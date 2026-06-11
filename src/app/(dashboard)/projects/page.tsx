'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, FolderKanban, Calendar, Users, Briefcase, User } from 'lucide-react'
import { useProjectStore } from '@/stores/use-project-store'
import { useClientStore } from '@/stores/use-client-store'
import { useServiceStore } from '@/stores/use-service-store'
import { useTeamStore } from '@/stores/use-team-store'
import { type DemoProject, type ProjectStatus, formatDate } from '@/lib/demo-data'
import { toast } from 'sonner'
import Link from 'next/link'

export default function ProjectsPage() {
  const { projects, addProject } = useProjectStore()
  const { clients } = useClientStore()
  const { services } = useServiceStore()
  const { members } = useTeamStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | ProjectStatus>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form State
  const [name, setName] = useState('')
  const [clientId, setClientId] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [teamMemberId, setTeamMemberId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [status, setStatus] = useState<ProjectStatus>('pending')

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter((proj) => {
      const client = clients.find(c => c.id === proj.clientId)
      const clientName = client?.name || ''
      const matchesSearch = 
        proj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clientName.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = activeTab === 'all' || proj.status === activeTab
      
      return matchesSearch && matchesStatus
    })
  }, [projects, clients, searchQuery, activeTab])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !clientId || !serviceId || !teamMemberId || !startDate || !endDate) {
      toast.error('All fields marked with an asterisk are required')
      return
    }

    const newProject: DemoProject = {
      id: `proj-${String(projects.length + 1).padStart(4, '0')}`,
      name,
      clientId,
      serviceId,
      teamMemberId,
      startDate,
      endDate,
      status,
      createdAt: new Date().toISOString().split('T')[0]
    }

    addProject(newProject)
    toast.success(`Project "${name}" created successfully!`)
    setIsModalOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setName('')
    setClientId('')
    setServiceId('')
    setTeamMemberId('')
    setStartDate('')
    setEndDate('')
    setStatus('pending')
  }

  // Calculate progress percentage based on status
  const getProgressVal = (status: ProjectStatus) => {
    switch(status) {
      case 'completed': return 100
      case 'in-progress': return 50
      case 'pending': return 10
      case 'cancelled': return 0
      default: return 0
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-black tracking-tight">Projects</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Overview client operations, execution timelines, and staff project assignments.
          </p>
        </div>

        <button
          onClick={() => { resetForm(); setIsModalOpen(true) }}
          className="flex items-center gap-1.5 self-start sm:self-center bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
        >
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>

      {/* ── Search & Filter Panel ── */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 glass p-4 rounded-2xl border border-neutral-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by title or client name..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-black focus:glass transition-all"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {(['all', 'pending', 'in-progress', 'completed', 'cancelled'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold border capitalize transition-all shrink-0 ${
                activeTab === tab
                  ? 'bg-primary border-primary text-white'
                  : 'glass border-neutral-200 text-neutral-600 hover:border-neutral-400'
              }`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* ── Projects Grid ── */}
      {filteredProjects.length === 0 ? (
        <div className="glass rounded-3xl border border-neutral-200 p-16 text-center shadow-sm max-w-lg mx-auto mt-8">
          <FolderKanban className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-black">No projects found</h3>
          <p className="text-sm text-neutral-500 mt-1">Try resetting your filters or create a new project contract.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((proj) => {
            const client = clients.find(c => c.id === proj.clientId)
            const service = services.find(s => s.id === proj.serviceId)
            const lead = members.find(m => m.id === proj.teamMemberId)
            const progress = getProgressVal(proj.status)

            return (
              <div key={proj.id} className="glass rounded-3xl border border-neutral-200 p-6 flex flex-col justify-between card-hover shadow-sm group">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 truncate max-w-[120px]">
                      {service?.name || 'Service Allocation'}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      proj.status === 'completed' 
                        ? 'status-paid' 
                        : proj.status === 'in-progress' 
                          ? 'status-in-progress' 
                          : proj.status === 'cancelled'
                            ? 'status-cancelled'
                            : 'status-pending'
                    }`}>
                      {proj.status.replace('-', ' ')}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-black text-base group-hover:underline mb-2">
                    <Link href={`/projects/${proj.id}`}>{proj.name}</Link>
                  </h3>

                  <p className="text-xs text-neutral-500 flex items-center gap-1.5 mt-1 font-semibold">
                    <Users className="h-3.5 w-3.5 text-neutral-400" />
                    {client?.name || 'Unknown Client'}
                  </p>
                </div>

                <div className="mt-6 space-y-4">
                  {/* Progress Indicator */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold text-neutral-400">
                      <span>PROJECT PROGRESS</span>
                      <span className="text-black">{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          proj.status === 'completed' ? 'bg-emerald-500' : proj.status === 'cancelled' ? 'bg-neutral-300' : 'bg-primary'
                        }`} 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Dates / Lead Footer */}
                  <div className="border-t border-[#f0f0f2] pt-4 grid grid-cols-2 gap-4 text-[11px] text-neutral-400 font-semibold uppercase tracking-wider">
                    <div>
                      <span className="block text-[9px] text-neutral-400 font-bold uppercase">Timeline</span>
                      <span className="text-neutral-700 font-bold">{formatDate(proj.startDate)}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[9px] text-neutral-400 font-bold uppercase">Lead Owner</span>
                      <span className="text-neutral-700 font-bold truncate block">{lead?.name || 'Unassigned'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Add Project Modal Overlay ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="glass w-full max-w-lg rounded-3xl shadow-xl border border-neutral-200 overflow-hidden flex flex-col animate-scale-in">
            {/* Header */}
            <div className="p-6 border-b border-[#f0f0f2] flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-black">New Project</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Register a new client deliverable inside the system.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-neutral-100 text-neutral-400 hover:text-black transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Project Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Website Redesign, Logo Branding"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Client *</label>
                  <select
                    required
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm glass outline-none focus:border-black transition-all"
                  >
                    <option value="">Select Client</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Service Category *</label>
                  <select
                    required
                    value={serviceId}
                    onChange={(e) => setServiceId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm glass outline-none focus:border-black transition-all"
                  >
                    <option value="">Select Service</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all"
                  />
                </div>

                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">End Date *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Lead Staff *</label>
                  <select
                    required
                    value={teamMemberId}
                    onChange={(e) => setTeamMemberId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm glass outline-none focus:border-black transition-all"
                  >
                    <option value="">Select Member</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Initial Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm glass outline-none focus:border-black transition-all"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                  </select>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-[#f0f0f2] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
