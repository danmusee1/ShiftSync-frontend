import type { ConstraintRule } from '@/types/domain'

export const CONSTRAINT_RULE_LABELS: Record<ConstraintRule, string> = {
  SKILL_MISMATCH: 'Skill mismatch',
  LOCATION_NOT_CERTIFIED: 'Not certified at this location',
  UNAVAILABLE: 'Unavailable',
  DOUBLE_BOOKED: 'Double-booked',
  MIN_REST_HOURS: 'Minimum rest hours',
  DAILY_HOURS_WARNING: 'Approaching daily hour limit',
  DAILY_HOURS_HARD_BLOCK: 'Daily hour limit exceeded',
  WEEKLY_HOURS_WARNING: 'Approaching weekly hour limit',
  WEEKLY_HOURS_OVERTIME: 'Overtime',
  SIXTH_CONSECUTIVE_DAY: '6th consecutive day',
  SEVENTH_CONSECUTIVE_DAY: '7th consecutive day',
  ALREADY_ASSIGNED_ELSEWHERE: 'Already assigned elsewhere',
}
