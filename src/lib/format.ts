import type { Role } from '@/types/domain'

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  STAFF: 'Staff',
}

export function roleLabel(role: Role): string {
  return ROLE_LABELS[role]
}

export function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function fullName(person: { firstName: string; lastName: string }): string {
  return `${person.firstName} ${person.lastName}`
}

const TIME_AGO_STEPS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 60 * 60 * 24 * 365],
  ['month', 60 * 60 * 24 * 30],
  ['week', 60 * 60 * 24 * 7],
  ['day', 60 * 60 * 24],
  ['hour', 60 * 60],
  ['minute', 60],
]

const relativeTimeFormat = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

export function timeAgo(isoDate: string): string {
  const seconds = (Date.now() - new Date(isoDate).getTime()) / 1000
  for (const [unit, unitSeconds] of TIME_AGO_STEPS) {
    if (seconds >= unitSeconds) {
      return relativeTimeFormat.format(-Math.floor(seconds / unitSeconds), unit)
    }
  }
  return relativeTimeFormat.format(0, 'minute')
}
