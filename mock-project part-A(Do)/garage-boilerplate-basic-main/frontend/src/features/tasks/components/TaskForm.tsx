'use client'

import { useEffect, useId, type BaseSyntheticEvent } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { createTask, updateTask } from '@/features/tasks/actions/tasks.actions'
import { taskInputSchema, type TaskFormValues, type TaskInput } from '@/features/tasks/schemas'
import type { Task } from '@/types/firestore'

const SAVE_FAILED = 'Task could not be saved. Please try again.'
const NOT_FOUND = 'Task not found.'

const inputClass =
  'block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none aria-invalid:border-red-500'
const labelClass = 'text-sm font-medium text-zinc-700'
const errorClass = 'text-xs text-red-600'

interface TaskFormProps {
  /** Present when editing; absent when creating. */
  task?: Pick<Task, 'id' | 'title' | 'description' | 'dueDate'>
  /** Called after a successful save, a "Task not found." on edit, or Cancel. The parent returns focus (A26, A31). */
  onClose: () => void
}

export function TaskForm({ task, onClose }: TaskFormProps) {
  const isEdit = task !== undefined
  const id = useId()
  const fieldId = (name: string) => `${id}-${name}`

  const {
    register,
    handleSubmit,
    setFocus,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues, unknown, TaskInput>({
    resolver: zodResolver(taskInputSchema),
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      dueDate: task?.dueDate ?? '',
    },
  })

  // Opening the form moves focus to the title field (A26, A31).
  useEffect(() => {
    setFocus('title')
  }, [setFocus])

  async function onSubmit(values: TaskInput, event?: BaseSyntheticEvent) {
    // A half-typed or impossible date reads as '' (which means "no due date"), so ask the browser.
    const form = event?.target as HTMLFormElement | undefined
    const dueDateInput = form?.elements.namedItem('dueDate') as HTMLInputElement | null | undefined
    if (dueDateInput?.validity.badInput) {
      setError('dueDate', { message: 'Due date must be a valid date.' }, { shouldFocus: true })
      return
    }
    try {
      const result = isEdit ? await updateTask(task.id, values) : await createTask(values)
      if (result.success) {
        toast.success(isEdit ? 'Task updated' : 'Task created')
        onClose()
        return
      }
      toast.error(result.error ?? SAVE_FAILED)
      // The task was deleted elsewhere and is already gone from the live list (A37).
      if (result.error === NOT_FOUND) onClose()
    } catch {
      // The call itself failed (e.g. offline). Keep the form open with the values (AC8, AC14).
      toast.error(SAVE_FAILED)
    }
  }

  const describedBy = (name: keyof TaskFormValues) =>
    errors[name] ? fieldId(`${name}-error`) : undefined

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label={isEdit ? 'Edit task' : 'Create task'}
      className="flex flex-col gap-4 border-t-2 border-orange-500 bg-orange-50 px-5 py-4"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor={fieldId('title')} className={labelClass}>
          Title
        </label>
        <input
          id={fieldId('title')}
          type="text"
          aria-invalid={!!errors.title}
          aria-describedby={describedBy('title')}
          className={inputClass}
          {...register('title')}
        />
        {errors.title && (
          <p id={fieldId('title-error')} role="alert" className={errorClass}>
            {errors.title.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_14rem]">
        <div className="flex min-w-0 flex-col gap-1.5">
          <label htmlFor={fieldId('description')} className={labelClass}>
            Description <span className="font-normal text-zinc-500">(optional)</span>
          </label>
          <textarea
            id={fieldId('description')}
            rows={3}
            aria-invalid={!!errors.description}
            aria-describedby={describedBy('description')}
            className={inputClass}
            {...register('description')}
          />
          {errors.description && (
            <p id={fieldId('description-error')} role="alert" className={errorClass}>
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={fieldId('dueDate')} className={labelClass}>
            Due date <span className="font-normal text-zinc-500">(optional)</span>
          </label>
          <input
            id={fieldId('dueDate')}
            type="date"
            aria-invalid={!!errors.dueDate}
            aria-describedby={describedBy('dueDate')}
            className={inputClass}
            {...register('dueDate')}
          />
          {errors.dueDate && (
            <p id={fieldId('dueDate-error')} role="alert" className={errorClass}>
              {errors.dueDate.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="inline-flex items-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isEdit ? 'Save' : 'Create'}
        </button>
      </div>
    </form>
  )
}
