import { apiClient } from '@/api/client'
import type { Shift } from '@/types/domain'

export interface CreateShiftPayload {
  startAt: string // ISO instant (UTC)
  endAt: string
  requiredSkillId: string
  headcountNeeded?: number
  notes?: string
}

export type UpdateShiftPayload = Partial<CreateShiftPayload>

export const shiftsApi = {
  create: (scheduleWeekId: string, payload: CreateShiftPayload) =>
    apiClient
      .post<Shift>(`/schedule-weeks/${scheduleWeekId}/shifts`, payload)
      .then((res) => res.data),

  get: (id: string) => apiClient.get<Shift>(`/shifts/${id}`).then((res) => res.data),

  update: (id: string, payload: UpdateShiftPayload) =>
    apiClient.patch<Shift>(`/shifts/${id}`, payload).then((res) => res.data),

  remove: (id: string) => apiClient.delete(`/shifts/${id}`),
}
