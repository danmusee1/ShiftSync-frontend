import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { authApi, type LoginPayload } from '@/api/endpoints/auth'
import { queryClient } from '@/lib/query-client'
import { useAuthStore } from '@/stores/auth-store'

export function useSession() {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = !!user
  return { user, isAuthenticated }
}

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (data) => {
      setSession(data)
      navigate('/', { replace: true })
    },
  })
}

export function useLogout() {
  const refreshToken = useAuthStore((state) => state.refreshToken)
  const clearSession = useAuthStore((state) => state.clearSession)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async () => {
      if (refreshToken) {
        await authApi.logout(refreshToken).catch(() => undefined)
      }
    },
    onSettled: () => {
      clearSession()
      queryClient.clear()
      navigate('/login', { replace: true })
    },
  })
}
