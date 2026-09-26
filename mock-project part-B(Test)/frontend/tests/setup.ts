import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Firebase client SDK — never call real Firebase in unit tests
vi.mock('@/lib/firebase/client', () => ({
  auth: { currentUser: null, onAuthStateChanged: vi.fn() },
  db: {},
  app: {},
}))

vi.mock('@/lib/firebase/admin', () => ({
  adminAuth: {
    verifySessionCookie: vi.fn(),
    createSessionCookie: vi.fn(),
  },
  adminDb: {},
}))
