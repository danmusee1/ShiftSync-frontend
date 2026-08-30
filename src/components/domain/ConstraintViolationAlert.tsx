import { AlertTriangle, ShieldAlert, UserPlus } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import type { ConstraintViolation, StaffSuggestion } from '@/types/domain'
import { CONSTRAINT_RULE_LABELS } from './constraint-rule-labels'

interface ConstraintViolationAlertProps {
  violations: ConstraintViolation[]
  suggestions?: StaffSuggestion[]
  onSelectSuggestion?: (staffId: string) => void
}

/**
 * Renders the backend's structured constraint-violation payload — every rule
 * that was broken, why, and (when the backend found any) who else could take
 * the shift instead. Used anywhere an assignment or swap can be blocked.
 */
export function ConstraintViolationAlert({
  violations,
  suggestions,
  onSelectSuggestion,
}: ConstraintViolationAlertProps) {
  if (violations.length === 0) return null

  return (
    <div className="space-y-2">
      {violations.map((violation, index) => (
        <Alert
          key={`${violation.rule}-${index}`}
          variant={violation.severity === 'BLOCK' ? 'destructive' : 'warning'}
        >
          {violation.severity === 'BLOCK' ? <ShieldAlert /> : <AlertTriangle />}
          <AlertTitle>{CONSTRAINT_RULE_LABELS[violation.rule] ?? violation.rule}</AlertTitle>
          <AlertDescription>{violation.message}</AlertDescription>
        </Alert>
      ))}

      {suggestions && suggestions.length > 0 && (
        <div className="rounded-lg border border-border bg-muted/40 p-3">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-medium">
            <UserPlus className="size-4" />
            Suggested instead
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <Button
                key={suggestion.staffId}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onSelectSuggestion?.(suggestion.staffId)}
                disabled={!onSelectSuggestion}
              >
                {suggestion.firstName} {suggestion.lastName}
                <span className="text-muted-foreground">
                  ({suggestion.currentWeeklyHours.toFixed(1)}h this week)
                </span>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
