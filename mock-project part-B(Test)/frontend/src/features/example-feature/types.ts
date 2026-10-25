import type { Timestamp } from 'firebase/firestore'

/**
 * Example feature data model.
 * Replace this with your actual feature types.
 * Use the /new-feature skill to scaffold new features.
 */
export interface ExampleItem {
  id: string
  uid: string
  title: string
  description: string | null
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type CreateExampleItemInput = Pick<ExampleItem, 'uid' | 'title' | 'description'>
