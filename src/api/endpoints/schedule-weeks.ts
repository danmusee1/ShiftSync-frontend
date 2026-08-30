import { apiClient } from '@/api/client'
import type { ScheduleWeek, ScheduleWeekDetail } from '@/types/domain'

export interface CreateScheduleWeekPayload {
  weekStartDate: string // "YYYY-MM-DD", must be a Sunday
  publishCutoffHours?: number
}

export const scheduleWeeksApi = {
  getOrCreate: (locationId: string, payload: CreateScheduleWeekPayload) =>
    apiClient
      .post<ScheduleWeek>(`/locations/${locationId}/schedule-weeks`, payload)
      .then((res) => res.data),

  listForLocation: (locationId: string) =>
    apiClient
      .get<ScheduleWeek[]>(`/locations/${locationId}/schedule-weeks`)
      .then((res) => res.data),

  get: (id: string) =>
    apiClient.get<ScheduleWeekDetail>(`/schedule-weeks/${id}`).then((res) => res.data),

  publish: (id: string) =>
    apiClient.post<ScheduleWeek>(`/schedule-weeks/${id}/publish`).then((res) => res.data),

  unpublish: (id: string) =>
    apiClient.post<ScheduleWeek>(`/schedule-weeks/${id}/unpublish`).then((res) => res.data),
}
