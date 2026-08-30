import { apiClient } from '@/api/client'
import type { AssignmentResult, ConstraintCheckResult } from '@/types/domain'

export const shiftAssignmentsApi = {
  assign: (shiftId: string, staffId: string) =>
    apiClient
      .post<AssignmentResult>(`/shifts/${shiftId}/assignments`, { staffId })
      .then((res) => res.data),

  preview: (shiftId: string, staffId: string) =>
    apiClient
      .post<ConstraintCheckResult>(`/shifts/${shiftId}/assignments/preview`, { staffId })
      .then((res) => res.data),

  unassign: (shiftId: string, staffId: string) =>
    apiClient.delete(`/shifts/${shiftId}/assignments/${staffId}`),
}
