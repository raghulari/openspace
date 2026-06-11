'use client'

import { use, useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Building, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  FolderKanban, 
  User, 
  Plus, 
  ChevronRight, 
  IndianRupee, 
  Layers
} from 'lucide-react'
import { useClientStore } from '@/stores/use-client-store'
import { useProjectStore } from '@/stores/use-project-store'
import { useInvoiceStore } from '@/stores/use-invoice-store'
import { useTeamStore } from '@/stores/use-team-store'
import { formatCurrency, formatDate } from '@/lib/demo-data'

interface ClientDetailPageProps {
  params: Promise<{ id: string }>
}

export default function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { id } = use(params)
  const { clients } = useClientStore()
  const { projects } = useProjectStore()
  const { invoices, getClientRevenue } = useInvoiceStore()
  const { members } = useTeamStore()

  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'invoices' | 'payments'>('overview')

  // Find client
  const client = useMemo(() => clients.find(c => c.id === id), [clients, id])

  // Get client-specific projects and invoices
  const clientProjects = useMemo(() => projects.filter(p => p.clientId === id), [projects, id])
  const clientInvoices = useMemo(() => invoices.filter(i => i.clientId === id), [invoices, id])
  const paidInvoices = useMemo(() => clientInvoices.filter(i => i.status === 'paid'), [clientInvoices])
  
  // Total Revenue contribution
  const totalRevenue = useMemo(() => getClientRevenue(id), [getClientRevenue, id])

  // Get assigned team members (from projects linked to this client)
  const assignedTeamMembers = useMemo(() => {
    const memberIds = new Set(clientProjects.map(p => p.teamMemberId))
    return members.filter(m => memberIds.has(m.id))
  }, [clientProjects, members])

  if (!client) {
    return (
      <div className="text-center py-16 animate-fade-in max-w-md mx-auto">
        <h3 className="text-lg font-bold text-black">Client not found</h3>
        <p className="text-sm text-neutral-500 mt-1">The client ID you are looking for does not exist.</p>
        <Link 
          href="/clients"
          className="mt-4 inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Clients
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
        <Link href="/clients" className="hover:text-black transition-colors">Clients</Link>
        <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
        <span className="text-neutral-400">{client.name}</span>
      </div>

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 glass p-6 rounded-3xl border border-neutral-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 border border-neutral-200 text-lg font-extrabold text-black">
            {client.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-black tracking-tight">{client.name}</h1>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                client.type === 'regular' ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-700'
              }`}>
                {client.type}
              </span>
            </div>
            <p className="text-sm text-neutral-500 flex items-center gap-1.5 mt-0.5">
              <Building className="h-4 w-4 shrink-0" />
              {client.companyName || 'Individual Client'}
            </p>
          </div>
        </div>

        {/* Total Revenue Summary */}
        <div className="flex gap-8 border-t md:border-t-0 md:border-l border-[#f0f0f2] pt-4 md:pt-0 md:pl-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Total Contribution</p>
            <h3 className="text-2xl font-black text-black mt-0.5 flex items-center">
              <IndianRupee className="h-5 w-5 shrink-0" />
              {totalRevenue.toLocaleString('en-IN')}
            </h3>
            <p className="text-[10px] text-neutral-500 mt-0.5">{paidInvoices.length} paid invoices</p>
          </div>
        </div>
      </div>

      {/* ── Tabbed View Selection ── */}
      <div className="border-b border-[#e4e4e7]">
        <nav className="flex gap-6 -mb-px">
          {([
            { id: 'overview', label: 'Overview' },
            { id: 'projects', label: 'Projects' },
            { id: 'invoices', label: 'Invoices' },
            { id: 'payments', label: 'Payment History' },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-black text-black'
                  : 'border-transparent text-neutral-400 hover:text-black'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Tab Contents ── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-in">
          {/* Main Info Card */}
          <div className="lg:col-span-2 glass rounded-3xl border border-neutral-200 shadow-sm p-6 space-y-6">
            <h3 className="text-base font-bold text-black">Contact & Company Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Phone Number</span>
                <p className="text-sm font-semibold text-black flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-neutral-400" />
                  {client.phone}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Email Address</span>
                <p className="text-sm font-semibold text-black flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-neutral-400" />
                  {client.email || <span className="text-neutral-400 font-normal italic">None provided</span>}
                </p>
              </div>

              <div className="space-y-1 col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Billing Address</span>
                <p className="text-sm font-semibold text-black flex items-start gap-1.5">
                  <MapPin className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
                  {client.address || <span className="text-neutral-400 font-normal italic">None provided</span>}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">GSTIN Number</span>
                <p className="text-sm font-semibold text-black font-mono">
                  {client.gstNumber || <span className="text-neutral-400 font-normal italic">Unregistered</span>}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Billing Cycle</span>
                <p className="text-sm font-semibold text-black capitalize">
                  {client.billingCycle}
                </p>
              </div>
            </div>

            <div className="border-t border-[#f0f0f2] pt-6 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Notes / Instructions</span>
              <p className="text-sm text-neutral-600 bg-neutral-50/50 p-4 rounded-2xl border border-neutral-100">
                {client.notes || 'No client-specific instructions registered.'}
              </p>
            </div>
          </div>

          {/* Side Info Cards */}
          <div className="space-y-6">
            {/* Team Members assigned */}
            <div className="glass rounded-3xl border border-neutral-200 shadow-sm p-6">
              <h3 className="text-sm font-bold text-black mb-4">Assigned Team</h3>
              {assignedTeamMembers.length === 0 ? (
                <p className="text-xs text-neutral-400 italic">No team members assigned via active projects.</p>
              ) : (
                <div className="space-y-3">
                  {assignedTeamMembers.map(member => (
                    <div key={member.id} className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-xs font-bold text-black">
                        {member.avatarInitials}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-black">{member.name}</h4>
                        <p className="text-[10px] text-neutral-400">{member.role} ({member.department})</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="glass rounded-3xl border border-neutral-200 shadow-sm p-6 space-y-4">
              <h3 className="text-sm font-bold text-black">Workspace Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 text-center">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase">Projects</span>
                  <p className="text-lg font-black text-black mt-1">{clientProjects.length}</p>
                </div>
                <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 text-center">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase">Invoices</span>
                  <p className="text-lg font-black text-black mt-1">{clientInvoices.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="space-y-4 animate-slide-in">
          {clientProjects.length === 0 ? (
            <div className="glass rounded-3xl border border-neutral-200 p-12 text-center shadow-sm">
              <FolderKanban className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
              <h4 className="font-bold text-black">No projects found</h4>
              <p className="text-xs text-neutral-400 mt-1">There are no projects linked to this client yet.</p>
              <Link
                href="/projects"
                className="mt-3 inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5" /> Create Project
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {clientProjects.map((project) => {
                const manager = members.find(m => m.id === project.teamMemberId)
                return (
                  <div key={project.id} className="glass p-6 rounded-3xl border border-neutral-200 shadow-sm flex flex-col justify-between card-hover">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-black text-base">{project.name}</h4>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          project.status === 'completed' ? 'status-paid' : project.status === 'in-progress' ? 'status-in-progress' : project.status === 'cancelled' ? 'status-cancelled' : 'status-pending'
                        }`}>
                          {project.status.replace('-', ' ')}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-6 text-xs text-neutral-500">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-neutral-400">Timeline</p>
                          <p className="font-semibold text-black mt-0.5">{formatDate(project.startDate)} - {formatDate(project.endDate)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-neutral-400">Assigned Lead</p>
                          <p className="font-semibold text-black mt-0.5">{manager?.name || 'Unassigned'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 mt-4 border-t border-[#f0f0f2] flex justify-end">
                      <Link 
                        href={`/projects/${project.id}`}
                        className="text-xs font-semibold text-neutral-500 hover:text-black"
                      >
                        View Project details →
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="space-y-4 animate-slide-in">
          {clientInvoices.length === 0 ? (
            <div className="glass rounded-3xl border border-neutral-200 p-12 text-center shadow-sm">
              <FileText className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
              <h4 className="font-bold text-black">No invoices found</h4>
              <p className="text-xs text-neutral-400 mt-1">There are no invoices issued for this client yet.</p>
              <Link
                href="/invoices/create"
                className="mt-3 inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5" /> Create Invoice
              </Link>
            </div>
          ) : (
            <div className="glass border border-neutral-200 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#f0f0f2] bg-neutral-50/50 text-[#71717a] font-semibold uppercase tracking-wider text-xs">
                    <th className="px-6 py-4">Invoice #</th>
                    <th className="px-6 py-4">Invoice Date</th>
                    <th className="px-6 py-4">Due Date</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f0f2]">
                  {clientInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-black">
                        <Link href={`/invoices/${inv.id}`} className="hover:underline">{inv.invoiceNumber}</Link>
                      </td>
                      <td className="px-6 py-4 text-neutral-500 font-mono text-xs">{formatDate(inv.invoiceDate)}</td>
                      <td className="px-6 py-4 text-neutral-500 font-mono text-xs">{formatDate(inv.dueDate)}</td>
                      <td className="px-6 py-4 font-semibold text-black">{formatCurrency(inv.total)}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize ${
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
      )}

      {activeTab === 'payments' && (
        <div className="space-y-4 animate-slide-in">
          {paidInvoices.length === 0 ? (
            <div className="glass rounded-3xl border border-neutral-200 p-12 text-center shadow-sm">
              <IndianRupee className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
              <h4 className="font-bold text-black">No billing history found</h4>
              <p className="text-xs text-neutral-400 mt-1">No payments have been received from this client yet.</p>
            </div>
          ) : (
            <div className="glass border border-neutral-200 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#f0f0f2] bg-neutral-50/50 text-[#71717a] font-semibold uppercase tracking-wider text-xs">
                    <th className="px-6 py-4">Receipt Ref</th>
                    <th className="px-6 py-4">Billing Date</th>
                    <th className="px-6 py-4">Settled Date</th>
                    <th className="px-6 py-4">Total Amount Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f0f2]">
                  {paidInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-black">
                        <Link href={`/invoices/${inv.id}`} className="hover:underline">{inv.invoiceNumber}</Link>
                      </td>
                      <td className="px-6 py-4 text-neutral-500 font-mono text-xs">{formatDate(inv.invoiceDate)}</td>
                      <td className="px-6 py-4 text-neutral-500 font-mono text-xs">{inv.paidDate ? formatDate(inv.paidDate) : '-'}</td>
                      <td className="px-6 py-4 font-bold text-emerald-600">{formatCurrency(inv.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
