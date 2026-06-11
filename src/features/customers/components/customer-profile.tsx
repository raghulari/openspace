'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  FolderOpen,
  ArrowLeft,
  Mail,
  Phone,
  Building,
  Calendar,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  History,
  PlusCircle,
  ExternalLink,
} from 'lucide-react'

interface CustomerProfileProps {
  customer: any
  invoices: any[]
  documents: any[]
  meetings: any[]
  activities: any[]
}

export function CustomerProfile({
  customer,
  invoices,
  documents,
  meetings,
  activities,
}: CustomerProfileProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')

  // Financial calculations
  const totalInvoiced = invoices.reduce((acc, inv) => acc + (inv.total || 0), 0)
  const totalPaid = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((acc, inv) => acc + (inv.total || 0), 0)
  const totalOutstanding = invoices
    .filter((inv) => inv.status === 'pending' || inv.status === 'sent' || inv.status === 'overdue')
    .reduce((acc, inv) => acc + (inv.total || 0), 0)

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0)
  }

  // Format date helper
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  // Get status class for invoice badges
  const getInvoiceStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'overdue':
        return 'bg-rose-50 text-rose-700 border-rose-200'
      case 'sent':
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Breadcrumbs & Back ── */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/customers')}
          className="rounded-lg text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] h-9 px-3"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Customers
        </Button>
      </div>

      {/* ── Client Profile Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-[#e2e8f0]">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7c3aed]/10 text-xl font-bold text-[#7c3aed] border border-[#7c3aed]/20 shrink-0">
            {customer.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-[#0f172a]">{customer.name}</h1>
              <Badge
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  customer.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-transparent'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-100 border-transparent'
                }`}
              >
                {customer.status === 'active' ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            
            {/* Contact quick summaries */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#64748b]">
              {customer.company && (
                <span className="flex items-center gap-1.5">
                  <Building className="h-4 w-4 text-[#94a3b8]" />
                  {customer.company}
                </span>
              )}
              {customer.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-[#94a3b8]" />
                  {customer.email}
                </span>
              )}
              {customer.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-[#94a3b8]" />
                  {customer.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          {customer.google_drive_folder_url && (
            <a
              href={customer.google_drive_folder_url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "rounded-xl border-[#e2e8f0] text-amber-600 hover:text-amber-700 hover:bg-amber-50 h-10 px-4 flex items-center gap-2"
              )}
            >
              <FolderOpen className="h-4.5 w-4.5" />
              Drive Workspace
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      {/* ── Tabs Navigation ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white border border-[#e2e8f0] p-1.5 rounded-2xl h-auto flex flex-wrap gap-1">
          <TabsTrigger value="overview" className="rounded-xl px-4 py-2.5 text-sm font-semibold transition-all">Overview</TabsTrigger>
          <TabsTrigger value="invoices" className="rounded-xl px-4 py-2.5 text-sm font-semibold transition-all">Invoices</TabsTrigger>
          <TabsTrigger value="documents" className="rounded-xl px-4 py-2.5 text-sm font-semibold transition-all">Documents</TabsTrigger>
          <TabsTrigger value="meetings" className="rounded-xl px-4 py-2.5 text-sm font-semibold transition-all">Meetings</TabsTrigger>
          <TabsTrigger value="notes" className="rounded-xl px-4 py-2.5 text-sm font-semibold transition-all">Notes & Address</TabsTrigger>
          <TabsTrigger value="activity" className="rounded-xl px-4 py-2.5 text-sm font-semibold transition-all">History Log</TabsTrigger>
        </TabsList>

        {/* ── OVERVIEW TAB ── */}
        <TabsContent value="overview" className="space-y-6 outline-none">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border border-[#e2e8f0] bg-white rounded-2xl shadow-sm overflow-hidden">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#64748b] mb-1">Total Invoiced</p>
                  <p className="text-2xl font-bold text-[#0f172a]">{formatINR(totalInvoiced)}</p>
                  <p className="text-xs text-[#94a3b8] mt-1">{invoices.length} invoices generated</p>
                </div>
                <div className="rounded-xl bg-[#7c3aed]/10 p-3 text-[#7c3aed]">
                  <FileText className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-[#e2e8f0] bg-white rounded-2xl shadow-sm overflow-hidden">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#64748b] mb-1">Paid Revenue</p>
                  <p className="text-2xl font-bold text-emerald-600">{formatINR(totalPaid)}</p>
                  <p className="text-xs text-[#94a3b8] mt-1">Cleared balance in Rs.</p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-[#e2e8f0] bg-white rounded-2xl shadow-sm overflow-hidden">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#64748b] mb-1">Outstanding Balance</p>
                  <p className="text-2xl font-bold text-amber-600">{formatINR(totalOutstanding)}</p>
                  <p className="text-xs text-[#94a3b8] mt-1">Pending client clearance</p>
                </div>
                <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                  <Clock className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Invoices */}
            <Card className="border border-[#e2e8f0] bg-white rounded-2xl shadow-sm lg:col-span-2 overflow-hidden">
              <CardHeader className="border-b border-[#f1f5f9] px-6 py-4">
                <CardTitle className="text-base font-bold text-[#0f172a]">Recent Invoices</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {invoices.length === 0 ? (
                  <p className="p-6 text-sm text-[#64748b] text-center">No invoices generated yet for this customer.</p>
                ) : (
                  <Table>
                    <TableHeader className="bg-[#f8fafc]">
                      <TableRow className="border-b border-[#e2e8f0]">
                        <TableHead className="font-bold text-[#64748b] text-xs uppercase">Invoice#</TableHead>
                        <TableHead className="font-bold text-[#64748b] text-xs uppercase">Date</TableHead>
                        <TableHead className="font-bold text-[#64748b] text-xs uppercase">Amount</TableHead>
                        <TableHead className="font-bold text-[#64748b] text-xs uppercase">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.slice(0, 5).map((inv) => (
                        <TableRow key={inv.id} className="border-b border-[#f1f5f9]">
                          <TableCell className="font-semibold text-[#0f172a] text-sm">
                            <Link href={`/invoices/${inv.id}`} className="text-[#7c3aed] hover:underline">
                              {inv.invoice_number}
                            </Link>
                          </TableCell>
                          <TableCell className="text-sm text-[#64748b]">{formatDate(inv.invoice_date)}</TableCell>
                          <TableCell className="font-bold text-sm text-[#0f172a]">{formatINR(inv.total)}</TableCell>
                          <TableCell>
                            <Badge className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${getInvoiceStatusBadge(inv.status)}`}>
                              {inv.status.toUpperCase()}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Quick Details Sidebar Card */}
            <Card className="border border-[#e2e8f0] bg-white rounded-2xl shadow-sm overflow-hidden h-fit">
              <CardHeader className="border-b border-[#f1f5f9] px-6 py-4">
                <CardTitle className="text-base font-bold text-[#0f172a]">Core Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4 text-sm">
                <div>
                  <span className="text-xs text-[#94a3b8] font-semibold uppercase tracking-wider">PAN / GSTIN</span>
                  <p className="font-semibold text-[#0f172a] mt-0.5">{customer.gst_number || 'Not Provided'}</p>
                </div>
                <div>
                  <span className="text-xs text-[#94a3b8] font-semibold uppercase tracking-wider">Tags</span>
                  {customer.tags && customer.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {customer.tags.map((tag: string) => (
                        <Badge key={tag} className="bg-slate-100 hover:bg-slate-100 text-slate-700 border-none text-[10px] rounded-full">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 mt-0.5">No tags added</p>
                  )}
                </div>
                <div>
                  <span className="text-xs text-[#94a3b8] font-semibold uppercase tracking-wider">Billing Country</span>
                  <p className="font-semibold text-[#0f172a] mt-0.5">{customer.country || 'India'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── INVOICES TAB ── */}
        <TabsContent value="invoices" className="outline-none">
          <Card className="border border-[#e2e8f0] bg-white rounded-2xl shadow-sm overflow-hidden">
            <CardHeader className="border-b border-[#f1f5f9] px-6 py-4 flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold text-[#0f172a]">Billing History</CardTitle>
                <CardDescription className="text-xs text-[#64748b]">Complete financial invoicing logs for this customer.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {invoices.length === 0 ? (
                <div className="p-12 text-center text-[#64748b] space-y-2">
                  <FileText className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="text-sm font-semibold">No invoices generated yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-[#f8fafc]">
                    <TableRow className="border-b border-[#e2e8f0]">
                      <TableHead className="font-bold text-[#64748b] text-xs uppercase">Invoice#</TableHead>
                      <TableHead className="font-bold text-[#64748b] text-xs uppercase">Invoice Date</TableHead>
                      <TableHead className="font-bold text-[#64748b] text-xs uppercase">Due Date</TableHead>
                      <TableHead className="font-bold text-[#64748b] text-xs uppercase">Tax / GST</TableHead>
                      <TableHead className="font-bold text-[#64748b] text-xs uppercase">Total</TableHead>
                      <TableHead className="font-bold text-[#64748b] text-xs uppercase">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((inv) => (
                      <TableRow key={inv.id} className="border-b border-[#f1f5f9]">
                        <TableCell className="font-semibold text-sm">
                          <Link href={`/invoices/${inv.id}`} className="text-[#7c3aed] hover:underline">
                            {inv.invoice_number}
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm text-[#64748b]">{formatDate(inv.invoice_date)}</TableCell>
                        <TableCell className="text-sm text-[#64748b]">{formatDate(inv.due_date)}</TableCell>
                        <TableCell className="text-sm text-[#64748b]">{formatINR(inv.tax_amount)} ({inv.tax_rate}%)</TableCell>
                        <TableCell className="font-bold text-sm text-[#0f172a]">{formatINR(inv.total)}</TableCell>
                        <TableCell>
                          <Badge className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${getInvoiceStatusBadge(inv.status)}`}>
                            {inv.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── DOCUMENTS TAB ── */}
        <TabsContent value="documents" className="outline-none">
          <Card className="border border-[#e2e8f0] bg-white rounded-2xl shadow-sm overflow-hidden">
            <CardHeader className="border-b border-[#f1f5f9] px-6 py-4">
              <CardTitle className="text-base font-bold text-[#0f172a]">Shared Workspace Documents</CardTitle>
              <CardDescription className="text-xs text-[#64748b]">Browse files stored in Google Drive under this client folder.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {documents.length === 0 ? (
                <div className="p-12 text-center text-[#64748b] space-y-2">
                  <FolderOpen className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="text-sm font-semibold">No documents uploaded yet</p>
                  <p className="text-xs text-[#94a3b8]">Upload documents inside Documents page and associate them to this client.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-[#f8fafc]">
                    <TableRow className="border-b border-[#e2e8f0]">
                      <TableHead className="font-bold text-[#64748b] text-xs uppercase">Document Name</TableHead>
                      <TableHead className="font-bold text-[#64748b] text-xs uppercase">Category</TableHead>
                      <TableHead className="font-bold text-[#64748b] text-xs uppercase">Upload Date</TableHead>
                      <TableHead className="font-bold text-[#64748b] text-xs uppercase">Source</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id} className="border-b border-[#f1f5f9]">
                        <TableCell className="font-semibold text-sm text-[#0f172a]">
                          {doc.google_drive_file_url ? (
                            <a
                              href={doc.google_drive_file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#7c3aed] hover:underline flex items-center gap-1.5"
                            >
                              {doc.name}
                              <ExternalLink className="h-3.5 w-3.5 text-[#94a3b8]" />
                            </a>
                          ) : (
                            doc.name
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-[#64748b]">
                          <Badge className="bg-slate-100 hover:bg-slate-100 text-slate-700 uppercase border-none text-[10px]">
                            {doc.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-[#64748b]">{formatDate(doc.created_at)}</TableCell>
                        <TableCell className="text-xs text-[#94a3b8]">Google Drive</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── MEETINGS TAB ── */}
        <TabsContent value="meetings" className="outline-none">
          <Card className="border border-[#e2e8f0] bg-white rounded-2xl shadow-sm overflow-hidden">
            <CardHeader className="border-b border-[#f1f5f9] px-6 py-4">
              <CardTitle className="text-base font-bold text-[#0f172a]">Meeting Notes & Records</CardTitle>
              <CardDescription className="text-xs text-[#64748b]">AI-summarized meeting notes, decisions, and action items.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {meetings.length === 0 ? (
                <div className="p-6 text-center text-[#64748b] space-y-2">
                  <Calendar className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="text-sm font-semibold">No meetings logged yet</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {meetings.map((meeting) => (
                    <div key={meeting.id} className="border border-[#e2e8f0] bg-[#f8fafc] rounded-2xl p-5 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e2e8f0] pb-3">
                        <div>
                          <h4 className="font-bold text-sm text-[#0f172a]">{meeting.title}</h4>
                          <p className="text-xs text-[#64748b] mt-0.5">{formatDate(meeting.meeting_date)}</p>
                        </div>
                        {meeting.google_doc_url && (
                          <a
                            href={meeting.google_doc_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              buttonVariants({ variant: "outline", size: "sm" }),
                              "rounded-xl border-[#e2e8f0] text-xs h-8 flex items-center gap-1"
                            )}
                          >
                            Google Doc <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      
                      {/* AI summary snippet */}
                      {meeting.ai_summary?.summary ? (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold tracking-wider text-[#94a3b8] uppercase">AI Summary</span>
                          <p className="text-xs text-[#64748b] leading-relaxed">{meeting.ai_summary.summary}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-[#64748b]">{meeting.content || 'No meeting summary available.'}</p>
                      )}

                      {/* Decisions & Action Items list */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        {meeting.ai_decisions && meeting.ai_decisions.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold tracking-wider text-emerald-600 uppercase">Key Decisions</span>
                            <ul className="list-disc list-inside text-[11px] text-[#64748b] space-y-0.5">
                              {meeting.ai_decisions.slice(0, 3).map((dec: string, i: number) => (
                                <li key={i}>{dec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {meeting.ai_tasks && meeting.ai_tasks.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold tracking-wider text-[#7c3aed] uppercase">Action Items</span>
                            <ul className="list-disc list-inside text-[11px] text-[#64748b] space-y-0.5">
                              {meeting.ai_tasks.slice(0, 3).map((item: any, i: number) => (
                                <li key={i}>{item.task || item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── NOTES & ADDRESS TAB ── */}
        <TabsContent value="notes" className="outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Notes */}
            <Card className="border border-[#e2e8f0] bg-white rounded-2xl shadow-sm overflow-hidden h-fit">
              <CardHeader className="border-b border-[#f1f5f9] px-6 py-4">
                <CardTitle className="text-base font-bold text-[#0f172a]">Customer Notes</CardTitle>
                <CardDescription className="text-xs text-[#64748b]">Private internal logs and operational tags.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {customer.notes ? (
                  <p className="text-sm text-[#0f172a] whitespace-pre-wrap leading-relaxed">
                    {customer.notes}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400 italic">No custom notes saved for this customer profile yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Address */}
            <Card className="border border-[#e2e8f0] bg-white rounded-2xl shadow-sm overflow-hidden h-fit">
              <CardHeader className="border-b border-[#f1f5f9] px-6 py-4">
                <CardTitle className="text-base font-bold text-[#0f172a]">Billing Address Details</CardTitle>
                <CardDescription className="text-xs text-[#64748b]">Registered billing address used for PDF invoice generation.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-3 text-sm">
                <div>
                  <span className="text-xs text-[#94a3b8] font-semibold uppercase tracking-wider">Street Address</span>
                  <p className="font-semibold text-[#0f172a] mt-0.5">{customer.address || '-'}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-[#94a3b8] font-semibold uppercase tracking-wider">City</span>
                    <p className="font-semibold text-[#0f172a] mt-0.5">{customer.city || '-'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-[#94a3b8] font-semibold uppercase tracking-wider">State</span>
                    <p className="font-semibold text-[#0f172a] mt-0.5">{customer.state || '-'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-[#94a3b8] font-semibold uppercase tracking-wider">Pincode</span>
                    <p className="font-semibold text-[#0f172a] mt-0.5">{customer.pincode || '-'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-[#94a3b8] font-semibold uppercase tracking-wider">Country</span>
                    <p className="font-semibold text-[#0f172a] mt-0.5">{customer.country || 'India'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── HISTORY / ACTIVITY TAB ── */}
        <TabsContent value="activity" className="outline-none">
          <Card className="border border-[#e2e8f0] bg-white rounded-2xl shadow-sm overflow-hidden">
            <CardHeader className="border-b border-[#f1f5f9] px-6 py-4">
              <CardTitle className="text-base font-bold text-[#0f172a]">Workspace Timeline Log</CardTitle>
              <CardDescription className="text-xs text-[#64748b]">Audit logs of actions relating to this customer profile.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {activities.length === 0 ? (
                <p className="text-sm text-[#64748b] text-center">No activity logged for this client profile.</p>
              ) : (
                <div className="relative border-l-2 border-[#e2e8f0] pl-6 space-y-6">
                  {activities.map((act) => (
                    <div key={act.id} className="relative group">
                      {/* Timeline dot */}
                      <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-[#e2e8f0] group-hover:bg-[#7c3aed] ring-4 ring-white border border-[#94a3b8] transition-colors" />
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[#0f172a] capitalize bg-slate-100 px-2 py-0.5 rounded-md">
                            {act.action}
                          </span>
                          <span className="text-xs text-[#94a3b8]">{formatDate(act.created_at)}</span>
                        </div>
                        <p className="text-sm text-[#64748b]">{act.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
