import type { ApiErrorResponse, ConstraintViolation, StaffSuggestion } from '@/types/domain'

/**
 * A normalized error thrown for every failed API call. Carries the backend's
 * structured payload straight through — including `violations`/`suggestions`
 * on a blocked assignment/swap (see ConstraintViolationException on the
 * backend) — so UI code can branch on `error instanceof ApiError` and render
 * the exact rule that failed instead of a generic message.
 */
export class ApiError extends Error {
  readonly status: number
  readonly violations?: ConstraintViolation[]
  readonly suggestions?: StaffSuggestion[]
  readonly path?: string

  constructor(status: number, payload: Partial<ApiErrorResponse> & { message: string }) {
    super(payload.message)
    this.name = 'ApiError'
    this.status = status
    this.violations = payload.violations
    this.suggestions = payload.suggestions
    this.path = payload.path
  }

  get isConstraintViolation(): boolean {
    return this.status === 422 && !!this.violations?.length
  }
}
