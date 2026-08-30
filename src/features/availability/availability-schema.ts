import { z } from 'zod'

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

export const availabilityRuleSchema = z
  .object({
    dayOfWeek: z.string().regex(/^[0-6]$/, 'Pick a day'),
    startTime: z.string().regex(TIME_PATTERN, 'Use HH:mm'),
    endTime: z.string().regex(TIME_PATTERN, 'Use HH:mm'),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: 'End time must be after start time',
    path: ['endTime'],
  })

export type AvailabilityRuleFormValues = z.infer<typeof availabilityRuleSchema>

export const defaultAvailabilityRuleValues: AvailabilityRuleFormValues = {
  dayOfWeek: '0',
  startTime: '09:00',
  endTime: '17:00',
}

export const availabilityExceptionSchema = z
  .object({
    date: z.string().min(1, 'Date is required'),
    type: z.enum(['AVAILABLE', 'UNAVAILABLE']),
    allDay: z.boolean(),
    startTime: z.string().regex(TIME_PATTERN, 'Use HH:mm').optional().or(z.literal('')),
    endTime: z.string().regex(TIME_PATTERN, 'Use HH:mm').optional().or(z.literal('')),
    reason: z.string().optional(),
  })
  .refine((data) => data.allDay || (data.startTime && data.endTime && data.startTime < data.endTime), {
    message: 'End time must be after start time (or check "all day")',
    path: ['endTime'],
  })

export type AvailabilityExceptionFormValues = z.infer<typeof availabilityExceptionSchema>

export const defaultAvailabilityExceptionValues: AvailabilityExceptionFormValues = {
  date: '',
  type: 'UNAVAILABLE',
  allDay: true,
  startTime: '',
  endTime: '',
  reason: '',
}
