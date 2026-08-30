import type { LucideIcon } from 'lucide-react'
import { LayoutDashboard } from 'lucide-react'

import type { Role } from '@/types/domain'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  roles: Role[]
}

// Grows as each feature phase lands (scheduling, swaps, compliance, fairness,
// timeclock, admin, audit, notifications) — intentionally minimal for now.
export const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'STAFF'] },
]
