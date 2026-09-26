import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

type Services = { app: FirebaseApp; auth: Auth; db: Firestore }

let _services: Services | undefined

/**
 * Lazily initializes the Firebase client SDK on first use.
 * Deferred to prevent `auth/invalid-api-key` during `next build` when
 * NEXT_PUBLIC_FIREBASE_* env vars are not set in the CI environment.
 */
function getServices(): Services {
  if (_services) return _services

  const missing = [
    !process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim() && 'NEXT_PUBLIC_FIREBASE_API_KEY',
    !process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() && 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() && 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    !process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() &&
      'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    !process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim() && 'NEXT_PUBLIC_FIREBASE_APP_ID',
  ].filter(Boolean) as string[]

  if (missing.length > 0) {
    throw new Error(
      `Firebase web config is incomplete (missing: ${missing.join(', ')}). ` +
        'In Firebase Console → Project settings → Your apps, open or add a web app and copy ' +
        'the config into frontend/.env.local. See README.md (environment variables).'
    )
  }

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
  const auth = getAuth(app)
  const db = getFirestore(app)

  _services = { app, auth, db }
  return _services
}

export function getClientApp(): FirebaseApp {
  return getServices().app
}

export function getClientAuth(): Auth {
  return getServices().auth
}

export function getClientDb(): Firestore {
  return getServices().db
}
