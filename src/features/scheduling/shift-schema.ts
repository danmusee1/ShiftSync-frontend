import { z } from 'zod'

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

// Mirrors the backend's CreateShiftDto, but expressed as local wall-clock
// fields (date/startTime/endTime/endsNextDay) instead of raw ISO instants —
// converted to UTC via localTimeToUtcIso() at submit time.
export const shiftFormSchema = z
  .object({
    date: z.string().min(1, 'Date is required'),
    startTime: z.string().regex(TIME_PATTERN, 'Use HH:mm'),
    endTime: z.string().regex(TIME_PATTERN, 'Use HH:mm'),
    endsNextDay: z.boolean(),
    requiredSkillId: z.string().min(1, 'Skill is required'),
    // Kept as a string in form state (react-hook-form + zod v4's z.coerce
    // don't reconcile cleanly for numeric HTML inputs) — parsed to a number
    // at submit time instead.
    headcountNeeded: z
      .string()
      .regex(/^\d+$/, 'Enter a whole number')
      .refine((v) => Number(v) >= 1, 'At least 1'),
    notes: z.string().optional(),
  })
  .refine((data) => data.endsNextDay || data.startTime < data.endTime, {
    message: 'End time must be after start time (or check "ends next day")',
    path: ['endTime'],
  })

export type ShiftFormValues = z.infer<typeof shiftFormSchema>

export const defaultShiftFormValues: Omit<ShiftFormValues, 'date' | 'requiredSkillId'> = {
  startTime: '09:00',
  endTime: '17:00',
  endsNextDay: false,
  headcountNeeded: '1',
  notes: '',
}
