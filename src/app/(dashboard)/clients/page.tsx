'use client'

import { useState } from 'react'
import { Plus, Search, Filter, Phone, Mail, Building, MapPin, FileText, CreditCard } from 'lucide-react'
import { useClientStore } from '@/stores/use-client-store'
import { type DemoClient, type ClientType, type BillingCycle, formatDate } from '@/lib/demo-data'
import { toast } from 'sonner'
import Link from 'next/link'

export default function ClientsPage() {
  const { clients, addClient } = useClientStore()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'regular' | 'one-time'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Form State
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [gstNumber, setGstNumber] = useState('')
  const [notes, setNotes] = useState('')
  const [clientType, setClientType] = useState<ClientType>('regular')
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')

  // Filter clients
  const filteredClients = clients.filter((client) => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.companyName.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (filterType === 'all') return matchesSearch
    return matchesSearch && client.type === filterType
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim() || !phone.trim()) {
      toast.error('Client Name and Phone Number are required')
      return
    }

    const newClient: DemoClient = {
      id: `cli-${String(clients.length + 1).padStart(4, '0')}`,
      name,
      phone,
      companyName,
      email,
      address,
      gstNumber,
      notes,
      type: clientType,
      billingCycle: clientType === 'regular' ? billingCycle : 'custom',
      createdAt: new Date().toISOString().split('T')[0]
    }

    addClient(newClient)
    toast.success(`Client "${name}" added successfully!`)
    setIsModalOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setName('')
    setPhone('')
    setCompanyName('')
    setEmail('')
    setAddress('')
    setGstNumber('')
    setNotes('')
    setClientType('regular')
    setBillingCycle('monthly')
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-black tracking-tight">Clients</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Manage your customer database and view accounts ({filteredClients.length} clients total).
          </p>
        </div>
        
        <button
          onClick={() => { resetForm(); setIsModalOpen(true) }}
          className="flex items-center gap-1.5 self-start sm:self-center bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Client
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
            placeholder="Search clients by name or company name..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-black focus:glass transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-neutral-500 font-semibold uppercase tracking-wider flex items-center gap-1 shrink-0">
            <Filter className="h-3.5 w-3.5" />
            Type:
          </span>
          <div className="flex gap-1.5">
            {(['all', 'regular', 'one-time'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold border capitalize transition-all shrink-0 ${
                  filterType === type
                    ? 'bg-primary border-primary text-white'
                    : 'glass border-neutral-200 text-neutral-600 hover:border-neutral-400'
                }`}
              >
                {type.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Clients Table/List ── */}
      {filteredClients.length === 0 ? (
        <div className="glass rounded-3xl border border-neutral-200 p-16 text-center shadow-sm max-w-lg mx-auto mt-8">
          <Building className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-black">No clients found</h3>
          <p className="text-sm text-neutral-500 mt-1">Try resetting your filters or create a new client profile.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
          >
            <Plus className="h-4 w-4" />
            Create Client
          </button>
        </div>
      ) : (
        <div className="glass border border-neutral-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#f0f0f2] bg-neutral-50/50 text-[#71717a] font-semibold uppercase tracking-wider text-xs">
                  <th className="px-6 py-4">Client Name</th>
                  <th className="px-6 py-4">Company Name</th>
                  <th className="px-6 py-4">Phone Number</th>
                  <th className="px-6 py-4">Billing Cycle</th>
                  <th className="px-6 py-4">Client Type</th>
                  <th className="px-6 py-4">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f2]">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-neutral-50 transition-colors cursor-pointer group">
                    <td className="px-6 py-4.5 font-bold text-black">
                      <Link href={`/clients/${client.id}`} className="block group-hover:underline">
                        {client.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4.5 text-neutral-600">
                      {client.companyName || <span className="text-neutral-300 italic text-xs">Individual</span>}
                    </td>
                    <td className="px-6 py-4.5 text-neutral-600 font-mono text-xs">{client.phone}</td>
                    <td className="px-6 py-4.5">
                      <span className="capitalize text-neutral-600 font-medium">{client.billingCycle}</span>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
                        client.type === 'regular' ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-700'
                      }`}>
                        {client.type}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-neutral-500 font-mono text-xs">{formatDate(client.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Add Client Modal Overlay ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="glass w-full max-w-xl rounded-3xl shadow-xl border border-neutral-200 overflow-hidden flex flex-col animate-scale-in max-h-[90vh]">
            {/* Header */}
            <div className="p-6 border-b border-[#f0f0f2] flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-black">Add New Client</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Register a new profile in your business operations database.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-neutral-100 text-neutral-400 hover:text-black transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Client Name */}
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Client Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter name"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all"
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 99999 99999"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all"
                    />
                  </div>
                </div>

                {/* Company Name */}
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Company Name</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Optional"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Optional"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Client Type Cards */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Client Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setClientType('regular')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                      clientType === 'regular' ? 'border-black bg-neutral-50 ring-1 ring-black' : 'border-neutral-200'
                    }`}
                  >
                    <CreditCard className="h-5 w-5 text-neutral-600" />
                    <div>
                      <h5 className="text-xs font-bold text-black">Regular</h5>
                      <p className="text-[10px] text-neutral-400">Ongoing retainer contracts</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setClientType('one-time')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                      clientType === 'one-time' ? 'border-black bg-neutral-50 ring-1 ring-black' : 'border-neutral-200'
                    }`}
                  >
                    <FileText className="h-5 w-5 text-neutral-600" />
                    <div>
                      <h5 className="text-xs font-bold text-black">One-Time</h5>
                      <p className="text-[10px] text-neutral-400">Single project orders</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Conditional Billing Cycle */}
              {clientType === 'regular' && (
                <div className="space-y-1.5 animate-slide-in">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Billing Cycle</label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm glass outline-none focus:border-black transition-all"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              )}

              {/* GST Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">GSTIN Number (Optional)</label>
                <input
                  type="text"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  placeholder="e.g. 29AAAAA0000A1Z1"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all"
                />
              </div>

              {/* Business Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Billing Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter complete billing address"
                    rows={2}
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all resize-none"
                  />
                </div>
              </div>

              {/* Internal Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Internal Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add details, preferences, links..."
                  rows={2}
                  className="w-full px-4 py-2 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all resize-none"
                />
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
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
