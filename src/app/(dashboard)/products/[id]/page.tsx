'use client'

import { use, useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Tag, 
  IndianRupee, 
  ChevronRight, 
  Warehouse, 
  History, 
  Plus, 
  Clock, 
  FileText 
} from 'lucide-react'
import { useProductStore } from '@/stores/use-product-store'
import { useInvoiceStore } from '@/stores/use-invoice-store'
import { formatCurrency, formatDate } from '@/lib/demo-data'
import { toast } from 'sonner'

interface ProductDetailPageProps {
  params: Promise<{ id: string }>
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = use(params)
  const { products, stockMovements, restockProduct } = useProductStore()
  const { invoices } = useInvoiceStore()

  const [isRestockOpen, setIsRestockOpen] = useState(false)
  const [restockQty, setRestockQty] = useState('')
  const [restockNote, setRestockNote] = useState('Restocked from supplier')

  // Find product
  const product = useMemo(() => products.find(p => p.id === id), [products, id])

  // Get stock movements for this product
  const movements = useMemo(() => 
    stockMovements.filter(m => m.productId === id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [stockMovements, id]
  )

  // Calculate product metrics from paid invoices
  const metrics = useMemo(() => {
    let revenueGenerated = 0
    let timesInvoiced = 0

    invoices.forEach(inv => {
      inv.items.forEach(item => {
        if (item.type === 'product' && item.referenceId === id) {
          timesInvoiced += item.quantity
          if (inv.status === 'paid') {
            revenueGenerated += item.amount
          }
        }
      })
    })

    return {
      revenueGenerated,
      timesInvoiced
    }
  }, [invoices, id])

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!restockQty || Number(restockQty) <= 0) {
      toast.error('Please enter a valid restock quantity')
      return
    }

