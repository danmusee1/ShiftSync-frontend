import { z } from 'zod'

export const createUserSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  role: z.enum(['ADMIN', 'MANAGER', 'STAFF']),
  homeTimezone: z.string().min(1, 'Required'),
  notificationChannel: z.enum(['IN_APP', 'IN_APP_AND_EMAIL']),
  desiredWeeklyHours: z.string().regex(/^\d*$/, 'Enter a whole number'),
  hourlyRate: z.string().regex(/^\d*(\.\d{1,2})?$/, 'Enter a dollar amount, e.g. 18.50'),
})

export type CreateUserFormValues = z.infer<typeof createUserSchema>

export const defaultCreateUserValues: CreateUserFormValues = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  role: 'STAFF',
  homeTimezone: '',
  notificationChannel: 'IN_APP',
  desiredWeeklyHours: '',
  hourlyRate: '',
}

export const updateUserSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  role: z.enum(['ADMIN', 'MANAGER', 'STAFF']),
  homeTimezone: z.string().min(1, 'Required'),
  notificationChannel: z.enum(['IN_APP', 'IN_APP_AND_EMAIL']),
  desiredWeeklyHours: z.string().regex(/^\d*$/, 'Enter a whole number'),
  hourlyRate: z.string().regex(/^\d*(\.\d{1,2})?$/, 'Enter a dollar amount, e.g. 18.50'),
  password: z.string().min(8, 'At least 8 characters').optional().or(z.literal('')),
})

export type UpdateUserFormValues = z.infer<typeof updateUserSchema>
