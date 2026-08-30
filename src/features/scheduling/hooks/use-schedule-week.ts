import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { ApiError } from '@/api/api-error'
import { scheduleWeeksApi } from '@/api/endpoints/schedule-weeks'
import { queryKeys } from '@/lib/query-keys'

export function useScheduleWeeksForLocation(locationId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.scheduleWeeks.byLocation(locationId ?? ''),
    queryFn: () => scheduleWeeksApi.listForLocation(locationId!),
    enabled: !!locationId,
  })
}

/**
 * `getOrCreate` is a POST on the backend, but from the client's point of view
 * it's idempotent and cacheable (same location + week always yields the same
 * record) — a useQuery, not a useMutation, so selecting a week is declarative
 * instead of an imperative "fire this on change" effect.
 */
export function useScheduleWeekForWeek(locationId: string | undefined, weekStartDate: string) {
  return useQuery({
    queryKey: [...queryKeys.scheduleWeeks.byLocation(locationId ?? ''), weekStartDate],
    queryFn: () => scheduleWeeksApi.getOrCreate(locationId!, { weekStartDate }),
    enabled: !!locationId,
  })
}

export function useScheduleWeek(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.scheduleWeeks.detail(id ?? ''),
    queryFn: () => scheduleWeeksApi.get(id!),
    enabled: !!id,
  })
}

export function usePublishScheduleWeek(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => scheduleWeeksApi.publish(id),
    onSuccess: (week) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scheduleWeeks.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.scheduleWeeks.byLocation(week.locationId) })
      toast.success('Schedule published.')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Could not publish this schedule.')
    },
  })
}

export function useUnpublishScheduleWeek(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => scheduleWeeksApi.unpublish(id),
    onSuccess: (week) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scheduleWeeks.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.scheduleWeeks.byLocation(week.locationId) })
      toast.success('Schedule unpublished.')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Could not unpublish this schedule.')
    },
  })
}
