import { useState } from 'react'
import { Plus, UserPlus } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useLocations, useUpdateLocation } from '@/hooks/use-locations'
import type { Location } from '@/types/domain'
import { AssignManagerDialog } from './AssignManagerDialog'
import { LocationFormDialog } from './LocationFormDialog'

function ToggleActiveButton({ location }: { location: Location }) {
  const updateLocation = useUpdateLocation(location.id)
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 text-xs"
      onClick={() => updateLocation.mutate({ isActive: !location.isActive })}
      disabled={updateLocation.isPending}
    >
      {location.isActive ? 'Deactivate' : 'Activate'}
    </Button>
  )
}

export function AdminLocationsPage() {
  const { data: locations, isLoading } = useLocations()
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Location | null>(null)
  const [managerTarget, setManagerTarget] = useState<Location | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Locations</h1>
          <p className="text-muted-foreground">Coastal Eats' restaurant locations.</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="size-4" />
          New location
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
        </div>
      ) : (
        <div className="space-y-2">
          {locations?.map((location) => (
            <div
              key={location.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-3"
            >
              <div>
                <p className="flex items-center gap-2 text-sm font-medium">
                  {location.name}
                  <Badge variant={location.isActive ? 'success' : 'outline'}>
                    {location.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </p>
                <p className="text-xs text-muted-foreground">
                  {location.timezone}
                  {location.address && ` · ${location.address}`}
                </p>
              </div>
              <div className="flex gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setManagerTarget(location)}
                >
                  <UserPlus className="size-3.5" />
                  Assign manager
                </Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setEditTarget(location)}>
                  Edit
                </Button>
                <ToggleActiveButton location={location} />
              </div>
            </div>
          ))}
        </div>
      )}

      <LocationFormDialog open={formOpen} onOpenChange={setFormOpen} />
      <LocationFormDialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        location={editTarget}
      />
      <AssignManagerDialog location={managerTarget} onOpenChange={(open) => !open && setManagerTarget(null)} />
    </div>
  )
}
