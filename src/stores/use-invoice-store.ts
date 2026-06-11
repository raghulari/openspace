'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  DEMO_INVOICES,
  getNextInvoiceNumber,
  type DemoInvoice,
  type InvoiceStatus,
} from '@/lib/demo-data'

interface InvoiceConfig {
  companyName: string
  gstNumber: string
  businessAddress: string
  invoicePrefix: string
  defaultTaxRate: number
  logoUrl: string | null
}

interface InvoiceState {
  invoices: DemoInvoice[]
  config: InvoiceConfig
  addInvoice: (invoice: Omit<DemoInvoice, 'invoiceNumber'>) => DemoInvoice
  updateInvoice: (id: string, updates: Partial<DemoInvoice>) => void
  markAsPaid: (id: string) => void
  markAsOverdue: (id: string) => void
  deleteInvoice: (id: string) => void
  getInvoice: (id: string) => DemoInvoice | undefined
  getInvoicesByClient: (clientId: string) => DemoInvoice[]
  getInvoicesByProject: (projectId: string) => DemoInvoice[]
  getInvoicesByStatus: (status: InvoiceStatus) => DemoInvoice[]
  getPaidTotal: () => number
  getPendingTotal: () => number
  getOverdueTotal: () => number
  getClientRevenue: (clientId: string) => number
  getProjectRevenue: (projectId: string) => number
  getNextNumber: () => string
  updateConfig: (updates: Partial<InvoiceConfig>) => void
  initializeDemo: () => void
}

export const useInvoiceStore = create<InvoiceState>()(
  persist(
    (set, get) => ({
      invoices: DEMO_INVOICES,
      config: {
        companyName: 'SRK Enterprise Pvt. Ltd.',
        gstNumber: '27AABCD1234F1Z5',
        businessAddress: '42 MG Road, Bengaluru, Karnataka 560001',
        invoicePrefix: 'INV',
        defaultTaxRate: 18,
        logoUrl: null,
      },

      addInvoice: (invoiceData) => {
        const invoiceNumber = get().getNextNumber()
        const invoice: DemoInvoice = {
          ...invoiceData,
          invoiceNumber,
        }
        set((state) => ({ invoices: [...state.invoices, invoice] }))
        return invoice
      },

      updateInvoice: (id, updates) =>
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === id ? { ...inv, ...updates } : inv
          ),
        })),

      markAsPaid: (id) =>
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === id
              ? {
                  ...inv,
                  status: 'paid' as InvoiceStatus,
                  paidDate: new Date().toISOString().split('T')[0],
                }
              : inv
          ),
        })),

      markAsOverdue: (id) =>
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === id
              ? { ...inv, status: 'overdue' as InvoiceStatus }
              : inv
          ),
        })),

      deleteInvoice: (id) =>
        set((state) => ({
          invoices: state.invoices.filter((inv) => inv.id !== id),
        })),

      getInvoice: (id) => get().invoices.find((inv) => inv.id === id),

      getInvoicesByClient: (clientId) =>
        get().invoices.filter((inv) => inv.clientId === clientId),

      getInvoicesByProject: (projectId) =>
        get().invoices.filter((inv) => inv.projectId === projectId),

      getInvoicesByStatus: (status) =>
        get().invoices.filter((inv) => inv.status === status),

      getPaidTotal: () =>
        get()
          .invoices.filter((inv) => inv.status === 'paid')
          .reduce((sum, inv) => sum + inv.total, 0),

      getPendingTotal: () =>
        get()
          .invoices.filter((inv) => inv.status === 'pending')
          .reduce((sum, inv) => sum + inv.total, 0),

      getOverdueTotal: () =>
        get()
          .invoices.filter((inv) => inv.status === 'overdue')
          .reduce((sum, inv) => sum + inv.total, 0),

      getClientRevenue: (clientId) =>
        get()
          .invoices.filter(
            (inv) => inv.clientId === clientId && inv.status === 'paid'
          )
          .reduce((sum, inv) => sum + inv.total, 0),

      getProjectRevenue: (projectId) =>
        get()
          .invoices.filter(
            (inv) => inv.projectId === projectId && inv.status === 'paid'
          )
          .reduce((sum, inv) => sum + inv.total, 0),

      getNextNumber: () => getNextInvoiceNumber(get().invoices),

      updateConfig: (updates) =>
        set((state) => ({
          config: { ...state.config, ...updates },
        })),

      initializeDemo: () =>
        set({
          invoices: DEMO_INVOICES,
          config: {
            companyName: 'SRK Enterprise Pvt. Ltd.',
            gstNumber: '27AABCD1234F1Z5',
            businessAddress: '42 MG Road, Bengaluru, Karnataka 560001',
            invoicePrefix: 'INV',
            defaultTaxRate: 18,
            logoUrl: null,
          },
        }),
    }),
    {
      name: 'onespace-invoices',
    }
  )
)
