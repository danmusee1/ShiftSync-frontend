/**
 * Centralized query-key factory. Every feature's hooks pull keys from here
 * instead of hand-rolling arrays, so cache invalidation can't drift out of
 * sync with what a query was actually keyed by.
 */
export const queryKeys = {
  me: () => ['me'] as const,
  users: {
    all: () => ['users'] as const,
    list: (role?: string) => ['users', 'list', role ?? 'all'] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
    colleagues: () => ['users', 'colleagues'] as const,
  },
  locations: {
    all: () => ['locations'] as const,
    list: () => ['locations', 'list'] as const,
    detail: (id: string) => ['locations', 'detail', id] as const,
  },
  skills: {
    list: () => ['skills', 'list'] as const,
  },
  staff: {
    skills: (staffId: string) => ['staff', staffId, 'skills'] as const,
    locations: (staffId: string) => ['staff', staffId, 'locations'] as const,
    availabilityRules: (staffId: string) => ['staff', staffId, 'availability', 'rules'] as const,
    availabilityExceptions: (staffId: string) =>
      ['staff', staffId, 'availability', 'exceptions'] as const,
  },
  scheduleWeeks: {
    byLocation: (locationId: string) => ['schedule-weeks', 'location', locationId] as const,
    detail: (id: string) => ['schedule-weeks', 'detail', id] as const,
  },
  shifts: {
    detail: (id: string) => ['shifts', 'detail', id] as const,
  },
  swapRequests: {
    all: () => ['swap-requests'] as const,
    byStaff: (staffId: string) => ['swap-requests', 'staff', staffId] as const,
    openDrops: () => ['swap-requests', 'open-drops'] as const,
    pendingApproval: () => ['swap-requests', 'pending-approval'] as const,
    detail: (id: string) => ['swap-requests', 'detail', id] as const,
  },
  compliance: {
    overtime: (weekStartDate: string, locationId?: string) =>
      ['compliance', 'overtime', weekStartDate, locationId ?? 'all'] as const,
  },
  fairness: {
    hoursDistribution: (from: string, to: string, locationId?: string) =>
      ['fairness', 'hours-distribution', from, to, locationId ?? 'all'] as const,
    premiumShifts: (from: string, to: string, locationId?: string) =>
      ['fairness', 'premium-shifts', from, to, locationId ?? 'all'] as const,
    desiredHours: (weekStartDate: string, locationId?: string) =>
      ['fairness', 'desired-hours', weekStartDate, locationId ?? 'all'] as const,
  },
  onDuty: {
    byLocation: (locationId: string) => ['on-duty', locationId] as const,
  },
  notifications: {
    all: () => ['notifications'] as const,
    list: (unreadOnly: boolean) => ['notifications', 'list', unreadOnly] as const,
  },
  audit: {
    entity: (entityType: string, entityId: string) =>
      ['audit', 'entity', entityType, entityId] as const,
  },
} as const
