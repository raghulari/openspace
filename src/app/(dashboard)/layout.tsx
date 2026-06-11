'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { AppHeader } from '@/components/layout/app-header'
import { useAuthStore } from '@/stores/use-auth-store'
import { useWorkspaceStore } from '@/stores/use-workspace-store'

import { FloatingChatbot } from '@/components/chat/FloatingChatbot'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, hasCompletedSetup } = useAuthStore()
  const { workspace } = useWorkspaceStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.replace('/login')
    } else if (!hasCompletedSetup && (!workspace || !workspace.name)) {
      router.replace('/setup')
    }
  }, [mounted, isAuthenticated, hasCompletedSetup, workspace, router])

  if (!mounted || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-mesh">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden bg-transparent">
        <AppHeader />
        <main className="flex-1 overflow-auto p-8 animate-fade-in relative z-0">
          {children}
        </main>
      </div>
      <FloatingChatbot />
    </div>
  )
}
