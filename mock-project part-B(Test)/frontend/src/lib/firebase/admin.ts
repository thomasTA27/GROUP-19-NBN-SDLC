import 'server-only'
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'

function getAdminApp(): App {
  const existing = getApps()
  if (existing.length > 0) return existing[0]!

  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64
  if (!key) throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 environment variable is not set')

  return initializeApp({
    credential: cert(JSON.parse(Buffer.from(key, 'base64').toString('utf8'))),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  })
}

/**
 * Returns a proxy that defers Firebase Admin SDK initialization until the
 * first property access at request time. This prevents the SDK from throwing
 * during `next build` when FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 is not set.
 */
function lazyProxy<T extends object>(factory: () => T): T {
  let instance: T | undefined
  return new Proxy({} as T, {
    get(_, prop: string | symbol) {
      instance ??= factory()
      const value = (instance as Record<string | symbol, unknown>)[prop]
      return typeof value === 'function' ? value.bind(instance) : value
    },
  })
}

export const adminAuth: Auth = lazyProxy(() => getAuth(getAdminApp()))
export const adminDb: Firestore = lazyProxy(() => getFirestore(getAdminApp()))
