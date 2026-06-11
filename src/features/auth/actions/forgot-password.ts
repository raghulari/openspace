'use server'

import { createClient } from '@/lib/supabase/server'
import { forgotPasswordSchema } from '@/features/auth/types'
import type { AuthActionResponse } from '@/features/auth/types'

export async function forgotPassword(formData: {
  email: string
}): Promise<AuthActionResponse> {
  const parsed = forgotPasswordSchema.safeParse(formData)

  if (!parsed.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    }
  )

  if (error) {
    return {
      success: false,
      message: error.message,
    }
  }

  return {
    success: true,
    message: 'Password reset link sent. Check your email.',
  }
}
