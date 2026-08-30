// Hand-maintained against the actual backend response shapes (see ../../shift-sync backend).
// The generated src/api/schema.d.ts captures request DTOs well (class-validator + @ApiProperty
// give Swagger full introspection there) but most controllers don't declare explicit
// @ApiResponse types, so response schemas in the generated file are thin. These types are the
// source of truth for anything the API actually returns.

export type Role = 'ADMIN' | 'MANAGER' | 'STAFF'
export type NotificationChannel = 'IN_APP' | 'IN_APP_AND_EMAIL'
export type AssignmentStatus = 'ASSIGNED' | 'CANCELLED'
export type SwapRequestType = 'SWAP' | 'DROP'
export type SwapRequestStatus =
  | 'PENDING'
  | 'PENDING_TARGET'
  | 'PENDING_MANAGER'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'EXPIRED'
export type OverrideType = 'SEVENTH_CONSECUTIVE_DAY' | 'DAILY_LIMIT_EXCEEDED' | 'OTHER'
export type AvailabilityExceptionType = 'AVAILABLE' | 'UNAVAILABLE'
export type NotificationType =
  | 'SHIFT_ASSIGNED'
  | 'SHIFT_UNASSIGNED'
  | 'SHIFT_CHANGED'
  | 'SCHEDULE_PUBLISHED'
  | 'SCHEDULE_UNPUBLISHED'
  | 'SWAP_REQUESTED'
  | 'SWAP_ACCEPTED'
  | 'SWAP_DECLINED'
  | 'SWAP_APPROVED'
  | 'SWAP_REJECTED'
  | 'SWAP_CANCELLED'
  | 'DROP_POSTED'
  | 'DROP_CLAIMED'
  | 'DROP_EXPIRED'
  | 'OVERTIME_WARNING'
  | 'CONSECUTIVE_DAYS_WARNING'
  | 'AVAILABILITY_CHANGED'
  | 'MANAGER_APPROVAL_NEEDED'
  | 'ASSIGNMENT_CONFLICT'
export type AuditEntityType =
  | 'USER'
  | 'LOCATION'
  | 'STAFF_LOCATION'
  | 'STAFF_SKILL'
  | 'AVAILABILITY_RULE'
  | 'AVAILABILITY_EXCEPTION'
  | 'SCHEDULE_WEEK'
  | 'SHIFT'
  | 'SHIFT_ASSIGNMENT'
  | 'SWAP_REQUEST'
  | 'SCHEDULE_OVERRIDE'
export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'PUBLISH'
  | 'UNPUBLISH'
  | 'ASSIGN'
  | 'UNASSIGN'
  | 'APPROVE'
  | 'REJECT'
  | 'CANCEL'
  | 'CLAIM'
  | 'CLOCK_IN'
  | 'CLOCK_OUT'
  | 'OVERRIDE'

export interface AuthenticatedUser {
  id: string
  email: string
  role: Role
  firstName: string
  lastName: string
}

