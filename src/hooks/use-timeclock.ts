import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { ApiError } from '@/api/api-error'
import { timeclockApi } from '@/api/endpoints/timeclock'
import { queryKeys } from '@/lib/query-keys'

export function useOnDuty(locationId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.onDuty.byLocation(locationId ?? ''),
    queryFn: () => timeclockApi.getOnDuty(locationId!),
    enabled: !!locationId,
  })
}

export function useClockIn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ shiftId }: { shiftId: string; locationId: string }) => timeclockApi.clockIn(shiftId),
    onSuccess: (_data, { locationId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.onDuty.byLocation(locationId) })
      toast.success('Clocked in.')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Could not clock in.')
    },
  })
}

export function useClockOut() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ shiftId }: { shiftId: string; locationId: string }) => timeclockApi.clockOut(shiftId),
    onSuccess: (_data, { locationId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.onDuty.byLocation(locationId) })
      toast.success('Clocked out.')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Could not clock out.')
    },
  })
}
