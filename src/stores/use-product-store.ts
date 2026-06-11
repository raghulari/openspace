'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  DEMO_PRODUCTS,
  DEMO_STOCK_MOVEMENTS,
  type DemoProduct,
  type StockMovement,
} from '@/lib/demo-data'

interface ProductState {
  products: DemoProduct[]
  stockMovements: StockMovement[]
  addProduct: (product: DemoProduct) => void
  updateProduct: (id: string, updates: Partial<DemoProduct>) => void
  deleteProduct: (id: string) => void
  getProduct: (id: string) => DemoProduct | undefined
  reduceStock: (productId: string, quantity: number, invoiceId: string) => void
  restockProduct: (productId: string, quantity: number, note: string) => void
  getLowStockProducts: () => DemoProduct[]
  getOutOfStockProducts: () => DemoProduct[]
  initializeDemo: () => void
}

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: DEMO_PRODUCTS,
      stockMovements: DEMO_STOCK_MOVEMENTS,

      addProduct: (product) =>
        set((state) => ({ products: [...state.products, product] })),

      updateProduct: (id, updates) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),

      getProduct: (id) => get().products.find((p) => p.id === id),

      reduceStock: (productId, quantity, invoiceId) =>
        set((state) => {
          const product = state.products.find((p) => p.id === productId)
          if (!product) return state
          const newMovement: StockMovement = {
            id: `sm-${Date.now()}`,
            productId,
            type: 'sale',
            quantity,
            date: new Date().toISOString().split('T')[0],
            invoiceId,
            note: `Invoice sale`,
          }
          return {
            products: state.products.map((p) =>
              p.id === productId
                ? { ...p, stockQuantity: Math.max(0, p.stockQuantity - quantity) }
                : p
            ),
            stockMovements: [...state.stockMovements, newMovement],
          }
        }),

      restockProduct: (productId, quantity, note) =>
        set((state) => {
          const newMovement: StockMovement = {
            id: `sm-${Date.now()}`,
            productId,
            type: 'restock',
            quantity,
            date: new Date().toISOString().split('T')[0],
            invoiceId: null,
            note,
          }
          return {
            products: state.products.map((p) =>
              p.id === productId
                ? { ...p, stockQuantity: p.stockQuantity + quantity }
                : p
            ),
            stockMovements: [...state.stockMovements, newMovement],
          }
        }),

      getLowStockProducts: () =>
        get().products.filter(
          (p) => p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold
        ),

      getOutOfStockProducts: () =>
        get().products.filter((p) => p.stockQuantity === 0),

      initializeDemo: () =>
        set({ products: DEMO_PRODUCTS, stockMovements: DEMO_STOCK_MOVEMENTS }),
    }),
    {
      name: 'onespace-products',
    }
  )
)
