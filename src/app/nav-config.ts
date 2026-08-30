import type { LucideIcon } from 'lucide-react'
import {
  ArrowLeftRight,
  CalendarCheck,
  CalendarDays,
  CheckSquare,
  Clock9,
  LayoutDashboard,
  Radio,
  Scale,
  ShieldAlert,
} from 'lucide-react'

import type { Role } from '@/types/domain'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  roles: Role[]
}

// Grows as each feature phase lands (admin, audit) — intentionally minimal
// for now.
export const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'STAFF'] },
  { label: 'Schedule', href: '/schedule', icon: CalendarDays, roles: ['ADMIN', 'MANAGER'] },
  { label: 'Approvals', href: '/approvals', icon: CheckSquare, roles: ['ADMIN', 'MANAGER'] },
  { label: 'On Duty', href: '/on-duty', icon: Radio, roles: ['ADMIN', 'MANAGER'] },
  { label: 'Compliance', href: '/compliance', icon: ShieldAlert, roles: ['ADMIN', 'MANAGER'] },
  { label: 'Fairness', href: '/fairness', icon: Scale, roles: ['ADMIN', 'MANAGER'] },
  { label: 'My Schedule', href: '/my-schedule', icon: CalendarCheck, roles: ['STAFF'] },
  { label: 'Availability', href: '/availability', icon: Clock9, roles: ['STAFF'] },
  { label: 'Swaps & Drops', href: '/swaps', icon: ArrowLeftRight, roles: ['STAFF'] },
]
