'use client'

import { use, useMemo } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Tag, 
  IndianRupee, 
  ChevronRight, 
  Briefcase, 
  Clock, 
  Users, 
  FolderKanban, 
  CheckCircle,
  Building
} from 'lucide-react'
import { useServiceStore } from '@/stores/use-service-store'
import { useProjectStore } from '@/stores/use-project-store'
import { useInvoiceStore } from '@/stores/use-invoice-store'
import { useClientStore } from '@/stores/use-client-store'
import { useTeamStore } from '@/stores/use-team-store'
import { formatCurrency, formatDate } from '@/lib/demo-data'

interface ServiceDetailPageProps {
  params: Promise<{ id: string }>
}

export default function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { id } = use(params)
  const { services } = useServiceStore()
  const { projects } = useProjectStore()
  const { invoices } = useInvoiceStore()
  const { clients } = useClientStore()
  const { members } = useTeamStore()

  // Find service
  const service = useMemo(() => services.find(s => s.id === id), [services, id])

  // Aggregate project statistics
  const serviceProjects = useMemo(() => projects.filter(p => p.serviceId === id), [projects, id])
  const completedProjectsCount = useMemo(() => 
    serviceProjects.filter(p => p.status === 'completed').length, 
    [serviceProjects]
  )

  // Aggregate revenue from paid invoices containing this service
  const revenueGenerated = useMemo(() => {
    let total = 0
    invoices.forEach(inv => {
      if (inv.status === 'paid') {
        inv.items.forEach(item => {
          if (item.type === 'service' && item.referenceId === id) {
            total += item.amount
          }
        })
      }
    })
    return total
  }, [invoices, id])

  // Get assigned team members (from projects running this service)
  const assignedStaff = useMemo(() => {
    const memberIds = new Set(serviceProjects.map(p => p.teamMemberId))
    return members.filter(m => memberIds.has(m.id))
  }, [serviceProjects, members])

  // Get linked clients
  const linkedClientsList = useMemo(() => {
    const clientIds = new Set(serviceProjects.map(p => p.clientId))
    return clients.filter(c => clientIds.has(c.id))
  }, [serviceProjects, clients])

  if (!service) {
    return (
      <div className="text-center py-16 animate-fade-in max-w-md mx-auto">
        <h3 className="text-lg font-bold text-black">Service not found</h3>
        <p className="text-sm text-neutral-500 mt-1">The service ID you are looking for does not exist.</p>
        <Link 
          href="/services"
          className="mt-4 inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Services
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
        <Link href="/services" className="hover:text-black transition-colors">Services</Link>
        <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
        <span className="text-neutral-400">{service.name}</span>
      </div>

      {/* ── Service Header ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 glass p-6 rounded-3xl border border-neutral-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 border border-neutral-200 text-lg font-extrabold text-black">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-black tracking-tight">{service.name}</h1>
              <span className="inline-flex items-center rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                {service.category}
              </span>
            </div>
            <p className="text-sm text-neutral-500 flex items-center gap-1.5 mt-0.5">
              <Clock className="h-4 w-4 shrink-0 text-neutral-400" />
              Contract Duration: <span className="font-semibold text-black">{service.estimatedDuration}</span>
            </p>
          </div>
        </div>

        {/* Pricing Info */}
        <div className="flex gap-8 border-t md:border-t-0 md:border-l border-[#f0f0f2] pt-4 md:pt-0 md:pl-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Rate Price</p>
            <h3 className="text-2xl font-black text-black mt-0.5 flex items-center">
              <IndianRupee className="h-5 w-5 shrink-0" />
              {service.price.toLocaleString('en-IN')}
            </h3>
            <p className="text-[10px] text-neutral-500 mt-0.5">Estimated catalog fee</p>
          </div>
        </div>
      </div>

      {/* ── Stat Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Projects Completed */}
        <div className="glass p-6 rounded-3xl border border-neutral-200 shadow-sm card-hover">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Projects Completed</span>
          <h3 className="text-3xl font-black text-black mt-2 flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-emerald-500" />
            {completedProjectsCount} <span className="text-xs text-neutral-400 font-sans">/ {serviceProjects.length} total</span>
          </h3>
          <p className="text-xs text-neutral-500 mt-1">Successfully closed contracts</p>
        </div>

        {/* Total Revenue */}
        <div className="glass p-6 rounded-3xl border border-neutral-200 shadow-sm card-hover">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Revenue Contribution</span>
          <h3 className="text-3xl font-black text-black mt-2 flex items-center">
            <IndianRupee className="h-6 w-6 shrink-0" />
            {revenueGenerated.toLocaleString('en-IN')}
          </h3>
          <p className="text-xs text-neutral-500 mt-1">From settled invoice receipts</p>
        </div>

        {/* Staff Allocated */}
        <div className="glass p-6 rounded-3xl border border-neutral-200 shadow-sm card-hover">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Department Leads</span>
          <h3 className="text-3xl font-black text-black mt-2">{assignedStaff.length}</h3>
          <p className="text-xs text-neutral-500 mt-1">Staff members allocated</p>
        </div>
      </div>

      {/* ── Detail layout grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Linked Clients */}
        <div className="lg:col-span-2 glass rounded-3xl border border-neutral-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-[#f0f0f2] pb-4">
            <Users className="h-5 w-5 text-neutral-400" />
            <h3 className="text-base font-bold text-black">Clients Contracted</h3>
          </div>
          
          {linkedClientsList.length === 0 ? (
            <p className="text-xs text-neutral-400 italic py-6 text-center">No clients have purchased this service yet.</p>
          ) : (
            <div className="space-y-3">
              {linkedClientsList.map((client) => {
                const clientProj = serviceProjects.filter(p => p.clientId === client.id)
                return (
                  <div key={client.id} className="flex items-center justify-between p-4 rounded-2xl border border-neutral-100 hover:bg-neutral-50 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 border border-neutral-200 text-xs font-bold text-black">
                        {client.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-black">{client.name}</h4>
                        <p className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
                          <Building className="h-3 w-3" />
                          {client.companyName || 'Individual'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <span className="text-neutral-500 font-semibold">{clientProj.length} project(s)</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Details Card */}
        <div className="space-y-6">
          {/* Service specs */}
          <div className="glass rounded-3xl border border-neutral-200 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-black border-b border-[#f0f0f2] pb-3">Contract parameters</h3>
            
            <div className="space-y-3 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Category:</span>
                <span className="font-bold text-black">{service.category}</span>
              </div>
              <div className="flex justify-between">
                <span>Standard Fee:</span>
                <span className="font-bold text-black">{formatCurrency(service.price)}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration Unit:</span>
                <span className="font-bold text-black">{service.estimatedDuration}</span>
              </div>
              <div className="flex justify-between border-t border-[#f0f0f2] pt-3">
                <span>Registered:</span>
                <span className="font-mono text-neutral-500">{formatDate(service.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Catalog Description */}
          <div className="glass rounded-3xl border border-neutral-200 shadow-sm p-6 space-y-2">
            <h3 className="text-sm font-bold text-black">Catalog Description</h3>
            <p className="text-xs leading-relaxed text-neutral-500">
              {service.description || 'No description listed in catalog.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
