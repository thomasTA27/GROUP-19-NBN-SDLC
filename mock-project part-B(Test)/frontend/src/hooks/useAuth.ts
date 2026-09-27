'use client'

import { useAuthContext } from '@/providers/AuthProvider'

/**
 * Access the authenticated user, their Firestore profile, and auth actions.
 *
 * Must be used inside a component wrapped by AuthProvider (i.e., any client
 * component rendered under the root layout).
 *
 * @example
 * const { user, profile, signOut, loading } = useAuth()
 */
export const useAuth = useAuthContext
