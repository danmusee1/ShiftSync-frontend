import { Toaster as Sonner, type ToasterProps } from 'sonner'

import { useThemeStore } from '@/stores/theme-store'

function Toaster(props: ToasterProps) {
  const theme = useThemeStore((state) => state.resolvedTheme)

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      richColors
      closeButton
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
