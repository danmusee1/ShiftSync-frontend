import { apiClient } from '@/api/client'
import type { SwapRequest } from '@/types/domain'

export interface RequestSwapPayload {
  shiftId: string
  targetStaffId: string
  proposedReturnShiftId?: string
}

export interface RequestDropPayload {
  shiftId: string
}

export interface DecisionPayload {
  reason?: string
}

export const swapRequestsApi = {
  requestSwap: (staffId: string, payload: RequestSwapPayload) =>
    apiClient
      .post<SwapRequest>(`/staff/${staffId}/swap-requests`, payload)
      .then((res) => res.data),

  requestDrop: (staffId: string, payload: RequestDropPayload) =>
    apiClient
      .post<SwapRequest>(`/staff/${staffId}/drop-requests`, payload)
      .then((res) => res.data),

  listForStaff: (staffId: string) =>
    apiClient.get<SwapRequest[]>(`/staff/${staffId}/swap-requests`).then((res) => res.data),

  listOpenDrops: () =>
    apiClient.get<SwapRequest[]>('/swap-requests/open-drops').then((res) => res.data),

  listPendingForManager: () =>
    apiClient.get<SwapRequest[]>('/swap-requests/pending-approval').then((res) => res.data),

  get: (id: string) => apiClient.get<SwapRequest>(`/swap-requests/${id}`).then((res) => res.data),

  accept: (id: string) =>
    apiClient.post<SwapRequest>(`/swap-requests/${id}/accept`).then((res) => res.data),

  decline: (id: string) =>
    apiClient.post<SwapRequest>(`/swap-requests/${id}/decline`).then((res) => res.data),

  claim: (id: string) =>
    apiClient.post<SwapRequest>(`/swap-requests/${id}/claim`).then((res) => res.data),

  cancel: (id: string, payload: DecisionPayload) =>
    apiClient.post<SwapRequest>(`/swap-requests/${id}/cancel`, payload).then((res) => res.data),

  approve: (id: string) =>
    apiClient.post<SwapRequest>(`/swap-requests/${id}/approve`).then((res) => res.data),

  reject: (id: string, payload: DecisionPayload) =>
    apiClient.post<SwapRequest>(`/swap-requests/${id}/reject`, payload).then((res) => res.data),
}
