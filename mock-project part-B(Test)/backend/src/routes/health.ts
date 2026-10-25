import { Router, type Router as ExpressRouter } from 'express'

const router: ExpressRouter = Router()

/**
 * GET /api/health
 * Returns service health status. No auth required.
 */
router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? 'development',
  })
})

export { router as healthRouter }
