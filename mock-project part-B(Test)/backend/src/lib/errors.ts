/**
 * HttpError — the single error type for the API.
 *
 * Throw it (or pass it to next()) from any route handler; the errorHandler
 * middleware renders it as an RFC 9457 Problem Details response:
 *   { type, title, status, detail }
 *
 * Prefer the static helpers over the constructor:
 *   next(HttpError.notFound('Invoice', id))
 *   next(HttpError.badRequest('title is required'))
 */
export class HttpError extends Error {
  readonly status: number
  readonly title: string
  readonly detail: string
  readonly type: string

  constructor(status: number, title: string, detail: string, type?: string) {
    super(detail)
    this.name = 'HttpError'
    this.status = status
    this.title = title
    this.detail = detail
    this.type = type ?? `https://httpstatuses.io/${status}`
  }

  static badRequest(detail: string): HttpError {
    return new HttpError(400, 'Bad Request', detail)
  }

  static unauthorized(detail = 'Authentication required'): HttpError {
    return new HttpError(401, 'Unauthorized', detail)
  }

  static forbidden(detail = 'You do not have access to this resource'): HttpError {
    return new HttpError(403, 'Forbidden', detail)
  }

  static notFound(resource: string, id?: string): HttpError {
    return new HttpError(404, 'Not Found', id ? `${resource} '${id}' not found` : `${resource} not found`)
  }

  static conflict(detail: string): HttpError {
    return new HttpError(409, 'Conflict', detail)
  }

  static internal(detail = 'An unexpected error occurred'): HttpError {
    return new HttpError(500, 'Internal Server Error', detail)
  }
}
