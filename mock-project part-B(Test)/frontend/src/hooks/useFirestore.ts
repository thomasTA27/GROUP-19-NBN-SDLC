'use client'

import { useEffect, useState } from 'react'
import {
  onSnapshot,
  query,
  queryEqual,
  type CollectionReference,
  type DocumentData,
  type Query,
  type QueryConstraint,
} from 'firebase/firestore'

interface UseCollectionResult<T> {
  data: T[]
  loading: boolean
  error: Error | null
}

/**
 * Subscribe to a Firestore collection with real-time updates.
 *
 * Restarts only when the query really changes (compared with `queryEqual`), so
 * a new collection reference or constraint objects that describe the same query
 * do not resubscribe. A restart sets `loading` back to true.
 *
 * @example
 * const { data, loading, error } = useCollection(usersCollection, where('role', '==', 'admin'))
 */
export function useCollection<T extends DocumentData>(
  collectionRef: CollectionReference<T>,
  ...queryConstraints: QueryConstraint[]
): UseCollectionResult<T> {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const nextQuery: Query<T> =
    queryConstraints.length > 0
      ? query(collectionRef, ...queryConstraints)
      : query(collectionRef)

  // Keep the first query we saw until a different one arrives, so the effect
  // below depends on query identity, not on the objects built on each render.
  const [activeQuery, setActiveQuery] = useState<Query<T>>(nextQuery)
  if (!queryEqual(activeQuery, nextQuery)) {
    setActiveQuery(nextQuery)
    setLoading(true)
    setError(null)
  }

  useEffect(() => {
    const unsubscribe = onSnapshot(
      activeQuery,
      (snapshot) => {
        setData(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as T[])
        setError(null)
        setLoading(false)
      },
      (err) => {
        setError(err)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [activeQuery])

  return { data, loading, error }
}
