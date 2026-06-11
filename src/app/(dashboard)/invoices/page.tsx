'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, Filter, FileText, CheckCircle, Clock, AlertTriangle, MoreVertical, Trash2 } from 'lucide-react'
import { useInvoiceStore } from '@/stores/use-invoice-store'
import { useClientStore } from '@/stores/use-client-store'
import { type DemoInvoice, type InvoiceStatus, formatCurrency, formatDate } from '@/lib/demo-data'
import { toast } from 'sonner'
import Link from 'next/link'

export default function InvoicesPage() {
  const { 
    invoices, 
    markAsPaid, 
    markAsOverdue, 
    deleteInvoice,
    getPaidTotal, 
    getPendingTotal, 
    getOverdueTotal 
  } = useInvoiceStore()
  
  const { clients } = useClientStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all')
  const [activeActionId, setActiveActionId] = useState<string | null>(null)

  // Status summaries in INR
  const totalCount = invoices.length
  const paidTotal = getPaidTotal()
  const pendingTotal = getPendingTotal()
  const overdueTotal = getOverdueTotal()

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const client = clients.find(c => c.id === inv.clientId)
      const clientName = client?.name || ''
      const matchesSearch = 
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clientName.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = activeTab === 'all' || inv.status === activeTab
      
      return matchesSearch && matchesStatus
    })
  }, [invoices, clients, searchQuery, activeTab])

  const handleMarkPaid = (id: string, num: string) => {
    markAsPaid(id)
    toast.success(`Invoice ${num} marked as Paid`)
    setActiveActionId(null)
  }

  const handleMarkOverdue = (id: string, num: string) => {
    markAsOverdue(id)
    toast.success(`Invoice ${num} marked as Overdue`)
    setActiveActionId(null)
  }

  const handleDelete = (id: string, num: string) => {
    if (confirm(`Are you sure you want to delete invoice ${num}?`)) {
      deleteInvoice(id)
      toast.success(`Invoice ${num} has been deleted`)
      setActiveActionId(null)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-black tracking-tight">Invoices</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Manage client billing records, billing terms, and ledger states.
          </p>
        </div>

        <Link
          href="/invoices/create"
          className="flex items-center gap-1.5 self-start sm:self-center bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Create Invoice
        </Link>
      </div>

      {/* ── Summary Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Total Invoices count */}
        <div className="glass p-5 rounded-3xl border border-neutral-200 shadow-sm flex items-center gap-4 card-hover">
          <div className="p-3 bg-neutral-50 border border-neutral-100 rounded-2xl text-black">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Total Invoices</span>
            <h3 className="text-xl font-black text-black mt-0.5">{totalCount}</h3>
          </div>
        </div>

        {/* Paid Revenue */}
        <div className="glass p-5 rounded-3xl border border-neutral-200 shadow-sm flex items-center gap-4 card-hover">
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Paid Receipts</span>
            <h3 className="text-xl font-black text-black mt-0.5">{formatCurrency(paidTotal)}</h3>
          </div>
        </div>

        {/* Pending Revenue */}
        <div className="glass p-5 rounded-3xl border border-neutral-200 shadow-sm flex items-center gap-4 card-hover">
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-2xl text-amber-600">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Pending Ledger</span>
            <h3 className="text-xl font-black text-black mt-0.5">{formatCurrency(pendingTotal)}</h3>
          </div>
        </div>

        {/* Overdue Revenue */}
        <div className="glass p-5 rounded-3xl border border-neutral-200 shadow-sm flex items-center gap-4 card-hover">
          <div className="p-3 bg-red-50 border border-red-100 rounded-2xl text-red-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Overdue Ledger</span>
            <h3 className="text-xl font-black text-black mt-0.5">{formatCurrency(overdueTotal)}</h3>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Panel ── */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 glass p-4 rounded-2xl border border-neutral-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by invoice number or client name..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-black focus:glass transition-all"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {(['all', 'paid', 'pending', 'overdue'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold border capitalize transition-all shrink-0 ${
                activeTab === tab
                  ? 'bg-primary border-primary text-white'
                  : 'glass border-neutral-200 text-neutral-600 hover:border-neutral-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Invoices List Table ── */}
      {filteredInvoices.length === 0 ? (
        <div className="glass rounded-3xl border border-neutral-200 p-16 text-center shadow-sm max-w-lg mx-auto mt-8">
          <FileText className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-black">No invoices found</h3>
          <p className="text-sm text-neutral-500 mt-1">Try resetting your filters or generate a new invoice document.</p>
        </div>
      ) : (
        <div className="glass border border-neutral-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#f0f0f2] bg-neutral-50/50 text-[#71717a] font-semibold uppercase tracking-wider text-xs">
                  <th className="px-6 py-4">Invoice #</th>
                  <th className="px-6 py-4">Client Name</th>
                  <th className="px-6 py-4">Billing Type</th>
                  <th className="px-6 py-4">Total (₹)</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f2]">
                {filteredInvoices.map((inv) => {
                  const client = clients.find(c => c.id === inv.clientId)
                  return (
                    <tr key={inv.id} className="hover:bg-neutral-50 transition-colors group relative">
                      <td className="px-6 py-4 font-bold text-black">
                        <Link href={`/invoices/${inv.id}`} className="hover:underline">
                          {inv.invoiceNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-neutral-600 font-semibold">{client?.name || 'Unknown Client'}</td>
                      <td className="px-6 py-4">
                        <span className="capitalize text-xs text-neutral-500 bg-neutral-100 border border-neutral-200/50 px-2 py-0.5 rounded">
                          {inv.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-black">{formatCurrency(inv.total)}</td>
                      <td className="px-6 py-4 text-neutral-500 font-mono text-xs">{formatDate(inv.invoiceDate)}</td>
                      <td className="px-6 py-4 text-neutral-500 font-mono text-xs">{formatDate(inv.dueDate)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          inv.status === 'paid' ? 'status-paid' : inv.status === 'pending' ? 'status-pending' : 'status-overdue'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 text-right relative">
                        <div className="inline-block text-left">
                          <button
                            onClick={() => setActiveActionId(activeActionId === inv.id ? null : inv.id)}
                            className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-black transition-colors"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          
                          {activeActionId === inv.id && (
                            <>
                              <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setActiveActionId(null)}
                              />
                              <div className="absolute right-6 mt-1 w-36 glass border border-neutral-200 rounded-xl shadow-lg z-20 py-1.5 text-xs text-left animate-scale-in">
                                {inv.status !== 'paid' && (
                                  <button
                                    onClick={() => handleMarkPaid(inv.id, inv.invoiceNumber)}
                                    className="w-full text-left px-4 py-2 hover:bg-neutral-50 font-semibold text-emerald-600"
                                  >
                                    Mark as Paid
                                  </button>
                                )}
                                {inv.status === 'pending' && (
                                  <button
                                    onClick={() => handleMarkOverdue(inv.id, inv.invoiceNumber)}
                                    className="w-full text-left px-4 py-2 hover:bg-neutral-50 font-semibold text-amber-600"
                                  >
                                    Mark as Overdue
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDelete(inv.id, inv.invoiceNumber)}
                                  className="w-full text-left px-4 py-2 hover:bg-neutral-50 font-semibold text-red-600 flex items-center gap-1.5"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
