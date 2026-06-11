import { create } from 'zustand'

interface UIState {
  sidebarCollapsed: boolean
  searchOpen: boolean
  createMenuOpen: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setSearchOpen: (open: boolean) => void
  setCreateMenuOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarCollapsed: false,
  searchOpen: false,
  createMenuOpen: false,
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setCreateMenuOpen: (createMenuOpen) => set({ createMenuOpen }),
}))
