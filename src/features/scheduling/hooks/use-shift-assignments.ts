import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { ApiError } from '@/api/api-error'
import { shiftAssignmentsApi } from '@/api/endpoints/shift-assignments'
import { queryKeys } from '@/lib/query-keys'

/**
 * Read-only "what-if" check — always returns 200 with { ok, violations,
 * suggestions } even when blocked (unlike the real assign call, which
 * throws a 422 ApiError when blocked). Never toasts; the caller renders
 * the result inline via <ConstraintViolationAlert>.
 */
export function usePreviewAssignment() {
  return useMutation({
    mutationFn: ({ shiftId, staffId }: { shiftId: string; staffId: string }) =>
      shiftAssignmentsApi.preview(shiftId, staffId),
  })
}

export function useAssignStaff(scheduleWeekId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ shiftId, staffId }: { shiftId: string; staffId: string }) =>
      shiftAssignmentsApi.assign(shiftId, staffId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scheduleWeeks.detail(scheduleWeekId) })
      if (result.warnings.length > 0) {
        toast.warning('Assigned, with warnings — see the shift for details.')
      } else {
        toast.success('Staff assigned.')
      }
    },
    onError: (error) => {
      // A blocked (422) assignment is rendered inline via ConstraintViolationAlert
      // by the caller, using error.violations/error.suggestions — no toast for that.
      if (error instanceof ApiError && error.isConstraintViolation) return
      toast.error(error instanceof ApiError ? error.message : 'Could not assign this staff member.')
    },
  })
}

export function useUnassignStaff(scheduleWeekId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ shiftId, staffId }: { shiftId: string; staffId: string }) =>
      shiftAssignmentsApi.unassign(shiftId, staffId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scheduleWeeks.detail(scheduleWeekId) })
      toast.success('Staff unassigned.')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Could not unassign this staff member.')
    },
  })
}
