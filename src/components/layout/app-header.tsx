'use client'

import { Bell, Search, Gift, ChevronDown, Calendar as CalendarIcon } from 'lucide-react'
import { useAuthStore } from '@/stores/use-auth-store'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export function AppHeader() {
  const { user } = useAuthStore()
  const initials = user?.avatarInitials || 'SRK'
  const firstName = user?.fullName?.split(' ')[0] || 'SRK'
  
  const [greeting, setGreeting] = useState('Good day')
  const [date, setDate] = useState('')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')

    setDate(new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date()))
  }, [])

  return (
    <header className="flex h-24 shrink-0 items-center justify-between gap-4 bg-transparent px-8 relative z-10">
      {/* Left: Greeting & Date */}
      <div className="flex flex-col animate-fade-in">
        <h2 className="text-xl font-extrabold text-foreground tracking-tight">
          {greeting}, {firstName} 👋
        </h2>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mt-1">
          <CalendarIcon className="h-3.5 w-3.5" />
          {date}
        </div>
      </div>

      {/* Center: Search bar */}
      <div className="flex-1 max-w-md mx-8 hidden md:block">
        <div className="relative flex w-full items-center group">
          <Search className="pointer-events-none absolute left-4 h-4.5 w-4.5 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <input
            type="text"
            placeholder="Search clients, projects, or invoices..."
            className="h-12 w-full rounded-full glass border border-white/40 pl-12 pr-16 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-300 shadow-sm focus:shadow-md focus:border-primary/30 focus:bg-white/80"
          />
          <kbd className="pointer-events-none absolute right-4 flex h-6 items-center rounded-full bg-black/5 px-2.5 text-[10px] font-bold text-muted-foreground tracking-widest">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 glass px-2 py-1.5 rounded-full border border-white/40 shadow-sm">
          <button
            className="rounded-full p-2 text-muted-foreground transition-all hover:bg-white hover:text-primary hover:shadow-sm"
            aria-label="Gifts"
          >
            <Gift className="h-4.5 w-4.5" strokeWidth={2.5} />
          </button>
          <div className="w-px h-4 bg-black/10 mx-0.5"></div>
          <button
            className="relative rounded-full p-2 text-muted-foreground transition-all hover:bg-white hover:text-primary hover:shadow-sm"
            aria-label="Notifications"
          >
            <Bell className="h-4.5 w-4.5" strokeWidth={2.5} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>
        </div>

        {/* User avatar */}
        <Link href="/settings" className="flex items-center gap-3 rounded-full glass border border-white/40 shadow-sm hover:bg-white/80 p-1.5 pr-4 transition-all cursor-pointer group">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-black text-white shadow-inner">
            {initials}
          </div>
          <div className="flex flex-col text-left mr-1 hidden sm:flex">
            <span className="text-sm font-bold text-foreground leading-none group-hover:text-primary transition-colors">{user?.fullName || 'SRK'}</span>
            <span className="text-[10px] font-semibold text-muted-foreground mt-1 uppercase tracking-wider">Admin</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </Link>
      </div>
    </header>
  )
}
