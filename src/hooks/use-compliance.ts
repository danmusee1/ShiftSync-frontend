import { useQuery } from '@tanstack/react-query'

import { complianceApi } from '@/api/endpoints/compliance'
import { queryKeys } from '@/lib/query-keys'

export function useWeeklyOvertimeReport(weekStartDate: string, locationId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.compliance.overtime(weekStartDate, locationId),
    queryFn: () => complianceApi.getWeeklyOvertimeReport(weekStartDate, locationId),
    enabled: !!locationId,
  })
}
