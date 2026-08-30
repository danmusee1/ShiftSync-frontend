import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { getAuthState, useAuthStore } from '@/stores/auth-store'
import type { ApiErrorResponse } from '@/types/domain'
import { ApiError } from './api-error'

export const API_BASE_URL: string =
  import.meta.env.VITE_API_URL ?? 'https://shiftsync.civic-nexus.com'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const { accessToken } = getAuthState()
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`)
  }
  return config
})

// A refresh is triggered by whichever request hits 401 first; every other
// request that 401s while it's in flight awaits the same promise instead of
// firing its own refresh call.
let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const { refreshToken } = getAuthState()
  if (!refreshToken) throw new Error('No refresh token available')

  const response = await axios.post<{ accessToken: string; refreshToken: string }>(
    `${API_BASE_URL}/auth/refresh`,
    { refreshToken },
  )
  useAuthStore.getState().setTokens(response.data)
  return response.data.accessToken
}

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const config = error.config as RetriableConfig | undefined
    const status = error.response?.status

    const isAuthEndpoint = config?.url?.startsWith('/auth/');
    if (status === 401 && config && !config._retried && !isAuthEndpoint) {
      config._retried = true
      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null
        })
        const accessToken = await refreshPromise
        config.headers.set('Authorization', `Bearer ${accessToken}`)
        return apiClient.request(config)
      } catch {
        useAuthStore.getState().clearSession()
        window.location.assign('/login')
        return Promise.reject(new ApiError(401, { message: 'Session expired' }))
      }
    }

    if (error.response) {
      throw new ApiError(error.response.status, {
        message: error.response.data?.message ?? error.message,
        violations: error.response.data?.violations,
        suggestions: error.response.data?.suggestions,
        path: error.response.data?.path,
      })
    }

    throw new ApiError(0, { message: error.message || 'Network error — is the API reachable?' })
  },
)
