'use client'

import { use, useMemo, useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  IndianRupee,
  Building,
  User,
  Briefcase,
  FileText
} from 'lucide-react'
import { useProjectStore } from '@/stores/use-project-store'
import { useClientStore } from '@/stores/use-client-store'
import { useServiceStore } from '@/stores/use-service-store'
import { useTeamStore } from '@/stores/use-team-store'
import { useInvoiceStore } from '@/stores/use-invoice-store'
import { type ProjectStatus, formatCurrency, formatDate } from '@/lib/demo-data'
import { toast } from 'sonner'

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = use(params)
  const { projects, updateStatus } = useProjectStore()
  const { clients } = useClientStore()
  const { services } = useServiceStore()
  const { members } = useTeamStore()
  const { invoices, getProjectRevenue } = useInvoiceStore()

  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)

  // Find project
  const project = useMemo(() => projects.find(p => p.id === id), [projects, id])

  // Cross references
  const client = useMemo(() => 
    project ? clients.find(c => c.id === project.clientId) : null,
    [clients, project]
  )

  const service = useMemo(() => 
    project ? services.find(s => s.id === project.serviceId) : null,
    [services, project]
  )

  const lead = useMemo(() => 
    project ? members.find(m => m.id === project.teamMemberId) : null,
    [members, project]
  )

  // Linked invoices and revenue in INR
  const linkedInvoices = useMemo(() => 
    invoices.filter(inv => inv.projectId === id),
    [invoices, id]
  )

  const revenueEarned = useMemo(() => 
    getProjectRevenue(id),
    [getProjectRevenue, id]
  )

  const handleStatusChange = (newStatus: ProjectStatus) => {
    if (!project) return
    updateStatus(project.id, newStatus)
    toast.success(`Project status updated to ${newStatus.replace('-', ' ')}`)
    setIsStatusDropdownOpen(false)
  }

  if (!project) {
    return (
      <div className="text-center py-16 animate-fade-in max-w-md mx-auto">
        <h3 className="text-lg font-bold text-black">Project not found</h3>
        <p className="text-sm text-neutral-500 mt-1">The project ID you are looking for does not exist.</p>
        <Link 
          href="/projects"
          className="mt-4 inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>
      </div>
    )
  }

  // Calculate progress percentage based on status
  const progressPercent = (() => {
    switch(project.status) {
      case 'completed': return 100
      case 'in-progress': return 50
      case 'pending': return 10
      case 'cancelled': return 0
      default: return 0
    }
  })()

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
        <Link href="/projects" className="hover:text-black transition-colors">Projects</Link>
        <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
        <span className="text-neutral-400">{project.name}</span>
      </div>

      {/* ── Project Header ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 glass p-6 rounded-3xl border border-neutral-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 border border-neutral-200 text-lg font-extrabold text-black">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-black tracking-tight">{project.name}</h1>
            <p className="text-sm text-neutral-500 flex items-center gap-1.5 mt-0.5">
              <Building className="h-4 w-4 shrink-0 text-neutral-400" />
              Client: <span className="font-semibold text-black">{client?.name || 'Unknown Client'}</span>
            </p>
          </div>
        </div>

        {/* Status Dropdown Trigger */}
        <div className="relative">
          <button
            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
            className={`inline-flex items-center gap-2 rounded-xl border border-neutral-200 hover:border-neutral-400 glass text-xs font-bold uppercase tracking-wider px-4 py-2.5 shadow-xs transition-all`}
          >
            Status: {project.status.replace('-', ' ')}
          </button>
          
          {isStatusDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsStatusDropdownOpen(false)} />
              <div className="absolute right-0 mt-1.5 w-40 glass border border-neutral-200 rounded-xl shadow-lg z-20 py-1.5 text-xs text-left animate-scale-in">
                {(['pending', 'in-progress', 'completed', 'cancelled'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    className="w-full text-left px-4 py-2 hover:bg-neutral-50 font-semibold capitalize"
                  >
                    {st.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Stat Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Project Revenue */}
        <div className="glass p-6 rounded-3xl border border-neutral-200 shadow-sm card-hover">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Paid Revenue Earned</span>
          <h3 className="text-3xl font-black text-emerald-600 mt-2 flex items-center">
            <IndianRupee className="h-6 w-6 shrink-0" />
            {revenueEarned.toLocaleString('en-IN')}
          </h3>
          <p className="text-xs text-neutral-500 mt-1">From paid invoices of this project</p>
        </div>

        {/* Service rate */}
        <div className="glass p-6 rounded-3xl border border-neutral-200 shadow-sm card-hover">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Allocated Service Fee</span>
          <h3 className="text-3xl font-black text-black mt-2 flex items-center">
            <IndianRupee className="h-6 w-6 shrink-0" />
            {service ? service.price.toLocaleString('en-IN') : '0'}
          </h3>
          <p className="text-xs text-neutral-500 mt-1">Standard rate catalog price</p>
        </div>

        {/* Lead staff member */}
        <div className="glass p-6 rounded-3xl border border-neutral-200 shadow-sm card-hover">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Staff Delivery Lead</span>
          <h3 className="text-xl font-bold text-black mt-3 flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-neutral-100 flex items-center justify-center text-[10px] font-black border border-neutral-200">
              {lead?.avatarInitials || 'NA'}
            </div>
            {lead?.name || 'Unassigned'}
          </h3>
          <p className="text-xs text-neutral-500 mt-1.5">{lead?.role || 'Service Representative'}</p>
        </div>
      </div>

      {/* ── Progress & Timeline Card ── */}
      <div className="glass rounded-3xl border border-neutral-200 shadow-sm p-6 space-y-6">
        <div>
          <h3 className="text-base font-bold text-black">Timeline & Completion Progress</h3>
          <p className="text-xs text-neutral-500 mt-0.5">Start date: {formatDate(project.startDate)} • Target End date: {formatDate(project.endDate)}</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-neutral-400 uppercase tracking-wider">
            <span>Progress bar</span>
            <span className="text-black">{progressPercent}%</span>
          </div>
          <div className="h-2.5 w-full bg-neutral-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                project.status === 'completed' ? 'bg-emerald-500' : project.status === 'cancelled' ? 'bg-neutral-300' : 'bg-primary'
              }`} 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Main content split layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Linked Invoices */}
        <div className="lg:col-span-2 glass rounded-3xl border border-neutral-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-[#f0f0f2] pb-4">
            <FileText className="h-5 w-5 text-neutral-400" />
            <h3 className="text-base font-bold text-black">Linked Invoices</h3>
          </div>

          {linkedInvoices.length === 0 ? (
            <p className="text-xs text-neutral-400 italic py-6 text-center">No invoices are currently linked to this project.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-400 font-semibold uppercase tracking-wider">
                    <th className="py-2.5">Invoice #</th>
                    <th className="py-2.5">Amount</th>
                    <th className="py-2.5">Date</th>
                    <th className="py-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {linkedInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-3 font-bold text-black">
                        <Link href={`/invoices/${inv.id}`} className="hover:underline">{inv.invoiceNumber}</Link>
                      </td>
                      <td className="py-3 font-semibold text-black">{formatCurrency(inv.total)}</td>
                      <td className="py-3 font-mono text-neutral-500">{formatDate(inv.invoiceDate)}</td>
                      <td className="py-3 text-right">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          inv.status === 'paid' ? 'status-paid' : inv.status === 'pending' ? 'status-pending' : 'status-overdue'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Client details overview */}
        <div className="glass rounded-3xl border border-neutral-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-[#f0f0f2] pb-4">
            <User className="h-5 w-5 text-neutral-400" />
            <h3 className="text-base font-bold text-black">Client Account</h3>
          </div>

          <div className="space-y-4.5 text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Account Name</span>
              <p className="font-bold text-black text-sm">
                <Link href={`/clients/${client?.id}`} className="hover:underline">{client?.name || 'Unknown client'}</Link>
              </p>
            </div>
            
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Company Name</span>
              <p className="font-semibold text-neutral-700">{client?.companyName || 'Individual Client'}</p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Phone Number</span>
              <p className="font-mono text-neutral-600">{client?.phone || 'No phone registered'}</p>
            </div>
            
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Billing Address</span>
              <p className="text-neutral-500 leading-relaxed">{client?.address || 'No address registered'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
