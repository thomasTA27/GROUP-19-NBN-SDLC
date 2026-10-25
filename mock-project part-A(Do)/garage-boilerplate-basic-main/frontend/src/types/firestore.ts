import type { Timestamp } from 'firebase/firestore'

/**
 * Firestore collection type definitions.
 *
 * Keep in sync with:
 *   - src/lib/firebase/firestore.ts  (typed collection exports)
 *   - firebase/firestore.rules       (security rules)
 *   - docs/FIRESTORE-SCHEMA.md       (schema documentation)
 */

export interface UserProfile {
  uid: string
  email: string
  displayName: string | null
  photoURL: string | null
  role: 'user'
  createdAt: Timestamp
  updatedAt: Timestamp
  _schemaVersion: 1
}

export type CreateUserProfileInput = Omit<UserProfile, 'createdAt' | 'updatedAt'>

export interface Note {
  id: string
  uid: string // owner's user id — used by security rules
  title: string
  body: string
  createdAt: Timestamp
  updatedAt: Timestamp
  _schemaVersion: 1
}

export interface Task {
  id: string
  uid: string // owner's user id — set from the session, never from client input
  title: string
  description: string // '' when empty
  dueDate: string | null // 'YYYY-MM-DD', not a Timestamp (spec D5)
  status: 'pending' | 'completed'
  createdAt: Timestamp
  updatedAt: Timestamp
  deletedAt: Timestamp | null // null until soft-deleted (ADR-0004)
  _schemaVersion: 1
}
