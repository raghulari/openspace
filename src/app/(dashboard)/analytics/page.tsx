'use client'

import { useState, useMemo } from 'react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts'
import { useInvoiceStore } from '@/stores/use-invoice-store'
import { useClientStore } from '@/stores/use-client-store'
import { useProjectStore } from '@/stores/use-project-store'
import { useProductStore } from '@/stores/use-product-store'
import { useServiceStore } from '@/stores/use-service-store'
import { formatCurrency } from '@/lib/demo-data'
import { DollarSign, Users, FileText, FolderKanban, Warehouse } from 'lucide-react'

export default function AnalyticsPage() {
  const { invoices, getPaidTotal, getPendingTotal, getOverdueTotal } = useInvoiceStore()
  const { clients } = useClientStore()
  const { projects } = useProjectStore()
  const { products } = useProductStore()
  const { services } = useServiceStore()

  const [activeSection, setActiveSection] = useState<'revenue' | 'clients' | 'invoices' | 'projects' | 'inventory'>('revenue')

  // Colors
  const COLORS = ['#09090b', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#71717a']

  // 1. REVENUE CALCULATIONS
  const revenueCalculations = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    const totals: { [key: string]: number } = {}
    months.forEach(m => { totals[m] = 0 })

    invoices.forEach(inv => {
      if (inv.status === 'paid' && inv.paidDate) {
        const mIdx = new Date(inv.paidDate).getMonth()
        const mName = months[mIdx]
        if (mName) totals[mName] += inv.total
      }
    })

    const barData = months.map(m => ({ month: m, Revenue: totals[m] }))
    
    let cumulative = 0
    const lineData = months.map(m => {
      cumulative += totals[m]
      return { month: m, 'Cumulative Revenue': cumulative }
    })

    return { barData, lineData }
  }, [invoices])

  // 2. CLIENT CALCULATIONS
  const clientCalculations = useMemo(() => {
    // Top 5 Clients by Revenue
    const clientRevenue: { [key: string]: { name: string, value: number } } = {}
    clients.forEach(c => {
      clientRevenue[c.id] = { name: c.name, value: 0 }
    })

    invoices.forEach(inv => {
      if (inv.status === 'paid' && clientRevenue[inv.clientId]) {
        clientRevenue[inv.clientId].value += inv.total
      }
    })

    const topClients = Object.values(clientRevenue)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    // Regular vs One-Time distribution
    let regularCount = 0
    let oneTimeCount = 0
    clients.forEach(c => {
      if (c.type === 'regular') regularCount++
      else oneTimeCount++
    })

    const distribution = [
      { name: 'Regular Retainer', value: regularCount },
      { name: 'One-Time Order', value: oneTimeCount }
    ]

    return { topClients, distribution }
  }, [clients, invoices])

  // 3. INVOICE CALCULATIONS
  const invoiceCalculations = useMemo(() => {
    let paidCount = 0, pendingCount = 0, overdueCount = 0
    invoices.forEach(inv => {
      if (inv.status === 'paid') paidCount++
      else if (inv.status === 'pending') pendingCount++
      else if (inv.status === 'overdue') overdueCount++
    })

    const statusPie = [
      { name: 'Paid', value: paidCount, color: '#22c55e' },
      { name: 'Pending', value: pendingCount, color: '#f59e0b' },
      { name: 'Overdue', value: overdueCount, color: '#ef4444' }
    ]

    // Monthly volume counts
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    const counts: { [key: string]: number } = {}
    months.forEach(m => { counts[m] = 0 })

    invoices.forEach(inv => {
      const mIdx = new Date(inv.invoiceDate).getMonth()
      const mName = months[mIdx]
      if (mName) counts[mName]++
    })

    const volumeData = months.map(m => ({ month: m, Invoices: counts[m] }))

    return { statusPie, volumeData }
  }, [invoices])

  // 4. PROJECT CALCULATIONS
  const projectCalculations = useMemo(() => {
    let pending = 0, inProgress = 0, completed = 0, cancelled = 0
    projects.forEach(p => {
      if (p.status === 'pending') pending++
      else if (p.status === 'in-progress') inProgress++
      else if (p.status === 'completed') completed++
      else if (p.status === 'cancelled') cancelled++
    })

    const statusDonut = [
      { name: 'Pending', value: pending, color: '#f59e0b' },
      { name: 'In Progress', value: inProgress, color: '#3b82f6' },
      { name: 'Completed', value: completed, color: '#22c55e' },
      { name: 'Cancelled', value: cancelled, color: '#71717a' }
    ]

    // Projects by service category
    const catCounts: { [key: string]: number } = {}
    projects.forEach(p => {
      const svc = services.find(s => s.id === p.serviceId)
      const cat = svc?.category || 'Other'
      catCounts[cat] = (catCounts[cat] || 0) + 1
    })

    const categoryData = Object.keys(catCounts).map(name => ({
      name,
      Projects: catCounts[name]
    }))

    return { statusDonut, categoryData }
  }, [projects, services])

  // 5. INVENTORY CALCULATIONS
  const inventoryCalculations = useMemo(() => {
    // Low stock items count
    const lowStock = products.filter(p => p.stockQuantity <= p.lowStockThreshold)
    
    // Total stock valuation in INR (Qty * Cost Price)
    const valuation = products.reduce((sum, p) => sum + (p.stockQuantity * p.costPrice), 0)

    // Most sold products: count quantities in paid invoices
    const productSales: { [key: string]: { name: string, quantity: number } } = {}
    products.forEach(p => {
      productSales[p.id] = { name: p.name, quantity: 0 }
    })

    invoices.forEach(inv => {
      if (inv.status === 'paid') {
        inv.items.forEach(item => {
          if (item.type === 'product' && productSales[item.referenceId]) {
            productSales[item.referenceId].quantity += item.quantity
          }
        })
      }
    })

    const topSales = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)

    return { lowStock, valuation, topSales }
  }, [products, invoices])

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-2xl font-extrabold text-black tracking-tight font-sans">Business Analytics</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Detailed metrics, financial ledgers, and operational performance trends.
        </p>
      </div>

      {/* ── Tabs Navigation ── */}
      <div className="flex glass p-2 rounded-2xl border border-neutral-200 shadow-sm overflow-x-auto gap-2">
        <button
          onClick={() => setActiveSection('revenue')}
          className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shrink-0 ${
            activeSection === 'revenue' ? 'bg-primary text-white' : 'text-neutral-500 hover:text-black hover:bg-neutral-50'
          }`}
        >
          <DollarSign className="h-4.5 w-4.5" />
          Revenue Analysis
        </button>

        <button
          onClick={() => setActiveSection('clients')}
          className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shrink-0 ${
            activeSection === 'clients' ? 'bg-primary text-white' : 'text-neutral-500 hover:text-black hover:bg-neutral-50'
          }`}
        >
          <Users className="h-4.5 w-4.5" />
          Client Growth
        </button>

        <button
          onClick={() => setActiveSection('invoices')}
          className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shrink-0 ${
            activeSection === 'invoices' ? 'bg-primary text-white' : 'text-neutral-500 hover:text-black hover:bg-neutral-50'
          }`}
        >
          <FileText className="h-4.5 w-4.5" />
          Invoice Ledger
        </button>

        <button
          onClick={() => setActiveSection('projects')}
          className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shrink-0 ${
            activeSection === 'projects' ? 'bg-primary text-white' : 'text-neutral-500 hover:text-black hover:bg-neutral-50'
          }`}
        >
          <FolderKanban className="h-4.5 w-4.5" />
          Project Delivery
        </button>

        <button
          onClick={() => setActiveSection('inventory')}
          className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shrink-0 ${
            activeSection === 'inventory' ? 'bg-primary text-white' : 'text-neutral-500 hover:text-black hover:bg-neutral-50'
          }`}
        >
          <Warehouse className="h-4.5 w-4.5" />
          Inventory Value
        </button>
      </div>

      {/* ── Tab Contents ── */}
      
      {/* 1. Revenue Tab */}
      {activeSection === 'revenue' && (
        <div className="space-y-6 animate-slide-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="glass p-6 rounded-3xl border border-neutral-200 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Total Settled Earnings</span>
              <h3 className="text-2xl font-black text-black mt-2">{formatCurrency(getPaidTotal())}</h3>
            </div>
            <div className="glass p-6 rounded-3xl border border-neutral-200 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Outstanding Receivables</span>
              <h3 className="text-2xl font-black text-neutral-600 mt-2">{formatCurrency(getPendingTotal())}</h3>
            </div>
            <div className="glass p-6 rounded-3xl border border-neutral-200 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Overdue Liabilities</span>
              <h3 className="text-2xl font-black text-red-600 mt-2">{formatCurrency(getOverdueTotal())}</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass p-6 rounded-3xl border border-neutral-200 shadow-sm">
              <h4 className="font-bold text-black text-sm mb-6">Monthly Revenue Share (₹)</h4>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueCalculations.barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f2" vertical={false} />
                    <XAxis dataKey="month" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} />
                    <Bar dataKey="Revenue" fill="#09090b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass p-6 rounded-3xl border border-neutral-200 shadow-sm">
              <h4 className="font-bold text-black text-sm mb-6">Cumulative Annual Growth (₹)</h4>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueCalculations.lineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f2" vertical={false} />
                    <XAxis dataKey="month" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Total Cumulative']} />
                    <Area type="monotone" dataKey="Cumulative Revenue" stroke="#09090b" fill="#f5f5f7" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Clients Tab */}
      {activeSection === 'clients' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-in">
          <div className="glass p-6 rounded-3xl border border-neutral-200 shadow-sm">
            <h4 className="font-bold text-black text-sm mb-6">Top 5 Clients by Revenue (₹)</h4>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clientCalculations.topClients} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f2" horizontal={false} />
                  <XAxis type="number" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                  <YAxis type="category" dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} width={100} />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Revenue Contribution']} />
                  <Bar dataKey="value" fill="#09090b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass p-6 rounded-3xl border border-neutral-200 shadow-sm">
            <h4 className="font-bold text-black text-sm mb-6">Client Distribution (Contract Types)</h4>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={clientCalculations.distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {clientCalculations.distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 3. Invoices Tab */}
      {activeSection === 'invoices' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-in">
          <div className="glass p-6 rounded-3xl border border-neutral-200 shadow-sm">
            <h4 className="font-bold text-black text-sm mb-6">Invoice Status Composition</h4>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={invoiceCalculations.statusPie}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {invoiceCalculations.statusPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass p-6 rounded-3xl border border-neutral-200 shadow-sm">
            <h4 className="font-bold text-black text-sm mb-6">Invoice Volume per Month</h4>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={invoiceCalculations.volumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f2" vertical={false} />
                  <XAxis dataKey="month" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="Invoices" fill="#09090b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 4. Projects Tab */}
      {activeSection === 'projects' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-in">
          <div className="glass p-6 rounded-3xl border border-neutral-200 shadow-sm">
            <h4 className="font-bold text-black text-sm mb-6">Workload Allocation</h4>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectCalculations.statusDonut}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    dataKey="value"
                  >
                    {projectCalculations.statusDonut.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass p-6 rounded-3xl border border-neutral-200 shadow-sm">
            <h4 className="font-bold text-black text-sm mb-6">Projects by Service Category</h4>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectCalculations.categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f2" vertical={false} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="Projects" fill="#09090b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 5. Inventory Tab */}
      {activeSection === 'inventory' && (
        <div className="space-y-6 animate-slide-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="glass p-6 rounded-3xl border border-neutral-200 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Total Asset Valuation (Cost)</span>
              <h3 className="text-2xl font-black text-black mt-2">{formatCurrency(inventoryCalculations.valuation)}</h3>
            </div>
            <div className="glass p-6 rounded-3xl border border-neutral-200 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Critical Low Stock Warning</span>
              <h3 className="text-2xl font-black text-red-600 mt-2">{inventoryCalculations.lowStock.length} <span className="text-xs text-neutral-400 font-normal">SKUs</span></h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass p-6 rounded-3xl border border-neutral-200 shadow-sm">
              <h4 className="font-bold text-black text-sm mb-6">Top 5 Best Selling Products (Quantity)</h4>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={inventoryCalculations.topSales} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f2" horizontal={false} />
                    <XAxis type="number" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} width={100} />
                    <Tooltip />
                    <Bar dataKey="quantity" fill="#09090b" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass p-6 rounded-3xl border border-neutral-200 shadow-sm">
              <h4 className="font-bold text-black text-sm mb-4">Low Stock Warning Inventory Alert</h4>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {inventoryCalculations.lowStock.map(p => (
                  <div key={p.id} className="flex justify-between items-center p-3.5 rounded-xl border border-neutral-100 bg-red-50/10">
                    <div>
                      <h5 className="text-xs font-bold text-black">{p.name}</h5>
                      <span className="text-[10px] text-neutral-400 font-mono">SKU: {p.sku}</span>
                    </div>
                    <span className="text-xs font-black text-red-600">
                      {p.stockQuantity} Left / {p.lowStockThreshold} thresh
                    </span>
                  </div>
                ))}
                {inventoryCalculations.lowStock.length === 0 && (
                  <p className="text-xs text-neutral-400 italic text-center py-16">All warehouse stock levels are completely healthy.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
