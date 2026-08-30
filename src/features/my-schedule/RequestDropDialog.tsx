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
import { useRequestDrop } from '@/hooks/use-swap-requests'
import { formatLocalDate, formatLocalTimeRange } from '@/lib/time'
import type { Shift } from '@/types/domain'

interface RequestDropDialogProps {
  shift: Shift | null
  staffId: string
  locationTimezone: string
  onOpenChange: (open: boolean) => void
}

export function RequestDropDialog({ shift, staffId, locationTimezone, onOpenChange }: RequestDropDialogProps) {
  const requestDrop = useRequestDrop(staffId)

  return (
    <AlertDialog open={!!shift} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Drop this shift?</AlertDialogTitle>
          <AlertDialogDescription>
            {shift && (
              <>
                {formatLocalDate(shift.startAt, locationTimezone)} ·{' '}
                {formatLocalTimeRange(shift.startAt, shift.endAt, locationTimezone)}
                <br />
              </>
            )}
            Any eligible teammate will be able to claim it. Your manager still has to approve the
            handoff before it's final.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (!shift) return
              requestDrop.mutate({ shiftId: shift.id }, { onSuccess: () => onOpenChange(false) })
            }}
            disabled={requestDrop.isPending}
          >
            Post for drop
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
