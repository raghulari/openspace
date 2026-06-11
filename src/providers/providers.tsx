'use client'

import { type ReactNode } from 'react'
import { Toaster } from 'sonner'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#ffffff',
            border: '1px solid #e4e4e7',
            borderRadius: '12px',
            fontSize: '14px',
            color: '#09090b',
          },
        }}
      />
    </>
  )
}
