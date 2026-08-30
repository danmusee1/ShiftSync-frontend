import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { addDaysToDateStr, upcomingSunday } from '@/lib/time'

interface WeekNavigatorProps {
  weekStartDate: string
  onChange: (weekStartDate: string) => void
}

export function WeekNavigator({ weekStartDate, onChange }: WeekNavigatorProps) {
  const weekEndDate = addDaysToDateStr(weekStartDate, 6)
  const rangeLabel = formatRange(weekStartDate, weekEndDate)
  const isCurrentWeek = weekStartDate === upcomingSunday()

  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(addDaysToDateStr(weekStartDate, -7))}
        aria-label="Previous week"
      >
        <ChevronLeft />
      </Button>
      <div className="min-w-40 text-center text-sm font-medium">{rangeLabel}</div>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(addDaysToDateStr(weekStartDate, 7))}
        aria-label="Next week"
      >
        <ChevronRight />
      </Button>
      {!isCurrentWeek && (
        <Button variant="ghost" size="sm" onClick={() => onChange(upcomingSunday())}>
          This week
        </Button>
      )}
    </div>
  )
}

function formatRange(startDate: string, endDate: string): string {
  const start = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${endDate}T00:00:00`)
  const startLabel = start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  const endLabel = end.toLocaleDateString(undefined, {
    month: start.getMonth() === end.getMonth() ? undefined : 'short',
    day: 'numeric',
    year: 'numeric',
  })
  return `${startLabel} – ${endLabel}`
}
