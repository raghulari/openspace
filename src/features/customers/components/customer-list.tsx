'use client'

import { useState, useTransition } from 'react'
import Link from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { CustomerForm } from './customer-form'
import { deleteCustomer } from '../actions/customers'
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Folder,
  Loader2,
  Users,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface CustomerListProps {
  initialCustomers: any[]
  workspaceId: string
}

export function CustomerList({ initialCustomers, workspaceId }: CustomerListProps) {
  const router = useRouter()
  const [customers, setCustomers] = useState(initialCustomers)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isPending, startTransition] = useTransition()

  // Form sheet state
  const [formOpen, setFormOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)

  // Trigger add form
  const handleAddClick = () => {
    setSelectedCustomer(null)
    setFormOpen(true)
  }

  // Trigger edit form
  const handleEditClick = (e: React.MouseEvent, customer: any) => {
    e.stopPropagation() // Don't trigger navigation
    setSelectedCustomer(customer)
    setFormOpen(true)
  }

  // Trigger delete action
  const handleDeleteClick = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation() // Don't trigger navigation
    
    if (confirm(`Are you sure you want to delete customer "${name}"? This action cannot be undone.`)) {
      startTransition(async () => {
        const res = await deleteCustomer(workspaceId, id, name)
        if (res.success) {
          toast.success('Customer deleted successfully')
          router.refresh()
        } else {
          toast.error(res.message || 'Failed to delete customer')
        }
      })
    }
  }

  // Filter logic
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      (customer.email && customer.email.toLowerCase().includes(search.toLowerCase())) ||
      (customer.company && customer.company.toLowerCase().includes(search.toLowerCase()))
    
    const matchesStatus =
      statusFilter === 'all' || customer.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Format currency
  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0)
  }

  return (
    <div className="space-y-6">
      {/* ── Header Row ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">Customers</h1>
          <p className="text-sm text-[#64748b]">Manage your client database, document paths, and billing history.</p>
        </div>
        <Button
          onClick={handleAddClick}
          className="rounded-xl bg-[#7c3aed] text-white hover:bg-[#6d28d9] shadow-lg shadow-[#7c3aed]/25 flex items-center gap-2 px-4 py-5 font-semibold"
        >
          <Plus className="h-4.5 w-4.5" />
          Add Customer
        </Button>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-center bg-white p-4 rounded-2xl border border-[#e2e8f0]">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
          <Input
            placeholder="Search by name, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl border-[#e2e8f0]"
          />
        </div>
        <div className="w-full sm:w-[180px]">
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || 'all')}>
            <SelectTrigger className="rounded-xl border-[#e2e8f0]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Customer List Table ── */}
      {filteredCustomers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#e2e8f0] bg-white p-12 text-center">
          <div className="mx-auto inline-flex items-center justify-center rounded-2xl bg-[#7c3aed]/5 p-4 text-[#7c3aed] mb-4">
            <Users className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-[#0f172a] mb-1">No customers found</h3>
          <p className="text-sm text-[#64748b] max-w-sm mx-auto mb-6">
            {search || statusFilter !== 'all'
              ? 'No client profiles match your current search queries or filter settings.'
              : 'Add your first client profile to get started with invoicing and tracking files.'}
          </p>
          {!search && statusFilter === 'all' && (
            <Button
              onClick={handleAddClick}
              className="rounded-xl bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
            >
              Add Your First Customer
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-[#e2e8f0] bg-white overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-[#f8fafc]">
              <TableRow className="hover:bg-transparent border-b border-[#e2e8f0]">
                <TableHead className="font-bold text-[#64748b]">Client / Company</TableHead>
                <TableHead className="font-bold text-[#64748b]">Contact Information</TableHead>
                <TableHead className="font-bold text-[#64748b]">Status</TableHead>
                <TableHead className="font-bold text-[#64748b]">Drive Path</TableHead>
                <TableHead className="text-right font-bold text-[#64748b] w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow
                  key={customer.id}
                  onClick={() => router.push(`/customers/${customer.id}`)}
                  className="cursor-pointer hover:bg-slate-50/70 border-b border-[#f1f5f9] transition-colors"
                >
                  {/* Name & Company */}
                  <TableCell className="py-4">
                    <div>
                      <p className="font-semibold text-[#0f172a] group-hover:text-[#7c3aed]">
                        {customer.name}
                      </p>
                      {customer.company && (
                        <p className="text-xs text-[#64748b] mt-0.5">{customer.company}</p>
                      )}
                    </div>
                  </TableCell>

                  {/* Contact Info */}
                  <TableCell className="py-4">
                    <div className="space-y-0.5">
                      {customer.email && (
                        <p className="text-sm text-[#0f172a]">{customer.email}</p>
                      )}
                      {customer.phone && (
                        <p className="text-xs text-[#64748b]">{customer.phone}</p>
                      )}
                    </div>
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell className="py-4">
                    <Badge
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        customer.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-transparent'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-100 border-transparent'
                      }`}
                    >
                      {customer.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>

                  {/* Drive Folder */}
                  <TableCell className="py-4">
                    {customer.google_drive_folder_url ? (
                      <a
                        href={customer.google_drive_folder_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()} // Don't trigger navigation
                        className="inline-flex items-center gap-1.5 text-xs text-[#7c3aed] font-semibold hover:underline"
                      >
                        <Folder className="h-4 w-4 shrink-0 text-amber-500" />
                        Open Folder
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    ) : (
                      <span className="text-xs text-[#94a3b8]">No Folder connected</span>
                    )}
                  </TableCell>

                  {/* Row Actions */}
                  <TableCell className="py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleEditClick(e, customer)}
                        className="h-8 w-8 text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] rounded-lg"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDeleteClick(e, customer.id, customer.name)}
                        className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <ChevronRight className="h-5 w-5 text-[#94a3b8]" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ── Form Modal/Sheet ── */}
      {formOpen && (
        <CustomerForm
          workspaceId={workspaceId}
          open={formOpen}
          onOpenChange={setFormOpen}
          customer={selectedCustomer}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  )
}
