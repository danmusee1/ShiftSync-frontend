import type { LucideIcon } from 'lucide-react'
import { ArrowLeftRight, CalendarCheck, CalendarDays, Clock9, LayoutDashboard } from 'lucide-react'

import type { Role } from '@/types/domain'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  roles: Role[]
}

// Grows as each feature phase lands (compliance, fairness, timeclock, admin,
// audit) — intentionally minimal for now.
export const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'STAFF'] },
  { label: 'Schedule', href: '/schedule', icon: CalendarDays, roles: ['ADMIN', 'MANAGER'] },
  { label: 'My Schedule', href: '/my-schedule', icon: CalendarCheck, roles: ['STAFF'] },
  { label: 'Availability', href: '/availability', icon: Clock9, roles: ['STAFF'] },
  { label: 'Swaps & Drops', href: '/swaps', icon: ArrowLeftRight, roles: ['STAFF'] },
]
