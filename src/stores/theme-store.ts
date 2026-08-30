import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyResolvedTheme(resolved: ResolvedTheme): void {
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}

function resolve(theme: Theme): ResolvedTheme {
  return theme === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : theme
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      resolvedTheme: 'light',
      setTheme: (theme) => {
        const resolvedTheme = resolve(theme)
        applyResolvedTheme(resolvedTheme)
        set({ theme, resolvedTheme })
      },
    }),
    {
      name: 'shiftsync-theme',
      onRehydrateStorage: () => (state) => {
        if (!state) return
        const resolvedTheme = resolve(state.theme)
        applyResolvedTheme(resolvedTheme)
        state.resolvedTheme = resolvedTheme
      },
    },
  ),
)

// Keep "system" theme in sync with OS-level changes while the app is open.
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  const { theme } = useThemeStore.getState()
  if (theme !== 'system') return
  const resolvedTheme = resolve(theme)
  applyResolvedTheme(resolvedTheme)
  useThemeStore.setState({ resolvedTheme })
})
