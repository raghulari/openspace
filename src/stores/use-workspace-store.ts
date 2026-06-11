'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEMO_WORKSPACE, type BusinessType, type DemoWorkspace } from '@/lib/demo-data'

interface WorkspaceState {
  workspace: DemoWorkspace | null
  isLoading: boolean
  setWorkspace: (workspace: DemoWorkspace) => void
  updateWorkspace: (updates: Partial<DemoWorkspace>) => void
  setBusinessType: (type: BusinessType) => void
  setLoading: (loading: boolean) => void
  initializeDemo: () => void
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      workspace: null,
      isLoading: false,

      setWorkspace: (workspace) => set({ workspace }),

      updateWorkspace: (updates) =>
        set((state) => ({
          workspace: state.workspace ? { ...state.workspace, ...updates } : null,
        })),

      setBusinessType: (businessType) =>
        set((state) => ({
          workspace: state.workspace ? { ...state.workspace, businessType } : null,
        })),

      setLoading: (isLoading) => set({ isLoading }),

      initializeDemo: () => set({ workspace: DEMO_WORKSPACE, isLoading: false }),
    }),
    {
      name: 'onespace-workspace',
    }
  )
)
