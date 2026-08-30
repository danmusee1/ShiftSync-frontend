import { createBrowserRouter } from 'react-router-dom'

import { AppShell } from '@/components/layout/AppShell'
import { AvailabilityPage } from '@/features/availability/AvailabilityPage'
import { LoginPage } from '@/features/auth/LoginPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { MySchedulePage } from '@/features/my-schedule/MySchedulePage'
import { SchedulePage } from '@/features/scheduling/SchedulePage'
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
            children: [{ path: '/schedule', element: <SchedulePage /> }],
          },
          {
            element: <ProtectedRoute roles={['STAFF']} />,
            children: [
              { path: '/my-schedule', element: <MySchedulePage /> },
              { path: '/availability', element: <AvailabilityPage /> },
              { path: '/swaps', element: <SwapsPage /> },
            ],
          },
        ],
      },
    ],
  },
])
