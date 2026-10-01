import { collection, doc, type CollectionReference, type DocumentData } from 'firebase/firestore'
import { getClientDb } from './client'
import type { Note, Task, UserProfile } from '@/types/firestore'

/**
 * Creates a typed Firestore collection reference.
 * Use this factory to add new collections — see docs/FIRESTORE-SCHEMA.md
 */
function typedCollection<T extends DocumentData>(path: string): CollectionReference<T> {
  return collection(getClientDb(), path) as CollectionReference<T>
}

// ── Collections ──────────────────────────────────────────────────────────────
// Add one export per Firestore collection. Keep in sync with:
//   - src/types/firestore.ts
//   - firebase/firestore.rules
//   - docs/FIRESTORE-SCHEMA.md

export function getUsersCollection() {
  return typedCollection<UserProfile>('users')
}

export function userDoc(uid: string) {
  return doc(getUsersCollection(), uid)
}

export function getNotesCollection() {
  return typedCollection<Note>('notes')
}

export function noteDoc(id: string) {
  return doc(getNotesCollection(), id)
}

// Read-only from the client: all task writes go through Server Actions (ADR-0001).
export function getTasksCollection() {
  return typedCollection<Task>('tasks')
}

export function taskDoc(id: string) {
  return doc(getTasksCollection(), id)
}
