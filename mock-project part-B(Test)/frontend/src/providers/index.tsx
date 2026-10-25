'use client'

import type { ReactNode } from 'react'
import { AuthProvider } from './AuthProvider'
import { Toaster } from 'sonner'

/**
 * Compose all client-side providers here.
 * Import this in the root layout only.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster richColors position="top-right" />
    </AuthProvider>
  )
}
