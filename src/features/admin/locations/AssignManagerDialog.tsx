import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAssignManager } from '@/hooks/use-locations'
import { useUsers } from '@/hooks/use-users'
import type { Location } from '@/types/domain'

interface AssignManagerDialogProps {
  location: Location | null
  onOpenChange: (open: boolean) => void
}

// The backend doesn't expose which managers are already assigned to a
// location (only assign/unassign endpoints), so this dialog can only make a
// new assignment — it can't show or remove existing ones. Documented
// simplification, not an oversight.
export function AssignManagerDialog({ location, onOpenChange }: AssignManagerDialogProps) {
  const [managerId, setManagerId] = useState('')
  const { data: managers, isLoading } = useUsers('MANAGER')
  const assignManager = useAssignManager()

  function handleOpenChange(next: boolean) {
    if (!next) setManagerId('')
    onOpenChange(next)
  }

  return (
    <Dialog open={!!location} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign a manager</DialogTitle>
          <DialogDescription>Give a manager access to {location?.name}.</DialogDescription>
        </DialogHeader>

        <Select value={managerId} onValueChange={setManagerId} disabled={isLoading}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a manager" />
          </SelectTrigger>
          <SelectContent>
            {managers?.map((manager) => (
              <SelectItem key={manager.id} value={manager.id}>
                {manager.firstName} {manager.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!managerId || assignManager.isPending}
            onClick={() => {
              if (!location) return
              assignManager.mutate(
                { locationId: location.id, managerId },
                { onSuccess: () => handleOpenChange(false) },
              )
            }}
          >
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
