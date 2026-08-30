import { useState } from 'react'
import { Check, X } from 'lucide-react'

import { ApiError } from '@/api/api-error'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConstraintViolationAlert } from '@/components/domain/ConstraintViolationAlert'
import { SWAP_STATUS_BADGE_VARIANT, SWAP_STATUS_LABELS } from '@/components/domain/swap-request-labels'
import { useSession } from '@/features/auth/use-auth'
import { useLocation } from '@/hooks/use-locations'
import {
  useAcceptSwap,
  useCancelSwapRequest,
  useClaimDrop,
  useDeclineSwap,
  useOpenDrops,
  useSwapRequestsForStaff,
} from '@/hooks/use-swap-requests'
import { formatLocalDate, formatLocalTimeRange } from '@/lib/time'
import type { ConstraintViolation, Shift, StaffSuggestion, SwapRequest } from '@/types/domain'

// Shifts here can belong to a location the viewer isn't necessarily assigned
// to (e.g. an open drop), so the timezone is looked up per-shift rather than
// assumed from the viewer's own certified locations.
function ShiftSummary({ shift }: { shift: Shift }) {
  const { data: location } = useLocation(shift.locationId)
  const timezone = location?.timezone

  return (
    <div>
      <p className="text-sm font-medium">
        {timezone ? formatLocalDate(shift.startAt, timezone) : '…'}
      </p>
      <p className="text-xs text-muted-foreground">
        {timezone ? formatLocalTimeRange(shift.startAt, shift.endAt, timezone) : '…'}
        {shift.requiredSkill && ` · ${shift.requiredSkill.name}`}
      </p>
    </div>
  )
}

function MyRequestRow({ request, myId }: { request: SwapRequest; myId: string }) {
  const accept = useAcceptSwap()
  const decline = useDeclineSwap()
  const cancel = useCancelSwapRequest()

  const shift = request.initiatorAssignment?.shift
  const isInitiator = request.initiatorId === myId
  const isTargetAwaitingMe = request.status === 'PENDING_TARGET' && request.counterpartyId === myId
  const isActive = ['PENDING', 'PENDING_TARGET', 'PENDING_MANAGER'].includes(request.status)
  const canCancel = isActive && (isInitiator || request.counterpartyId === myId)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-3">
        <Badge variant={SWAP_STATUS_BADGE_VARIANT[request.status]}>{SWAP_STATUS_LABELS[request.status]}</Badge>
        {shift && <ShiftSummary shift={shift} />}
      </div>
      <div className="flex items-center gap-3">
        <p className="text-xs text-muted-foreground">
          {request.type === 'DROP'
            ? isInitiator
              ? 'You posted this to drop'
              : 'You claimed this drop'
            : isInitiator
              ? "You asked a teammate to take this"
              : 'A teammate asked you to take this'}
        </p>
        <div className="flex gap-1.5">
          {isTargetAwaitingMe && (
            <>
              <Button size="sm" className="h-7" onClick={() => accept.mutate(request.id)} disabled={accept.isPending}>
                <Check className="size-3.5" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7"
                onClick={() => decline.mutate(request.id)}
                disabled={decline.isPending}
              >
                <X className="size-3.5" />
                Decline
              </Button>
            </>
          )}
          {canCancel && !isTargetAwaitingMe && (
            <Button
              size="sm"
              variant="outline"
              className="h-7"
              onClick={() => cancel.mutate({ id: request.id, payload: {} })}
              disabled={cancel.isPending}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function OpenDropRow({ request }: { request: SwapRequest }) {
  const claim = useClaimDrop()
  const [violations, setViolations] = useState<ConstraintViolation[]>([])
  const [suggestions, setSuggestions] = useState<StaffSuggestion[] | undefined>()

  const shift = request.initiatorAssignment?.shift
  if (!shift) return null

  return (
    <div className="space-y-2 rounded-lg border border-border bg-card p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ShiftSummary shift={shift} />
        <Button
          size="sm"
          onClick={() =>
            claim.mutate(request.id, {
              onSuccess: () => {
                setViolations([])
                setSuggestions(undefined)
              },
              onError: (error) => {
                if (error instanceof ApiError && error.isConstraintViolation) {
                  setViolations(error.violations ?? [])
                  setSuggestions(error.suggestions)
                }
              },
            })
          }
          disabled={claim.isPending}
        >
          Claim shift
        </Button>
      </div>
      <ConstraintViolationAlert violations={violations} suggestions={suggestions} />
    </div>
  )
}

export function SwapsPage() {
  const { user } = useSession()
  const myRequests = useSwapRequestsForStaff(user?.id)
  const openDrops = useOpenDrops()

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold">Swaps &amp; Drops</h1>
        <p className="text-muted-foreground">
          Requests you've sent or received, and shifts teammates have posted for coverage.
        </p>
      </div>

      <Tabs defaultValue="mine">
        <TabsList>
          <TabsTrigger value="mine">My requests</TabsTrigger>
          <TabsTrigger value="open">Open shifts to claim</TabsTrigger>
        </TabsList>

        <TabsContent value="mine" className="space-y-2">
          {myRequests.isLoading ? (
            <Skeleton className="h-16" />
          ) : !myRequests.data || myRequests.data.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No swap or drop requests yet.
            </p>
          ) : (
            myRequests.data.map((request) => (
              <MyRequestRow key={request.id} request={request} myId={user!.id} />
            ))
          )}
        </TabsContent>

        <TabsContent value="open" className="space-y-2">
          {openDrops.isLoading ? (
            <Skeleton className="h-16" />
          ) : !openDrops.data || openDrops.data.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No open shifts right now.
            </p>
          ) : (
            openDrops.data.map((request) => <OpenDropRow key={request.id} request={request} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
