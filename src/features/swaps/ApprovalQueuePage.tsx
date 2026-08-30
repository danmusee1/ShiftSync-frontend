import { useState } from 'react'
import { Check, X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { ShiftTimeSummary } from '@/components/domain/ShiftTimeSummary'
import { ErrorState } from '@/components/layout/ErrorState'
import { useApproveSwap, usePendingApprovalSwaps, useRejectSwap } from '@/hooks/use-swap-requests'
import { useUser } from '@/hooks/use-users'
import { fullName } from '@/lib/format'
import type { SwapRequest } from '@/types/domain'

function PartyName({ userId }: { userId: string | null }) {
  const { data } = useUser(userId ?? undefined)
  if (!userId) return <span className="text-muted-foreground">—</span>
  return <span>{data ? fullName(data) : '…'}</span>
}

function RejectDialog({
  request,
  onOpenChange,
}: {
  request: SwapRequest | null
  onOpenChange: (open: boolean) => void
}) {
  const [reason, setReason] = useState('')
  const reject = useRejectSwap()

  function handleOpenChange(next: boolean) {
    if (!next) setReason('')
    onOpenChange(next)
  }

  return (
    <Dialog open={!!request} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject this request?</DialogTitle>
          <DialogDescription>Let them know why — this is shown to everyone involved.</DialogDescription>
        </DialogHeader>
        <Input
          placeholder="Reason (optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={reject.isPending}
            onClick={() => {
              if (!request) return
              reject.mutate(
                { id: request.id, payload: { reason: reason || undefined } },
                { onSuccess: () => handleOpenChange(false) },
              )
            }}
          >
            Reject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ApprovalRow({ request, onReject }: { request: SwapRequest; onReject: (r: SwapRequest) => void }) {
  const approve = useApproveSwap()
  const shift = request.initiatorAssignment?.shift
  if (!shift) return null

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-3">
        <Badge variant={request.type === 'DROP' ? 'secondary' : 'default'}>
          {request.type === 'DROP' ? 'Drop' : 'Swap'}
        </Badge>
        <ShiftTimeSummary shift={shift} />
      </div>

      <div className="flex items-center gap-3 text-sm">
        <div className="text-right">
          <p>
            <PartyName userId={request.initiatorId} /> <span className="text-muted-foreground">→</span>{' '}
            <PartyName userId={request.counterpartyId} />
          </p>
          <p className="text-xs text-muted-foreground">
            {request.type === 'DROP' ? 'dropping to' : 'swapping with'}
          </p>
        </div>
        <div className="flex gap-1.5">
          <Button size="sm" onClick={() => approve.mutate(request.id)} disabled={approve.isPending}>
            <Check className="size-3.5" />
            Approve
          </Button>
          <Button size="sm" variant="outline" onClick={() => onReject(request)}>
            <X className="size-3.5" />
            Reject
          </Button>
        </div>
      </div>
    </div>
  )
}

export function ApprovalQueuePage() {
  const pending = usePendingApprovalSwaps()
  const [rejectTarget, setRejectTarget] = useState<SwapRequest | null>(null)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold">Swap Approvals</h1>
        <p className="text-muted-foreground">
          Staff-arranged coverage changes waiting on a manager to sign off.
        </p>
      </div>

      {pending.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : pending.isError ? (
        <ErrorState message="Could not load pending approvals." onRetry={() => pending.refetch()} />
      ) : !pending.data || pending.data.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Nothing waiting on you right now.
        </p>
      ) : (
        <div className="space-y-2">
          {pending.data.map((request) => (
            <ApprovalRow key={request.id} request={request} onReject={setRejectTarget} />
          ))}
        </div>
      )}

      <RejectDialog request={rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)} />
    </div>
  )
}
