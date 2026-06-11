'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  Search, 
  ChevronRight, 
  ChevronLeft, 
  Briefcase, 
  Package, 
  Layers, 
  CheckCircle,
  FileText, 
  Percent, 
  Eye, 
  ArrowRight,
  IndianRupee,
  Building,
  User,
  Calculator
} from 'lucide-react'
import { useClientStore } from '@/stores/use-client-store'
import { useProductStore } from '@/stores/use-product-store'
import { useServiceStore } from '@/stores/use-service-store'
import { useInvoiceStore } from '@/stores/use-invoice-store'
import { type InvoiceType, type DemoInvoiceItem, formatCurrency } from '@/lib/demo-data'
import { toast } from 'sonner'

export default function CreateInvoicePage() {
  const router = useRouter()
  const { clients } = useClientStore()
  const { products, reduceStock } = useProductStore()
  const { services } = useServiceStore()
  const { addInvoice, config } = useInvoiceStore()

  const [step, setStep] = useState(1)

  // Step 1: Select Client
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [clientSearchQuery, setClientSearchQuery] = useState('')

  // Step 2: Select Invoice Type
  const [invoiceType, setInvoiceType] = useState<InvoiceType>('mixed')

  // Step 3: Select Items
  // Keep track of selected product IDs and service IDs separately
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const [itemSearchQuery, setItemSearchQuery] = useState('')

  // Step 4: Quantities
  // Map of itemId -> quantity
  const [itemQuantities, setItemQuantities] = useState<{ [key: string]: number }>({})

  // Step 5: Tax & Discount
  const [gstRate, setGstRate] = useState<number>(config.defaultTaxRate || 18)
  const [discountAmount, setDiscountAmount] = useState<number>(0)
  const [invoiceNotes, setInvoiceNotes] = useState('')

  // Selected client computed object
  const selectedClient = useMemo(() => 
    clients.find(c => c.id === selectedClientId),
    [clients, selectedClientId]
  )

  // Filter clients
  const filteredClients = useMemo(() => 
    clients.filter(c => c.name.toLowerCase().includes(clientSearchQuery.toLowerCase())),
    [clients, clientSearchQuery]
  )

  // Selected items detail list
  const selectedItemsDetails = useMemo(() => {
    const list: DemoInvoiceItem[] = []
    
    // Process products
    selectedProductIds.forEach(id => {
      const prod = products.find(p => p.id === id)
      if (prod) {
        const qty = itemQuantities[id] || 1
        list.push({
          id: `ii-p-${id}`,
          type: 'product',
          referenceId: id,
          name: prod.name,
          quantity: qty,
          rate: prod.sellingPrice,
          amount: prod.sellingPrice * qty
        })
      }
    })

    // Process services
    selectedServiceIds.forEach(id => {
      const svc = services.find(s => s.id === id)
      if (svc) {
        const qty = itemQuantities[id] || 1
        list.push({
          id: `ii-s-${id}`,
          type: 'service',
          referenceId: id,
          name: svc.name,
          quantity: qty,
          rate: svc.price,
          amount: svc.price * qty
        })
      }
    })

    return list
  }, [selectedProductIds, selectedServiceIds, itemQuantities, products, services])

  // Subtotal calculation
  const subtotal = useMemo(() => 
    selectedItemsDetails.reduce((sum, item) => sum + item.amount, 0),
    [selectedItemsDetails]
  )

  // Tax and Total Calculations
  const taxAmount = useMemo(() => Math.round(subtotal * (gstRate / 100)), [subtotal, gstRate])
  const total = useMemo(() => Math.max(0, subtotal + taxAmount - discountAmount), [subtotal, taxAmount, discountAmount])

  // Navigation handlers
  const handleNext = () => {
    if (step === 1 && !selectedClientId) {
      toast.error('Please select a client first')
      return
    }
    
    if (step === 3 && selectedProductIds.length === 0 && selectedServiceIds.length === 0) {
      toast.error('Please select at least one product or service')
      return
    }

    if (step === 4) {
      // Validate product quantities against stock
      for (const item of selectedItemsDetails) {
        if (item.type === 'product') {
          const prod = products.find(p => p.id === item.referenceId)
          if (prod && item.quantity > prod.stockQuantity) {
            toast.error(`Quantity for ${prod.name} exceeds available stock (${prod.stockQuantity})`)
            return
          }
        }
      }
    }

    setStep(step + 1)
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  // Generate action
  const handleGenerateInvoice = () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0]
      const due = new Date()
      due.setDate(due.getDate() + 15) // default 15 days due date
      const dueStr = due.toISOString().split('T')[0]

      const newInvoiceData = {
        id: `inv-${Date.now()}`,
        clientId: selectedClientId!,
        type: invoiceType,
        items: selectedItemsDetails,
        subtotal,
        taxRate: gstRate,
        taxAmount,
        discount: discountAmount,
        total,
        status: 'pending' as const,
        invoiceDate: todayStr,
        dueDate: dueStr,
        paidDate: null,
        projectId: null,
        notes: invoiceNotes || 'Thank you for your business!',
        createdAt: todayStr
      }

      // Add invoice in invoiceStore
      const createdInvoice = addInvoice(newInvoiceData)

      // Reduce product stock quantities (CRITICAL BUSINESS RULE)
      selectedItemsDetails.forEach(item => {
        if (item.type === 'product') {
          reduceStock(item.referenceId, item.quantity, createdInvoice.id)
        }
      })

      toast.success(`Invoice ${createdInvoice.invoiceNumber} created successfully!`)
      router.push(`/invoices/${createdInvoice.id}`)
    } catch (err) {
      toast.error('Failed to generate invoice')
    }
  }

  // Select Item togglers
  const handleToggleProduct = (id: string) => {
    if (selectedProductIds.includes(id)) {
      setSelectedProductIds(selectedProductIds.filter(pid => pid !== id))
    } else {
      setSelectedProductIds([...selectedProductIds, id])
      setItemQuantities(prev => ({ ...prev, [id]: 1 }))
    }
  }

  const handleToggleService = (id: string) => {
    if (selectedServiceIds.includes(id)) {
      setSelectedServiceIds(selectedServiceIds.filter(sid => sid !== id))
    } else {
      setSelectedServiceIds([...selectedServiceIds, id])
      setItemQuantities(prev => ({ ...prev, [id]: 1 }))
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* ── Header ── */}
      <div className="flex justify-between items-center pb-6 border-b border-[#e4e4e7]">
        <div>
          <h1 className="text-2xl font-extrabold text-black tracking-tight">Create Invoice Wizard</h1>
          <p className="text-xs text-neutral-500 mt-1">Generate a professional, itemized invoice for client billing.</p>
        </div>
        <div className="text-xs text-neutral-500 font-bold uppercase bg-neutral-100 px-3 py-1.5 rounded-xl border border-neutral-200">
          Step {step} of 7
        </div>
      </div>

      {/* ── Progress Indicators ── */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5, 6, 7].map((num) => (
          <div key={num} className={`h-1.5 flex-1 rounded-full ${step >= num ? 'bg-primary' : 'bg-neutral-200'}`} />
        ))}
      </div>

      {/* ── Wizard Steps ── */}
      <div className="glass border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        
        {/* Step 1: Select Client */}
        {step === 1 && (
          <div className="space-y-6 animate-slide-in">
            <div>
              <h2 className="text-xl font-bold text-black">Select Client</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Which customer is this invoice being issued to?</p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                value={clientSearchQuery}
                onChange={(e) => setClientSearchQuery(e.target.value)}
                placeholder="Type client name to filter..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all"
              />
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {filteredClients.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedClientId(c.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                    selectedClientId === c.id 
                      ? 'border-black bg-neutral-50 ring-1 ring-black' 
                      : 'border-neutral-100 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-xs font-bold text-black">
                      {c.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-black">{c.name}</h4>
                      <p className="text-[10px] text-neutral-400">{c.companyName || 'Individual'}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono">{c.phone}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select Invoice Type */}
        {step === 2 && (
          <div className="space-y-6 animate-slide-in">
            <div>
              <h2 className="text-xl font-bold text-black">Invoice Billing Type</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Define what catalog item categories you are billing for.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setInvoiceType('products')}
                className={`p-6 rounded-2xl border text-left flex flex-col justify-between h-40 transition-all ${
                  invoiceType === 'products' ? 'border-black bg-neutral-50 ring-1 ring-black' : 'border-neutral-200 hover:border-neutral-400'
                }`}
              >
                <Package className="h-6 w-6 text-black" />
                <div>
                  <h4 className="font-bold text-black text-xs">Products Only</h4>
                  <p className="text-[10px] text-neutral-400 mt-1">Issue invoice for physical inventory items with stock reductions.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setInvoiceType('services')}
                className={`p-6 rounded-2xl border text-left flex flex-col justify-between h-40 transition-all ${
                  invoiceType === 'services' ? 'border-black bg-neutral-50 ring-1 ring-black' : 'border-neutral-200 hover:border-neutral-400'
                }`}
              >
                <Briefcase className="h-6 w-6 text-black" />
                <div>
                  <h4 className="font-bold text-black text-xs">Services Only</h4>
                  <p className="text-[10px] text-neutral-400 mt-1">Issue invoice for client consulting, retainers, and work hours.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setInvoiceType('mixed')}
                className={`p-6 rounded-2xl border text-left flex flex-col justify-between h-40 transition-all ${
                  invoiceType === 'mixed' ? 'border-black bg-neutral-50 ring-1 ring-black' : 'border-neutral-200 hover:border-neutral-400'
                }`}
              >
                <Layers className="h-6 w-6 text-black" />
                <div>
                  <h4 className="font-bold text-black text-xs">Mixed / Hybrid</h4>
                  <p className="text-[10px] text-neutral-400 mt-1">Issue invoice for both services and physical items.</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Select Items */}
        {step === 3 && (
          <div className="space-y-6 animate-slide-in">
            <div>
              <h2 className="text-xl font-bold text-black">Select Items</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Toggle checkboxes to add catalog elements to this billing invoice.</p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                value={itemSearchQuery}
                onChange={(e) => setItemSearchQuery(e.target.value)}
                placeholder="Search catalog items by name..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all"
              />
            </div>

            <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2">
              {/* Product catalog list */}
              {(invoiceType === 'products' || invoiceType === 'mixed') && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1 flex items-center gap-1">
                    <Package className="h-3.5 w-3.5" /> Products
                  </h4>
                  {products
                    .filter(p => p.name.toLowerCase().includes(itemSearchQuery.toLowerCase()))
                    .map(p => (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => handleToggleProduct(p.id)}
                        className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                          selectedProductIds.includes(p.id) 
                            ? 'border-black bg-neutral-50 ring-1 ring-black' 
                            : 'border-neutral-100 hover:border-neutral-200'
                        }`}
                      >
                        <div>
                          <h5 className="text-xs font-bold text-black">{p.name}</h5>
                          <span className="text-[10px] text-neutral-400 font-mono">SKU: {p.sku} • Stock: {p.stockQuantity} available</span>
                        </div>
                        <span className="text-xs font-bold text-black">{formatCurrency(p.sellingPrice)}</span>
                      </button>
                    ))}
                </div>
              )}

              {/* Service catalog list */}
              {(invoiceType === 'services' || invoiceType === 'mixed') && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1 flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" /> Services
                  </h4>
                  {services
                    .filter(s => s.name.toLowerCase().includes(itemSearchQuery.toLowerCase()))
                    .map(s => (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => handleToggleService(s.id)}
                        className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                          selectedServiceIds.includes(s.id) 
                            ? 'border-black bg-neutral-50 ring-1 ring-black' 
                            : 'border-neutral-100 hover:border-neutral-200'
                        }`}
                      >
                        <div>
                          <h5 className="text-xs font-bold text-black">{s.name}</h5>
                          <span className="text-[10px] text-neutral-400 font-mono">Category: {s.category} • Est. Duration: {s.estimatedDuration}</span>
                        </div>
                        <span className="text-xs font-bold text-black">{formatCurrency(s.price)}</span>
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Quantities */}
        {step === 4 && (
          <div className="space-y-6 animate-slide-in">
            <div>
              <h2 className="text-xl font-bold text-black">Quantities & Stock Allocation</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Determine invoicing counts. Available stocks are verified.</p>
            </div>

            <div className="space-y-3">
              {selectedItemsDetails.map((item) => {
                const prodRef = item.type === 'product' ? products.find(p => p.id === item.referenceId) : null
                
                return (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border border-neutral-100 bg-neutral-50/50">
                    <div className="max-w-[50%]">
                      <h4 className="text-xs font-bold text-black truncate">{item.name}</h4>
                      <span className="text-[10px] text-neutral-400 capitalize">
                        {item.type} • rate {formatCurrency(item.rate)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      {prodRef && (
                        <span className="text-[10px] text-amber-600 font-bold uppercase">
                          Max stock: {prodRef.stockQuantity}
                        </span>
                      )}
                      <input
                        type="number"
                        min="1"
                        max={prodRef ? prodRef.stockQuantity : undefined}
                        value={item.quantity}
                        onChange={(e) => {
                          const val = Math.max(1, Number(e.target.value))
                          setItemQuantities(prev => ({ ...prev, [item.referenceId]: val }))
                        }}
                        className="w-16 px-2 py-1.5 text-center text-xs font-bold rounded-lg border border-neutral-200 glass"
                      />
                      <span className="text-xs font-bold text-black min-w-[70px] text-right">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 5: Taxes & Discounts */}
        {step === 5 && (
          <div className="space-y-6 animate-slide-in">
            <div>
              <h2 className="text-xl font-bold text-black">Taxes & Discounts</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Configure tax and ledger values (GST rates apply in INR).</p>
            </div>

            <div className="space-y-4 max-w-md">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">GST Tax Rate (%)</label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="number"
                      value={gstRate}
                      onChange={(e) => setGstRate(Number(e.target.value))}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Discount Amount (₹)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="number"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(Number(e.target.value))}
                      placeholder="₹ INR"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Invoice Note / Footnote</label>
                <textarea
                  value={invoiceNotes}
                  onChange={(e) => setInvoiceNotes(e.target.value)}
                  placeholder="e.g. Please settle within terms, bank account details..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Full Professional Preview */}
        {step === 6 && (
          <div className="space-y-6 animate-slide-in">
            <div>
              <h2 className="text-xl font-bold text-black">Invoice Preview</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Please check all details before finalizing receipt creation.</p>
            </div>

            {/* Professional Invoice Template */}
            <div className="border border-neutral-200 rounded-2xl p-6 sm:p-8 glass shadow-xs space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-neutral-100 pb-6">
                <div>
                  <h3 className="text-lg font-black text-black">{config.companyName || 'SRK Enterprise Pvt. Ltd.'}</h3>
                  <p className="text-xs text-neutral-400 max-w-[200px] leading-relaxed mt-1">{config.businessAddress}</p>
                  {config.gstNumber && <p className="text-[10px] font-mono text-neutral-500 mt-1">GSTIN: {config.gstNumber}</p>}
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-neutral-400 font-bold uppercase text-[10px]">Preview Invoice</span>
                  <h4 className="text-xl font-mono font-bold text-black mt-1">{config.invoicePrefix || 'INV'}-XXXX</h4>
                  <p className="text-xs text-neutral-500 mt-0.5">Issue Date: {new Date().toISOString().split('T')[0]}</p>
                </div>
              </div>

              {/* Client Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-neutral-100 pb-6">
                <div className="text-xs">
                  <span className="text-neutral-400 font-bold uppercase text-[9px] block mb-1">Billed To:</span>
                  <p className="font-bold text-black">{selectedClient?.name}</p>
                  <p className="text-neutral-500 mt-0.5">{selectedClient?.companyName}</p>
                  <p className="text-neutral-400 mt-0.5">{selectedClient?.address}</p>
                  {selectedClient?.gstNumber && <p className="text-[10px] font-mono text-neutral-400 mt-1">GSTIN: {selectedClient.gstNumber}</p>}
                </div>
                <div className="text-xs sm:text-right">
                  <span className="text-neutral-400 font-bold uppercase text-[9px] block mb-1">Payment parameters:</span>
                  <p className="font-semibold text-black">Due in 15 days</p>
                  <p className="text-neutral-500 mt-0.5">Type: <span className="capitalize">{invoiceType}</span></p>
                </div>
              </div>

              {/* Itemized Table */}
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-400 font-semibold uppercase tracking-wider">
                    <th className="py-2.5">Item Name</th>
                    <th className="py-2.5 text-center">Qty</th>
                    <th className="py-2.5 text-right">Rate</th>
                    <th className="py-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {selectedItemsDetails.map(item => (
                    <tr key={item.id}>
                      <td className="py-3 font-semibold text-black">{item.name}</td>
                      <td className="py-3 text-center">{item.quantity}</td>
                      <td className="py-3 text-right">{formatCurrency(item.rate)}</td>
                      <td className="py-3 text-right font-semibold text-black">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals Summary */}
              <div className="flex justify-end border-t border-neutral-200 pt-6">
                <div className="w-64 space-y-2 text-xs">
                  <div className="flex justify-between text-neutral-500">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-500">
                    <span>GST ({gstRate}%):</span>
                    <span>{formatCurrency(taxAmount)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-red-500 font-semibold">
                      <span>Discount:</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-black font-black text-sm border-t border-neutral-100 pt-2">
                    <span>Grand Total:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 7: Generate Final Action */}
        {step === 7 && (
          <div className="space-y-6 text-center py-8 animate-scale-in">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 border border-neutral-200 mx-auto mb-4 text-black">
              <Calculator className="h-8 w-8" />
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-black">Confirm Ledger Generation</h2>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-2 leading-relaxed">
                You are about to generate a pending invoice for <span className="font-semibold text-black">{selectedClient?.name}</span> for a total of <span className="font-bold text-black">{formatCurrency(total)}</span>.
              </p>
              {invoiceType !== 'services' && (
                <p className="text-[11px] text-amber-600 font-bold uppercase mt-2">
                  ⚠️ This action will automatically subtract item quantities from warehouse stock levels!
                </p>
              )}
            </div>

            <div className="pt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-2.5 text-xs font-bold border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
              >
                Back to Preview
              </button>
              <button
                type="button"
                onClick={handleGenerateInvoice}
                className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl text-xs font-extrabold transition-all shadow-sm flex items-center gap-1.5"
              >
                Generate Invoice
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Footer Navigation (if not final submit step) */}
        {step < 7 && (
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-neutral-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-neutral-600 hover:text-black font-semibold transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous Step
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
