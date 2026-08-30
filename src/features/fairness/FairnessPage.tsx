import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WeekNavigator } from '@/features/scheduling/WeekNavigator'
import { useDesiredHoursComparison, useHoursDistribution, usePremiumShiftFairness } from '@/hooks/use-fairness'
import { useLocations } from '@/hooks/use-locations'
import { addDaysToDateStr, upcomingSunday } from '@/lib/time'

export function FairnessPage() {
  const { data: locations, isLoading: locationsLoading } = useLocations()
  const [selectedLocationId, setSelectedLocationId] = useState('')
  const [weekStartDate, setWeekStartDate] = useState(upcomingSunday())

  const locationId = selectedLocationId || locations?.[0]?.id || ''
  const weekEndDate = addDaysToDateStr(weekStartDate, 7)

  const hoursDistribution = useHoursDistribution(weekStartDate, weekEndDate, locationId || undefined)
  const premiumShifts = usePremiumShiftFairness(weekStartDate, weekEndDate, locationId || undefined)
  const desiredHours = useDesiredHoursComparison(weekStartDate, locationId || undefined)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Fairness</h1>
          <p className="text-muted-foreground">How hours and desirable shifts are spread across the team.</p>
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

      <Tabs defaultValue="hours">
        <TabsList>
          <TabsTrigger value="hours">Hours distribution</TabsTrigger>
          <TabsTrigger value="premium">Premium shifts</TabsTrigger>
          <TabsTrigger value="desired">Desired vs actual</TabsTrigger>
        </TabsList>

        <TabsContent value="hours">
          {hoursDistribution.isLoading ? (
            <Skeleton className="h-40" />
          ) : !hoursDistribution.data || hoursDistribution.data.length === 0 ? (
            <EmptyState />
          ) : (
            <Table
              headers={['Staff', 'Total hours', 'Shifts']}
              rows={hoursDistribution.data.map((row) => [
                `${row.firstName} ${row.lastName}`,
                `${row.totalHours.toFixed(1)}h`,
                String(row.shiftCount),
              ])}
            />
          )}
        </TabsContent>

        <TabsContent value="premium">
          {premiumShifts.isLoading ? (
            <Skeleton className="h-40" />
          ) : !premiumShifts.data || premiumShifts.data.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs text-muted-foreground uppercase">
                  <tr>
                    <th className="px-3 py-2 font-medium">Staff</th>
                    <th className="px-3 py-2 font-medium">Premium shifts</th>
                    <th className="px-3 py-2 font-medium">Total shifts</th>
                    <th className="px-3 py-2 font-medium">Fairness score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {premiumShifts.data.map((row) => (
                    <tr key={row.staffId}>
                      <td className="px-3 py-2 font-medium">
                        {row.firstName} {row.lastName}
                      </td>
                      <td className="px-3 py-2 tabular-nums">
                        {row.premiumShifts} ({(row.premiumRatio * 100).toFixed(0)}%)
                      </td>
                      <td className="px-3 py-2 tabular-nums">{row.totalShifts}</td>
                      <td className="px-3 py-2">
                        <Badge variant={row.fairnessScore >= 0.8 ? 'success' : row.fairnessScore >= 0.5 ? 'warning' : 'destructive'}>
                          {row.fairnessScore.toFixed(2)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="desired">
          {desiredHours.isLoading ? (
            <Skeleton className="h-40" />
          ) : !desiredHours.data || desiredHours.data.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs text-muted-foreground uppercase">
                  <tr>
                    <th className="px-3 py-2 font-medium">Staff</th>
                    <th className="px-3 py-2 font-medium">Desired</th>
                    <th className="px-3 py-2 font-medium">Actual</th>
                    <th className="px-3 py-2 font-medium">Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {desiredHours.data.map((row) => (
                    <tr key={row.staffId}>
                      <td className="px-3 py-2 font-medium">
                        {row.firstName} {row.lastName}
                      </td>
                      <td className="px-3 py-2 tabular-nums">
                        {row.desiredWeeklyHours !== null ? `${row.desiredWeeklyHours.toFixed(1)}h` : '—'}
                      </td>
                      <td className="px-3 py-2 tabular-nums">{row.actualWeeklyHours.toFixed(1)}h</td>
                      <td className="px-3 py-2 tabular-nums">
                        {row.deltaHours === null
                          ? '—'
                          : `${row.deltaHours > 0 ? '+' : ''}${row.deltaHours.toFixed(1)}h`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function EmptyState() {
  return (
    <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
      No data for this week yet.
    </p>
  )
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs text-muted-foreground uppercase">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-3 py-2 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className={`px-3 py-2 ${j > 0 ? 'tabular-nums' : 'font-medium'}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
