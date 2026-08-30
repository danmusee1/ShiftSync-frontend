import type { LucideIcon } from 'lucide-react'
import {
  ArrowLeftRight,
  Building2,
  CalendarCheck,
  CalendarDays,
  CheckSquare,
  Clock9,
  FileClock,
  LayoutDashboard,
  Radio,
  Scale,
  ShieldAlert,
  Sparkles,
  Users,
} from 'lucide-react'

import type { Role } from '@/types/domain'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  roles: Role[]
  /** Groups items under a heading in the sidebar; ungrouped items render first. */
  section?: string
}

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
  { label: 'Users', href: '/admin/users', icon: Users, roles: ['ADMIN'], section: 'Admin' },
  { label: 'Locations', href: '/admin/locations', icon: Building2, roles: ['ADMIN'], section: 'Admin' },
  { label: 'Skills', href: '/admin/skills', icon: Sparkles, roles: ['ADMIN'], section: 'Admin' },
  { label: 'Audit Log', href: '/admin/audit', icon: FileClock, roles: ['ADMIN'], section: 'Admin' },
]
