import * as z from 'zod'

// ── Login Schema ──────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().min(1, { message: 'Email is required' }).email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
})

export type LoginFormData = z.infer<typeof loginSchema>

// ── Register Schema ───────────────────────────────────────────────────
export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, { message: 'Name must be at least 2 characters' })
      .max(64, { message: 'Name must be less than 64 characters' }),
    email: z.string().min(1, { message: 'Email is required' }).email({ message: 'Please enter a valid email address' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' })
      .regex(/[a-zA-Z]/, { message: 'Password must contain at least one letter' })
      .regex(/[0-9]/, { message: 'Password must contain at least one number' })
      .regex(/[^a-zA-Z0-9]/, { message: 'Password must contain at least one special character' }),
    confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the Terms of Service',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type RegisterFormData = z.infer<typeof registerSchema>

// ── Forgot Password Schema ───────────────────────────────────────────
export const forgotPasswordSchema = z.object({
  email: z.string().min(1, { message: 'Email is required' }).email({ message: 'Please enter a valid email address' }),
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

// ── Auth Action Response ──────────────────────────────────────────────
export type AuthActionResponse = {
  success: boolean
  message?: string
  errors?: Record<string, string[]>
}
