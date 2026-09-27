export type * from './auth'
export type * from './firestore'

/** Generic Server Action response shape */
export interface ActionResult<T = undefined> {
  success: boolean
  error?: string
  data?: T
}
