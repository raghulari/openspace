'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/use-auth-store'

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, hasCompletedSetup } = useAuthStore()

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.replace('/login')
    } else if (!hasCompletedSetup) {
      router.replace('/setup')
    } else {
      router.replace('/dashboard')
    }
  }, [mounted, isAuthenticated, hasCompletedSetup, router])

  return (
    <div className="flex h-screen items-center justify-center bg-[#f5f5f7]">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#09090b] border-t-transparent" />
    </div>
  )
}
