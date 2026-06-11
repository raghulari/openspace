'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEMO_SERVICES, type DemoService } from '@/lib/demo-data'

interface ServiceState {
  services: DemoService[]
  addService: (service: DemoService) => void
  updateService: (id: string, updates: Partial<DemoService>) => void
  deleteService: (id: string) => void
  getService: (id: string) => DemoService | undefined
  initializeDemo: () => void
}

export const useServiceStore = create<ServiceState>()(
  persist(
    (set, get) => ({
      services: DEMO_SERVICES,

      addService: (service) =>
        set((state) => ({ services: [...state.services, service] })),

      updateService: (id, updates) =>
        set((state) => ({
          services: state.services.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),

      deleteService: (id) =>
        set((state) => ({
          services: state.services.filter((s) => s.id !== id),
        })),

      getService: (id) => get().services.find((s) => s.id === id),

      initializeDemo: () => set({ services: DEMO_SERVICES }),
    }),
    {
      name: 'onespace-services',
    }
  )
)