    restockProduct(id, Number(restockQty), restockNote)
    toast.success(`Successfully restocked ${restockQty} units!`)
    setIsRestockOpen(false)
    setRestockQty('')
    setRestockNote('Restocked from supplier')
  }

  if (!product) {
    return (
      <div className="text-center py-16 animate-fade-in max-w-md mx-auto">
        <h3 className="text-lg font-bold text-black">Product not found</h3>
        <p className="text-sm text-neutral-500 mt-1">The product ID you are looking for does not exist.</p>
        <Link 
          href="/products"
          className="mt-4 inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>
      </div>
    )
  }

  const isOut = product.stockQuantity === 0
  const isLow = product.stockQuantity <= product.lowStockThreshold && !isOut

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
        <Link href="/products" className="hover:text-black transition-colors">Products</Link>
        <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
        <span className="text-neutral-400">{product.name}</span>
      </div>

      {/* ── Product Header ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 glass p-6 rounded-3xl border border-neutral-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 border border-neutral-200 text-lg font-extrabold text-black">
            <Warehouse className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-black tracking-tight">{product.name}</h1>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                isOut 
                  ? 'bg-red-50 text-red-700' 
                  : isLow 
                    ? 'bg-amber-50 text-amber-700' 
                    : 'bg-emerald-50 text-emerald-700'
              }`}>
                {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
              </span>
            </div>
            <p className="text-sm text-neutral-500 flex items-center gap-1.5 mt-0.5">
              <Tag className="h-4 w-4 shrink-0" />
              SKU: <span className="font-mono uppercase text-xs font-bold text-black">{product.sku}</span>
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setIsRestockOpen(true)}
          className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm self-start md:self-center"
        >
          <Plus className="h-4 w-4" />
          Restock Inventory
        </button>
      </div>

      {/* ── Stat Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Current Stock */}
        <div className="glass p-6 rounded-3xl border border-neutral-200 shadow-sm card-hover">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Current Stock Level</span>
          <h3 className="text-3xl font-black text-black mt-2">{product.stockQuantity}</h3>
          <p className="text-xs text-neutral-500 mt-1">
            Low stock alert threshold is {product.lowStockThreshold} units
          </p>
        </div>

        {/* Revenue Generated */}
        <div className="glass p-6 rounded-3xl border border-neutral-200 shadow-sm card-hover">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Revenue Contribution</span>
          <h3 className="text-3xl font-black text-black mt-2 flex items-center">
            <IndianRupee className="h-6 w-6 shrink-0" />
            {metrics.revenueGenerated.toLocaleString('en-IN')}
          </h3>
          <p className="text-xs text-neutral-500 mt-1">From settled retail orders</p>
        </div>

        {/* Units Sold */}
        <div className="glass p-6 rounded-3xl border border-neutral-200 shadow-sm card-hover">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Total Units Invoiced</span>
          <h3 className="text-3xl font-black text-black mt-2">{metrics.timesInvoiced}</h3>
          <p className="text-xs text-neutral-500 mt-1">Units sold across invoices</p>
        </div>
      </div>

      {/* ── Main content layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock Movement History */}
        <div className="lg:col-span-2 glass rounded-3xl border border-neutral-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-[#f0f0f2] pb-4">
            <History className="h-5 w-5 text-neutral-400" />
            <h3 className="text-base font-bold text-black">Stock Movement History</h3>
          </div>
          
          {movements.length === 0 ? (
            <p className="text-xs text-neutral-400 italic py-6 text-center">No stock movements registered yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#f0f0f2] text-[#71717a] font-semibold uppercase tracking-wider">
                    <th className="py-2.5">Date</th>
                    <th className="py-2.5">Type</th>
                    <th className="py-2.5">Quantity</th>
                    <th className="py-2.5">Reference / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f0f2]">
                  {movements.map((move) => (
                    <tr key={move.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-3 font-mono text-neutral-500">{formatDate(move.date)}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          move.type === 'restock' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : move.type === 'sale' 
                              ? 'bg-blue-50 text-blue-700' 
                              : 'bg-neutral-100 text-neutral-700'
                        }`}>
                          {move.type}
                        </span>
                      </td>
                      <td className="py-3 font-bold text-black">
                        {move.type === 'restock' ? `+${move.quantity}` : `-${move.quantity}`}
                      </td>
                      <td className="py-3 text-neutral-500">
                        {move.invoiceId ? (
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            Invoice Reference: {move.note}
                          </span>
                        ) : (
                          move.note
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Product parameters card */}
        <div className="glass rounded-3xl border border-neutral-200 shadow-sm p-6 space-y-4.5">
          <h3 className="text-sm font-bold text-black border-b border-[#f0f0f2] pb-3">Pricing Parameters</h3>
          
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-neutral-400 font-semibold">Selling Price (₹):</span>
              <span className="font-bold text-black">{formatCurrency(product.sellingPrice)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400 font-semibold">Cost Price (₹):</span>
              <span className="font-bold text-neutral-600">{formatCurrency(product.costPrice)}</span>
            </div>
            <div className="flex justify-between items-center border-t border-[#f0f0f2] pt-3">
              <span className="text-neutral-400 font-semibold">Gross Profit Margin:</span>
              <span className="font-bold text-emerald-600">
                {product.sellingPrice > 0 
                  ? `${(((product.sellingPrice - product.costPrice) / product.sellingPrice) * 100).toFixed(1)}%`
                  : '0%'}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-[#f0f0f2] pt-3">
              <span className="text-neutral-400 font-semibold">Registered:</span>
              <span className="font-mono text-neutral-500">{formatDate(product.createdAt)}</span>
            </div>
          </div>

          <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 mt-6 text-xs text-neutral-600">
            <p className="font-bold text-black mb-1">Catalog Description</p>
            <p className="leading-relaxed">{product.description || 'No description listed in catalog.'}</p>
          </div>
        </div>
      </div>

      {/* ── Restock Modal Overlay ── */}
      {isRestockOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="glass w-full max-w-sm rounded-3xl shadow-xl border border-neutral-200 overflow-hidden flex flex-col animate-scale-in">
            {/* Header */}
            <div className="p-6 border-b border-[#f0f0f2] flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-black">Restock Item</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Increment inventory levels for this SKU.</p>
              </div>
              <button
                onClick={() => setIsRestockOpen(false)}
                className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-neutral-100 text-neutral-400 hover:text-black transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleRestockSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Restock Quantity *</label>
                <input
                  type="number"
                  required
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Restock Note / Log</label>
                <input
                  type="text"
                  value={restockNote}
                  onChange={(e) => setRestockNote(e.target.value)}
                  placeholder="e.g. Restocked from supplier"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all"
                />
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-[#f0f0f2] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRestockOpen(false)}
                  className="px-4 py-2 text-sm font-semibold border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm"
                >
                  Confirm Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
