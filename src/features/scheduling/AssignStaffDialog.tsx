import { useState } from 'react'
import { Loader2 } from 'lucide-react'

import { ApiError } from '@/api/api-error'
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
import { ConstraintViolationAlert } from '@/components/domain/ConstraintViolationAlert'
import { useUsers } from '@/hooks/use-users'
import { formatLocalDate, formatLocalTimeRange } from '@/lib/time'
import type { ConstraintViolation, Shift, StaffSuggestion } from '@/types/domain'
import { useAssignStaff, usePreviewAssignment } from './hooks/use-shift-assignments'

interface AssignStaffDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shift: Shift
  scheduleWeekId: string
  locationTimezone: string
}

export function AssignStaffDialog({
  open,
  onOpenChange,
  shift,
  scheduleWeekId,
  locationTimezone,
}: AssignStaffDialogProps) {
  const [staffId, setStaffId] = useState<string>('')
  const [assignError, setAssignError] = useState<{
    violations: ConstraintViolation[]
    suggestions?: StaffSuggestion[]
  } | null>(null)

  const { data: staff, isLoading: staffLoading } = useUsers('STAFF')
  const preview = usePreviewAssignment()
  const assign = useAssignStaff(scheduleWeekId)

  const assignedStaffIds = new Set(
    (shift.assignments ?? []).filter((a) => a.status === 'ASSIGNED').map((a) => a.staffId),
  )
  const candidates = (staff ?? []).filter((s) => !assignedStaffIds.has(s.id))

  // Reset local state as part of the close interaction itself (not a
  // derived effect) — whichever way the dialog closes routes through here.
  function handleOpenChange(next: boolean) {
    if (!next) {
      setStaffId('')
      setAssignError(null)
      preview.reset()
    }
    onOpenChange(next)
  }

  function selectStaff(id: string) {
    setStaffId(id)
    setAssignError(null)
    preview.mutate({ shiftId: shift.id, staffId: id })
  }

  function handleAssign() {
    if (!staffId) return
    setAssignError(null)
    assign.mutate(
      { shiftId: shift.id, staffId },
      {
        onSuccess: () => handleOpenChange(false),
        onError: (error) => {
          if (error instanceof ApiError && error.isConstraintViolation) {
            setAssignError({ violations: error.violations ?? [], suggestions: error.suggestions })
          }
        },
      },
    )
  }

  const previewResult = preview.data
  const violations = assignError?.violations ?? previewResult?.violations ?? []
  const suggestions = assignError?.suggestions ?? previewResult?.suggestions
  const hasBlockingViolation = violations.some((v) => v.severity === 'BLOCK')

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign staff</DialogTitle>
          <DialogDescription>
            {formatLocalDate(shift.startAt, locationTimezone)} ·{' '}
            {formatLocalTimeRange(shift.startAt, shift.endAt, locationTimezone)}
            {shift.requiredSkill && ` · ${shift.requiredSkill.name}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Select value={staffId} onValueChange={selectStaff} disabled={staffLoading}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a staff member" />
            </SelectTrigger>
            <SelectContent>
              {candidates.map((person) => (
                <SelectItem key={person.id} value={person.id}>
                  {person.firstName} {person.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {preview.isPending && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Checking eligibility…
            </p>
          )}

          {!preview.isPending && violations.length > 0 && (
            <ConstraintViolationAlert
              violations={violations}
              suggestions={suggestions}
              onSelectSuggestion={selectStaff}
            />
          )}

          {!preview.isPending && staffId && previewResult?.ok && violations.length === 0 && (
            <p className="text-sm text-success">No conflicts — clear to assign.</p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleAssign}
            disabled={!staffId || assign.isPending || preview.isPending || hasBlockingViolation}
          >
            {assign.isPending && <Loader2 className="animate-spin" />}
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
