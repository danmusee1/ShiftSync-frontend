import { useState } from 'react'
import { Radio } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useLocations } from '@/hooks/use-locations'
import { useOnDuty } from '@/hooks/use-timeclock'
import { initials } from '@/lib/format'

export function OnDutyPage() {
  const { data: locations, isLoading: locationsLoading } = useLocations()
  const [selectedLocationId, setSelectedLocationId] = useState('')
  const locationId = selectedLocationId || locations?.[0]?.id || ''
  const location = locations?.find((l) => l.id === locationId)

  const onDuty = useOnDuty(locationId || undefined)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">On Duty</h1>
          <p className="text-muted-foreground">Who's currently clocked in, live.</p>
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

      {onDuty.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
        </div>
      ) : !onDuty.data || onDuty.data.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Nobody's clocked in at {location?.name ?? 'this location'} right now.
        </p>
      ) : (
        <div className="space-y-2">
          {onDuty.data.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
            >
              <Avatar>
                <AvatarFallback>{initials(entry.staff.firstName, entry.staff.lastName)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  {entry.staff.firstName} {entry.staff.lastName}
                </p>
                <p className="text-xs text-muted-foreground">
                  Clocked in at{' '}
                  {new Date(entry.clockInAt).toLocaleTimeString(undefined, {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-success">
                <Radio className="size-3 animate-pulse" />
                Live
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
