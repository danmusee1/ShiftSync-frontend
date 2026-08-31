import { apiClient } from '@/api/client'
import type { Role, User } from '@/types/domain'

export interface CreateUserPayload {
  email: string
  password: string
  firstName: string
  lastName: string
  role: Role
  homeTimezone: string
  notificationChannel?: User['notificationChannel']
  desiredWeeklyHours?: number
  hourlyRate?: number
}

export type UpdateUserPayload = Partial<Omit<CreateUserPayload, 'email' | 'password'>> & {
  password?: string
}

export interface UpdateProfilePayload {
  homeTimezone?: string
  notificationChannel?: User['notificationChannel']
  desiredWeeklyHours?: number
}

export const usersApi = {
  me: () => apiClient.get<User>('/users/me').then((res) => res.data),

  updateMe: (payload: UpdateProfilePayload) =>
    apiClient.patch<User>('/users/me', payload).then((res) => res.data),

  list: (role?: Role) =>
    apiClient.get<User[]>('/users', { params: role ? { role } : undefined }).then((res) => res.data),

  /** Staff-safe: other active staff certified at a location the caller is also certified at. */
  listColleagues: () => apiClient.get<User[]>('/users/me/colleagues').then((res) => res.data),

  get: (id: string) => apiClient.get<User>(`/users/${id}`).then((res) => res.data),

  create: (payload: CreateUserPayload) =>
    apiClient.post<User>('/users', payload).then((res) => res.data),

  update: (id: string, payload: UpdateUserPayload) =>
    apiClient.patch<User>(`/users/${id}`, payload).then((res) => res.data),

  activate: (id: string) => apiClient.patch<User>(`/users/${id}/activate`).then((res) => res.data),

  deactivate: (id: string) =>
    apiClient.patch<User>(`/users/${id}/deactivate`).then((res) => res.data),
}
