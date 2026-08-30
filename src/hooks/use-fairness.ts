import { useQuery } from '@tanstack/react-query'

import { fairnessApi } from '@/api/endpoints/fairness'
import { queryKeys } from '@/lib/query-keys'

export function useHoursDistribution(from: string, to: string, locationId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.fairness.hoursDistribution(from, to, locationId),
    queryFn: () => fairnessApi.getHoursDistribution(from, to, locationId),
    enabled: !!locationId,
  })
}

export function usePremiumShiftFairness(from: string, to: string, locationId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.fairness.premiumShifts(from, to, locationId),
    queryFn: () => fairnessApi.getPremiumShiftFairness(from, to, locationId),
    enabled: !!locationId,
  })
}

export function useDesiredHoursComparison(weekStartDate: string, locationId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.fairness.desiredHours(weekStartDate, locationId),
    queryFn: () => fairnessApi.getDesiredHoursComparison(weekStartDate, locationId),
    enabled: !!locationId,
  })
}
