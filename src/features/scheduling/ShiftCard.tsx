import { useState } from 'react'
import { Pencil, Trash2, UserPlus, X } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatLocalTimeRange, shiftDurationHours } from '@/lib/time'
import { initials } from '@/lib/format'
import type { Shift } from '@/types/domain'
import { AssignStaffDialog } from './AssignStaffDialog'
import { useUnassignStaff } from './hooks/use-shift-assignments'

interface ShiftCardProps {
  shift: Shift
  scheduleWeekId: string
  locationTimezone: string
  onEdit: (shift: Shift) => void
  onDelete: (shift: Shift) => void
}

export function ShiftCard({ shift, scheduleWeekId, locationTimezone, onEdit, onDelete }: ShiftCardProps) {
  const [assignOpen, setAssignOpen] = useState(false)
  const unassign = useUnassignStaff(scheduleWeekId)

  const activeAssignments = (shift.assignments ?? []).filter((a) => a.status === 'ASSIGNED')
  const isFullyStaffed = activeAssignments.length >= shift.headcountNeeded
  const hours = shiftDurationHours(shift.startAt, shift.endAt)

  return (
    <div className="space-y-2.5 rounded-lg border border-border bg-card p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium">
            {formatLocalTimeRange(shift.startAt, shift.endAt, locationTimezone)}
          </p>
          <p className="text-xs text-muted-foreground">{hours.toFixed(1)}h</p>
        </div>
        <div className="flex gap-0.5">
          <Button variant="ghost" size="icon" className="size-7" onClick={() => onEdit(shift)} aria-label="Edit shift">
            <Pencil className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-destructive hover:text-destructive"
            onClick={() => onDelete(shift)}
            aria-label="Delete shift"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {shift.requiredSkill && (
          <Badge variant="secondary" className="text-xs">
            {shift.requiredSkill.name}
          </Badge>
        )}
        <Badge variant={isFullyStaffed ? 'success' : 'warning'} className="text-xs">
          {activeAssignments.length}/{shift.headcountNeeded} staffed
        </Badge>
      </div>

      {activeAssignments.length > 0 && (
        <ul className="space-y-1">
          {activeAssignments.map((assignment) => (
            <li key={assignment.id} className="flex items-center gap-1.5">
              <Avatar className="size-5">
                <AvatarFallback className="text-[10px]">
                  {assignment.staff ? initials(assignment.staff.firstName, assignment.staff.lastName) : '?'}
                </AvatarFallback>
              </Avatar>
              <span className="flex-1 truncate text-xs">
                {assignment.staff ? `${assignment.staff.firstName} ${assignment.staff.lastName}` : 'Unknown'}
              </span>
              <button
                type="button"
                className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-destructive"
                onClick={() => unassign.mutate({ shiftId: shift.id, staffId: assignment.staffId })}
                aria-label="Unassign"
              >
                <X className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Button variant="outline" size="sm" className="w-full" onClick={() => setAssignOpen(true)}>
        <UserPlus className="size-3.5" />
        Assign staff
      </Button>

      <AssignStaffDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        shift={shift}
        scheduleWeekId={scheduleWeekId}
        locationTimezone={locationTimezone}
      />
    </div>
  )
}
