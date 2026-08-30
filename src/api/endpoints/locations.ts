import { apiClient } from '@/api/client'
import type { Location } from '@/types/domain'

export interface CreateLocationPayload {
  name: string
  timezone: string
  address?: string
}

export type UpdateLocationPayload = Partial<CreateLocationPayload> & { isActive?: boolean }

export const locationsApi = {
  list: () => apiClient.get<Location[]>('/locations').then((res) => res.data),

  get: (id: string) => apiClient.get<Location>(`/locations/${id}`).then((res) => res.data),

  create: (payload: CreateLocationPayload) =>
    apiClient.post<Location>('/locations', payload).then((res) => res.data),

  update: (id: string, payload: UpdateLocationPayload) =>
    apiClient.patch<Location>(`/locations/${id}`, payload).then((res) => res.data),

  assignManager: (locationId: string, managerId: string) =>
    apiClient.post(`/locations/${locationId}/managers/${managerId}`),

  unassignManager: (locationId: string, managerId: string) =>
    apiClient.delete(`/locations/${locationId}/managers/${managerId}`),
}
