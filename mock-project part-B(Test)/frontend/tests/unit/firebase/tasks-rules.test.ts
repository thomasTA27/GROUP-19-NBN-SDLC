// @vitest-environment node
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'

/**
 * Static checks on firebase/firestore.rules for the tasks collection.
 *
 * Rules behaviour can't be unit-tested without an emulator (docs/TESTING.md), so
 * this reads the rules as text and pins down everything that decides who can reach
 * a task document: the tasks block, the helpers its read rule calls, and every other
 * match that could also cover a task (ADR-0002, .claude/rules/tasks.md).
 * Testing checks the behaviour itself (spec P1, P2).
 */

const RULES_PATH = fileURLToPath(new URL('../../../../firebase/firestore.rules', import.meta.url))

// The only read rule allowed in the tasks block, whitespace normalised.
const EXPECTED_TASK_READ = 'isAuthenticated() && isOwner(resource.data.uid) && notDeleted()'

// The helpers that read rule calls, exactly as they are now, whitespace normalised.
// They decide who can read tasks (AC-1.5, AC-7.1). A deliberate change to any of them
// must update this list too, and needs the same review as a change to the tasks rules.
const EXPECTED_HELPERS: Record<string, string> = {
  isAuthenticated:
    'function isAuthenticated() { return request.auth != null && request.auth.uid != null; }',
  isOwner: 'function isOwner(uid) { return isAuthenticated() && request.auth.uid == uid; }',
  notDeleted:
    "function notDeleted() { return resource == null || !('deletedAt' in resource.data) || resource.data.deletedAt == null; }",
}

const READ_METHODS = ['read', 'get', 'list']
const WRITE_METHODS = ['create', 'update', 'delete', 'write']

// A task document's full path. null marks a segment that can hold any value.
const TASK_DOCUMENT_PATH = ['databases', null, 'documents', 'tasks', null]

interface MatchBlock {
  path: string // as written, e.g. /tasks/{taskId}
  fullPath: string // with the paths of every enclosing match in front
  parent: MatchBlock | undefined
  body: string // everything between the block's braces, nested blocks included
  end: number // index just past the closing brace
}

interface AllowStatement {
  methods: string[]
  condition: string | null // null for `allow read;`, which allows unconditionally
}

const normalise = (text: string) => text.replace(/\s+/g, ' ').trim()
const countWord = (text: string, word: string) =>
  (text.match(new RegExp(`\\b${word}\\b`, 'g')) ?? []).length

// Line comments go first, so a `/*` inside one (such as a `tasks/**` glob) can't
// open a block comment that hides real rules.
function stripComments(source: string): string {
  return source.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '')
}

// Index just past the `}` that closes the `{` at openIndex.
function closingBrace(source: string, openIndex: number): number {
  let depth = 0
  for (let i = openIndex; i < source.length; i++) {
    if (source[i] === '{') depth++
    if (source[i] === '}') depth--
    if (depth === 0) return i + 1
  }
  throw new Error(`Unbalanced braces from index ${openIndex}`)
}

function matchBlocks(source: string): MatchBlock[] {
  const header = /\bmatch\s+((?:\/(?:\{[^}]*\}|[^/\s{]+))+)\s*\{/g
  const blocks: MatchBlock[] = []
  const enclosing: MatchBlock[] = [] // blocks still open at the current header, innermost last
  let m: RegExpExecArray | null
  while ((m = header.exec(source)) !== null) {
    const openBrace = m.index + m[0].length - 1
    while ((enclosing.at(-1)?.end ?? Infinity) <= m.index) enclosing.pop()
    const parent = enclosing.at(-1)
    const path = m[1] ?? ''
    const end = closingBrace(source, openBrace)
    const block = {
      path,
      fullPath: (parent?.fullPath ?? '') + path,
      parent,
      body: source.slice(openBrace + 1, end - 1),
      end,
    }
    blocks.push(block)
    enclosing.push(block)
  }
  return blocks
}

// Every `function name(...) { ... }`, whitespace normalised.
function functionDefinitions(source: string): { name: string; text: string }[] {
  const header = /\bfunction\s+(\w+)\s*\([^)]*\)\s*\{/g
  const definitions: { name: string; text: string }[] = []
  let m: RegExpExecArray | null
  while ((m = header.exec(source)) !== null) {
    const end = closingBrace(source, m.index + m[0].length - 1)
    definitions.push({ name: m[1] ?? '', text: normalise(source.slice(m.index, end)) })
  }
  return definitions
}

function allowStatements(body: string): AllowStatement[] {
  const statement = /\ballow\s+([^:;]+?)\s*(?::\s*if\s+([^;]*?))?\s*;/g
  return [...body.matchAll(statement)].map((m) => ({
    methods: (m[1] ?? '').split(',').map((method) => method.trim()),
    condition: m[2] === undefined ? null : normalise(m[2]),
  }))
}

// True when a path with no recursive wildcard matches some task document.
function coversTaskDocument(fullPath: string): boolean {
  const segments = fullPath.split('/').slice(1)
  return (
    segments.length === TASK_DOCUMENT_PATH.length &&
    segments.every((segment, i) => {
      const expected = TASK_DOCUMENT_PATH[i]
      return segment.startsWith('{') || expected === null || segment === expected
    })
  )
}

// `match /tasks/{taskId}` directly inside a top-level `match /databases/{database}/documents`.
function isTopLevelTasksBlock(block: MatchBlock): boolean {
  const parent = block.parent
  return (
    /^\/tasks\/\{[^}=]+\}$/.test(block.path) &&
    parent !== undefined &&
    parent.parent === undefined &&
    /^\/databases\/\{[^}=]+\}\/documents$/.test(parent.path)
  )
}

