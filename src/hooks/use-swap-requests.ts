import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { ApiError } from '@/api/api-error'
import {
  swapRequestsApi,
  type DecisionPayload,
  type RequestDropPayload,
  type RequestSwapPayload,
} from '@/api/endpoints/swap-requests'
import { queryKeys } from '@/lib/query-keys'

function invalidateAllSwapLists(queryClient: ReturnType<typeof useQueryClient>, staffId?: string) {
  queryClient.invalidateQueries({ queryKey: queryKeys.swapRequests.all() })
  if (staffId) {
    queryClient.invalidateQueries({ queryKey: queryKeys.swapRequests.byStaff(staffId) })
  }
}

export function useSwapRequestsForStaff(staffId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.swapRequests.byStaff(staffId ?? ''),
    queryFn: () => swapRequestsApi.listForStaff(staffId!),
    enabled: !!staffId,
  })
}

export function useOpenDrops() {
  return useQuery({
    queryKey: queryKeys.swapRequests.openDrops(),
    queryFn: () => swapRequestsApi.listOpenDrops(),
  })
}

export function usePendingApprovalSwaps() {
  return useQuery({
    queryKey: queryKeys.swapRequests.pendingApproval(),
    queryFn: () => swapRequestsApi.listPendingForManager(),
  })
}

export function useRequestSwap(staffId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: RequestSwapPayload) => swapRequestsApi.requestSwap(staffId, payload),
    onSuccess: () => {
      invalidateAllSwapLists(queryClient, staffId)
      toast.success('Swap request sent.')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Could not send this swap request.')
    },
  })
}

export function useRequestDrop(staffId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: RequestDropPayload) => swapRequestsApi.requestDrop(staffId, payload),
    onSuccess: () => {
      invalidateAllSwapLists(queryClient, staffId)
      toast.success('Shift posted for drop — any eligible teammate can claim it.')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Could not drop this shift.')
    },
  })
}

export function useAcceptSwap() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => swapRequestsApi.accept(id),
    onSuccess: () => {
      invalidateAllSwapLists(queryClient)
      toast.success('Swap accepted — awaiting manager approval.')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Could not accept this swap.')
    },
  })
}

export function useDeclineSwap() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => swapRequestsApi.decline(id),
    onSuccess: () => {
      invalidateAllSwapLists(queryClient)
      toast.success('Swap declined.')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Could not decline this swap.')
    },
  })
}

/** Claiming can be blocked by a 422 constraint violation — the caller renders that inline. */
export function useClaimDrop() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => swapRequestsApi.claim(id),
    onSuccess: () => {
      invalidateAllSwapLists(queryClient)
      toast.success('Shift claimed — awaiting manager approval.')
    },
    onError: (error) => {
      if (error instanceof ApiError && error.isConstraintViolation) return
      toast.error(error instanceof ApiError ? error.message : 'Could not claim this shift.')
    },
  })
}

export function useCancelSwapRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: DecisionPayload }) =>
      swapRequestsApi.cancel(id, payload),
    onSuccess: () => {
      invalidateAllSwapLists(queryClient)
      toast.success('Request cancelled.')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Could not cancel this request.')
    },
  })
}

export function useApproveSwap() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => swapRequestsApi.approve(id),
    onSuccess: () => {
      invalidateAllSwapLists(queryClient)
      toast.success('Swap approved.')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Could not approve this swap.')
    },
  })
}

export function useRejectSwap() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: DecisionPayload }) =>
      swapRequestsApi.reject(id, payload),
    onSuccess: () => {
      invalidateAllSwapLists(queryClient)
      toast.success('Swap rejected.')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Could not reject this swap.')
    },
  })
}
