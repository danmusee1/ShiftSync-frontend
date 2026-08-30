import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { WeekNavigator } from '@/features/scheduling/WeekNavigator'
import { useWeeklyOvertimeReport } from '@/hooks/use-compliance'
import { useLocations } from '@/hooks/use-locations'
import { upcomingSunday } from '@/lib/time'
import type { OvertimeStatus } from '@/types/domain'

const STATUS_BADGE: Record<OvertimeStatus, 'success' | 'warning' | 'destructive'> = {
  OK: 'success',
  WARNING: 'warning',
  OVERTIME: 'destructive',
}

export function CompliancePage() {
  const { data: locations, isLoading: locationsLoading } = useLocations()
  const [selectedLocationId, setSelectedLocationId] = useState('')
  const [weekStartDate, setWeekStartDate] = useState(upcomingSunday())

  const locationId = selectedLocationId || locations?.[0]?.id || ''
  const report = useWeeklyOvertimeReport(weekStartDate, locationId || undefined)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Overtime Compliance</h1>
          <p className="text-muted-foreground">
            Weekly hours per staff member, bucketed in their own home timezone — same rules the
            scheduler enforces.
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
      ) : !report.data || report.data.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No hours scheduled for this week yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground uppercase">
              <tr>
                <th className="px-3 py-2 font-medium">Staff</th>
                <th className="px-3 py-2 font-medium">Weekly hours</th>
                <th className="px-3 py-2 font-medium">Over threshold</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {report.data.map((row) => (
                <tr key={row.staffId}>
                  <td className="px-3 py-2 font-medium">
                    {row.firstName} {row.lastName}
                  </td>
                  <td className="px-3 py-2 tabular-nums">{row.weeklyHours.toFixed(1)}h</td>
                  <td className="px-3 py-2 tabular-nums">
                    {row.projectedOvertimeHours > 0 ? `+${row.projectedOvertimeHours.toFixed(1)}h` : '—'}
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant={STATUS_BADGE[row.status]}>{row.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
