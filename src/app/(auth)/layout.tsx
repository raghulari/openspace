import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Onespace AI – Authentication',
  description: 'Sign in or create your Onespace AI account',
}

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-mesh px-4 py-12">
      {/* Auth card */}
      <div className="relative z-10 w-full max-w-[480px]">
        <div className="rounded-2xl glass p-8 shadow-2xl sm:p-10">
          {children}
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} OpenSpace. All rights reserved.
        </p>
      </div>
    </div>
  )
}
