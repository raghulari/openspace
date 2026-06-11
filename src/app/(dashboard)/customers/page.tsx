'use client'

import { useState } from 'react'
import { Search, Folder, ExternalLink, Users, AlertCircle } from 'lucide-react'
import Link from 'next/link'

const MOCK_LEGACY_CUSTOMERS = [
  {
    id: 'leg-001',
    name: 'Acme Corp',
    email: 'contact@acme.com',
    status: 'active',
    folderUrl: 'https://drive.google.com/drive/folders/mock',
    date: '2025-10-01'
  },
  {
    id: 'leg-002',
    name: 'Globex Inc',
    email: 'info@globex.com',
    status: 'inactive',
    folderUrl: null,
    date: '2025-08-15'
  },
  {
    id: 'leg-003',
    name: 'Initech',
    email: 'hello@initech.co',
    status: 'active',
    folderUrl: 'https://drive.google.com/drive/folders/mock2',
    date: '2025-12-10'
  }
]

export default function LegacyCustomersPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = MOCK_LEGACY_CUSTOMERS.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Customers</h1>
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Legacy</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Read-only archive of legacy customer records and Drive folders.
          </p>
        </div>
      </div>

      {/* ── Search Panel ── */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 glass p-4 rounded-2xl shadow-sm border border-white/20">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search legacy customers..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-white/50 backdrop-blur-sm border border-black/10 rounded-xl outline-none focus:border-primary transition-all text-foreground placeholder-black/30"
          />
        </div>
      </div>

      {/* ── Warning Banner ── */}
      <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 text-amber-700 p-4 rounded-2xl backdrop-blur-sm">
        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-amber-600" />
        <div>
          <h4 className="font-bold text-sm">Legacy Module</h4>
          <p className="text-xs mt-1 opacity-90">
            This module is preserved for historical record access. You cannot add or edit new customers here. Please use the modern <Link href="/clients" className="underline font-bold">Clients</Link> module for active operations.
          </p>
        </div>
      </div>

      {/* ── Customers List ── */}
      <div className="glass rounded-3xl overflow-hidden shadow-sm border border-white/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-black/5 bg-black/5 text-muted-foreground font-semibold uppercase tracking-wider text-xs">
                <th className="px-6 py-4">Customer Name</th>
                <th className="px-6 py-4">Email Address</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Drive Folder</th>
                <th className="px-6 py-4">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filtered.length > 0 ? filtered.map((customer) => (
                <tr key={customer.id} className="hover:bg-black/5 transition-colors group">
                  <td className="px-6 py-4.5 font-bold text-foreground">
                    {customer.name}
                  </td>
                  <td className="px-6 py-4.5 text-muted-foreground">
                    {customer.email}
                  </td>
                  <td className="px-6 py-4.5">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
                      customer.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-neutral-200 text-neutral-600'
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4.5">
                    {customer.folderUrl ? (
                      <a href={customer.folderUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary font-bold hover:underline">
                        <Folder className="h-3.5 w-3.5" />
                        Open Folder
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">No folder linked</span>
                    )}
                  </td>
                  <td className="px-6 py-4.5 text-muted-foreground font-mono text-xs">
                    {customer.date}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-3 opacity-20" />
                    <p className="font-semibold text-sm">No legacy customers found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
