import express, { type Express } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { createAuthMiddleware, verifyFirebaseToken, type VerifyToken } from './middleware/auth'
import { errorHandler } from './middleware/errorHandler'
import { healthRouter } from './routes/health'
import { apiRouter } from './routes'

interface AppOptions {
  verifyToken?: VerifyToken
}

/** Global rate limiter — 300 requests per 15 min per IP */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    type: 'https://httpstatuses.io/429',
    title: 'Too Many Requests',
    status: 429,
    detail: 'Too many requests, please try again later',
  },
})

/**
 * Express app factory.
 *
 * verifyToken defaults to Firebase token verification (production).
 * Pass a mock in tests: createApp({ verifyToken: mockVerifyToken })
 */
export function createApp({ verifyToken = verifyFirebaseToken }: AppOptions = {}): Express {
  const app = express()

  const authMiddleware = createAuthMiddleware(verifyToken)

  // Security headers (must be first)
  app.use(helmet())

  // CORS — defaults to deny-all if CORS_ORIGIN is not set
  app.use(cors({ origin: process.env.CORS_ORIGIN ?? false }))

  // Rate limiting — applied before any route logic
  app.use(globalLimiter)

  // Body parsers — 1mb limit to prevent memory exhaustion attacks
  app.use(express.json({ limit: '1mb' }))
  app.use(express.urlencoded({ extended: true, limit: '1mb' }))

  // Public routes (no auth)
  app.use('/api/health', healthRouter)

  // Protected routes — require a valid Firebase ID token
  app.use('/api', authMiddleware, apiRouter)

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({
      type: 'https://httpstatuses.io/404',
      title: 'Not Found',
      status: 404,
      detail: 'The requested resource does not exist',
    })
  })

  // Global error handler (must be last)
  app.use(errorHandler)

  return app
}
