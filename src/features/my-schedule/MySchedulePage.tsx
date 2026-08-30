import { useState } from 'react'
import { ArrowLeftRight, LogOut, Timer } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useSession } from '@/features/auth/use-auth'
import { useScheduleWeek, useScheduleWeeksForLocation } from '@/features/scheduling/hooks/use-schedule-week'
import { WeekNavigator } from '@/features/scheduling/WeekNavigator'
import { useLocations } from '@/hooks/use-locations'
import { useClockIn, useClockOut } from '@/hooks/use-timeclock'
import { addDaysToDateStr, formatLocalTimeRange, localDayOfWeek, shiftDurationHours, upcomingSunday, WEEKDAY_LABELS } from '@/lib/time'
import type { Shift } from '@/types/domain'
import { RequestDropDialog } from './RequestDropDialog'
import { RequestSwapDialog } from './RequestSwapDialog'

const CLOCK_IN_WINDOW_MINUTES = 15

function ClockControls({ shift, staffId }: { shift: Shift; staffId: string }) {
  const clockIn = useClockIn()
  const clockOut = useClockOut()

  const assignment = shift.assignments?.find((a) => a.staffId === staffId)
  if (!assignment) return null

  const now = new Date()
  const earliestClockIn = new Date(new Date(shift.startAt).getTime() - CLOCK_IN_WINDOW_MINUTES * 60_000)
  const inWindow = now >= earliestClockIn && now <= new Date(shift.endAt)
  if (!inWindow) return null

  if (assignment.clockOutAt) {
    return <p className="text-xs text-muted-foreground">Clocked out</p>
  }

  if (assignment.clockInAt) {
    return (
      <Button
        size="sm"
        variant="outline"
        className="h-7 w-full text-xs"
        onClick={() => clockOut.mutate({ shiftId: shift.id, locationId: shift.locationId })}
        disabled={clockOut.isPending}
      >
        <LogOut className="size-3.5" />
        Clock out
      </Button>
    )
  }

  return (
    <Button
      size="sm"
      className="h-7 w-full text-xs"
      onClick={() => clockIn.mutate({ shiftId: shift.id, locationId: shift.locationId })}
      disabled={clockIn.isPending}
    >
      <Timer className="size-3.5" />
      Clock in
    </Button>
  )
}

export function MySchedulePage() {
  const { user } = useSession()
  const { data: locations, isLoading: locationsLoading } = useLocations()
  const [selectedLocationId, setSelectedLocationId] = useState('')
  const [weekStartDate, setWeekStartDate] = useState(upcomingSunday())
  const [swapTarget, setSwapTarget] = useState<Shift | null>(null)
  const [dropTarget, setDropTarget] = useState<Shift | null>(null)

  const locationId = selectedLocationId || locations?.[0]?.id || ''
  const location = locations?.find((l) => l.id === locationId)

  const weeks = useScheduleWeeksForLocation(locationId || undefined)
  const week = weeks.data?.find((w) => w.weekStartDate.slice(0, 10) === weekStartDate)
  const weekDetail = useScheduleWeek(week?.id)

  const isLoading = locationsLoading || weeks.isLoading || (!!week && weekDetail.isLoading)

  const myShifts = (weekDetail.data?.shifts ?? [])
    .filter((shift) => shift.assignments?.some((a) => a.staffId === user?.id && a.status === 'ASSIGNED'))
    .sort((a, b) => a.startAt.localeCompare(b.startAt))

  const days = Array.from({ length: 7 }, (_, i) => addDaysToDateStr(weekStartDate, i))
  const shiftsByDay = new Map<string, Shift[]>(days.map((d) => [d, []]))
  if (location) {
    for (const shift of myShifts) {
      const day = days.find((d) => localDayOfWeek(shift.startAt, location.timezone) === new Date(`${d}T00:00:00Z`).getUTCDay())
      if (day) shiftsByDay.get(day)?.push(shift)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">My Schedule</h1>
          <p className="text-muted-foreground">Your upcoming shifts, and where to request coverage changes.</p>
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

      {locations && locations.length === 0 && (
        <p className="text-sm text-muted-foreground">
          You aren't certified at any location yet — ask your manager to add you.
        </p>
      )}

      {locationId && (
        <>
          <div className="rounded-lg border border-border bg-card p-3">
            <WeekNavigator weekStartDate={weekStartDate} onChange={setWeekStartDate} />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : !week ? (
            <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No published schedule for this week yet.
            </p>
          ) : (
            location && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                {days.map((day) => (
                  <div key={day} className="space-y-2">
                    <p className="px-0.5 text-xs font-semibold text-muted-foreground uppercase">
                      {WEEKDAY_LABELS[new Date(`${day}T00:00:00Z`).getUTCDay()]}{' '}
                      {Number(day.slice(8, 10))}
                    </p>
                    <div className="space-y-2">
                      {shiftsByDay.get(day)?.length === 0 && (
                        <p className="rounded-md border border-dashed border-border px-2 py-4 text-center text-xs text-muted-foreground">
                          Off
                        </p>
                      )}
                      {shiftsByDay.get(day)?.map((shift) => {
                        const isUpcoming = new Date(shift.startAt) > new Date()
                        return (
                          <div key={shift.id} className="space-y-2 rounded-lg border border-border bg-card p-3">
                            <p className="text-sm font-medium">
                              {formatLocalTimeRange(shift.startAt, shift.endAt, location.timezone)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {shiftDurationHours(shift.startAt, shift.endAt).toFixed(1)}h
                            </p>
                            {shift.requiredSkill && <Badge variant="secondary">{shift.requiredSkill.name}</Badge>}
                            {user && <ClockControls shift={shift} staffId={user.id} />}
                            {isUpcoming && (
                              <div className="flex gap-1.5 pt-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 flex-1 text-xs"
                                  onClick={() => setSwapTarget(shift)}
                                >
                                  <ArrowLeftRight className="size-3.5" />
                                  Swap
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 flex-1 text-xs"
                                  onClick={() => setDropTarget(shift)}
                                >
                                  <LogOut className="size-3.5" />
                                  Drop
                                </Button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}

      {user && location && (
        <>
          <RequestSwapDialog
            shift={swapTarget}
            staffId={user.id}
            locationTimezone={location.timezone}
            onOpenChange={(open) => !open && setSwapTarget(null)}
          />
          <RequestDropDialog
            shift={dropTarget}
            staffId={user.id}
            locationTimezone={location.timezone}
            onOpenChange={(open) => !open && setDropTarget(null)}
          />
        </>
      )}
    </div>
  )
}
