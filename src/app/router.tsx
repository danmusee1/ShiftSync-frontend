import { createBrowserRouter } from 'react-router-dom'

import { AppShell } from '@/components/layout/AppShell'
import { AdminAuditPage } from '@/features/admin/audit/AdminAuditPage'
import { AdminLocationsPage } from '@/features/admin/locations/AdminLocationsPage'
import { AdminSkillsPage } from '@/features/admin/skills/AdminSkillsPage'
import { AdminUsersPage } from '@/features/admin/users/AdminUsersPage'
import { AvailabilityPage } from '@/features/availability/AvailabilityPage'
import { LoginPage } from '@/features/auth/LoginPage'
import { CompliancePage } from '@/features/compliance/CompliancePage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { FairnessPage } from '@/features/fairness/FairnessPage'
import { MySchedulePage } from '@/features/my-schedule/MySchedulePage'
import { OnDutyPage } from '@/features/on-duty/OnDutyPage'
import { SchedulePage } from '@/features/scheduling/SchedulePage'
import { ApprovalQueuePage } from '@/features/swaps/ApprovalQueuePage'
import { SwapsPage } from '@/features/swaps/SwapsPage'
import { ProtectedRoute } from './ProtectedRoute'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/', element: <DashboardPage /> },
          {
            element: <ProtectedRoute roles={['ADMIN', 'MANAGER']} />,
            children: [
              { path: '/schedule', element: <SchedulePage /> },
              { path: '/approvals', element: <ApprovalQueuePage /> },
              { path: '/on-duty', element: <OnDutyPage /> },
              { path: '/compliance', element: <CompliancePage /> },
              { path: '/fairness', element: <FairnessPage /> },
            ],
          },
          {
            element: <ProtectedRoute roles={['STAFF']} />,
            children: [
              { path: '/my-schedule', element: <MySchedulePage /> },
              { path: '/availability', element: <AvailabilityPage /> },
              { path: '/swaps', element: <SwapsPage /> },
            ],
          },
          {
            element: <ProtectedRoute roles={['ADMIN']} />,
            children: [
              { path: '/admin/users', element: <AdminUsersPage /> },
              { path: '/admin/locations', element: <AdminLocationsPage /> },
              { path: '/admin/skills', element: <AdminSkillsPage /> },
              { path: '/admin/audit', element: <AdminAuditPage /> },
            ],
          },
        ],
      },
    ],
  },
])
