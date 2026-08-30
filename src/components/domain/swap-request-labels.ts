import type { SwapRequestStatus } from '@/types/domain'

export const SWAP_STATUS_LABELS: Record<SwapRequestStatus, string> = {
  PENDING: 'Open',
  PENDING_TARGET: 'Awaiting teammate',
  PENDING_MANAGER: 'Awaiting manager',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired',
}

export const SWAP_STATUS_BADGE_VARIANT: Record<
  SwapRequestStatus,
  'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning'
> = {
  PENDING: 'warning',
  PENDING_TARGET: 'warning',
  PENDING_MANAGER: 'warning',
  APPROVED: 'success',
  REJECTED: 'destructive',
  CANCELLED: 'outline',
  EXPIRED: 'outline',
}
