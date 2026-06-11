'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEMO_CLIENTS, type DemoClient } from '@/lib/demo-data'

interface ClientState {
  clients: DemoClient[]
  addClient: (client: DemoClient) => void
  updateClient: (id: string, updates: Partial<DemoClient>) => void
  deleteClient: (id: string) => void
  getClient: (id: string) => DemoClient | undefined
  initializeDemo: () => void
}

export const useClientStore = create<ClientState>()(
  persist(
    (set, get) => ({
      clients: DEMO_CLIENTS,

      addClient: (client) =>
        set((state) => ({ clients: [...state.clients, client] })),

      updateClient: (id, updates) =>
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      deleteClient: (id) =>
        set((state) => ({
          clients: state.clients.filter((c) => c.id !== id),
        })),

      getClient: (id) => get().clients.find((c) => c.id === id),

      initializeDemo: () => set({ clients: DEMO_CLIENTS }),
    }),
    {
      name: 'onespace-clients',
    }
  )
)
