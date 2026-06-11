'use client'

import { useState, useMemo } from 'react'
import { Warehouse, AlertTriangle, CheckCircle, Package, ArrowUpRight, Plus } from 'lucide-react'
import { useProductStore } from '@/stores/use-product-store'
import { type DemoProduct, formatCurrency, formatDate } from '@/lib/demo-data'
import { toast } from 'sonner'

export default function InventoryPage() {
  const { products, stockMovements, restockProduct } = useProductStore()

  const [selectedProduct, setSelectedProduct] = useState<DemoProduct | null>(null)
  const [restockQty, setRestockQty] = useState('50')
  const [restockNote, setRestockNote] = useState('Supplier restock')

  // Summaries
  const totalProducts = products.length
  const totalAvailableStock = products.reduce((sum, p) => sum + p.stockQuantity, 0)
  
  const lowStockProducts = useMemo(() => 
    products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold),
    [products]
  )

  const outOfStockProducts = useMemo(() => 
    products.filter(p => p.stockQuantity === 0),
    [products]
  )

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct) return

    if (!restockQty || Number(restockQty) <= 0) {
      toast.error('Please enter a valid quantity')
      return
    }

    restockProduct(selectedProduct.id, Number(restockQty), restockNote)
    toast.success(`Restocked ${restockQty} units of ${selectedProduct.name}`)
    setSelectedProduct(null)
    setRestockQty('50')
    setRestockNote('Supplier restock')
  }

  // Get last movement for a product
  const getLastMovement = (productId: string) => {
    const moves = stockMovements.filter(m => m.productId === productId)
    if (moves.length === 0) return 'No history'
    const latest = moves.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    return `${latest.type === 'restock' ? 'Restocked' : 'Sold'} ${latest.quantity} units on ${formatDate(latest.date)}`
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-2xl font-extrabold text-black tracking-tight font-sans">Inventory Dashboard</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Monitor real-time warehouse stock levels, alert thresholds, and logs.
        </p>
      </div>

      {/* ── Summary Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Total Products */}
        <div className="glass p-6 rounded-3xl border border-neutral-200 shadow-sm flex items-center gap-4 card-hover">
          <div className="p-3 bg-neutral-50 border border-neutral-100 rounded-2xl text-black">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Total Products</span>
            <h3 className="text-2xl font-black text-black mt-0.5">{totalProducts}</h3>
          </div>
        </div>

        {/* Total Stock */}
        <div className="glass p-6 rounded-3xl border border-neutral-200 shadow-sm flex items-center gap-4 card-hover">
          <div className="p-3 bg-neutral-50 border border-neutral-100 rounded-2xl text-black">
            <Warehouse className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Warehouse Stock</span>
            <h3 className="text-2xl font-black text-black mt-0.5">{totalAvailableStock} <span className="text-xs text-neutral-400 font-normal">units</span></h3>
          </div>
        </div>

        {/* Low Stock count */}
        <div className="glass p-6 rounded-3xl border border-neutral-200 shadow-sm flex items-center gap-4 card-hover">
          <div className={`p-3 rounded-2xl border ${lowStockProducts.length > 0 ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-neutral-50 border-neutral-100 text-neutral-400'}`}>
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Low Stock Alert</span>
            <h3 className="text-2xl font-black text-black mt-0.5">{lowStockProducts.length} <span className="text-xs text-neutral-400 font-normal">SKUs</span></h3>
          </div>
        </div>

        {/* Out of Stock count */}
        <div className="glass p-6 rounded-3xl border border-neutral-200 shadow-sm flex items-center gap-4 card-hover">
          <div className={`p-3 rounded-2xl border ${outOfStockProducts.length > 0 ? 'bg-red-50 border-red-100 text-red-600' : 'bg-neutral-50 border-neutral-100 text-neutral-400'}`}>
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Out of Stock</span>
            <h3 className="text-2xl font-black text-black mt-0.5">{outOfStockProducts.length} <span className="text-xs text-neutral-400 font-normal">SKUs</span></h3>
          </div>
        </div>
      </div>

      {/* ── Low Stock Alert Cards Panel ── */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="glass p-6 rounded-3xl border border-red-200/50 bg-red-50/5 shadow-sm space-y-4 animate-slide-in">
          <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
            <AlertTriangle className="h-4.5 w-4.5" />
            <span>Critical Restock Alerts</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {outOfStockProducts.map(p => (
              <div key={p.id} className="glass p-4 rounded-2xl border border-red-200 flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-black truncate max-w-[150px]">{p.name}</h4>
                  <p className="text-[10px] text-red-600 font-bold uppercase mt-0.5">Out of Stock (0 units)</p>
                </div>
                <button
                  onClick={() => setSelectedProduct(p)}
                  className="bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold uppercase px-3 py-1.5 rounded-lg transition-all"
                >
                  Restock
                </button>
              </div>
            ))}
            {lowStockProducts.map(p => (
              <div key={p.id} className="glass p-4 rounded-2xl border border-amber-200 flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-black truncate max-w-[150px]">{p.name}</h4>
                  <p className="text-[10px] text-amber-600 font-bold uppercase mt-0.5">Low Stock ({p.stockQuantity} units left)</p>
                </div>
                <button
                  onClick={() => setSelectedProduct(p)}
                  className="bg-primary hover:bg-primary/90 text-white text-[11px] font-bold uppercase px-3 py-1.5 rounded-lg transition-all"
                >
                  Restock
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Full Inventory list ── */}
      <div className="glass border border-neutral-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[#f0f0f2]">
          <h3 className="text-base font-bold text-black">Full Warehouse Inventory</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#f0f0f2] bg-neutral-50/50 text-[#71717a] font-semibold uppercase tracking-wider text-xs">
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Current Stock</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Transaction / Movement</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0f2]">
              {products.map((prod) => {
                const isOut = prod.stockQuantity === 0
                const isLow = prod.stockQuantity <= prod.lowStockThreshold && !isOut
                
                return (
                  <tr key={prod.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4.5 font-bold text-black">{prod.name}</td>
                    <td className="px-6 py-4.5 text-neutral-500 font-mono text-xs uppercase">{prod.sku}</td>
                    <td className="px-6 py-4.5 font-mono text-xs font-semibold text-black">
                      {prod.stockQuantity} <span className="text-neutral-400 font-sans font-normal">/ {prod.lowStockThreshold} threshold</span>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isOut 
                          ? 'bg-red-50 text-red-700' 
                          : isLow 
                            ? 'bg-amber-50 text-amber-700' 
                            : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-xs text-neutral-500">{getLastMovement(prod.id)}</td>
                    <td className="px-6 py-4.5 text-right">
                      <button
                        onClick={() => setSelectedProduct(prod)}
                        className="inline-flex items-center gap-1 bg-primary hover:bg-primary/90 text-white text-[11px] font-bold uppercase px-3 py-1.5 rounded-lg transition-all"
                      >
                        <Plus className="h-3 w-3" /> Quick Restock
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Quick Restock Dialog overlay ── */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="glass w-full max-w-sm rounded-3xl shadow-xl border border-neutral-200 overflow-hidden flex flex-col animate-scale-in">
            {/* Header */}
            <div className="p-6 border-b border-[#f0f0f2] flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-black">Quick Restock</h3>
                <p className="text-xs text-neutral-500 mt-0.5">{selectedProduct.name}</p>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-neutral-100 text-neutral-400 hover:text-black transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleRestockSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Restock Units *</label>
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
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Stock log notes</label>
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
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 text-sm font-semibold border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm"
                >
                  Log Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
