import { useLocation } from '@/hooks/use-locations'
import { formatLocalDate, formatLocalTimeRange } from '@/lib/time'
import type { Shift } from '@/types/domain'

/**
 * Shifts shown outside their own schedule board (swap requests, approval
 * queues) can belong to a location the viewer isn't necessarily assigned to,
 * so the timezone is looked up per-shift rather than assumed from context.
 */
export function ShiftTimeSummary({ shift }: { shift: Shift }) {
  const { data: location } = useLocation(shift.locationId)
  const timezone = location?.timezone

  return (
    <div>
      <p className="text-sm font-medium">{timezone ? formatLocalDate(shift.startAt, timezone) : '…'}</p>
      <p className="text-xs text-muted-foreground">
        {timezone ? formatLocalTimeRange(shift.startAt, shift.endAt, timezone) : '…'}
        {shift.requiredSkill && ` · ${shift.requiredSkill.name}`}
      </p>
    </div>
  )
}
