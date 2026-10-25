import type { User } from 'firebase/auth'
import type { UserProfile } from './firestore'

export interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

export interface SessionPayload {
  uid: string
  email: string
  expiresAt: number
}
