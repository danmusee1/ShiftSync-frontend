import { apiClient } from '@/api/client'
import type { AvailabilityException, AvailabilityExceptionType, AvailabilityRule } from '@/types/domain'

export interface CreateAvailabilityRulePayload {
  dayOfWeek: number
  startTime: string
  endTime: string
}

export interface UpdateAvailabilityRulePayload {
  startTime?: string
  endTime?: string
  isActive?: boolean
}

export interface CreateAvailabilityExceptionPayload {
  date: string
  type: AvailabilityExceptionType
  startTime?: string
  endTime?: string
  reason?: string
}

export const availabilityApi = {
  listRules: (staffId: string) =>
    apiClient
      .get<AvailabilityRule[]>(`/staff/${staffId}/availability/rules`)
      .then((res) => res.data),

  createRule: (staffId: string, payload: CreateAvailabilityRulePayload) =>
    apiClient
      .post<AvailabilityRule>(`/staff/${staffId}/availability/rules`, payload)
      .then((res) => res.data),

  updateRule: (staffId: string, ruleId: string, payload: UpdateAvailabilityRulePayload) =>
    apiClient
      .patch<AvailabilityRule>(`/staff/${staffId}/availability/rules/${ruleId}`, payload)
      .then((res) => res.data),

  deleteRule: (staffId: string, ruleId: string) =>
    apiClient.delete<void>(`/staff/${staffId}/availability/rules/${ruleId}`).then((res) => res.data),

  listExceptions: (staffId: string) =>
    apiClient
      .get<AvailabilityException[]>(`/staff/${staffId}/availability/exceptions`)
      .then((res) => res.data),

  createException: (staffId: string, payload: CreateAvailabilityExceptionPayload) =>
    apiClient
      .post<AvailabilityException>(`/staff/${staffId}/availability/exceptions`, payload)
      .then((res) => res.data),

  deleteException: (staffId: string, exceptionId: string) =>
    apiClient
      .delete<void>(`/staff/${staffId}/availability/exceptions/${exceptionId}`)
      .then((res) => res.data),
}
