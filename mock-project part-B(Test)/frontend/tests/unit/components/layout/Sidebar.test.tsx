import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Sidebar } from '@/components/layout/Sidebar'

describe('Sidebar', () => {
  it('has a Tasks link to /tasks (AC-4.8)', () => {
    render(<Sidebar />)
    expect(screen.getByRole('link', { name: 'Tasks' })).toHaveAttribute('href', '/tasks')
  })

  it('lists Tasks right after Notes', () => {
    render(<Sidebar />)
    const labels = screen.getAllByRole('link').map((link) => link.textContent)
    expect(labels.indexOf('Tasks')).toBe(labels.indexOf('Notes') + 1)
  })
})
