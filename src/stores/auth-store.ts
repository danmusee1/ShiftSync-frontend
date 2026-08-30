import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { AuthenticatedUser } from '@/types/domain'

interface AuthTokens {
  accessToken: string
  refreshToken: string
}

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: AuthenticatedUser | null
  setSession: (session: AuthTokens & { user: AuthenticatedUser }) => void
  setTokens: (tokens: AuthTokens) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setSession: ({ accessToken, refreshToken, user }) =>
        set({ accessToken, refreshToken, user }),
      setTokens: ({ accessToken, refreshToken }) => set({ accessToken, refreshToken }),
      clearSession: () => set({ accessToken: null, refreshToken: null, user: null }),
    }),
    { name: 'shiftsync-auth' },
  ),
)

/** For use outside React components (e.g. the axios interceptor). */
export function getAuthState(): AuthState {
  return useAuthStore.getState()
}
