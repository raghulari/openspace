'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Building2,
  Globe,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Database,
  Calendar,
  Mail,
  Loader2,
  Trash2,
  PlusCircle,
  IndianRupee,
} from 'lucide-react'
import {
  saveCompanyInfo,
  getAISuggestions,
  saveOnboardingServices,
  completeOnboarding,
  type SuggestedService,
} from '../actions/setup'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface SetupWizardProps {
  userEmail: string
  fullName: string
}

export function SetupWizard({ userEmail, fullName }: SetupWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isPending, startTransition] = useTransition()
  
  // Workspace ID after step 1
  const [workspaceId, setWorkspaceId] = useState<string>('')

  // Step 1: Company Info State
  const [companyName, setCompanyName] = useState('')
  const [slug, setSlug] = useState('')
  const [industry, setIndustry] = useState('')
  const [teamSize, setTeamSize] = useState('')
  const [gstNumber, setGstNumber] = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [pincode, setPincode] = useState('')
  const [phone, setPhone] = useState('')
  const [companyEmail, setCompanyEmail] = useState(userEmail)

  // Step 2: Integrations State (Simulated)
  const [integrations, setIntegrations] = useState({
    googleDrive: false,
    googleCalendar: false,
    gmail: false,
  })

  // Step 3: AI Configuration State
  const [businessDescription, setBusinessDescription] = useState('')
  const [services, setServices] = useState<SuggestedService[]>([])
  const [isGeneratingServices, setIsGeneratingServices] = useState(false)

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setCompanyName(val)
    setSlug(val.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'))
  }

  // Next Step validation
  const validateStep1 = () => {
    if (!companyName.trim()) {
      toast.error('Company Name is required')
      return false
    }
    if (!slug.trim()) {
      toast.error('URL Slug is required')
      return false
    }
    if (!industry) {
      toast.error('Please select an industry')
      return false
    }
    if (!teamSize) {
      toast.error('Please select team size')
      return false
    }
    if (!addressLine1.trim()) {
      toast.error('Address Line 1 is required')
      return false
    }
    if (!city.trim()) {
      toast.error('City is required')
      return false
    }
    if (!state.trim()) {
      toast.error('State is required')
      return false
    }
    if (!pincode.trim()) {
      toast.error('Pincode is required')
      return false
    }
    if (!phone.trim()) {
      toast.error('Phone number is required')
      return false
    }
    if (!companyEmail.trim()) {
      toast.error('Company email is required')
      return false
    }
    return true
  }

  const handleStep1Submit = () => {
    if (!validateStep1()) return

    startTransition(async () => {
      const res = await saveCompanyInfo({
        workspaceId: workspaceId || undefined,
        name: companyName,
        slug,
        industry,
        teamSize,
        gstNumber,
        addressLine1,
        addressLine2,
        city,
        state,
        pincode,
        phone,
        email: companyEmail,
      })

      if (res.success && res.workspaceId) {
        setWorkspaceId(res.workspaceId)
        toast.success(workspaceId ? 'Company info updated' : 'Workspace created successfully!')
        setCurrentStep(2)
      } else {
        toast.error(res.message || 'Failed to save workspace details')
      }
    })
  }

  // Google OAuth flow simulation
  const simulateConnect = (type: 'googleDrive' | 'googleCalendar' | 'gmail') => {
    const label = type === 'googleDrive' ? 'Google Drive' : type === 'googleCalendar' ? 'Google Calendar' : 'Gmail'
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: `Connecting to ${label}...`,
        success: () => {
          setIntegrations(prev => ({ ...prev, [type]: true }))
          return `${label} connected successfully!`
        },
        error: `Failed to connect ${label}`,
      }
    )
  }

  // Step 3 Actions: AI Suggestions
  const handleGenerateAISuggestions = async () => {
    if (!businessDescription || businessDescription.trim().length < 10) {
      toast.error('Please describe your business in at least 10 characters')
      return
    }

    setIsGeneratingServices(true)
    try {
      const res = await getAISuggestions(businessDescription)
      if (res.success && res.suggestions) {
        setServices(res.suggestions)
        toast.success('AI successfully generated standard services for you!')
      } else {
        toast.error(res.message || 'Failed to generate suggestions')
      }
    } catch (err: any) {
      toast.error('An error occurred during suggestions generation')
    } finally {
      setIsGeneratingServices(false)
    }
  }

  // Add custom service row
  const addCustomService = () => {
    setServices(prev => [
      ...prev,
      {
        name: 'New Custom Service',
        rate: 5000,
        unit: 'per_project',
        category: 'Services',
        description: 'Provide custom operational services to clients.',
      },
    ])
  }

  // Update service details
  const updateServiceDetail = (index: number, key: keyof SuggestedService, value: any) => {
    setServices(prev => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [key]: value }
      return copy
    })
  }

  // Delete service row
  const removeService = (index: number) => {
    setServices(prev => prev.filter((_, i) => i !== index))
  }

  // Step 3 Submit
  const handleStep3Submit = () => {
    if (services.length === 0) {
      toast.error('Please add or generate at least one service before proceeding')
      return
    }

    startTransition(async () => {
      const saveRes = await saveOnboardingServices(workspaceId, services)
      if (!saveRes.success) {
        toast.error(saveRes.message || 'Failed to save billing services')
        return
      }

      const completeRes = await completeOnboarding(workspaceId)
      if (completeRes.success) {
        toast.success('Setup completed!')
        setCurrentStep(4)
      } else {
        toast.error(completeRes.message || 'Failed to finalize setup')
      }
    })
  }

  const handleFinish = () => {
    router.push('/dashboard')
    router.refresh()
  }

  const progressPercentage = (currentStep / 4) * 100

  return (
    <div className="mx-auto max-w-4xl py-6 animate-fade-in">
      {/* ── Progress bar and steps description ── */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm font-semibold text-[#64748b] mb-2">
          <span>SETUP PROGRESS</span>
          <span>STEP {currentStep} OF 4</span>
        </div>
        <Progress value={progressPercentage} className="h-2 bg-[#e2e8f0]" />
        
        {/* Step Indicators */}
        <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs font-medium text-[#94a3b8]">
          <span className={currentStep >= 1 ? 'text-[#7c3aed] font-bold' : ''}>1. Company Profile</span>
          <span className={currentStep >= 2 ? 'text-[#7c3aed] font-bold' : ''}>2. Google Workspace</span>
          <span className={currentStep >= 3 ? 'text-[#7c3aed] font-bold' : ''}>3. AI Configuration</span>
          <span className={currentStep >= 4 ? 'text-[#7c3aed] font-bold' : ''}>4. Complete!</span>
        </div>
      </div>

      {/* ── STEP 1: Company Profile ── */}
      {currentStep === 1 && (
        <Card className="border border-[#e2e8f0] bg-white shadow-xl shadow-slate-100 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-[#f1f5f9] bg-[#f8fafc] p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#7c3aed]/10 p-2.5 text-[#7c3aed]">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-[#0f172a]">Company Profile</CardTitle>
                <CardDescription className="text-sm text-[#64748b]">Configure your workspace business registration detail</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Company Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">Company Name *</label>
                <Input
                  placeholder="e.g. Acme Agency"
                  value={companyName}
                  onChange={handleNameChange}
                  className="rounded-xl border-[#e2e8f0] focus:ring-[#7c3aed]"
                />
              </div>

              {/* Workspace Slug */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">Workspace URL *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#94a3b8] select-none">
                    onespace.ai/
                  </span>
                  <Input
                    placeholder="acme-agency"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    className="pl-24 rounded-xl border-[#e2e8f0]"
                  />
                </div>
              </div>

              {/* Industry */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">Industry *</label>
                <Select value={industry} onValueChange={(val) => setIndustry(val || '')}>
                  <SelectTrigger className="rounded-xl border-[#e2e8f0]">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Consulting & Advisory">Consulting & Advisory</SelectItem>
                    <SelectItem value="Software & IT Services">Software & IT Services</SelectItem>
                    <SelectItem value="Design & Marketing">Design & Marketing</SelectItem>
                    <SelectItem value="Education & EdTech">Education & EdTech</SelectItem>
                    <SelectItem value="Real Estate & Construction">Real Estate & Construction</SelectItem>
                    <SelectItem value="Healthcare & Wellness">Healthcare & Wellness</SelectItem>
                    <SelectItem value="Other Professional Services">Other Professional Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Team Size */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">Team Size *</label>
                <Select value={teamSize} onValueChange={(val) => setTeamSize(val || '')}>
                  <SelectTrigger className="rounded-xl border-[#e2e8f0]">
                    <SelectValue placeholder="Select team size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 (Self-employed)">1 (Self-employed)</SelectItem>
                    <SelectItem value="2-10 employees">2-10 employees</SelectItem>
                    <SelectItem value="11-50 employees">11-50 employees</SelectItem>
                    <SelectItem value="51-200 employees">51-200 employees</SelectItem>
                    <SelectItem value="200+ employees">200+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* GST Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">GSTIN Number (Optional)</label>
                <Input
                  placeholder="e.g. 27AAAAA0000A1Z5"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                  className="rounded-xl border-[#e2e8f0]"
                />
              </div>

              {/* Business Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">Business Email *</label>
                <Input
                  type="email"
                  placeholder="billing@company.com"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  className="rounded-xl border-[#e2e8f0]"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">Business Phone *</label>
                <Input
                  placeholder="e.g. +91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="rounded-xl border-[#e2e8f0]"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4 pt-4 border-t border-[#f1f5f9]">
              <h3 className="text-sm font-bold text-[#0f172a]">Billing Address</h3>
              
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">Address Line 1 *</label>
                  <Input
                    placeholder="Suite/Flat#, Building Name, Street Address"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    className="rounded-xl border-[#e2e8f0]"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">Address Line 2 (Optional)</label>
                  <Input
                    placeholder="Locality, Landmark"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    className="rounded-xl border-[#e2e8f0]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">City *</label>
                    <Input
                      placeholder="e.g. Mumbai"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="rounded-xl border-[#e2e8f0]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">State *</label>
                    <Input
                      placeholder="e.g. Maharashtra"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="rounded-xl border-[#e2e8f0]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">Pincode *</label>
                    <Input
                      placeholder="e.g. 400001"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="rounded-xl border-[#e2e8f0]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t border-[#f1f5f9] bg-[#f8fafc] px-6 py-4 flex justify-end">
            <Button
              onClick={handleStep1Submit}
              disabled={isPending}
              className="rounded-xl bg-[#7c3aed] text-white hover:bg-[#6d28d9] px-6 py-5 shadow-lg shadow-[#7c3aed]/20"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Workspace...
                </>
              ) : (
                <>
                  Next Step
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* ── STEP 2: Google Workspace Integrations ── */}
      {currentStep === 2 && (
        <Card className="border border-[#e2e8f0] bg-white shadow-xl shadow-slate-100 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-[#f1f5f9] bg-[#f8fafc] p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#7c3aed]/10 p-2.5 text-[#7c3aed]">
                <Globe className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-[#0f172a]">Connect Google Workspace</CardTitle>
                <CardDescription className="text-sm text-[#64748b]">Integrate Google Drive, Calendar, and Gmail to centralize business assets</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Google Drive Connection Card */}
              <div className="flex flex-col justify-between rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-5 transition-all hover:shadow-md hover:border-[#7c3aed]/30">
                <div>
                  <div className="mb-4 inline-flex rounded-xl bg-blue-50 p-3 text-blue-600">
                    <Database className="h-6 w-6" />
                  </div>
                  <h4 className="text-base font-bold text-[#0f172a] mb-1">Google Drive</h4>
                  <p className="text-xs text-[#64748b] leading-relaxed mb-4">
                    Allows Onespace AI to auto-create client folders, store contracts, and keep invoices synced in your Drive.
                  </p>
                </div>
                <Button
                  onClick={() => simulateConnect('googleDrive')}
                  variant={integrations.googleDrive ? 'outline' : 'default'}
                  className={`w-full rounded-xl py-5 ${
                    integrations.googleDrive
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100/70 hover:text-emerald-800'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {integrations.googleDrive ? '✓ Connected' : 'Connect Drive'}
                </Button>
              </div>

              {/* Google Calendar Connection Card */}
              <div className="flex flex-col justify-between rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-5 transition-all hover:shadow-md hover:border-[#7c3aed]/30">
                <div>
                  <div className="mb-4 inline-flex rounded-xl bg-amber-50 p-3 text-amber-600">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <h4 className="text-base font-bold text-[#0f172a] mb-1">Google Calendar</h4>
                  <p className="text-xs text-[#64748b] leading-relaxed mb-4">
                    Sync clients meetings, automatically schedule invoice follow-ups, and keep track of contract renewal dates.
                  </p>
                </div>
                <Button
                  onClick={() => simulateConnect('googleCalendar')}
                  variant={integrations.googleCalendar ? 'outline' : 'default'}
                  className={`w-full rounded-xl py-5 ${
                    integrations.googleCalendar
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100/70 hover:text-emerald-800'
                      : 'bg-amber-600 hover:bg-amber-700 text-white'
                  }`}
                >
                  {integrations.googleCalendar ? '✓ Connected' : 'Connect Calendar'}
                </Button>
              </div>

              {/* Gmail Connection Card */}
              <div className="flex flex-col justify-between rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-5 transition-all hover:shadow-md hover:border-[#7c3aed]/30">
                <div>
                  <div className="mb-4 inline-flex rounded-xl bg-red-50 p-3 text-red-600">
                    <Mail className="h-6 w-6" />
                  </div>
                  <h4 className="text-base font-bold text-[#0f172a] mb-1">Gmail Account</h4>
                  <p className="text-xs text-[#64748b] leading-relaxed mb-4">
                    Send invoice PDFs directly to clients from your workspace email address and track response threads automatically.
                  </p>
                </div>
                <Button
                  onClick={() => simulateConnect('gmail')}
                  variant={integrations.gmail ? 'outline' : 'default'}
                  className={`w-full rounded-xl py-5 ${
                    integrations.gmail
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100/70 hover:text-emerald-800'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {integrations.gmail ? '✓ Connected' : 'Connect Gmail'}
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-xs text-blue-800 leading-relaxed">
              <strong>💡 Integration Note</strong>: You can click the &quot;Connect&quot; buttons above to simulate Google Workspace connection for the dashboard testing, or you can skip this step and configure OAuth details under workspace settings later.
            </div>
          </CardContent>
          <CardFooter className="border-t border-[#f1f5f9] bg-[#f8fafc] px-6 py-4 flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(1)}
              className="rounded-xl border-[#e2e8f0] text-[#64748b] px-4 py-5"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => setCurrentStep(3)}
                className="rounded-xl text-[#7c3aed] px-4 py-5 hover:bg-[#7c3aed]/5"
              >
                Skip for now
              </Button>
              
              <Button
                onClick={() => setCurrentStep(3)}
                className="rounded-xl bg-[#7c3aed] text-white hover:bg-[#6d28d9] px-6 py-5 shadow-lg shadow-[#7c3aed]/20"
              >
                Next Step
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}

      {/* ── STEP 3: AI Configuration ── */}
      {currentStep === 3 && (
        <Card className="border border-[#e2e8f0] bg-white shadow-xl shadow-slate-100 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-[#f1f5f9] bg-[#f8fafc] p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#7c3aed]/10 p-2.5 text-[#7c3aed]">
                  <Sparkles className="h-6 w-6 animate-pulse" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-[#0f172a]">AI Business Onboarding</CardTitle>
                  <CardDescription className="text-sm text-[#64748b]">Describe your business offerings, and let AI generate your billing catalog.</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                Describe what your business does & the services you offer *
              </label>
              <Textarea
                placeholder="e.g. We are a software agency specialized in custom Next.js/SaaS web applications and mobile apps. We also offer UI/UX designs, tech consultancy charged hourly, and monthly maintenance plans..."
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
                rows={4}
                className="rounded-xl border-[#e2e8f0] focus:ring-[#7c3aed]"
              />
              <p className="text-xs text-[#94a3b8]">
                Describe your services, billing methods (hourly/retainer/project-based), and industry. Our Gemini model will auto-create your service inventory.
              </p>
            </div>

            <Button
              onClick={handleGenerateAISuggestions}
              disabled={isGeneratingServices}
              className="rounded-xl bg-[#0f1729] text-white hover:bg-slate-800 px-5 py-5 w-full flex items-center justify-center gap-2"
            >
              {isGeneratingServices ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[#7c3aed]" />
                  Gemini is analyzing your business profile...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  Generate Services Inventory with AI
                </>
              )}
            </Button>

            {/* Generated Services Catalog */}
            {services.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-[#f1f5f9]">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#0f172a]">AI Generated Services Catalog</h4>
                  <Button
                    onClick={addCustomService}
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-[#e2e8f0] text-xs h-9"
                  >
                    <PlusCircle className="mr-1 h-3.5 w-3.5 text-[#7c3aed]" />
                    Add Service
                  </Button>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {services.map((service, index) => (
                    <div
                      key={index}
                      className="group flex flex-col gap-3 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-4 transition-all hover:border-[#7c3aed]/20"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <Input
                          value={service.name}
                          onChange={(e) => updateServiceDetail(index, 'name', e.target.value)}
                          className="font-bold text-sm bg-transparent border-transparent group-hover:border-[#e2e8f0] rounded-lg h-8 focus:bg-white"
                          placeholder="Service Name"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeService(index)}
                          className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {/* Rate */}
                        <div className="relative">
                          <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#94a3b8]" />
                          <Input
                            type="number"
                            value={service.rate}
                            onChange={(e) => updateServiceDetail(index, 'rate', parseFloat(e.target.value) || 0)}
                            className="pl-8 text-xs rounded-xl h-9 bg-white"
                            placeholder="Rate (₹)"
                          />
                        </div>

                        {/* Unit */}
                        <Select
                          value={service.unit}
                          onValueChange={(val) => { if (val) updateServiceDetail(index, 'unit', val as any) }}
                        >
                          <SelectTrigger className="rounded-xl text-xs h-9 bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="per_project">per project</SelectItem>
                            <SelectItem value="per_hour">per hour</SelectItem>
                            <SelectItem value="per_month">per month</SelectItem>
                            <SelectItem value="per_unit">per unit</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Category */}
                        <Input
                          value={service.category}
                          onChange={(e) => updateServiceDetail(index, 'category', e.target.value)}
                          className="text-xs rounded-xl h-9 bg-white"
                          placeholder="Category"
                        />
                      </div>

                      {/* Description */}
                      <Input
                        value={service.description}
                        onChange={(e) => updateServiceDetail(index, 'description', e.target.value)}
                        className="text-xs text-[#64748b] bg-transparent border-transparent group-hover:border-[#e2e8f0] rounded-lg h-8 focus:bg-white"
                        placeholder="Description for invoices"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t border-[#f1f5f9] bg-[#f8fafc] px-6 py-4 flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(2)}
              className="rounded-xl border-[#e2e8f0] text-[#64748b] px-4 py-5"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            <Button
              onClick={handleStep3Submit}
              disabled={isPending || services.length === 0}
              className="rounded-xl bg-[#7c3aed] text-white hover:bg-[#6d28d9] px-6 py-5 shadow-lg shadow-[#7c3aed]/20"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Configuration...
                </>
              ) : (
                <>
                  Complete Setup
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* ── STEP 4: Success / Completion ── */}
      {currentStep === 4 && (
        <Card className="border border-[#e2e8f0] bg-white shadow-xl shadow-slate-100 rounded-2xl overflow-hidden p-8 text-center space-y-6">
          <div className="mx-auto inline-flex items-center justify-center rounded-full bg-emerald-50 p-6 text-emerald-500 animate-bounce">
            <CheckCircle2 className="h-16 w-16" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[#0f172a]">Configuration Successful!</h2>
            <p className="text-sm text-[#64748b] max-w-md mx-auto leading-relaxed">
              Your business workspace <strong>{companyName}</strong> has been initialized successfully. Onespace AI is ready to automate your client files, invoices, and operations.
            </p>
          </div>

          <div className="max-w-md mx-auto grid grid-cols-2 gap-4 text-left border-t border-[#f1f5f9] pt-6 text-xs text-[#64748b]">
            <div className="space-y-1">
              <span className="font-semibold text-slate-400 uppercase">BUSINESS INFO</span>
              <p className="font-bold text-[#0f172a]">{companyName}</p>
              <p>{industry}</p>
            </div>
            <div className="space-y-1">
              <span className="font-semibold text-slate-400 uppercase">INVENTORY ADDED</span>
              <p className="font-bold text-[#0f172a]">{services.length} Billing Services</p>
              <p>Currencies: INR Only (₹)</p>
            </div>
          </div>

          <Button
            onClick={handleFinish}
            className="w-full max-w-sm rounded-xl bg-[#7c3aed] text-white hover:bg-[#6d28d9] px-6 py-6 shadow-lg shadow-[#7c3aed]/20 text-sm font-semibold"
          >
            Launch Onespace AI Dashboard
          </Button>
        </Card>
      )}
    </div>
  )
}
