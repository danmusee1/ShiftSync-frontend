import { z } from 'zod'

export const locationSchema = z.object({
  name: z.string().min(1, 'Required'),
  timezone: z.string().min(1, 'Required'),
  address: z.string().optional(),
})

export type LocationFormValues = z.infer<typeof locationSchema>

export const defaultLocationValues: LocationFormValues = {
  name: '',
  timezone: '',
  address: '',
}
