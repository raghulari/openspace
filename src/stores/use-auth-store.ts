'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEMO_USER, type DemoUser } from '@/lib/demo-data'

interface AuthState {
  isAuthenticated: boolean
  user: DemoUser | null
  login: (email: string, password: string) => boolean
  signup: (fullName: string, email: string, password: string) => boolean
  logout: () => void
  hasCompletedSetup: boolean
  setHasCompletedSetup: (val: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      hasCompletedSetup: false,

      login: (_email: string, _password: string) => {
        set({
          isAuthenticated: true,
          user: DEMO_USER,
        })
        return true
      },

      signup: (fullName: string, email: string, _password: string) => {
        const initials = fullName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)

        set({
          isAuthenticated: true,
          user: {
            id: 'user-0001',
            fullName,
            email,
            avatarInitials: initials,
          },
        })
        return true
      },

      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          hasCompletedSetup: false,
        })
      },

      setHasCompletedSetup: (hasCompletedSetup) => set({ hasCompletedSetup }),
    }),
    {
      name: 'onespace-auth',
    }
  )
)
