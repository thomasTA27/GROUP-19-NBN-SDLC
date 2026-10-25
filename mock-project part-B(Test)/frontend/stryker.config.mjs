// Mutation testing for the Task CRUD feature (Testing and QA module, step 2).
// Run from frontend/: pnpm run test:mutation
// Scope and exclusions: testing-and-qa/setup-log.md. Reports: testing-and-qa/reports/.
import { copyFileSync, mkdirSync } from 'node:fs'

// Worker threads cannot change time zone at run time, so fix it before Stryker spawns them. Perth is the zone
// most of the date tests set for themselves (see stryker/skip-thread-tz.setup.ts for the two that cannot work).
process.env.TZ = 'Australia/Perth'

// tasks-rules.test.ts finds firebase/firestore.rules four levels up from itself. In a Stryker sandbox
// (frontend/.stryker-tmp/sandbox-*/) that is frontend/.stryker-tmp/firebase/, so put the rules file there.
mkdirSync('.stryker-tmp/firebase', { recursive: true })
copyFileSync('../firebase/firestore.rules', '.stryker-tmp/firebase/firestore.rules')

/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  plugins: ['@stryker-mutator/vitest-runner'],
  testRunner: 'vitest',
  vitest: { configFile: 'vitest.stryker.config.ts' },
  mutate: [
    'src/features/tasks/schemas.ts',
    'src/features/tasks/lib/due-date.ts',
    'src/features/tasks/actions/tasks.actions.ts',
    'src/features/tasks/hooks/useTasks.ts',
    'src/features/tasks/components/TaskList.tsx',
    'src/features/tasks/components/TaskItem.tsx',
    'src/features/tasks/components/CreateTaskForm.tsx',
    'src/features/tasks/components/EditTaskForm.tsx',
    'src/hooks/useFirestore.ts',
    'src/app/api/cron/erase-deleted-tasks/route.ts',
    // typedCollection helper and getTasksCollection only; users and notes exports excluded.
    'src/lib/firebase/firestore.ts:9-11',
    'src/lib/firebase/firestore.ts:37-39',
  ],
  reporters: ['clear-text', 'progress', 'html', 'json'],
  htmlReporter: { fileName: '../testing-and-qa/reports/mutation.html' },
  jsonReporter: { fileName: '../testing-and-qa/reports/mutation.json' },
  thresholds: { high: 80, low: 60, break: null },
  tempDirName: '.stryker-tmp',
  // 'always': a failed run must not leave sandboxes behind, because Vitest would pick up their copies of the tests.
  cleanTempDir: 'always',
  // 32 logical CPUs and 31.7 GB here. Stryker's default would start 31 workers; 16 leaves headroom so a
  // slow worker is less likely to turn into a Timeout.
  concurrency: 16,
}
