import type { Request, Response, NextFunction } from 'express'
import { adminAuth } from '../lib/firebase'
import { HttpError } from '../lib/errors'

/** The authenticated user attached to every request that passes the auth middleware. */
export interface AuthUser {
  uid: string
  email: string | undefined
  claims: Record<string, unknown>
}

/**
 * Verifies a Firebase ID token and returns the user.
 * Injected into createApp() so tests can swap in a mock without touching Firebase.
 */
export type VerifyToken = (token: string) => Promise<AuthUser>

export const verifyFirebaseToken: VerifyToken = async (token) => {
  const decoded = await adminAuth.verifyIdToken(token)
  return {
    uid: decoded.uid,
    email: decoded.email,
    claims: decoded as Record<string, unknown>,
  }
}

export interface AuthenticatedRequest extends Request {
  user: AuthUser
}

/**
 * Auth middleware — expects `Authorization: Bearer <Firebase ID token>`.
 * On success attaches the user: `const { user } = req as AuthenticatedRequest`.
 */
export function createAuthMiddleware(verifyToken: VerifyToken) {
  return async function authMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      next(HttpError.unauthorized('Missing or invalid Authorization header'))
      return
    }

    try {
      ;(req as AuthenticatedRequest).user = await verifyToken(authHeader.slice(7))
      next()
    } catch {
      next(HttpError.unauthorized('Invalid or expired token'))
    }
  }
}
