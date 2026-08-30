import { useState } from 'react'
import { CalendarClock, Menu, X } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

import { navItems } from '@/app/nav-config'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSession } from '@/features/auth/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { NotificationBell } from './NotificationBell'
import { ThemeToggle } from './ThemeToggle'
import { UserMenu } from './UserMenu'

function Sidebar({ onClose }: { onClose?: () => void }) {
  const { user } = useSession()
  const items = navItems.filter((item) => user && item.roles.includes(user.role))

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <CalendarClock className="size-4.5" />
        </div>
        <span className="font-display flex-1 text-base font-bold">ShiftSync</span>
        {onClose && (
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onClose} aria-label="Close navigation">
            <X />
          </Button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item, index) => (
          <div key={item.href}>
            {item.section && item.section !== items[index - 1]?.section && (
              <p className="mt-4 mb-1 px-3 text-xs font-semibold text-muted-foreground uppercase">
                {item.section}
              </p>
            )}
            <NavLink
              to={item.href}
              end={item.href === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )
              }
            >
              <item.icon className="size-4" />
              {item.label}
            </NavLink>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <UserMenu />
      </div>
    </div>
  )
}

export function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  useRealtime()

  return (
    <div className="flex min-h-svh bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border md:block">
        <Sidebar />
      </aside>

      {/* Mobile sidebar */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 w-64 bg-card shadow-lg">
            <Sidebar onClose={() => setMobileNavOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center border-b border-border px-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation"
          >
            <Menu />
          </Button>
          <div className="ml-auto flex items-center gap-1">
            <NotificationBell />
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
