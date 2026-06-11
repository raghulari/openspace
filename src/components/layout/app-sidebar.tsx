'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  FileText,
  FolderOpen,
  Bot,
  CalendarDays,
  Zap,
  CheckSquare,
  BarChart3,
  Settings,
  Package,
  Briefcase,
  FolderKanban,
  Warehouse,
  UserCog,
  ChevronsUpDown,
  Command
} from 'lucide-react'
import { useWorkspaceStore } from '@/stores/use-workspace-store'
import { useAuthStore } from '@/stores/use-auth-store'

export function AppSidebar() {
  const pathname = usePathname()
  const { workspace } = useWorkspaceStore()
  const { user } = useAuthStore()

  const businessType = workspace?.businessType || 'hybrid'

  const originalNavItems = [
    { label: 'Customers (Legacy)', icon: Users, href: '/customers' },
    { label: 'Tasks (Legacy)', icon: CheckSquare, href: '/tasks' },
    { label: 'Reports (Legacy)', icon: BarChart3, href: '/reports' },
    { label: 'Documents', icon: FolderOpen, href: '/documents' },
    { label: 'AI Copilot', icon: Bot, href: '/copilot' },
    { label: 'Automations', icon: Zap, href: '/automations' },
  ]

  const mainNavItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', show: true },
    { label: 'Clients', icon: Users, href: '/clients', show: true },
    { 
      label: 'Products', 
      icon: Package, 
      href: '/products', 
      show: businessType === 'product' || businessType === 'hybrid' 
    },
    { label: 'Services', icon: Briefcase, href: '/services', show: true },
    { 
      label: 'Projects', 
      icon: FolderKanban, 
      href: '/projects', 
      show: businessType === 'service' || businessType === 'hybrid' 
    },
    { label: 'Invoices', icon: FileText, href: '/invoices', show: true },
    { 
      label: 'Inventory', 
      icon: Warehouse, 
      href: '/inventory', 
      show: businessType === 'product' || businessType === 'hybrid' 
    },
    { label: 'Team', icon: UserCog, href: '/team', show: true },
    { label: 'Calendar', icon: CalendarDays, href: '/calendar', show: true },
    { label: 'Analytics', icon: BarChart3, href: '/analytics', show: true },
    { label: 'Settings', icon: Settings, href: '/settings', show: true },
  ]

  const displayName = user?.fullName || 'SRK'
  const displayEmail = user?.email || 'srk@openspace.ai'
  const initials = user?.avatarInitials || 'SRK'

  return (
    <aside className="flex h-full w-[280px] shrink-0 flex-col relative z-20 overflow-hidden">
      {/* Absolute Frosted Background Plate */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-white/10 backdrop-blur-[24px] border-r border-white/40 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)] pointer-events-none" />

      {/* ── Workspace & Logo Header ── */}
      <div className="p-6 relative z-10">
        <div className="flex items-center gap-3 px-2 pb-6 mb-2 border-b border-white/30">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full shadow-sm ring-1 ring-white/20 overflow-hidden bg-white/10">
            <img src="/logo.png" alt="OpenSpace Logo" className="h-full w-full object-cover drop-shadow-sm" />
          </div>
          <span className="text-2xl font-black tracking-tight text-foreground font-sans lowercase drop-shadow-sm">
            openspace
          </span>
        </div>

        <button className="w-full flex items-center justify-between rounded-xl hover:bg-white/40 p-2.5 transition-all duration-300 text-left border border-transparent hover:border-white/50 shadow-sm hover:shadow-md">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white shadow-inner">
               <Briefcase className="h-4 w-4" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-foreground truncate drop-shadow-sm">
                {workspace?.name?.replace('Davis Enterprises', 'SRK Enterprise') || 'My Workspace'}
              </span>
              <span className="text-[10px] font-semibold text-primary uppercase tracking-wider drop-shadow-sm">Free Plan</span>
            </div>
          </div>
          <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
        </button>
      </div>

      {/* ── Navigation ── */}
      <div className="flex-1 overflow-y-auto px-4 space-y-8 scrollbar-hide pb-4 relative z-10">
        <div>
          <div className="px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 mb-3 drop-shadow-sm">Main Menu</div>
          <nav className="space-y-1">
            {mainNavItems.map(({ label, icon: Icon, href, show }) => {
              if (!show) return null
              const isActive = pathname === href || pathname.startsWith(href + '/')

              return (
                <Link
                  key={href}
                  href={href}
                  className={`group flex items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-300 ease-out border ${
                    isActive
                      ? 'bg-white/80 border-white/60 shadow-sm text-primary scale-[1.02] origin-left backdrop-blur-md'
                      : 'border-transparent text-foreground/70 hover:bg-white/40 hover:border-white/30 hover:text-foreground hover:shadow-sm'
                  }`}
                >
                  <Icon className={`h-5 w-5 shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="drop-shadow-sm">{label}</span>
                  {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
                </Link>
              )
            })}
          </nav>
        </div>

        <div>
          <div className="px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 mb-3 drop-shadow-sm">Legacy Tools</div>
          <nav className="space-y-1">
            {originalNavItems.map(({ label, icon: Icon, href }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/')

              return (
                <Link
                  key={href}
                  href={href}
                  className={`group flex items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-300 ease-out border ${
                    isActive
                      ? 'bg-white/80 border-white/60 shadow-sm text-primary scale-[1.02] origin-left backdrop-blur-md'
                      : 'border-transparent text-foreground/70 hover:bg-white/40 hover:border-white/30 hover:text-foreground hover:shadow-sm'
                  }`}
                >
                  <Icon className={`h-5 w-5 shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="drop-shadow-sm">{label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* ── User Footer ── */}
      <div className="mt-auto p-6 border-t border-white/30 relative z-10 bg-white/10 backdrop-blur-sm">
        <Link href="/settings" className="group flex w-full items-center justify-between gap-3 rounded-2xl p-2.5 transition-all duration-300 hover:bg-white/40 hover:shadow-sm border border-transparent hover:border-white/30 text-left">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-sm font-black text-white shadow-inner group-hover:scale-105 transition-transform">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate drop-shadow-sm group-hover:text-primary transition-colors">{displayName}</p>
              <p className="text-xs font-semibold text-muted-foreground truncate">{displayEmail}</p>
            </div>
          </div>
          <Settings className="h-4.5 w-4.5 text-muted-foreground group-hover:text-primary transition-all duration-300 group-hover:rotate-45" strokeWidth={2.5} />
        </Link>
      </div>
    </aside>
  )
}
