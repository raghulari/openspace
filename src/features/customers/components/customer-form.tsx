'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createCustomer, updateCustomer, type CustomerData } from '../actions/customers'
import { Loader2, Plus, X } from 'lucide-react'

interface CustomerFormProps {
  workspaceId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  customer?: any // If provided, we are editing this customer
  onSuccess?: () => void
}

export function CustomerForm({
  workspaceId,
  open,
  onOpenChange,
  customer,
  onSuccess,
}: CustomerFormProps) {
  const [isPending, startTransition] = useTransition()
  const isEditing = !!customer

  // Form states
  const [name, setName] = useState(customer?.name || '')
  const [email, setEmail] = useState(customer?.email || '')
  const [phone, setPhone] = useState(customer?.phone || '')
  const [company, setCompany] = useState(customer?.company || '')
  const [gstNumber, setGstNumber] = useState(customer?.gst_number || '')
  const [address, setAddress] = useState(customer?.address || '')
  const [city, setCity] = useState(customer?.city || '')
  const [state, setState] = useState(customer?.state || '')
  const [pincode, setPincode] = useState(customer?.pincode || '')
  const [country, setCountry] = useState(customer?.country || 'India')
  const [status, setStatus] = useState<'active' | 'inactive'>(customer?.status || 'active')
  const [notes, setNotes] = useState(customer?.notes || '')
  
  // Tags state
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>(customer?.tags || [])

  // Handle adding tag
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  // Handle removing tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Customer Name is required')
      return
    }

    const payload: CustomerData = {
      name,
      email,
      phone,
      company,
      gstNumber: gstNumber || undefined,
      address: address || undefined,
      city: city || undefined,
      state: state || undefined,
      pincode: pincode || undefined,
      country,
      status,
      tags,
      notes: notes || undefined,
    }

    startTransition(async () => {
      let res
      if (isEditing) {
        res = await updateCustomer(workspaceId, customer.id, payload)
      } else {
        res = await createCustomer(workspaceId, payload)
      }

      if (res.success) {
        toast.success(isEditing ? 'Customer details updated!' : 'Customer created successfully!')
        onOpenChange(false)
        if (onSuccess) onSuccess()
      } else {
        toast.error(res.message || 'Something went wrong')
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl overflow-y-auto bg-white border-l border-[#e2e8f0]">
        <SheetHeader className="border-b border-[#f1f5f9] pb-4 mb-4">
          <SheetTitle className="text-xl font-bold text-[#0f172a]">
            {isEditing ? 'Edit Customer Details' : 'Add New Customer'}
          </SheetTitle>
          <SheetDescription className="text-sm text-[#64748b]">
            {isEditing
              ? 'Modify the client profile, billing details, and notes below.'
              : 'Add customer details to manage invoices, documents, and workflows.'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer Name */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">Customer Name *</label>
              <Input
                placeholder="e.g. Aditi Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl border-[#e2e8f0]"
                required
              />
            </div>

            {/* Company Name */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">Company Name</label>
              <Input
                placeholder="e.g. GreenLeaf Pvt Ltd"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="rounded-xl border-[#e2e8f0]"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">Email Address</label>
              <Input
                type="email"
                placeholder="client@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border-[#e2e8f0]"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">Phone Number</label>
              <Input
                placeholder="e.g. +91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-xl border-[#e2e8f0]"
              />
            </div>

            {/* GST Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">GST Number</label>
              <Input
                placeholder="e.g. 27AAAAA0000A1Z5"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                className="rounded-xl border-[#e2e8f0]"
              />
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">Status</label>
              <Select
                value={status}
                onValueChange={(val) => { if (val) setStatus(val as any) }}
              >
                <SelectTrigger className="rounded-xl border-[#e2e8f0]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">Customer Tags</label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="e.g. Retainer, Enterprise"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
                className="rounded-xl border-[#e2e8f0]"
              />
              <Button
                type="button"
                onClick={handleAddTag}
                variant="outline"
                className="rounded-xl border-[#e2e8f0]"
              >
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-dashed border-[#e2e8f0] bg-[#f8fafc]">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-[#7c3aed]/10 px-2.5 py-0.5 text-xs font-medium text-[#7c3aed]"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-[#7c3aed] hover:bg-[#7c3aed]/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Address info */}
          <div className="space-y-4 pt-4 border-t border-[#f1f5f9]">
            <h3 className="text-sm font-bold text-[#0f172a]">Billing Address</h3>
            
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">Street Address</label>
                <Input
                  placeholder="Office, Flat, Building, Street Name"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="rounded-xl border-[#e2e8f0]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">City</label>
                  <Input
                    placeholder="e.g. Bangalore"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="rounded-xl border-[#e2e8f0]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">State</label>
                  <Input
                    placeholder="e.g. Karnataka"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="rounded-xl border-[#e2e8f0]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">Pincode</label>
                  <Input
                    placeholder="e.g. 560001"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="rounded-xl border-[#e2e8f0]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">Country</label>
                  <Input
                    placeholder="e.g. India"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="rounded-xl border-[#e2e8f0]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5 pt-4 border-t border-[#f1f5f9]">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">Internal Notes</label>
            <Textarea
              placeholder="e.g. Primary contact is Aditi. Prefer invoices sent on 1st of every month..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="rounded-xl border-[#e2e8f0]"
            />
          </div>

          <SheetFooter className="border-t border-[#f1f5f9] pt-4 flex gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-[#e2e8f0] text-[#64748b]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-[#7c3aed] text-white hover:bg-[#6d28d9] shadow-lg shadow-[#7c3aed]/20"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Saving...' : 'Adding...'}
                </>
              ) : isEditing ? (
                'Save Changes'
              ) : (
                'Add Customer'
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
