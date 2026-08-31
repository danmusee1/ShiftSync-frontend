import { Fragment, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/layout/ErrorState'
import { WeekNavigator } from '@/features/scheduling/WeekNavigator'
import { useWeeklyOvertimeReport } from '@/hooks/use-compliance'
import { useLocations } from '@/hooks/use-locations'
import { formatLocalDate, formatLocalTimeRange, upcomingSunday } from '@/lib/time'
import type { OvertimeStatus, StaffWeeklyHours, WeeklyHoursAssignment } from '@/types/domain'

const STATUS_BADGE: Record<OvertimeStatus, 'success' | 'warning' | 'destructive'> = {
  OK: 'success',
  WARNING: 'warning',
  OVERTIME: 'destructive',
}

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount)
}

// Mirrors the backend's businessRules.weeklyHoursWarning/weeklyHoursOvertime
// defaults (35h / 40h) — the frontend has no endpoint to read these live, so
// this is a display-only assumption that should track the backend config if
// it's ever changed away from the defaults.
const WEEKLY_HOURS_WARNING = 35
const WEEKLY_HOURS_OVERTIME = 40

type CrossingKind = 'overtime' | 'warning' | null

function crossingFor(assignment: WeeklyHoursAssignment): CrossingKind {
  const before = assignment.cumulativeHoursAfter - assignment.hours
  if (before < WEEKLY_HOURS_OVERTIME && assignment.cumulativeHoursAfter >= WEEKLY_HOURS_OVERTIME) {
    return 'overtime'
  }
  if (before < WEEKLY_HOURS_WARNING && assignment.cumulativeHoursAfter >= WEEKLY_HOURS_WARNING) {
    return 'warning'
  }
  return null
}

