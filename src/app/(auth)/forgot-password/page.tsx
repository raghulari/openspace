'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Mail, ArrowLeft, Lock, Loader2, CheckCircle2 } from 'lucide-react'
import { z } from 'zod'

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isPending, setIsPending] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  function onSubmit(_data: ForgotPasswordFormData) {
    setServerError(null)
    setIsPending(true)
    
    // Simulate API delay
    setTimeout(() => {
      setSubmitted(true)
      setIsPending(false)
    }, 800)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 text-center animate-fade-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">Check your email</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          We&apos;ve sent a password reset link to your email address.
          Please check your inbox and follow the instructions.
        </p>
        <Link
          href="/login"
          className="mt-4 flex items-center gap-2 text-sm font-medium text-foreground hover:underline transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Back link */}
      <Link
        href="/login"
        className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </Link>

      {/* Header */}
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/50 backdrop-blur-sm border border-black/10">
          <Lock className="h-7 w-7 text-foreground" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight text-foreground">openspace</span>
          <span className="inline-flex items-center gap-1 rounded bg-white px-2 py-0.5 text-xs font-black text-black">
            AI
          </span>
        </div>
        <h1 className="text-xl font-semibold text-foreground">Forgot your password?</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      {/* Error */}
      {serverError && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {serverError}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-foreground/90">
            Email address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="email"
              type="email"
              placeholder="you@company.com"
              {...register('email')}
              className="w-full rounded-xl border border-black/10 bg-white/50 backdrop-blur-sm py-3 pl-11 pr-4 text-sm text-foreground placeholder-black/30 outline-none transition-all duration-200 focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-semibold text-black shadow-lg hover:bg-neutral-100 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending…
            </>
          ) : (
            'Send Reset Link'
          )}
        </button>
      </form>
    </div>
  )
}