const rules = stripComments(readFileSync(RULES_PATH, 'utf8'))
const blocks = matchBlocks(rules)
const recursiveBlocks = blocks.filter((block) => block.fullPath.includes('=**'))
const blocksCoveringTasks = blocks.filter(
  (block) => !block.fullPath.includes('=**') && coversTaskDocument(block.fullPath)
)
const taskBlock = blocks.find(isTopLevelTasksBlock)
const taskBody = taskBlock?.body ?? ''
const taskAllows = allowStatements(taskBody)

describe('firestore.rules: what this parser relies on', () => {
  // A `//` or a brace inside a string, or a leftover block-comment marker, would cut a
  // line or end a block early, and an allow could then escape the checks below.
  it('has no string or comment this parser would misread', () => {
    for (const line of rules.split('\n')) {
      expect((line.match(/'/g) ?? []).length % 2, line).toBe(0)
      expect((line.match(/"/g) ?? []).length % 2, line).toBe(0)
    }
    const strings = rules.match(/'[^'\n]*'|"[^"\n]*"/g) ?? []
    expect(strings.filter((text) => /[{}]/.test(text))).toEqual([])
    // No block comments at all. A `//` inside one (a URL, say) makes the line-comment
    // pass cut off its `*/` and any code after it, so the block-comment pass can then
    // swallow real rules. Check the file with only line comments removed.
    const withoutLineComments = readFileSync(RULES_PATH, 'utf8').replace(/\/\/[^\n]*/g, '')
    expect(withoutLineComments).not.toMatch(/\/\*|\*\//)
  })

  it('finds every match block and function', () => {
    expect(blocks).toHaveLength(countWord(rules, 'match'))
    expect(functionDefinitions(rules)).toHaveLength(countWord(rules, 'function'))
  })
})

describe('firestore.rules: matches that cover task documents', () => {
  it('has a top-level match /tasks/{taskId} block', () => {
    expect(taskBlock).toBeDefined()
  })

  it('has no other match without a recursive wildcard covering a task document', () => {
    // At any depth, and including full /databases/{database}/documents/... paths.
    expect(blocksCoveringTasks.map((block) => block.fullPath)).toEqual([taskBlock?.fullPath])
  })

  // Rules are OR-ed across every match that covers a document, so a recursive wildcard
  // that allowed anything could reach tasks.
  it('lets every match with a recursive wildcard (=**) allow only `if false`', () => {
    expect(recursiveBlocks.length).toBeGreaterThan(0) // the default deny
    for (const block of recursiveBlocks) {
      const allows = allowStatements(block.body)
      expect(allows).toHaveLength(countWord(block.body, 'allow'))
      for (const { condition } of allows) {
        expect(condition, block.fullPath).toBe('false')
      }
    }
  })
})

describe('firestore.rules: tasks block', () => {
  it('parses every allow statement in the block', () => {
    expect(taskAllows.length).toBeGreaterThan(0)
    expect(taskAllows).toHaveLength(countWord(taskBody, 'allow'))
    for (const { methods } of taskAllows) {
      for (const method of methods) {
        expect([...READ_METHODS, ...WRITE_METHODS]).toContain(method)
      }
    }
  })

  it('has no isAdmin(), hasCustomClaim() or other check of auth token claims', () => {
    expect(taskBody).not.toMatch(/\bisAdmin\s*\(/)
    expect(taskBody).not.toMatch(/\bhasCustomClaim\s*\(/)
    expect(taskBody).not.toMatch(/request\.auth\.token/)
  })

  it('ends every allow that names create, update, delete or write in `if false`', () => {
    const writes = taskAllows.filter(({ methods }) =>
      methods.some((method) => WRITE_METHODS.includes(method))
    )
    for (const { condition } of writes) {
      expect(condition).toBe('false')
    }
  })

  it('allows reads only with the exact owner-only, non-deleted condition', () => {
    const reads = taskAllows.filter(({ methods }) =>
      methods.some((method) => READ_METHODS.includes(method))
    )
    expect(reads.length).toBeGreaterThan(0)
    for (const { condition } of reads) {
      expect(condition).toBe(EXPECTED_TASK_READ)
    }
  })
})

describe('firestore.rules: helpers the tasks read rule calls', () => {
  it('defines isAuthenticated, isOwner and notDeleted once each, exactly as expected', () => {
    // Once in the whole file, so no block can shadow one with its own version.
    const definitions = functionDefinitions(rules)
    for (const [name, expected] of Object.entries(EXPECTED_HELPERS)) {
      const texts = definitions.filter((definition) => definition.name === name)
      expect(texts.map((definition) => definition.text)).toEqual([expected])
    }
  })
})
