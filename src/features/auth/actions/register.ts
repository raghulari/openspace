'use server'

import { createClient } from '@/lib/supabase/server'
import { registerSchema } from '@/features/auth/types'
import { redirect } from 'next/navigation'
import type { AuthActionResponse } from '@/features/auth/types'

export async function register(formData: {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  agreeToTerms: boolean
}): Promise<AuthActionResponse> {
  const parsed = registerSchema.safeParse(formData)

  if (!parsed.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
      },
    },
  })

  if (error) {
    return {
      success: false,
      message: error.message,
    }
  }

  redirect('/login?message=Check your email to confirm your account')
}
