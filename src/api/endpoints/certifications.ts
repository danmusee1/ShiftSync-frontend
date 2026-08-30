import { apiClient } from '@/api/client'
import type { StaffLocation, StaffSkill } from '@/types/domain'

export const certificationsApi = {
  listSkills: (staffId: string) =>
    apiClient.get<StaffSkill[]>(`/staff/${staffId}/skills`).then((res) => res.data),

  grantSkill: (staffId: string, skillId: string) =>
    apiClient.post<StaffSkill>(`/staff/${staffId}/skills/${skillId}`).then((res) => res.data),

  revokeSkill: (staffId: string, skillId: string) =>
    apiClient.delete<void>(`/staff/${staffId}/skills/${skillId}`).then((res) => res.data),

  listLocations: (staffId: string) =>
    apiClient.get<StaffLocation[]>(`/staff/${staffId}/locations`).then((res) => res.data),

  certifyLocation: (staffId: string, locationId: string) =>
    apiClient.post<StaffLocation>(`/staff/${staffId}/locations/${locationId}`).then((res) => res.data),

  decertifyLocation: (staffId: string, locationId: string) =>
    apiClient.delete<void>(`/staff/${staffId}/locations/${locationId}`).then((res) => res.data),
}
