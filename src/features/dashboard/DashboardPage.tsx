import { Link } from 'react-router-dom'

import { navItems } from '@/app/nav-config'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { useSession } from '@/features/auth/use-auth'
import { roleLabel } from '@/lib/format'

export function DashboardPage() {
  const { user } = useSession()
  if (!user) return null

  const quickLinks = navItems.filter((item) => item.href !== '/' && item.roles.includes(user.role))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Welcome back, {user.firstName}</h1>
        <p className="text-muted-foreground">You're signed in as {roleLabel(user.role).toLowerCase()}.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((item) => (
          <Link key={item.href} to={item.href}>
            <Card className="transition-colors hover:border-primary/50 hover:bg-accent/50">
              <CardHeader className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="size-4.5" />
                </div>
                <CardTitle className="text-base">{item.label}</CardTitle>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
