'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Briefcase, Package, Layers, ChevronRight, ChevronLeft, Building, MapPin, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/stores/use-auth-store'
import { useWorkspaceStore } from '@/stores/use-workspace-store'
import { useInvoiceStore } from '@/stores/use-invoice-store'
import { type BusinessType, DEMO_WORKSPACE } from '@/lib/demo-data'
import { toast } from 'sonner'

export default function SetupPage() {
  const router = useRouter()
  const { setHasCompletedSetup, user } = useAuthStore()
  const { setWorkspace } = useWorkspaceStore()
  const { updateConfig } = useInvoiceStore()
  
  const [step, setStep] = useState(1)
  const [workspaceName, setWorkspaceName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [businessType, setBusinessType] = useState<BusinessType>('hybrid')
  
  // Optional / tax fields
  const [gstNumber, setGstNumber] = useState('')
  const [businessAddress, setBusinessAddress] = useState('')
  const [taxRate, setTaxRate] = useState(18)
  const [invoicePrefix, setInvoicePrefix] = useState('INV')

  const handleNext = () => {
    if (step === 1 && (!workspaceName.trim() || !companyName.trim())) {
      toast.error('Please fill in both Workspace and Company name')
      return
    }
    setStep(step + 1)
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleComplete = () => {
    try {
      const newWorkspace = {
        id: `ws-${Date.now()}`,
        name: workspaceName,
        companyName,
        businessType,
        teamMembersCount: 1,
        departments: ['Engineering', 'Operations'],
        gstNumber,
        businessAddress,
        invoicePrefix,
        defaultTaxRate: taxRate,
        logoUrl: null
      }
      
      // Update stores
      setWorkspace(newWorkspace)
      setHasCompletedSetup(true)
      
      // Seed invoice config details
      updateConfig({
        companyName,
        businessAddress,
        gstNumber,
        defaultTaxRate: taxRate,
        invoicePrefix: invoicePrefix,
      })
      
      toast.success('Workspace initialized successfully!')
      router.push('/dashboard')
    } catch (err) {
      toast.error('Failed to initialize workspace')
    }
  }

  const handleSeedDemo = () => {
    try {
      setWorkspace(DEMO_WORKSPACE)
      setHasCompletedSetup(true)
      
      updateConfig({
        companyName: DEMO_WORKSPACE.companyName,
        businessAddress: DEMO_WORKSPACE.businessAddress,
        gstNumber: DEMO_WORKSPACE.gstNumber,
        defaultTaxRate: DEMO_WORKSPACE.defaultTaxRate,
        invoicePrefix: DEMO_WORKSPACE.invoicePrefix,
      })
      
      toast.success('Demo workspace initialized successfully!')
      router.push('/dashboard')
    } catch (err) {
      toast.error('Failed to seed demo data')
    }
  }

  return (
    <div className="min-h-screen bg-mesh flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full mx-auto my-auto glass rounded-3xl p-8 sm:p-10 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 pb-6 border-b border-[#f0f0f2]">
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-bold tracking-tight text-black">OneSpace</span>
            <span className="bg-primary text-white px-1.5 py-0.5 rounded text-[10px] font-bold">AI</span>
          </div>
          <button 
            onClick={handleSeedDemo}
            className="text-xs text-neutral-500 hover:text-black font-medium transition-colors"
          >
            Skip & Seed Demo Data
          </button>
        </div>

        {/* Stepper Progress */}
        <div className="flex items-center gap-2 mb-8">
          <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-black' : 'bg-neutral-200'}`} />
          <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-black' : 'bg-neutral-200'}`} />
          <div className={`h-1.5 flex-1 rounded-full ${step >= 3 ? 'bg-black' : 'bg-neutral-200'}`} />
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-slide-in">
            <div>
              <h2 className="text-2xl font-bold text-black tracking-tight">Create your workspace</h2>
              <p className="text-sm text-neutral-500 mt-1">First, let&apos;s get some basic details about your business.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Workspace Name</label>
                <div className="relative">
                  <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    placeholder="e.g. SRK Operations, My Creative Agency"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Company Legal Name</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. SRK Enterprise Pvt. Ltd."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-slide-in">
            <div>
              <h2 className="text-2xl font-bold text-black tracking-tight">Select your business model</h2>
              <p className="text-sm text-neutral-500 mt-1">This will show or hide specific modules to keep your dashboard clean.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button
                type="button"
                onClick={() => setBusinessType('service')}
                className={`flex items-start gap-4 p-5 rounded-2xl border text-left transition-all ${
                  businessType === 'service' ? 'border-black bg-neutral-50 ring-1 ring-black' : 'border-neutral-200 hover:border-neutral-400'
                }`}
              >
                <div className="p-3 bg-primary text-white rounded-xl">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-black text-sm">Service-Based</h4>
                  <p className="text-xs text-neutral-500 mt-1">For agencies, freelancers, consultants. Enables Clients, Projects, Services, Invoices.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setBusinessType('product')}
                className={`flex items-start gap-4 p-5 rounded-2xl border text-left transition-all ${
                  businessType === 'product' ? 'border-black bg-neutral-50 ring-1 ring-black' : 'border-neutral-200 hover:border-neutral-400'
                }`}
              >
                <div className="p-3 bg-primary text-white rounded-xl">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-black text-sm">Product-Based</h4>
                  <p className="text-xs text-neutral-500 mt-1">For retailers, manufacturers, e-commerce. Enables Products, Inventory, Invoices. Hides Projects.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setBusinessType('hybrid')}
                className={`flex items-start gap-4 p-5 rounded-2xl border text-left transition-all ${
                  businessType === 'hybrid' ? 'border-black bg-neutral-50 ring-1 ring-black' : 'border-neutral-200 hover:border-neutral-400'
                }`}
              >
                <div className="p-3 bg-primary text-white rounded-xl">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-black text-sm">Hybrid Business</h4>
                  <p className="text-xs text-neutral-500 mt-1">For businesses offering both products and services. Enables all system modules.</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-slide-in">
            <div>
              <h2 className="text-2xl font-bold text-black tracking-tight">Tax & Invoice setup (Optional)</h2>
              <p className="text-sm text-neutral-500 mt-1">Configure your billing parameters. All values in ₹ (INR).</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">GST Number</label>
                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    placeholder="e.g. 29AAAAA0000A1Z1"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Default GST (%)</label>
                  <input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Invoice Number Prefix</label>
                <input
                  type="text"
                  value={invoicePrefix}
                  onChange={(e) => setInvoicePrefix(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Business Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                  <textarea
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    placeholder="Enter full billing address..."
                    rows={3}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 text-sm outline-none focus:border-black transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex justify-between items-center mt-10 pt-6 border-t border-[#f0f0f2]">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-neutral-600 hover:text-black font-semibold transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
            >
              Complete Setup
            </button>
          )}
        </div>
      </div>
      
      <p className="text-center text-xs text-neutral-400 mt-6">
        Logged in as <span className="font-semibold text-neutral-600">{user?.fullName || 'SRK'}</span>
      </p>
    </div>
  )
}
