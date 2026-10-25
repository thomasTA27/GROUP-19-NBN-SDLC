// useFirestore.test.ts mocks firebase/firestore, including queryEqual. This file
// uses the real SDK to guard the assumption the hook relies on: two separately
// built, equal queries are equal (NotesList builds a new reference every render),
// and queries that differ are not. No network is used: getFirestore is lazy and
// no listener is attached.
import { describe, expect, it } from 'vitest'
import { initializeApp } from 'firebase/app'
import {
  collection,
  getFirestore,
  limit,
  orderBy,
  query,
  queryEqual,
  where,
} from 'firebase/firestore'

const db = getFirestore(
  initializeApp({ projectId: 'fake-project-for-queryequal' }, 'real-queryequal-test')
)

const build = (path = 'tasks', uid = 'u1', max = 21) =>
  query(collection(db, path), where('uid', '==', uid), orderBy('dueDate', 'asc'), limit(max))

describe('real firebase queryEqual', () => {
  it('is true for two separately built queries with the same where, orderBy and limit', () => {
    expect(collection(db, 'tasks')).not.toBe(collection(db, 'tasks'))
    expect(queryEqual(build(), build())).toBe(true)
  })

  it('is false for a different where value', () => {
    expect(queryEqual(build(), build('tasks', 'u2'))).toBe(false)
  })

  it('is false for a different limit', () => {
    expect(queryEqual(build(), build('tasks', 'u1', 41))).toBe(false)
  })

  it('is false for a different collection path', () => {
    expect(queryEqual(build(), build('notes'))).toBe(false)
  })
})
