'use client'

import { useState } from 'react'
import { Plus, Search, Tag, Package, Sparkles } from 'lucide-react'
import { useProductStore } from '@/stores/use-product-store'
import { type DemoProduct, formatCurrency } from '@/lib/demo-data'
import { toast } from 'sonner'
import Link from 'next/link'

export default function ProductsPage() {
  const { products, addProduct } = useProductStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form State
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [sellingPrice, setSellingPrice] = useState('')
  const [costPrice, setCostPrice] = useState('')
  const [stockQuantity, setStockQuantity] = useState('')
  const [lowStockThreshold, setLowStockThreshold] = useState('10')
  const [description, setDescription] = useState('')

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !sku.trim() || !sellingPrice || !stockQuantity) {
      toast.error('Product Name, SKU, Selling Price, and Stock Quantity are required')
      return
    }

    const newProduct: DemoProduct = {
      id: `prod-${String(products.length + 1).padStart(4, '0')}`,
      name,
      sku: sku.toUpperCase(),
      sellingPrice: Number(sellingPrice),
      costPrice: Number(costPrice || 0),
      stockQuantity: Number(stockQuantity),
      lowStockThreshold: Number(lowStockThreshold || 10),
      description,
      createdAt: new Date().toISOString().split('T')[0]
    }

    addProduct(newProduct)
    toast.success(`Product "${name}" added successfully!`)
    setIsModalOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setName('')
    setSku('')
    setSellingPrice('')
    setCostPrice('')
    setStockQuantity('')
    setLowStockThreshold('10')
    setDescription('')
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-black tracking-tight">Products</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Manage your physical merchandise inventory, SKU parameters, and stock states.
          </p>
        </div>

        <button
          onClick={() => { resetForm(); setIsModalOpen(true) }}
          className="flex items-center gap-1.5 self-start sm:self-center bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* ── Search Bar ── */}
      <div className="relative glass p-4 rounded-2xl border border-neutral-200 shadow-sm">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-neutral-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products by title or SKU..."
          className="w-full pl-11 pr-4 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-black focus:glass transition-all"
        />
      </div>

      {/* ── Products Table ── */}
      {filteredProducts.length === 0 ? (
        <div className="glass rounded-3xl border border-neutral-200 p-16 text-center shadow-sm max-w-lg mx-auto mt-8">
          <Package className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-black">No products found</h3>
          <p className="text-sm text-neutral-500 mt-1">Try resetting your search query or add a new product entry.</p>
        </div>
      ) : (
        <div className="glass border border-neutral-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#f0f0f2] bg-neutral-50/50 text-[#71717a] font-semibold uppercase tracking-wider text-xs">
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4">Selling Price</th>
                  <th className="px-6 py-4">Cost Price</th>
                  <th className="px-6 py-4">Stock Level</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f2]">
                {filteredProducts.map((prod) => {
                  const isOut = prod.stockQuantity === 0
                  const isLow = prod.stockQuantity <= prod.lowStockThreshold && !isOut
                  
                  return (
                    <tr key={prod.id} className="hover:bg-neutral-50 transition-colors cursor-pointer group">
                      <td className="px-6 py-4.5 font-bold text-black">
                        <Link href={`/products/${prod.id}`} className="block group-hover:underline">
                          {prod.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4.5 text-neutral-600 font-mono text-xs uppercase">{prod.sku}</td>
                      <td className="px-6 py-4.5 font-semibold text-black">{formatCurrency(prod.sellingPrice)}</td>
                      <td className="px-6 py-4.5 text-neutral-500">{formatCurrency(prod.costPrice)}</td>
                      <td className="px-6 py-4.5 font-mono text-xs">
                        {prod.stockQuantity} <span className="text-neutral-400 font-sans">/ {prod.lowStockThreshold} threshold</span>
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
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Add Product Modal Overlay ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="glass w-full max-w-lg rounded-3xl shadow-xl border border-neutral-200 overflow-hidden flex flex-col animate-scale-in">
            {/* Header */}
            <div className="p-6 border-b border-[#f0f0f2] flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-black">Add New Product</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Define a new physical stock product inside the system.</p>
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
              <div className="grid grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Premium Business Cards (500 pcs)"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all"
                  />
                </div>

                {/* SKU */}
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">SKU Code *</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="text"
                      required
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="e.g. BC-500-PREM"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all"
                    />
                  </div>
                </div>

                {/* Initial Stock Level */}
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    placeholder="e.g. 100"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all"
                  />
                </div>

                {/* Selling Price */}
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    placeholder="₹ INR"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all"
                  />
                </div>

                {/* Cost Price */}
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Cost Price (₹)</label>
                  <input
                    type="number"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    placeholder="₹ INR"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all"
                  />
                </div>

                {/* Low Stock Threshold */}
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Low Stock Alert Threshold</label>
                  <input
                    type="number"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                    placeholder="Alert when stock drops below this..."
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Product details, sizes, specs..."
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all resize-none"
                  />
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
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
