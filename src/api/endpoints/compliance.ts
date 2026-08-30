import { apiClient } from '@/api/client'
import type { StaffWeeklyHours } from '@/types/domain'

export const complianceApi = {
  getWeeklyOvertimeReport: (weekStartDate: string, locationId?: string) =>
    apiClient
      .get<StaffWeeklyHours[]>('/compliance/overtime', { params: { weekStartDate, locationId } })
      .then((res) => res.data),
}
