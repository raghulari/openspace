'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEMO_PROJECTS, type DemoProject, type ProjectStatus } from '@/lib/demo-data'

interface ProjectState {
  projects: DemoProject[]
  addProject: (project: DemoProject) => void
  updateProject: (id: string, updates: Partial<DemoProject>) => void
  updateStatus: (id: string, status: ProjectStatus) => void
  deleteProject: (id: string) => void
  getProject: (id: string) => DemoProject | undefined
  getProjectsByClient: (clientId: string) => DemoProject[]
  getProjectsByTeamMember: (teamMemberId: string) => DemoProject[]
  getProjectsByStatus: (status: ProjectStatus) => DemoProject[]
  initializeDemo: () => void
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: DEMO_PROJECTS,

      addProject: (project) =>
        set((state) => ({ projects: [...state.projects, project] })),

      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      updateStatus: (id, status) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, status } : p
          ),
        })),

      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        })),

      getProject: (id) => get().projects.find((p) => p.id === id),

      getProjectsByClient: (clientId) =>
        get().projects.filter((p) => p.clientId === clientId),

      getProjectsByTeamMember: (teamMemberId) =>
        get().projects.filter((p) => p.teamMemberId === teamMemberId),

      getProjectsByStatus: (status) =>
        get().projects.filter((p) => p.status === status),

      initializeDemo: () => set({ projects: DEMO_PROJECTS }),
    }),
    {
      name: 'onespace-projects',
    }
  )
)
