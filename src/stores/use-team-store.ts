'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEMO_TEAM, type DemoTeamMember } from '@/lib/demo-data'

interface TeamState {
  members: DemoTeamMember[]
  addMember: (member: DemoTeamMember) => void
  updateMember: (id: string, updates: Partial<DemoTeamMember>) => void
  deleteMember: (id: string) => void
  getMember: (id: string) => DemoTeamMember | undefined
  initializeDemo: () => void
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set, get) => ({
      members: DEMO_TEAM,

      addMember: (member) =>
        set((state) => ({ members: [...state.members, member] })),

      updateMember: (id, updates) =>
        set((state) => ({
          members: state.members.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),

      deleteMember: (id) =>
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
        })),

      getMember: (id) => get().members.find((m) => m.id === id),

      initializeDemo: () => set({ members: DEMO_TEAM }),
    }),
    {
      name: 'onespace-team',
    }
  )
)
