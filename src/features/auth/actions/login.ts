'use server'

import { createClient } from '@/lib/supabase/server'
import { loginSchema } from '@/features/auth/types'
import { redirect } from 'next/navigation'
import type { AuthActionResponse } from '@/features/auth/types'

export async function login(formData: {
  email: string
  password: string
}): Promise<AuthActionResponse> {
  const parsed = loginSchema.safeParse(formData)

  if (!parsed.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return {
      success: false,
      message: error.message,
    }
  }

  redirect('/dashboard')
}
