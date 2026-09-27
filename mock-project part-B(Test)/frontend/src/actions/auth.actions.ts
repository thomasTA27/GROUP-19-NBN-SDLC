'use server'

import { adminAuth } from '@/lib/firebase/admin'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { ActionResult } from '@/types'

const SESSION_COOKIE_NAME = '__session'

/**
 * Verify the current session cookie and return the decoded token.
 * Use this in Server Components and Server Actions to authenticate requests.
 */
export async function getServerSession() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionCookie) return null

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true)
    return decoded
  } catch {
    return null
  }
}

/**
 * Require authentication in a Server Action or Server Component.
 * Redirects to /login if not authenticated.
 */
export async function requireAuth() {
  const session = await getServerSession()
  if (!session) {
    redirect('/auth/signin')
  }
  return session
}

/**
 * Server-side sign out: clears the session cookie.
 */
export async function serverSignOut(): Promise<ActionResult> {
  try {
    const cookieStore = await cookies()
    cookieStore.delete(SESSION_COOKIE_NAME)
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to sign out' }
  }
}
