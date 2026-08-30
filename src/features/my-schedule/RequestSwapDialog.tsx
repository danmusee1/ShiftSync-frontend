import { useState } from 'react'
import { Loader2 } from 'lucide-react'

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
import { useUsers } from '@/hooks/use-users'
import { useRequestSwap } from '@/hooks/use-swap-requests'
import { formatLocalDate, formatLocalTimeRange } from '@/lib/time'
import type { Shift } from '@/types/domain'

interface RequestSwapDialogProps {
  shift: Shift | null
  staffId: string
  locationTimezone: string
  onOpenChange: (open: boolean) => void
}

// A one-way "please take this shift" request — the backend also supports a
// true 1-for-1 exchange via `proposedReturnShiftId`, but staff have no way to
// browse a teammate's schedule to pick a shift in return, so that field is
// left unset here (a documented scope simplification, not a backend gap).
export function RequestSwapDialog({ shift, staffId, locationTimezone, onOpenChange }: RequestSwapDialogProps) {
  const [targetStaffId, setTargetStaffId] = useState('')
  const { data: staff, isLoading: staffLoading } = useUsers('STAFF')
  const requestSwap = useRequestSwap(staffId)

  const candidates = (staff ?? []).filter((s) => s.id !== staffId)

  function handleOpenChange(next: boolean) {
    if (!next) setTargetStaffId('')
    onOpenChange(next)
  }

  return (
    <Dialog open={!!shift} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request a swap</DialogTitle>
          <DialogDescription>
            {shift && (
              <>
                {formatLocalDate(shift.startAt, locationTimezone)} ·{' '}
                {formatLocalTimeRange(shift.startAt, shift.endAt, locationTimezone)}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <Select value={targetStaffId} onValueChange={setTargetStaffId} disabled={staffLoading}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Invite a teammate to take it" />
          </SelectTrigger>
          <SelectContent>
            {candidates.map((person) => (
              <SelectItem key={person.id} value={person.id}>
                {person.firstName} {person.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!targetStaffId || requestSwap.isPending}
            onClick={() => {
              if (!shift || !targetStaffId) return
              requestSwap.mutate(
                { shiftId: shift.id, targetStaffId },
                { onSuccess: () => handleOpenChange(false) },
              )
            }}
          >
            {requestSwap.isPending && <Loader2 className="animate-spin" />}
            Send request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
