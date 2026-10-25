import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../../../src/app'
import { mockVerifyToken } from '../../setup'

const app = createApp({ verifyToken: mockVerifyToken })

describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.timestamp).toBeDefined()
  })

  it('returns 401 for protected routes without a token', async () => {
    const res = await request(app).get('/api/unknown-protected-route')
    expect(res.status).toBe(401)
  })

  it('returns 404 for truly unknown public routes', async () => {
    const res = await request(app).get('/not-found-at-all')
    expect(res.status).toBe(404)
  })
})
