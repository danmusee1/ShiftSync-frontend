import { AlertCircle, RotateCw } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

/** Shown when a query fails outright — distinct from an empty-but-successful result. */
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-destructive/40 bg-destructive/5 p-6 text-center">
      <AlertCircle className="size-5 text-destructive" />
      <p className="text-sm text-muted-foreground">{message ?? 'Something went wrong loading this.'}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RotateCw className="size-3.5" />
          Try again
        </Button>
      )}
    </div>
  )
}
