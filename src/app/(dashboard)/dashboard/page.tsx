'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter, 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard, 
  Zap,
  MessageSquare
} from 'lucide-react'
import { useAuthStore } from '@/stores/use-auth-store'
import { useClientStore } from '@/stores/use-client-store'
import { useProjectStore } from '@/stores/use-project-store'
import { useInvoiceStore } from '@/stores/use-invoice-store'
import { formatCurrency } from '@/lib/demo-data'
import { 
  BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'

export default function DashboardPage() {
  const { clients } = useClientStore()
  const { projects } = useProjectStore()
  const { invoices, getPaidTotal, getPendingTotal } = useInvoiceStore()

  const activeProjectsCount = useMemo(() => 
    projects.filter(p => p.status === 'in-progress').length, 
    [projects]
  )

  const paidTotal = getPaidTotal()
  const pendingTotal = getPendingTotal()

  // 1. Revenue Trend Data
  const revenueTrendData = useMemo(() => {
    return [
      { name: 'Jan', Revenue: 15000 },
      { name: 'Feb', Revenue: 22000 },
      { name: 'Mar', Revenue: 48000 },
      { name: 'Apr', Revenue: 18000 },
      { name: 'May', Revenue: 26000 },
      { name: 'Jun', Revenue: 34000 }
    ]
  }, [])

  const currentDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="space-y-6 pb-20 relative min-h-[calc(100vh-8rem)]">


      {/* ── Greeting ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-foreground/80 mt-1 font-medium">
            Welcome, Let's dive into your personalized setup guide.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors shadow-sm">
          <Plus className="h-4 w-4" />
          Create campaigns
        </button>
      </div>

      {/* ── Performance Over Time ── */}
      <div className="glass rounded-3xl p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-bold text-foreground">Performance Over Time</h2>
            <p className="text-xs text-muted-foreground mt-1">{currentDate}</p>
          </div>
          <div className="flex items-center gap-2">
             <button className="flex items-center gap-1.5 text-xs font-semibold text-foreground bg-black/5 hover:bg-black/10 px-3 py-1.5 rounded-lg transition-colors">
               <ArrowUpRight className="h-3.5 w-3.5" /> Short
             </button>
             <button className="flex items-center gap-1.5 text-xs font-semibold text-foreground bg-black/5 hover:bg-black/10 px-3 py-1.5 rounded-lg transition-colors">
               <Filter className="h-3 w-3" /> Filter
             </button>
             <button className="p-1.5 rounded-lg hover:bg-black/5 text-muted-foreground transition-colors bg-black/5">
               <MoreVertical className="h-4 w-4" />
             </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border/50">
           {/* Stat 1 */}
           <div className="py-4 md:py-0 md:pr-6">
             <p className="text-sm font-semibold text-muted-foreground mb-2">Delivered</p>
             <div className="flex items-center gap-3">
               <span className="text-3xl font-bold text-foreground">42,642.1</span>
               <span className="flex items-center bg-secondary/40 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                 +0.02% <ArrowUpRight className="h-2.5 w-2.5 ml-0.5" />
               </span>
             </div>
           </div>
           {/* Stat 2 */}
           <div className="py-4 md:py-0 md:px-6">
             <p className="text-sm font-semibold text-muted-foreground mb-2">Opened</p>
             <div className="flex items-center gap-3">
               <span className="text-3xl font-bold text-foreground">26,843</span>
               <span className="flex items-center bg-red-50 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded">
                 -0.02% <ArrowDownRight className="h-2.5 w-2.5 ml-0.5" />
               </span>
             </div>
           </div>
           {/* Stat 3 */}
           <div className="py-4 md:py-0 md:px-6">
             <p className="text-sm font-semibold text-muted-foreground mb-2">Clicked</p>
             <div className="flex items-center gap-3">
               <span className="text-3xl font-bold text-foreground">525,753</span>
               <span className="flex items-center bg-secondary/40 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                 +0.02% <ArrowUpRight className="h-2.5 w-2.5 ml-0.5" />
               </span>
             </div>
           </div>
           {/* Stat 4 */}
           <div className="py-4 md:py-0 md:pl-6">
             <p className="text-sm font-semibold text-muted-foreground mb-2">Subscribe</p>
             <div className="flex items-center gap-3">
               <span className="text-3xl font-bold text-foreground">425</span>
               <span className="flex items-center bg-secondary/40 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                 +0.02% <ArrowUpRight className="h-2.5 w-2.5 ml-0.5" />
               </span>
             </div>
           </div>
        </div>
      </div>

      {/* ── Charts & Schedule Section ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Campaign Performance Bar Chart */}
        <div className="xl:col-span-2 glass p-6 rounded-3xl flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-foreground">Campaign Performance</h3>
            <button className="p-1 rounded-md hover:bg-black/5 text-muted-foreground">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl font-bold text-foreground">$24,747.01</span>
            <div className="flex items-center gap-1.5 mt-1">
               <span className="flex items-center bg-secondary/40 text-green-700 text-[11px] font-bold px-2 py-0.5 rounded">
                 <ArrowUpRight className="h-3 w-3 mr-0.5" /> 12%
               </span>
               <span className="text-[13px] text-muted-foreground font-semibold">vs last month</span>
            </div>
          </div>
          <div className="flex-1 min-h-[250px] relative">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={revenueTrendData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                 <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
                 <Tooltip cursor={{fill: 'transparent'}} />
                 <Bar dataKey="Revenue" radius={[8, 8, 8, 8]} barSize={40}>
                   {revenueTrendData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={index === 2 ? '#ff7657' : '#f4f7f4'} />
                   ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Schedule Campaign */}
        <div className="glass p-6 rounded-3xl">
          <h3 className="text-lg font-bold text-foreground mb-6">Schedule Campaign</h3>
          
          <div className="flex items-center justify-between mb-6">
             <span className="text-sm font-semibold text-foreground">September 2024</span>
             <div className="flex items-center gap-1.5">
               <button className="p-1 rounded-md border border-border hover:bg-black/5 text-muted-foreground">
                 <ChevronLeft className="h-4 w-4" />
               </button>
               <button className="p-1 rounded-md border border-border hover:bg-black/5 text-muted-foreground">
                 <ChevronRight className="h-4 w-4" />
               </button>
             </div>
          </div>
          
          {/* Mini Calendar Row */}
          <div className="flex justify-between mb-8 text-center">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
               <div key={day} className="flex flex-col gap-3">
                 <span className="text-[11px] text-muted-foreground font-semibold">{day}</span>
                 <span className={`text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full ${i === 4 ? 'bg-secondary text-primary' : 'text-foreground'}`}>
                   {15 + i}
                 </span>
               </div>
            ))}
          </div>

          {/* Timeline items */}
          <div className="space-y-5">
            <div>
              <p className="text-[11px] text-muted-foreground font-semibold mb-3">Today</p>
              <div className="bg-[#fef08a] rounded-2xl p-3.5 flex gap-3 relative border border-[#fef08a] shadow-sm">
                 <div className="bg-white/60 p-2.5 rounded-xl shrink-0">
                    <LayoutDashboard className="h-5 w-5 text-yellow-700" />
                 </div>
                 <div className="flex-1 pt-0.5">
                    <h4 className="text-[13px] font-bold text-yellow-950">Element of Design Test</h4>
                    <p className="text-[11px] text-yellow-700 mt-1">10:00 - 11:00 AM</p>
                 </div>
                 <button className="text-yellow-700/50 hover:text-yellow-700 pt-0.5"><MoreVertical className="h-5 w-5" /></button>
              </div>
            </div>
            
            <div>
              <p className="text-[11px] text-muted-foreground font-semibold mb-3">Sat, Jan 20</p>
              <div className="bg-[#fce7f3] rounded-2xl p-3.5 flex gap-3 relative border border-[#fce7f3] shadow-sm">
                 <div className="bg-white/60 p-2.5 rounded-xl shrink-0">
                    <Zap className="h-5 w-5 text-pink-700" />
                 </div>
                 <div className="flex-1 pt-0.5">
                    <h4 className="text-[13px] font-bold text-pink-950">Design Principle Test</h4>
                    <p className="text-[11px] text-pink-700 mt-1">10:00 - 11:00 AM</p>
                 </div>
                 <button className="text-pink-700/50 hover:text-pink-700 pt-0.5"><MoreVertical className="h-5 w-5" /></button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