export interface User extends AuthenticatedUser {
  homeTimezone: string
  notificationChannel: NotificationChannel
  desiredWeeklyHours: number | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Location {
  id: string
  name: string
  timezone: string
  address: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Skill {
  id: string
  name: string
  createdAt: string
}

export interface StaffSkill {
  id: string
  staffId: string
  skillId: string
  createdAt: string
  skill?: Skill
}

export interface StaffLocation {
  id: string
  staffId: string
  locationId: string
  certifiedAt: string
  decertifiedAt: string | null
  location?: Location
}

export interface AvailabilityRule {
  id: string
  staffId: string
  dayOfWeek: number // 0 = Sunday .. 6 = Saturday
  startTime: string // "HH:mm"
  endTime: string // "HH:mm"
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AvailabilityException {
  id: string
  staffId: string
  date: string
  type: AvailabilityExceptionType
  startTime: string | null
  endTime: string | null
  reason: string | null
  createdAt: string
}

export interface ScheduleWeek {
  id: string
  locationId: string
  weekStartDate: string
  isPublished: boolean
  publishedAt: string | null
  publishCutoffHours: number
  createdAt: string
  updatedAt: string
}

export interface ShiftAssignmentStaffSummary {
  id: string
  firstName: string
  lastName: string
}

export interface ShiftAssignment {
  id: string
  shiftId: string
  staffId: string
  status: AssignmentStatus
  assignedById: string
  assignedAt: string
  clockInAt: string | null
  clockOutAt: string | null
  cancelledAt: string | null
  staff?: ShiftAssignmentStaffSummary
}

export interface Shift {
  id: string
  scheduleWeekId: string
  locationId: string
  startAt: string
  endAt: string
  requiredSkillId: string
  requiredSkill?: Skill
  headcountNeeded: number
  notes: string | null
  createdById: string
  createdAt: string
  updatedAt: string
  assignments?: ShiftAssignment[]
}

export interface ScheduleWeekDetail extends ScheduleWeek {
  shifts: Shift[]
}

export type ConstraintRule =
  | 'SKILL_MISMATCH'
  | 'LOCATION_NOT_CERTIFIED'
  | 'UNAVAILABLE'
  | 'DOUBLE_BOOKED'
  | 'MIN_REST_HOURS'
  | 'DAILY_HOURS_WARNING'
  | 'DAILY_HOURS_HARD_BLOCK'
  | 'WEEKLY_HOURS_WARNING'
  | 'WEEKLY_HOURS_OVERTIME'
  | 'SIXTH_CONSECUTIVE_DAY'
  | 'SEVENTH_CONSECUTIVE_DAY'
  | 'ALREADY_ASSIGNED_ELSEWHERE'

export type ConstraintSeverity = 'WARNING' | 'BLOCK'

export interface ConstraintViolation {
  rule: ConstraintRule
  severity: ConstraintSeverity
  message: string
  context?: Record<string, unknown>
}

export interface StaffSuggestion {
  staffId: string
  firstName: string
  lastName: string
  currentWeeklyHours: number
}

export interface ConstraintCheckResult {
  ok: boolean
  violations: ConstraintViolation[]
  suggestions?: StaffSuggestion[]
}

export interface AssignmentResult {
  assignment: ShiftAssignment
  warnings: ConstraintViolation[]
}

/** Shape of a 4xx/5xx JSON error response from the backend (see AllExceptionsFilter). */
export interface ApiErrorResponse {
  statusCode: number
  timestamp: string
  path: string
  message: string
  error?: string
  violations?: ConstraintViolation[]
  suggestions?: StaffSuggestion[]
}

export interface SwapRequest {
  id: string
  type: SwapRequestType
  status: SwapRequestStatus
  initiatorId: string
  initiatorAssignmentId: string
  initiatorAssignment?: ShiftAssignment & { shift: Shift }
  counterpartyId: string | null
  proposedReturnAssignmentId: string | null
  proposedReturnAssignment?: (ShiftAssignment & { shift: Shift }) | null
  requestedAt: string
  respondedAt: string | null
  managerId: string | null
  managerDecisionAt: string | null
  managerReason: string | null
  expiresAt: string | null
  cancelledAt: string | null
  cancelReason: string | null
  createdAt: string
  updatedAt: string
}

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  body: string
  data: Record<string, unknown> | null
  isRead: boolean
  readAt: string | null
  createdAt: string
}

export interface AuditLogActor {
  id: string
  firstName: string
  lastName: string
  email: string
}

export interface AuditLog {
  id: string
  entityType: AuditEntityType
  entityId: string
  action: AuditAction
  actorId: string | null
  actor?: AuditLogActor | null
  beforeState: unknown
  afterState: unknown
  reason: string | null
  locationId: string | null
  location?: { id: string; name: string } | null
  createdAt: string
}

export type OvertimeStatus = 'OK' | 'WARNING' | 'OVERTIME'

export interface WeeklyHoursAssignment {
  shiftId: string
  locationId: string
  startAt: string
  endAt: string
  hours: number
  cumulativeHoursAfter: number
}

export interface StaffWeeklyHours {
  staffId: string
  firstName: string
  lastName: string
  weeklyHours: number
  status: OvertimeStatus
  projectedOvertimeHours: number
  assignments: WeeklyHoursAssignment[]
}

export interface HoursDistributionEntry {
  staffId: string
  firstName: string
  lastName: string
  totalHours: number
  shiftCount: number
}

export interface PremiumFairnessEntry {
  staffId: string
  firstName: string
  lastName: string
  totalShifts: number
  premiumShifts: number
  premiumRatio: number
  fairnessScore: number
}

export interface DesiredHoursEntry {
  staffId: string
  firstName: string
  lastName: string
  desiredWeeklyHours: number | null
  actualWeeklyHours: number
  deltaHours: number | null
}

export interface OnDutyEntry {
  id: string
  shiftId: string
  staffId: string
  clockInAt: string
  clockOutAt: string | null
  staff: ShiftAssignmentStaffSummary
  shift: { id: string; startAt: string; endAt: string; requiredSkillId: string }
}
