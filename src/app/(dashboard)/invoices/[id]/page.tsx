'use client'

import { use, useMemo } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  ChevronRight, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Printer, 
  IndianRupee,
  Building,
  User,
  Calendar
} from 'lucide-react'
import { useInvoiceStore } from '@/stores/use-invoice-store'
import { useClientStore } from '@/stores/use-client-store'
import { formatCurrency, formatDate } from '@/lib/demo-data'
import { toast } from 'sonner'

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>
}

export default function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const { id } = use(params)
  const { invoices, config, markAsPaid, markAsOverdue } = useInvoiceStore()
  const { clients } = useClientStore()

  // Find invoice
  const invoice = useMemo(() => invoices.find(inv => inv.id === id), [invoices, id])

  // Find client
  const client = useMemo(() => {
    if (!invoice) return null
    return clients.find(c => c.id === invoice.clientId)
  }, [clients, invoice])

  const handleMarkPaid = () => {
    if (!invoice) return
    markAsPaid(invoice.id)
    toast.success(`Invoice ${invoice.invoiceNumber} marked as Paid`)
  }

  const handleMarkOverdue = () => {
    if (!invoice) return
    markAsOverdue(invoice.id)
    toast.success(`Invoice ${invoice.invoiceNumber} marked as Overdue`)
  }

  const handlePrint = () => {
    window.print()
  }

  if (!invoice) {
    return (
      <div className="text-center py-16 animate-fade-in max-w-md mx-auto">
        <h3 className="text-lg font-bold text-black">Invoice not found</h3>
        <p className="text-sm text-neutral-500 mt-1">The invoice ID you are looking for does not exist.</p>
        <Link 
          href="/invoices"
          className="mt-4 inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Invoices
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12 print:p-0 print:glass print:m-0">
      {/* ── Breadcrumb & Actions (Hidden on print) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          <Link href="/invoices" className="hover:text-black transition-colors">Invoices</Link>
          <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
          <span className="text-neutral-400">{invoice.invoiceNumber}</span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 border border-neutral-200 hover:border-neutral-400 glass text-neutral-700 hover:text-black px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Printer className="h-4 w-4" />
            Print / PDF
          </button>
          
          {invoice.status !== 'paid' && (
            <button
              onClick={handleMarkPaid}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <CheckCircle className="h-4 w-4" />
              Mark as Paid
            </button>
          )}

          {invoice.status === 'pending' && (
            <button
              onClick={handleMarkOverdue}
              className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <AlertTriangle className="h-4 w-4" />
              Mark as Overdue
            </button>
          )}
        </div>
      </div>

      {/* ── Invoice Container (Print-optimized layout) ── */}
      <div className="glass border border-neutral-200 rounded-3xl p-6 sm:p-12 shadow-sm space-y-8 max-w-4xl mx-auto print:border-none print:shadow-none print:p-0">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-neutral-100 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black text-black tracking-tight font-sans">
                {config.companyName || 'SRK Enterprise Pvt. Ltd.'}
              </span>
            </div>
            <p className="text-xs text-neutral-400 max-w-xs leading-relaxed">
              {config.businessAddress || '42 MG Road, Bengaluru, Karnataka 560001'}
            </p>
            {config.gstNumber ? (
              <p className="text-[10px] font-mono text-neutral-500">
                GSTIN: <span className="font-semibold">{config.gstNumber}</span>
              </p>
            ) : null}
          </div>

          <div className="text-left sm:text-right space-y-1">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider mb-2 print:border ${
              invoice.status === 'paid' ? 'status-paid' : invoice.status === 'pending' ? 'status-pending' : 'status-overdue'
            }`}>
              {invoice.status}
            </span>
            <h2 className="text-2xl font-mono font-bold text-black tracking-tight">
              {invoice.invoiceNumber}
            </h2>
            <div className="text-xs text-neutral-400 space-y-0.5">
              <p>Issue Date: {formatDate(invoice.invoiceDate)}</p>
              <p className="font-semibold text-black">Due Date: {formatDate(invoice.dueDate)}</p>
              {invoice.paidDate && (
                <p className="text-emerald-600 font-bold">Settled Date: {formatDate(invoice.paidDate)}</p>
              )}
            </div>
          </div>
        </div>

        {/* Addresses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-neutral-100 pb-8">
          <div className="text-xs space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Billed To:</span>
            <p className="font-extrabold text-black text-sm">{client?.name || 'Unknown Client'}</p>
            {client?.companyName && <p className="font-semibold text-neutral-600">{client.companyName}</p>}
            <p className="text-neutral-500 max-w-xs leading-relaxed">{client?.address || 'No billing address registered.'}</p>
            {client?.gstNumber && (
              <p className="text-[10px] font-mono text-neutral-400 mt-2">
                GSTIN: <span className="font-semibold">{client.gstNumber}</span>
              </p>
            )}
          </div>

          <div className="text-xs sm:text-right space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Payment terms:</span>
            <p className="font-semibold text-black">Net 15 Days</p>
            <p className="text-neutral-500">Billing Type: <span className="capitalize">{invoice.type}</span></p>
            {client?.email && <p className="text-neutral-500 mt-2">Contact: {client.email}</p>}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-400 font-semibold uppercase tracking-wider">
                <th className="py-3">Item Description</th>
                <th className="py-3 text-center">Qty</th>
                <th className="py-3 text-right">Rate</th>
                <th className="py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-4.5">
                    <p className="font-bold text-black text-sm">{item.name}</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5 capitalize">
                      Category: {item.type}
                    </p>
                  </td>
                  <td className="py-4.5 text-center font-semibold text-black">{item.quantity}</td>
                  <td className="py-4.5 text-right text-neutral-500">{formatCurrency(item.rate)}</td>
                  <td className="py-4.5 text-right font-bold text-black">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Ledger Breakdown Calculations */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t border-neutral-200 pt-8">
          {/* Notes footnote */}
          <div className="max-w-md text-xs text-neutral-500 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Ledger Footnotes</span>
            <p className="leading-relaxed bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
              {invoice.notes || 'Default Terms: Thank you for your business! Please settle outstanding balances within 15 days of issue date.'}
            </p>
          </div>

          {/* Math calculation totals */}
          <div className="w-full sm:w-64 space-y-2 text-xs">
            <div className="flex justify-between text-neutral-500">
              <span>Subtotal:</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-neutral-500">
              <span>GST ({invoice.taxRate}%):</span>
              <span>{formatCurrency(invoice.taxAmount)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-red-500 font-semibold">
                <span>Discount / Settlement:</span>
                <span>-{formatCurrency(invoice.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-black font-black text-sm border-t border-neutral-200 pt-3 flex-row items-center">
              <span>Total Amount (₹):</span>
              <span className="text-base flex items-center font-black">
                <IndianRupee className="h-4.5 w-4.5 shrink-0" />
                {invoice.total.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Footer print note */}
        <p className="hidden print:block text-center text-[10px] text-neutral-400 pt-16 border-t border-neutral-100">
          Generated automatically by OneSpace AI. Billed using standard corporate terms.
        </p>

      </div>
    </div>
  )
}
