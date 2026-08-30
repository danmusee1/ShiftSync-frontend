import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { ApiError } from '@/api/api-error'
import { shiftsApi, type CreateShiftPayload, type UpdateShiftPayload } from '@/api/endpoints/shifts'
import { queryKeys } from '@/lib/query-keys'

export function useCreateShift(scheduleWeekId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateShiftPayload) => shiftsApi.create(scheduleWeekId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scheduleWeeks.detail(scheduleWeekId) })
      toast.success('Shift created.')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Could not create this shift.')
    },
  })
}

export function useUpdateShift(scheduleWeekId: string, shiftId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateShiftPayload) => shiftsApi.update(shiftId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scheduleWeeks.detail(scheduleWeekId) })
      toast.success('Shift updated.')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Could not update this shift.')
    },
  })
}

export function useDeleteShift(scheduleWeekId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (shiftId: string) => shiftsApi.remove(shiftId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scheduleWeeks.detail(scheduleWeekId) })
      toast.success('Shift deleted.')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Could not delete this shift.')
    },
  })
}
