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

// Every field is stored (docs/FIRESTORE-SCHEMA.md "tasks"). The server sets uid,
// createdAt, updatedAt, deletedAt and _schemaVersion; the browser only reads (ADR-0002).
export interface Task {
  uid: string // owner's user id — used by security rules; never changes
  title: string
  description: string
  dueDate: Timestamp
  status: 'pending' | 'completed'
  createdAt: Timestamp
  updatedAt: Timestamp
  deletedAt: Timestamp | null // null from creation, so the list query can filter on it (ADR-0004)
  _schemaVersion: 1
}
