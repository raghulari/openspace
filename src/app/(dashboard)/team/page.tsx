'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, Mail, Phone, Briefcase, IndianRupee, FolderKanban, Sparkles, CheckCircle } from 'lucide-react'
import { useTeamStore } from '@/stores/use-team-store'
import { useProjectStore } from '@/stores/use-project-store'
import { useInvoiceStore } from '@/stores/use-invoice-store'
import { type DemoTeamMember, formatCurrency } from '@/lib/demo-data'
import { toast } from 'sonner'

export default function TeamPage() {
  const { members, addMember } = useTeamStore()
  const { projects } = useProjectStore()
  const { invoices } = useInvoiceStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDept, setSelectedDept] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form State
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [department, setDepartment] = useState('Engineering')

  const departments = ['Engineering', 'Design', 'Marketing', 'Sales', 'Operations']

  // Dynamically compute team metrics
  const teamMetrics = useMemo(() => {
    return members.map((member) => {
      // Projects assigned to member
      const memberProjects = projects.filter(p => p.teamMemberId === member.id)
      const assignedCount = memberProjects.length
      const completedCount = memberProjects.filter(p => p.status === 'completed').length

      // Revenue contribution: Paid invoices linked to projects owned by this member
      const projectIds = memberProjects.map(p => p.id)
      const memberPaidInvoices = invoices.filter(
        inv => inv.status === 'paid' && inv.projectId && projectIds.includes(inv.projectId)
      )
      const revenueContribution = memberPaidInvoices.reduce((sum, inv) => sum + inv.total, 0)

      return {
        member,
        assignedCount,
        completedCount,
        revenueContribution
      }
    })
  }, [members, projects, invoices])

  // Filter members
  const filteredTeam = useMemo(() => {
    return teamMetrics.filter(({ member }) => {
      const matchesSearch = 
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.role.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesDept = selectedDept === 'all' || member.department === selectedDept
      
      return matchesSearch && matchesDept
    })
  }, [teamMetrics, searchQuery, selectedDept])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !role.trim() || !email.trim()) {
      toast.error('Name, Role, and Email are required')
      return
    }

    const initials = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

    const newMember: DemoTeamMember = {
      id: `tm-${String(members.length + 1).padStart(4, '0')}`,
      name,
      role,
      phone,
      email,
      department,
      avatarInitials: initials,
      createdAt: new Date().toISOString().split('T')[0]
    }

    addMember(newMember)
    toast.success(`Team member "${name}" registered successfully!`)
    setIsModalOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setName('')
    setRole('')
    setPhone('')
    setEmail('')
    setDepartment('Engineering')
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-black tracking-tight">Team Members</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Manage your company department staffing and view project allocations.
          </p>
        </div>

        <button
          onClick={() => { resetForm(); setIsModalOpen(true) }}
          className="flex items-center gap-1.5 self-start sm:self-center bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Member
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 glass p-4 rounded-2xl border border-neutral-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, role, department..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-black focus:glass transition-all"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedDept('all')}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold border transition-all shrink-0 ${
              selectedDept === 'all'
                ? 'bg-primary border-primary text-white'
                : 'glass border-neutral-200 text-neutral-600 hover:border-neutral-400'
            }`}
          >
            All Departments
          </button>
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold border transition-all shrink-0 ${
                selectedDept === dept
                  ? 'bg-primary border-primary text-white'
                  : 'glass border-neutral-200 text-neutral-600 hover:border-neutral-400'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid List ── */}
      {filteredTeam.length === 0 ? (
        <div className="glass rounded-3xl border border-neutral-200 p-16 text-center shadow-sm max-w-lg mx-auto mt-8">
          <Briefcase className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-black">No team members found</h3>
          <p className="text-sm text-neutral-500 mt-1">Try resetting your filter or register a new team member.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTeam.map(({ member, assignedCount, completedCount, revenueContribution }) => (
            <div key={member.id} className="glass rounded-3xl border border-neutral-200 p-6 flex flex-col justify-between card-hover shadow-sm relative overflow-hidden group">
              <div className="absolute right-4 top-4 bg-neutral-50 border border-neutral-100 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full text-neutral-500">
                {member.department}
              </div>

              <div>
                {/* Profile Avatar & Name */}
                <div className="flex items-center gap-4.5 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {member.avatarInitials}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-black text-base group-hover:underline">{member.name}</h3>
                    <p className="text-xs text-neutral-400 mt-0.5">{member.role}</p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2.5 text-xs text-neutral-500 mb-6 pb-6 border-b border-[#f0f0f2]">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-neutral-400 shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-neutral-400 shrink-0" />
                    <span>{member.phone}</span>
                  </div>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-3 gap-2 text-center bg-neutral-50/50 p-3.5 rounded-2xl border border-neutral-100/50">
                <div>
                  <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider block">Assigned</span>
                  <p className="text-sm font-black text-black mt-1 flex items-center justify-center gap-1">
                    <FolderKanban className="h-3 w-3 text-neutral-400" />
                    {assignedCount}
                  </p>
                </div>
                <div>
                  <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider block">Done</span>
                  <p className="text-sm font-black text-black mt-1 flex items-center justify-center gap-1">
                    <CheckCircle className="h-3 w-3 text-neutral-400" />
                    {completedCount}
                  </p>
                </div>
                <div className="col-span-1">
                  <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider block">Revenue</span>
                  <p className="text-xs font-black text-emerald-600 mt-1 truncate" title={formatCurrency(revenueContribution)}>
                    ₹{revenueContribution >= 100000 ? `${(revenueContribution / 100000).toFixed(1)}L` : `${(revenueContribution / 1000).toFixed(1)}K`}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add Member Modal Overlay ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="glass w-full max-w-md rounded-3xl shadow-xl border border-neutral-200 overflow-hidden flex flex-col animate-scale-in">
            {/* Header */}
            <div className="p-6 border-b border-[#f0f0f2] flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-black">Register Team Member</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Register a new profile in your corporate staffing roll.</p>
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
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rohit Kapoor"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Designation Role *</label>
                <div className="relative">
                  <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Lead Designer, Senior Engineer"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@davisent.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 99999 99999"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm glass outline-none focus:border-black transition-all"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
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
                  Register Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
