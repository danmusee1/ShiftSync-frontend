import { lazy } from 'react'

export const DashboardPage = lazy(() =>
  import('@/features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
export const SchedulePage = lazy(() =>
  import('@/features/scheduling/SchedulePage').then((m) => ({ default: m.SchedulePage })),
)
export const ApprovalQueuePage = lazy(() =>
  import('@/features/swaps/ApprovalQueuePage').then((m) => ({ default: m.ApprovalQueuePage })),
)
export const OnDutyPage = lazy(() =>
  import('@/features/on-duty/OnDutyPage').then((m) => ({ default: m.OnDutyPage })),
)
export const CompliancePage = lazy(() =>
  import('@/features/compliance/CompliancePage').then((m) => ({ default: m.CompliancePage })),
)
export const FairnessPage = lazy(() =>
  import('@/features/fairness/FairnessPage').then((m) => ({ default: m.FairnessPage })),
)
export const MySchedulePage = lazy(() =>
  import('@/features/my-schedule/MySchedulePage').then((m) => ({ default: m.MySchedulePage })),
)
export const AvailabilityPage = lazy(() =>
  import('@/features/availability/AvailabilityPage').then((m) => ({ default: m.AvailabilityPage })),
)
export const SwapsPage = lazy(() =>
  import('@/features/swaps/SwapsPage').then((m) => ({ default: m.SwapsPage })),
)
export const AdminUsersPage = lazy(() =>
  import('@/features/admin/users/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })),
)
export const AdminLocationsPage = lazy(() =>
  import('@/features/admin/locations/AdminLocationsPage').then((m) => ({ default: m.AdminLocationsPage })),
)
export const AdminSkillsPage = lazy(() =>
  import('@/features/admin/skills/AdminSkillsPage').then((m) => ({ default: m.AdminSkillsPage })),
)
export const AdminAuditPage = lazy(() =>
  import('@/features/admin/audit/AdminAuditPage').then((m) => ({ default: m.AdminAuditPage })),
)
