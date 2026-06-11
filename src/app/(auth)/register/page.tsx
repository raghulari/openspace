'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, Loader2, User } from 'lucide-react'
import { z } from 'zod'
import { useAuthStore } from '@/stores/use-auth-store'

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const { signup } = useAuthStore()
  
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
  })

  function onSubmit(data: RegisterFormData) {
    setServerError(null)
    setIsPending(true)
    
    // Simulate API delay
    setTimeout(() => {
      try {
        const success = signup(data.fullName, data.email, data.password)
        if (success) {
          router.push('/setup')
        } else {
          setServerError('Failed to create account. Try another email.')
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
          <span className="inline-flex items-center gap-1 rounded bg-white px-2 py-0.5 text-xs font-black text-black">
            AI
          </span>
        </div>
        <div className="text-center">
          <h1 className="text-xl font-medium text-foreground">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Set up your enterprise operations hub.
          </p>
        </div>
      </div>

      {/* ── Server error ─────────────────────────────── */}
      {serverError && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {serverError}
        </div>
      )}

      {/* ── Form ─────────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-foreground/90"
          >
            Full Name
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="fullName"
              type="text"
              placeholder="John Doe"
              {...register('fullName')}
              className="w-full rounded-xl border border-black/10 bg-white/50 backdrop-blur-sm py-2.5 pl-11 pr-4 text-sm text-foreground placeholder-black/30 outline-none transition-all duration-200 focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          {errors.fullName && (
            <p className="text-xs text-red-400">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-foreground/90"
          >
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="email"
              type="email"
              placeholder="you@company.com"
              {...register('email')}
              className="w-full rounded-xl border border-black/10 bg-white/50 backdrop-blur-sm py-2.5 pl-11 pr-4 text-sm text-foreground placeholder-black/30 outline-none transition-all duration-200 focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-foreground/90"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
              className="w-full rounded-xl border border-black/10 bg-white/50 backdrop-blur-sm py-2.5 pl-11 pr-10 text-sm text-foreground placeholder-black/30 outline-none transition-all duration-200 focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-400">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-foreground/90"
          >
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('confirmPassword')}
              className="w-full rounded-xl border border-black/10 bg-white/50 backdrop-blur-sm py-2.5 pl-11 pr-4 text-sm text-foreground placeholder-black/30 outline-none transition-all duration-200 focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-semibold text-black shadow-lg hover:bg-neutral-100 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account…
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      {/* ── Footer link ──────────────────────────────── */}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-semibold text-foreground hover:underline transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
