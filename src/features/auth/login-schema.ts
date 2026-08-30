import { z } from 'zod'

// Mirrors the backend's LoginDto (src/auth/dto/login.dto.ts) validation exactly.
export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
