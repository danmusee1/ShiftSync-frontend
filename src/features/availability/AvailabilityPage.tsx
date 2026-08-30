import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/layout/ErrorState'
import { useSession } from '@/features/auth/use-auth'
import {
  useAvailabilityExceptions,
  useAvailabilityRules,
  useDeleteAvailabilityException,
  useDeleteAvailabilityRule,
} from '@/hooks/use-availability'
import { WEEKDAY_LABELS } from '@/lib/time'
import { AvailabilityExceptionDialog } from './AvailabilityExceptionDialog'
import { AvailabilityRuleDialog } from './AvailabilityRuleDialog'

export function AvailabilityPage() {
  const { user } = useSession()
  const staffId = user?.id ?? ''
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false)
  const [exceptionDialogOpen, setExceptionDialogOpen] = useState(false)

  const rules = useAvailabilityRules(staffId)
  const exceptions = useAvailabilityExceptions(staffId)
  const deleteRule = useDeleteAvailabilityRule(staffId)
  const deleteException = useDeleteAvailabilityException(staffId)

  const rulesByDay = new Map<number, typeof rules.data>()
  for (let i = 0; i < 7; i++) rulesByDay.set(i, [])
  for (const rule of rules.data ?? []) {
    rulesByDay.get(rule.dayOfWeek)?.push(rule)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Availability</h1>
        <p className="text-muted-foreground">
          The hours you're normally free to work, plus one-off exceptions for specific dates.
        </p>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Weekly availability</h2>
          <Button size="sm" onClick={() => setRuleDialogOpen(true)}>
            <Plus className="size-4" />
            Add window
          </Button>
        </div>

        {rules.isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : rules.isError ? (
          <ErrorState message="Could not load your availability." onRetry={() => rules.refetch()} />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            {WEEKDAY_LABELS.map((label, day) => (
              <div key={day} className="space-y-2 rounded-lg border border-border bg-card p-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase">{label}</p>
                {rulesByDay.get(day)?.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Not available</p>
                ) : (
                  rulesByDay.get(day)?.map((rule) => (
                    <div
                      key={rule.id}
                      className="flex items-center justify-between gap-1 rounded-md bg-secondary px-2 py-1"
                    >
                      <span className="text-xs font-medium">
                        {rule.startTime} – {rule.endTime}
                      </span>
                      <button
                        type="button"
                        aria-label="Remove window"
                        onClick={() => deleteRule.mutate(rule.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Exceptions</h2>
          <Button size="sm" variant="outline" onClick={() => setExceptionDialogOpen(true)}>
            <Plus className="size-4" />
            Add exception
          </Button>
        </div>

        {exceptions.isLoading ? (
          <Skeleton className="h-24" />
        ) : exceptions.isError ? (
          <ErrorState message="Could not load your exceptions." onRetry={() => exceptions.refetch()} />
        ) : !exceptions.data || exceptions.data.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No exceptions on file.
          </p>
        ) : (
          <div className="space-y-2">
            {exceptions.data.map((exception) => (
              <div
                key={exception.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3"
              >
                <div className="flex items-center gap-3">
                  <Badge variant={exception.type === 'AVAILABLE' ? 'success' : 'warning'}>
                    {exception.type === 'AVAILABLE' ? 'Available' : 'Unavailable'}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium">{exception.date.slice(0, 10)}</p>
                    <p className="text-xs text-muted-foreground">
                      {exception.startTime && exception.endTime
                        ? `${exception.startTime} – ${exception.endTime}`
                        : 'All day'}
                      {exception.reason && ` · ${exception.reason}`}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Remove exception"
                  onClick={() => deleteException.mutate(exception.id)}
                >
                  <Trash2 className="size-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <AvailabilityRuleDialog open={ruleDialogOpen} onOpenChange={setRuleDialogOpen} staffId={staffId} />
      <AvailabilityExceptionDialog
        open={exceptionDialogOpen}
        onOpenChange={setExceptionDialogOpen}
        staffId={staffId}
      />
    </div>
  )
}
