import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSession } from '@/features/auth/use-auth'
import { roleLabel } from '@/lib/format'

export function DashboardPage() {
  const { user } = useSession()
  if (!user) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Welcome back, {user.firstName}</h1>
        <p className="text-muted-foreground">
          You're signed in as {roleLabel(user.role).toLowerCase()}.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>More on the way</CardTitle>
          <CardDescription>
            Scheduling, swaps, compliance, fairness, and admin tools are built out feature by
            feature next.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
