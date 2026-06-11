'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWorkspaceStore } from '@/stores/use-workspace-store'
import { useInvoiceStore } from '@/stores/use-invoice-store'
import { useAuthStore } from '@/stores/use-auth-store'
import { type BusinessType } from '@/lib/demo-data'
import { toast } from 'sonner'
import { 
  Settings, 
  FileText, 
  User, 
  Briefcase, 
  Package, 
  Layers, 
  Save, 
  LogOut,
  Sparkles,
  Building,
  MapPin,
  Image
} from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const { workspace, updateWorkspace, setBusinessType } = useWorkspaceStore()
  const { config, updateConfig } = useInvoiceStore()
  const { user, logout } = useAuthStore()

  const [activeTab, setActiveTab] = useState<'general' | 'invoice' | 'profile'>('general')

  // General tab states
  const [workspaceName, setWorkspaceName] = useState(workspace?.name || '')
  const [companyName, setCompanyName] = useState(workspace?.companyName || '')
  const [localBusinessType, setLocalBusinessType] = useState<BusinessType>(workspace?.businessType || 'hybrid')
  const [gstNumber, setGstNumber] = useState(workspace?.gstNumber || '')
  const [businessAddress, setBusinessAddress] = useState(workspace?.businessAddress || '')

  // Invoice tab states
  const [invoicePrefix, setInvoicePrefix] = useState(config.invoicePrefix || 'INV')
  const [defaultTaxRate, setDefaultTaxRate] = useState<number>(config.defaultTaxRate || 18)
  const [invoiceCompanyDetails, setInvoiceCompanyDetails] = useState(config.companyName || '')
  const [invoiceAddress, setInvoiceAddress] = useState(config.businessAddress || '')

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!workspaceName.trim() || !companyName.trim()) {
      toast.error('Workspace Name and Company Name are required')
      return
    }

    updateWorkspace({
      name: workspaceName,
      companyName,
      businessType: localBusinessType,
      gstNumber,
      businessAddress
    })
    
    setBusinessType(localBusinessType)
    
    // Also mirror to invoice config
    updateConfig({
      companyName,
      businessAddress,
      gstNumber
    })

    toast.success('General workspace settings updated!')
  }

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault()

    updateConfig({
      invoicePrefix,
      defaultTaxRate,
      companyName: invoiceCompanyDetails,
      businessAddress: invoiceAddress
    })

    toast.success('Invoice configurations updated!')
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    router.replace('/login')
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-2xl font-extrabold text-black tracking-tight font-sans">Settings</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Configure business metadata, billing parameters, and manage user profile logs.
        </p>
      </div>

      {/* ── Tabs selector ── */}
      <div className="flex glass p-2 rounded-2xl border border-neutral-200 shadow-sm gap-2">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'general' ? 'bg-primary text-white' : 'text-neutral-500 hover:text-black hover:bg-neutral-50'
          }`}
        >
          <Settings className="h-4.5 w-4.5" />
          General Workspace
        </button>

        <button
          onClick={() => setActiveTab('invoice')}
          className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'invoice' ? 'bg-primary text-white' : 'text-neutral-500 hover:text-black hover:bg-neutral-50'
          }`}
        >
          <FileText className="h-4.5 w-4.5" />
          Invoice & Taxes
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'profile' ? 'bg-primary text-white' : 'text-neutral-500 hover:text-black hover:bg-neutral-50'
          }`}
        >
          <User className="h-4.5 w-4.5" />
          My Profile
        </button>
      </div>

      {/* ── Settings Forms ── */}
      <div className="glass border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-sm max-w-2xl">
        
        {/* 1. General Settings Tab */}
        {activeTab === 'general' && (
          <form onSubmit={handleSaveGeneral} className="space-y-6 animate-slide-in">
            <div>
              <h3 className="text-base font-bold text-black">Workspace Parameters</h3>
              <p className="text-xs text-neutral-400 mt-0.5">Customize your administrative and business type parameters.</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Workspace Name *</label>
                  <input
                    type="text"
                    required
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all"
                  />
                </div>

                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Company Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all"
                  />
                </div>
              </div>

              {/* Business Type selection cards */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Business Model Model</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setLocalBusinessType('service')}
                    className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                      localBusinessType === 'service' ? 'border-black bg-neutral-50 ring-1 ring-black' : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <Briefcase className="h-5 w-5 text-neutral-500 shrink-0" />
                    <div>
                      <h5 className="text-xs font-bold text-black">Service</h5>
                      <p className="text-[9px] text-neutral-400 leading-normal mt-0.5">Retainers, projects, task grids.</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLocalBusinessType('product')}
                    className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                      localBusinessType === 'product' ? 'border-black bg-neutral-50 ring-1 ring-black' : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <Package className="h-5 w-5 text-neutral-500 shrink-0" />
                    <div>
                      <h5 className="text-xs font-bold text-black">Product</h5>
                      <p className="text-[9px] text-neutral-400 leading-normal mt-0.5">Physical items, stock reductions.</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLocalBusinessType('hybrid')}
                    className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                      localBusinessType === 'hybrid' ? 'border-black bg-neutral-50 ring-1 ring-black' : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <Layers className="h-5 w-5 text-neutral-500 shrink-0" />
                    <div>
                      <h5 className="text-xs font-bold text-black">Hybrid</h5>
                      <p className="text-[9px] text-neutral-400 leading-normal mt-0.5">All modules enabled.</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* GST Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">GSTIN Tax Registration ID</label>
                <input
                  type="text"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  placeholder="e.g. 29AAAAA0000A1Z1"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all"
                />
              </div>

              {/* Billing Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Business Headquarters Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                  <textarea
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    rows={3}
                    placeholder="Enter full physical address"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#f0f0f2] flex justify-end">
              <button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center gap-1.5"
              >
                <Save className="h-4 w-4" />
                Save General Settings
              </button>
            </div>
          </form>
        )}

        {/* 2. Invoice Configurations Tab */}
        {activeTab === 'invoice' && (
          <form onSubmit={handleSaveInvoice} className="space-y-6 animate-slide-in">
            <div>
              <h3 className="text-base font-bold text-black">Invoicing Details & Parameters</h3>
              <p className="text-xs text-neutral-400 mt-0.5">Customize invoice design header data, prefix, and standard taxes.</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Invoice Number Prefix</label>
                  <input
                    type="text"
                    value={invoicePrefix}
                    onChange={(e) => setInvoicePrefix(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all"
                  />
                </div>

                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Default GST Rate (%)</label>
                  <input
                    type="number"
                    value={defaultTaxRate}
                    onChange={(e) => setDefaultTaxRate(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Invoice Header Company Name</label>
                <input
                  type="text"
                  value={invoiceCompanyDetails}
                  onChange={(e) => setInvoiceCompanyDetails(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Invoice Header Company Address</label>
                <textarea
                  value={invoiceAddress}
                  onChange={(e) => setInvoiceAddress(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all resize-none"
                />
              </div>

              {/* Logo Placeholder */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Corporate Invoice Logo</label>
                <div className="border-2 border-dashed border-neutral-200 rounded-2xl p-6 text-center bg-neutral-50/50 hover:bg-neutral-50 transition-all cursor-pointer">
                  <Image className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                  <p className="text-xs text-neutral-600 font-bold">Upload business logo</p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">PNG, JPG up to 2MB (decorative mock in prototype)</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#f0f0f2] flex justify-end">
              <button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center gap-1.5"
              >
                <Save className="h-4 w-4" />
                Save Invoice Settings
              </button>
            </div>
          </form>
        )}

        {/* 3. User Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-slide-in">
            <div>
              <h3 className="text-base font-bold text-black">My Profile</h3>
              <p className="text-xs text-neutral-400 mt-0.5">Manage credentials and sign out of the prototype dashboard.</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {user?.avatarInitials || 'SRK'}
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-black">{user?.fullName || 'SRK'}</h4>
                  <p className="text-xs text-neutral-400 mt-0.5">{user?.email || 'srk@openspace.ai'}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-[#f0f0f2] flex justify-between items-center">
                <span className="text-xs text-neutral-400">Sign out of OneSpace AI workspace session.</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="bg-red-50 hover:bg-red-100 border border-red-200/50 text-red-600 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
