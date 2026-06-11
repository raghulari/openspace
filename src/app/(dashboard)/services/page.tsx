'use client'

import { useState } from 'react'
import { Plus, Search, Briefcase, Clock, Tag, Sparkles } from 'lucide-react'
import { useServiceStore } from '@/stores/use-service-store'
import { type DemoService, formatCurrency } from '@/lib/demo-data'
import { toast } from 'sonner'
import Link from 'next/link'

export default function ServicesPage() {
  const { services, addService } = useServiceStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form State
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [estimatedDuration, setEstimatedDuration] = useState('1 week')
  const [category, setCategory] = useState('Design')

  const categories = ['Design', 'Development', 'Marketing', 'Consulting', 'Media', 'Other']

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !price || !estimatedDuration) {
      toast.error('Service Name, Price, and Estimated Duration are required')
      return
    }

    const newService: DemoService = {
      id: `svc-${String(services.length + 1).padStart(4, '0')}`,
      name,
      price: Number(price),
      description,
      estimatedDuration,
      category,
      createdAt: new Date().toISOString().split('T')[0]
    }

    addService(newService)
    toast.success(`Service "${name}" added successfully!`)
    setIsModalOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setName('')
    setPrice('')
    setDescription('')
    setEstimatedDuration('1 week')
    setCategory('Design')
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-black tracking-tight">Services</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Manage your service catalogs, pricing rates, contract durations, and departments.
          </p>
        </div>

        <button
          onClick={() => { resetForm(); setIsModalOpen(true) }}
          className="flex items-center gap-1.5 self-start sm:self-center bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Service
        </button>
      </div>

      {/* ── Search Bar ── */}
      <div className="relative glass p-4 rounded-2xl border border-neutral-200 shadow-sm">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-neutral-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search services by title, category..."
          className="w-full pl-11 pr-4 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-black focus:glass transition-all"
        />
      </div>

      {/* ── Services Grid ── */}
      {filteredServices.length === 0 ? (
        <div className="glass rounded-3xl border border-neutral-200 p-16 text-center shadow-sm max-w-lg mx-auto mt-8">
          <Briefcase className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-black">No services found</h3>
          <p className="text-sm text-neutral-500 mt-1">Try resetting your search query or add a new service contract catalog.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredServices.map((svc) => (
            <div key={svc.id} className="glass rounded-3xl border border-neutral-200 p-6 flex flex-col justify-between card-hover shadow-sm group">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 bg-neutral-50 border border-neutral-100 px-2.5 py-0.5 rounded-full">
                    {svc.category}
                  </span>
                  <span className="text-sm font-bold text-[#09090b]">
                    {formatCurrency(svc.price)}
                  </span>
                </div>

                <h3 className="font-extrabold text-black text-base group-hover:underline mb-2">
                  <Link href={`/services/${svc.id}`}>{svc.name}</Link>
                </h3>
                
                <p className="text-xs text-neutral-500 leading-relaxed line-clamp-3 mb-6">
                  {svc.description || 'No description listed in catalog.'}
                </p>
              </div>

              <div className="border-t border-[#f0f0f2] pt-4 flex items-center justify-between text-xs text-neutral-400 font-semibold uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-neutral-400" />
                  {svc.estimatedDuration}
                </span>
                <Link 
                  href={`/services/${svc.id}`}
                  className="text-[11px] text-neutral-500 hover:text-black font-bold uppercase"
                >
                  Configure Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add Service Modal Overlay ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="glass w-full max-w-lg rounded-3xl shadow-xl border border-neutral-200 overflow-hidden flex flex-col animate-scale-in">
            {/* Header */}
            <div className="p-6 border-b border-[#f0f0f2] flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-black">Define Service Contract</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Register a new client service offering inside the system.</p>
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
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Service Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Website Development, UI/UX Design"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Price Rate (₹) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="₹ INR"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all"
                  />
                </div>

                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Est. Duration *</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="text"
                      required
                      value={estimatedDuration}
                      onChange={(e) => setEstimatedDuration(e.target.value)}
                      placeholder="e.g. 4 weeks, 2 hours"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Category</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm glass outline-none focus:border-black transition-all"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail service steps, scope of work, deliverables..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all resize-none"
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
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
