import type { Request, Response, NextFunction } from 'express'
import { HttpError } from '../lib/errors'

/**
 * Global Express error handler — must be registered last in app.ts.
 * Renders every error as RFC 9457 Problem Details: { type, title, status, detail }
 *
 * HttpError    → rendered as-is
 * Anything else → 500 with a generic message (internals are never exposed to the client)
 */
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  const httpError = err instanceof HttpError ? err : HttpError.internal()

  if (httpError.status >= 500) {
    console.error(`[${httpError.status}]`, err.message, err.stack)
  }

  res.status(httpError.status).json({
    type: httpError.type,
    title: httpError.title,
    status: httpError.status,
    detail: httpError.detail,
  })
}
