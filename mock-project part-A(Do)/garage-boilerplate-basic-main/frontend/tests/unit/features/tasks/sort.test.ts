import { describe, it, expect } from 'vitest'
import type { Timestamp } from 'firebase/firestore'
import { sortTasks } from '@/features/tasks/sort'

function task(id: string, dueDate: string | null, createdAtMs: number) {
  return { id, dueDate, createdAt: { toMillis: () => createdAtMs } as Timestamp }
}

const ids = (tasks: { id: string }[]) => tasks.map((t) => t.id)

describe('sortTasks', () => {
  it('orders by due date, earliest first', () => {
    const sorted = sortTasks([
      task('mar', '2027-03-05', 1),
      task('jan', '2027-01-10', 2),
      task('feb', '2027-02-01', 3),
    ])
    expect(ids(sorted)).toEqual(['jan', 'feb', 'mar'])
  })

  it('breaks ties on the same due date by createdAt, oldest first', () => {
    const sorted = sortTasks([task('newer', '2027-01-10', 200), task('older', '2027-01-10', 100)])
    expect(ids(sorted)).toEqual(['older', 'newer'])
  })

  it('puts null due dates last, ordered by createdAt', () => {
    const sorted = sortTasks([
      task('none-new', null, 300),
      task('dated', '2099-12-31', 999),
      task('none-old', null, 100),
    ])
    expect(ids(sorted)).toEqual(['dated', 'none-old', 'none-new'])
  })

  it('does not mutate the input', () => {
    const input = [task('b', '2027-02-01', 1), task('a', '2027-01-01', 2)]
    sortTasks(input)
    expect(ids(input)).toEqual(['b', 'a'])
  })
})
