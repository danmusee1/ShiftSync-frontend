import { apiClient } from '@/api/client'
import type { OnDutyEntry, ShiftAssignment } from '@/types/domain'

export const timeclockApi = {
  clockIn: (shiftId: string) =>
    apiClient.post<ShiftAssignment>(`/shifts/${shiftId}/clock-in`).then((res) => res.data),

  clockOut: (shiftId: string) =>
    apiClient.post<ShiftAssignment>(`/shifts/${shiftId}/clock-out`).then((res) => res.data),

  getOnDuty: (locationId: string) =>
    apiClient.get<OnDutyEntry[]>(`/locations/${locationId}/on-duty`).then((res) => res.data),
}
