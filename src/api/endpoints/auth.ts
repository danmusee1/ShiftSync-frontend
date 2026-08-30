import { apiClient } from '@/api/client'
import type { AuthenticatedUser } from '@/types/domain'

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginResponse extends AuthTokens {
  user: AuthenticatedUser
}

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<LoginResponse>('/auth/login', payload).then((res) => res.data),

  refresh: (refreshToken: string) =>
    apiClient.post<AuthTokens>('/auth/refresh', { refreshToken }).then((res) => res.data),

  logout: (refreshToken: string) => apiClient.post('/auth/logout', { refreshToken }),
}
