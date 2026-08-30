import { Suspense, type ComponentType } from 'react'
import { createBrowserRouter } from 'react-router-dom'

import { AppShell } from '@/components/layout/AppShell'
import { PageLoader } from '@/components/layout/PageLoader'
import { LoginPage } from '@/features/auth/LoginPage'
import {
  AdminAuditPage,
  AdminLocationsPage,
  AdminSkillsPage,
  AdminUsersPage,
  ApprovalQueuePage,
  AvailabilityPage,
  CompliancePage,
  DashboardPage,
  FairnessPage,
  MySchedulePage,
  OnDutyPage,
  SchedulePage,
  SwapsPage,
} from './lazy-pages'
import { ProtectedRoute } from './ProtectedRoute'

/** One Suspense boundary per route element, so switching pages shows a
 * lightweight loader instead of the whole shell flashing blank. */
function page(Component: ComponentType) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  )
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/', element: page(DashboardPage) },
          {
            element: <ProtectedRoute roles={['ADMIN', 'MANAGER']} />,
            children: [
              { path: '/schedule', element: page(SchedulePage) },
              { path: '/approvals', element: page(ApprovalQueuePage) },
              { path: '/on-duty', element: page(OnDutyPage) },
              { path: '/compliance', element: page(CompliancePage) },
              { path: '/fairness', element: page(FairnessPage) },
            ],
          },
          {
            element: <ProtectedRoute roles={['STAFF']} />,
            children: [
              { path: '/my-schedule', element: page(MySchedulePage) },
              { path: '/availability', element: page(AvailabilityPage) },
              { path: '/swaps', element: page(SwapsPage) },
            ],
          },
          {
            element: <ProtectedRoute roles={['ADMIN']} />,
            children: [
              { path: '/admin/users', element: page(AdminUsersPage) },
              { path: '/admin/locations', element: page(AdminLocationsPage) },
              { path: '/admin/skills', element: page(AdminSkillsPage) },
              { path: '/admin/audit', element: page(AdminAuditPage) },
            ],
          },
        ],
      },
    ],
  },
])
