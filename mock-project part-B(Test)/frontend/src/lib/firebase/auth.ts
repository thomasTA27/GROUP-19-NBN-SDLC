import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  type User,
} from 'firebase/auth'
import { getClientAuth } from './client'

const googleProvider = new GoogleAuthProvider()
googleProvider.addScope('email')
googleProvider.addScope('profile')

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const result = await signInWithEmailAndPassword(getClientAuth(), email, password)

  await result.user.reload()
  if (!result.user.emailVerified) {
    await firebaseSignOut(getClientAuth())
    throw new Error('email-not-verified')
  }

  return result.user
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  const result = await createUserWithEmailAndPassword(getClientAuth(), email, password)
  await updateProfile(result.user, { displayName })
  await result.user.reload()

  await sendEmailVerification(result.user)
  await firebaseSignOut(getClientAuth())

  return result.user
}

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(getClientAuth(), googleProvider)
  return result.user
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(getClientAuth())
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(getClientAuth(), email)
}

export async function getIdToken(): Promise<string | null> {
  const user = getClientAuth().currentUser
  if (!user) return null
  return user.getIdToken()
}
