'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { z } from 'zod'
import { useAuthStore } from '@/stores/use-auth-store'
import { useWorkspaceStore } from '@/stores/use-workspace-store'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { login, hasCompletedSetup } = useAuthStore()
  const { workspace } = useWorkspaceStore()
  
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  function onSubmit(data: LoginFormData) {
    setServerError(null)
    setIsPending(true)
    
    // Simulate API delay
    setTimeout(() => {
      try {
        const success = login(data.email, data.password)
        if (success) {
          // If setup completed, go to dashboard, else onboarding setup
          if (hasCompletedSetup || (workspace && workspace.name)) {
            router.push('/dashboard')
          } else {
            router.push('/setup')
          }
        } else {
          setServerError('Invalid credentials. Try any email/password.')
        }
      } catch (err: any) {
        setServerError(err.message || 'Something went wrong')
      } finally {
        setIsPending(false)
      }
    }, 800)
  }

  return (
    <div className="animate-fade-in">
      {/* ── Brand ────────────────────────────────────── */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-primary font-sans lowercase">
            openspace
          </span>
        </div>
        <div className="text-center">
          <h1 className="text-xl font-bold text-foreground">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to manage your business operations.
          </p>
        </div>
      </div>

      {/* ── Server error ─────────────────────────────── */}
      {serverError && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-50 px-4 py-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      {/* ── Form ─────────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-foreground/90"
          >
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              {...register('email')}
              className="w-full rounded-xl border border-black/10 bg-white/50 py-3 pl-11 pr-4 text-sm text-foreground placeholder-black/30 outline-none transition-all duration-200 focus:border-primary focus:ring-1 focus:ring-primary backdrop-blur-sm"
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-foreground/90"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              {...register('password')}
              className="w-full rounded-xl border border-black/10 bg-white/50 py-3 pl-11 pr-10 text-sm text-foreground placeholder-black/30 outline-none transition-all duration-200 focus:border-primary focus:ring-1 focus:ring-primary backdrop-blur-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-lg hover:bg-primary/90 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying credentials…
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* ── Footer link ──────────────────────────────── */}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="font-bold text-primary hover:underline transition-colors"
        >
          Sign up
        </Link>
      </p>
    </div>
  )
}