function AssignmentBreakdown({
  row,
  timezoneFor,
}: {
  row: StaffWeeklyHours
  timezoneFor: (locationId: string) => string
}) {
  return (
    <tr>
      <td colSpan={5} className="bg-muted/30 px-3 py-3">
        <p className="mb-2 text-xs font-medium text-muted-foreground uppercase">
          Every assignment counting toward {row.firstName}'s {row.weeklyHours.toFixed(1)}h this week
        </p>
        {row.hourlyRate != null && row.totalCost != null ? (
          <p className="mb-3 text-sm">
            <span className="text-muted-foreground">At {formatCurrency(row.hourlyRate)}/hr — </span>
            <span className="font-medium">{formatCurrency(row.regularCost ?? 0)} regular</span>
            {row.overtimePremium != null && row.overtimePremium > 0 && (
              <>
                {' + '}
                <span className="font-medium text-destructive">
                  {formatCurrency(row.overtimePremium)} overtime premium
                </span>
              </>
            )}
            {' = '}
            <span className="font-semibold">{formatCurrency(row.totalCost)} projected this week</span>
          </p>
        ) : (
          <p className="mb-3 text-sm text-muted-foreground">
            No hourly rate on file for {row.firstName} — add one from the Users page to see projected cost.
          </p>
        )}
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground uppercase">
              <tr>
                <th className="px-3 py-1.5 font-medium">Shift</th>
                <th className="px-3 py-1.5 font-medium">Hours</th>
                <th className="px-3 py-1.5 font-medium">Running total</th>
                <th className="px-3 py-1.5 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {row.assignments.map((assignment) => {
                const crossing = crossingFor(assignment)
                const timezone = timezoneFor(assignment.locationId)
                return (
                  <tr
                    key={assignment.shiftId}
                    className={
                      crossing === 'overtime'
                        ? 'bg-destructive/10'
                        : crossing === 'warning'
                          ? 'bg-warning/10'
                          : undefined
                    }
                  >
                    <td className="px-3 py-1.5">
                      {formatLocalDate(assignment.startAt, timezone)} ·{' '}
                      {formatLocalTimeRange(assignment.startAt, assignment.endAt, timezone)}
                    </td>
                    <td className="px-3 py-1.5 tabular-nums">{assignment.hours.toFixed(1)}h</td>
                    <td className="px-3 py-1.5 tabular-nums">{assignment.cumulativeHoursAfter.toFixed(1)}h</td>
                    <td className="px-3 py-1.5">
                      {crossing === 'overtime' && (
                        <Badge variant="destructive">Pushes into overtime</Badge>
                      )}
                      {crossing === 'warning' && (
                        <Badge variant="warning">Pushes into warning zone</Badge>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </td>
    </tr>
  )
}

export function CompliancePage() {
  const { data: locations, isLoading: locationsLoading } = useLocations()
  const [selectedLocationId, setSelectedLocationId] = useState('')
  const [weekStartDate, setWeekStartDate] = useState(upcomingSunday())
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const locationId = selectedLocationId || locations?.[0]?.id || ''
  const report = useWeeklyOvertimeReport(weekStartDate, locationId || undefined)

  const totalProjectedCost = (report.data ?? []).reduce((sum, r) => sum + (r.totalCost ?? 0), 0)
  const totalOvertimePremium = (report.data ?? []).reduce((sum, r) => sum + (r.overtimePremium ?? 0), 0)
  const staffWithRates = (report.data ?? []).filter((r) => r.hourlyRate != null).length

  const timezoneFor = (id: string) => locations?.find((l) => l.id === id)?.timezone ?? 'UTC'

  function toggleExpanded(staffId: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(staffId)) next.delete(staffId)
      else next.add(staffId)
      return next
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Overtime Compliance</h1>
          <p className="text-muted-foreground">
            Weekly hours per staff member, bucketed in their own home timezone — same rules the
            scheduler enforces. Expand a row to see exactly which shift pushes them over.
          </p>
        </div>

        {locations && locations.length > 1 && (
          <Select value={locationId} onValueChange={setSelectedLocationId} disabled={locationsLoading}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Select a location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((loc) => (
                <SelectItem key={loc.id} value={loc.id}>
                  {loc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-3">
        <WeekNavigator weekStartDate={weekStartDate} onChange={setWeekStartDate} />
      </div>

      {report.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      ) : report.isError ? (
        <ErrorState message="Could not load the overtime report." onRetry={() => report.refetch()} />
      ) : !report.data || report.data.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No hours scheduled for this week yet.
        </p>
      ) : (
        <>
          {staffWithRates > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Projected labor cost this week
                </p>
                <p className="font-display text-2xl font-bold">{formatCurrency(totalProjectedCost)}</p>
                <p className="text-xs text-muted-foreground">
                  {staffWithRates} of {report.data.length} staff have a rate on file
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase">Of which, overtime premium</p>
                <p className="font-display text-2xl font-bold text-destructive">
                  {formatCurrency(totalOvertimePremium)}
                </p>
                <p className="text-xs text-muted-foreground">The extra cost avoidable without the overtime</p>
              </div>
            </div>
          )}
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs text-muted-foreground uppercase">
                <tr>
                  <th className="w-8"></th>
                  <th className="px-3 py-2 font-medium">Staff</th>
                  <th className="px-3 py-2 font-medium">Weekly hours</th>
                  <th className="px-3 py-2 font-medium">Over threshold</th>
                  <th className="px-3 py-2 font-medium">Projected cost</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {report.data.map((row) => {
                  const isExpanded = expandedIds.has(row.staffId)
                  return (
                    <Fragment key={row.staffId}>
                      <tr
                        className="cursor-pointer hover:bg-muted/30"
                        onClick={() => toggleExpanded(row.staffId)}
                      >
                        <td className="pl-3">
                          <Button variant="ghost" size="icon" className="size-6" aria-label="Toggle breakdown">
                            {isExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
                          </Button>
                        </td>
                        <td className="px-3 py-2 font-medium">
                          {row.firstName} {row.lastName}
                        </td>
                        <td className="px-3 py-2 tabular-nums">{row.weeklyHours.toFixed(1)}h</td>
                        <td className="px-3 py-2 tabular-nums">
                          {row.projectedOvertimeHours > 0 ? `+${row.projectedOvertimeHours.toFixed(1)}h` : '—'}
                        </td>
                        <td className="px-3 py-2 tabular-nums">
                          {row.totalCost != null ? formatCurrency(row.totalCost) : '—'}
                        </td>
                        <td className="px-3 py-2">
                          <Badge variant={STATUS_BADGE[row.status]}>{row.status}</Badge>
                        </td>
                      </tr>
                      {isExpanded && <AssignmentBreakdown row={row} timezoneFor={timezoneFor} />}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
