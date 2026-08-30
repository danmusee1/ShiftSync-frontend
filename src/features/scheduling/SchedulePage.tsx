import { useState } from 'react'
import { Loader2, Lock, Plus, Unlock } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useLocations } from '@/hooks/use-locations'
import { addDaysToDateStr, localDayOfWeek, upcomingSunday, WEEKDAY_LABELS } from '@/lib/time'
import type { Shift } from '@/types/domain'
import { ShiftCard } from './ShiftCard'
import { ShiftFormDialog } from './ShiftFormDialog'
import { WeekNavigator } from './WeekNavigator'
import { useDeleteShift } from './hooks/use-shifts'
import {
  useScheduleWeek,
  useScheduleWeekForWeek,
  usePublishScheduleWeek,
  useUnpublishScheduleWeek,
} from './hooks/use-schedule-week'

export function SchedulePage() {
  const { data: locations, isLoading: locationsLoading } = useLocations()
  const [selectedLocationId, setSelectedLocationId] = useState<string>('')
  const [weekStartDate, setWeekStartDate] = useState(upcomingSunday())
  const [shiftDialog, setShiftDialog] = useState<{ open: boolean; date?: string; shift?: Shift }>({
    open: false,
  })
  const [deleteTarget, setDeleteTarget] = useState<Shift | null>(null)

  // Falls back to the first location until the user makes an explicit
  // choice — computed during render instead of synced via an effect.
  const locationId = selectedLocationId || locations?.[0]?.id || ''

  const location = locations?.find((l) => l.id === locationId)
  const weekRef = useScheduleWeekForWeek(locationId || undefined, weekStartDate)
  const weekDetail = useScheduleWeek(weekRef.data?.id)
  const publish = usePublishScheduleWeek(weekRef.data?.id ?? '')
  const unpublish = useUnpublishScheduleWeek(weekRef.data?.id ?? '')
  const deleteShift = useDeleteShift(weekRef.data?.id ?? '')

  const week = weekDetail.data
  const isLoading = locationsLoading || weekRef.isLoading || weekDetail.isLoading

  const days = Array.from({ length: 7 }, (_, i) => addDaysToDateStr(weekStartDate, i))
  const shiftsByDay = new Map<string, Shift[]>(days.map((d) => [d, []]))
  if (week && location) {
    for (const shift of week.shifts) {
      const day = days.find((d) => localDayOfWeek(shift.startAt, location.timezone) === new Date(`${d}T00:00:00Z`).getUTCDay())
      if (day) shiftsByDay.get(day)?.push(shift)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Schedule</h1>
          <p className="text-muted-foreground">Build and publish weekly shift schedules.</p>
        </div>

        <Select value={locationId} onValueChange={setSelectedLocationId} disabled={locationsLoading}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Select a location" />
          </SelectTrigger>
          <SelectContent>
            {locations?.map((loc) => (
              <SelectItem key={loc.id} value={loc.id}>
                {loc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {locations && locations.length === 0 && (
        <p className="text-sm text-muted-foreground">
          You don't manage any locations yet — ask an admin to assign you one.
        </p>
      )}

      {locationId && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-3">
            <WeekNavigator weekStartDate={weekStartDate} onChange={setWeekStartDate} />

            {week && (
              <div className="flex items-center gap-2">
                <Badge variant={week.isPublished ? 'success' : 'secondary'}>
                  {week.isPublished ? 'Published' : 'Draft'}
                </Badge>
                {week.isPublished ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => unpublish.mutate()}
                    disabled={unpublish.isPending}
                  >
                    {unpublish.isPending ? <Loader2 className="animate-spin" /> : <Lock />}
                    Unpublish
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => publish.mutate()} disabled={publish.isPending}>
                    {publish.isPending ? <Loader2 className="animate-spin" /> : <Unlock />}
                    Publish
                  </Button>
                )}
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : (
            week &&
            location && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                {days.map((day) => (
                  <div key={day} className="space-y-2">
                    <div className="flex items-center justify-between px-0.5">
                      <p className="text-xs font-semibold text-muted-foreground uppercase">
                        {WEEKDAY_LABELS[new Date(`${day}T00:00:00Z`).getUTCDay()]}{' '}
                        {Number(day.slice(8, 10))}
                      </p>
                    </div>
                    <div className="space-y-2">
                      {shiftsByDay.get(day)?.map((shift) => (
                        <ShiftCard
                          key={shift.id}
                          shift={shift}
                          scheduleWeekId={week.id}
                          locationTimezone={location.timezone}
                          onEdit={(s) => setShiftDialog({ open: true, shift: s })}
                          onDelete={setDeleteTarget}
                        />
                      ))}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full border border-dashed border-border text-muted-foreground"
                        onClick={() => setShiftDialog({ open: true, date: day })}
                      >
                        <Plus className="size-3.5" />
                        Add shift
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {week && location && (
            <ShiftFormDialog
              open={shiftDialog.open}
              onOpenChange={(open) => setShiftDialog((prev) => ({ ...prev, open }))}
              scheduleWeekId={week.id}
              locationTimezone={location.timezone}
              defaultDate={shiftDialog.date}
              shift={shiftDialog.shift}
            />
          )}
        </>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this shift?</AlertDialogTitle>
            <AlertDialogDescription>
              This can't be undone. Shifts with swap/drop history can't be deleted — edit them
              instead to preserve the audit trail.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) deleteShift.mutate(deleteTarget.id)
                setDeleteTarget(null)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
