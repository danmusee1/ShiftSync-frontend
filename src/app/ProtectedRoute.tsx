import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useSession } from '@/features/auth/use-auth'
import type { Role } from '@/types/domain'

/** Wrap a route subtree that requires auth; optionally restrict to specific roles. */
export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { user, isAuthenticated } = useSession()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
