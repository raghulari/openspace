'use client'

import { useState, useMemo } from 'react'
import { CalendarDays, Clock, FileText, FolderKanban, CheckSquare, ChevronLeft, ChevronRight } from 'lucide-react'
import { useProjectStore } from '@/stores/use-project-store'
import { useInvoiceStore } from '@/stores/use-invoice-store'
import { formatDate } from '@/lib/demo-data'

interface CalendarEvent {
  id: string
  title: string
  date: string
  type: 'project-deadline' | 'invoice-due' | 'task'
  color: string
  details: string
}

export default function CalendarPage() {
  const { projects } = useProjectStore()
  const { invoices } = useInvoiceStore()

  const [activeTab, setActiveTab] = useState<'month' | 'week' | 'agenda'>('month')
  const [currentMonth, setCurrentMonth] = useState(5) // June (0-indexed: 5)
  const [currentYear, setCurrentYear] = useState(2026)

  // Auto-generate events from stores
  const events = useMemo((): CalendarEvent[] => {
    const list: CalendarEvent[] = []

    // 1. Project deadlines (endDate) -> Blue dots
    projects.forEach(p => {
      if (p.status !== 'completed' && p.status !== 'cancelled') {
        list.push({
          id: `ev-p-${p.id}`,
          title: `Deadline: ${p.name}`,
          date: p.endDate,
          type: 'project-deadline',
          color: '#3b82f6', // blue
          details: `Target deadline for team lead`
        })
      }
    })

    // 2. Invoice due dates (dueDate, only pending/overdue) -> Red/Amber dots
    invoices.forEach(inv => {
      if (inv.status === 'pending' || inv.status === 'overdue') {
        list.push({
          id: `ev-i-${inv.id}`,
          title: `Due: ${inv.invoiceNumber}`,
          date: inv.dueDate,
          type: 'invoice-due',
          color: inv.status === 'overdue' ? '#ef4444' : '#f59e0b', // red or amber
          details: `Invoice value: ${inv.total}`
        })
      }
    })

    // 3. Mock tasks and followups -> Gray dots
    list.push(
      { id: 'ev-t-1', title: 'Internal Staff Operations Review', date: '2026-06-08', type: 'task', color: '#71717a', details: 'Quarterly review with leads' },
      { id: 'ev-t-2', title: 'Client Feedback Check-In', date: '2026-06-15', type: 'task', color: '#71717a', details: 'Call Rajesh regarding branding' },
      { id: 'ev-t-3', title: 'Inventory Reconciliation Audit', date: '2026-06-22', type: 'task', color: '#71717a', details: 'Count stock packaging bags' },
      { id: 'ev-t-4', title: 'Tax & GST filing deadline', date: '2026-06-25', type: 'task', color: '#71717a', details: 'Clear invoice tax files' }
    )

    return list
  }, [projects, invoices])

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  // Calendar Math for June 2026
  // June 1, 2026 is a Monday. Days in June 2026 = 30 days.
  const daysInMonth = 30
  const startDayOffset = 1 // Monday (0=Sun, 1=Mon, etc.)

  const monthWeeks = useMemo(() => {
    const cells: (number | null)[] = []
    
    // Fill offsets
    for (let i = 0; i < startDayOffset; i++) {
      cells.push(null)
    }
    
    // Fill days
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(d)
    }

    // Round out to full week grids
    while (cells.length % 7 !== 0) {
      cells.push(null)
    }

    const weeks: (number | null)[][] = []
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7))
    }

    return weeks
  }, [])

  // Filter events for a specific day in June 2026
  const getEventsForDay = (day: number) => {
    const dateStr = `2026-06-${String(day).padStart(2, '0')}`
    return events.filter(e => e.date === dateStr)
  }

  // Agenda list (sorted chronologically)
  const agendaEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [events])

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-black tracking-tight font-sans">Calendar</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Overview business events, invoice due dates, and project milestones in a centralized agenda.
          </p>
        </div>

        {/* View toggles */}
        <div className="flex bg-neutral-100 p-1 rounded-xl border border-neutral-200 self-start sm:self-center">
          {(['month', 'week', 'agenda'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs px-3.5 py-1.5 rounded-lg font-bold uppercase transition-all ${
                activeTab === tab 
                  ? 'glass text-black shadow-xs' 
                  : 'text-neutral-500 hover:text-black'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Month Grid View ── */}
      {activeTab === 'month' && (
        <div className="glass border border-neutral-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-neutral-100">
            <h3 className="font-extrabold text-black text-base">June 2026</h3>
            <div className="flex gap-2">
              <button disabled className="p-1 rounded-lg border border-neutral-200 text-neutral-300 cursor-not-allowed">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button disabled className="p-1 rounded-lg border border-neutral-200 text-neutral-300 cursor-not-allowed">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-neutral-400 uppercase tracking-wider mb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {monthWeeks.map((week, wIdx) => 
              week.map((day, dIdx) => {
                if (day === null) {
                  return <div key={`empty-${wIdx}-${dIdx}`} className="h-28 rounded-2xl bg-neutral-50/50 border border-neutral-100/30" />
                }

                const dayEvents = getEventsForDay(day)
                const isToday = day === 5 // June 5, 2026 is today's mock date!

                return (
                  <div 
                    key={`day-${day}`} 
                    className={`h-28 rounded-2xl border p-2 flex flex-col justify-between transition-all ${
                      isToday 
                        ? 'border-black bg-neutral-50/50 ring-1 ring-black' 
                        : 'border-neutral-200 glass hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`text-xs font-bold font-mono ${
                        isToday ? 'bg-black text-white px-1.5 py-0.5 rounded-md' : 'text-neutral-500'
                      }`}>
                        {day}
                      </span>
                      {isToday && <span className="text-[8px] font-bold text-neutral-400">TODAY</span>}
                    </div>

                    <div className="space-y-1 overflow-y-auto max-h-[70px]">
                      {dayEvents.map(e => (
                        <button
                          key={e.id}
                          onClick={() => setSelectedEvent(e)}
                          className="w-full text-left text-[9px] font-bold truncate rounded-md px-1.5 py-0.5 transition-all text-white"
                          style={{ backgroundColor: e.color }}
                        >
                          {e.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* ── Week View ── */}
      {activeTab === 'week' && (
        <div className="glass border border-neutral-200 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-center pb-4 border-b border-neutral-100 mb-6">
            <h3 className="font-extrabold text-black text-base">Week of June 1 - June 7, 2026</h3>
          </div>

          <div className="grid grid-cols-7 gap-3">
            {[
              { d: 'Mon', num: 1 },
              { d: 'Tue', num: 2 },
              { d: 'Wed', num: 3 },
              { d: 'Thu', num: 4 },
              { d: 'Fri', num: 5 }, // today
              { d: 'Sat', num: 6 },
              { d: 'Sun', num: 7 }
            ].map(day => {
              const dayEvents = getEventsForDay(day.num)
              const isToday = day.num === 5

              return (
                <div key={day.num} className="space-y-4">
                  <div className="text-center pb-3 border-b border-neutral-100">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase block">{day.d}</span>
                    <span className={`text-base font-black font-mono block mt-1 ${
                      isToday ? 'text-black bg-neutral-100 px-2 py-0.5 rounded-full inline-block' : 'text-neutral-700'
                    }`}>
                      {day.num}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {dayEvents.length === 0 ? (
                      <p className="text-[10px] text-neutral-300 italic text-center py-4">No events</p>
                    ) : (
                      dayEvents.map(e => (
                        <div 
                          key={e.id}
                          onClick={() => setSelectedEvent(e)}
                          className="p-2.5 rounded-xl text-white text-[10px] font-bold cursor-pointer transition-all hover:scale-[1.02]"
                          style={{ backgroundColor: e.color }}
                        >
                          <h4 className="truncate">{e.title}</h4>
                          <span className="opacity-75 block text-[9px] font-medium mt-1 font-mono">2026-06-{String(day.num).padStart(2, '0')}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Agenda List View ── */}
      {activeTab === 'agenda' && (
        <div className="glass border border-neutral-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="pb-4 border-b border-neutral-100 mb-2">
            <h3 className="font-extrabold text-black text-base">Upcoming Event Agenda</h3>
          </div>

          <div className="space-y-3.5">
            {agendaEvents.map((e) => (
              <div 
                key={e.id} 
                onClick={() => setSelectedEvent(e)}
                className="flex items-center justify-between p-4 rounded-2xl border border-neutral-100 hover:bg-neutral-50 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: e.color }}
                  />
                  <div>
                    <h4 className="text-xs font-bold text-black group-hover:underline">{e.title}</h4>
                    <p className="text-[10px] text-neutral-400 mt-0.5">{e.details}</p>
                  </div>
                </div>

                <div className="text-right text-xs text-neutral-500 font-semibold font-mono">
                  {formatDate(e.date)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Event Detail Modal Overlay ── */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="glass w-full max-w-sm rounded-3xl shadow-xl border border-neutral-200 overflow-hidden flex flex-col animate-scale-in">
            {/* Header */}
            <div className="p-6 border-b border-[#f0f0f2] flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-black">Calendar Event details</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Derived timeline parameters</p>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-neutral-100 text-neutral-400 hover:text-black transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Details */}
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div 
                  className="h-4 w-4 rounded-full mt-1 shrink-0" 
                  style={{ backgroundColor: selectedEvent.color }}
                />
                <div>
                  <h4 className="text-sm font-bold text-black">{selectedEvent.title}</h4>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block mt-1">Event Type</span>
                  <p className="text-xs text-neutral-600 capitalize">{selectedEvent.type.replace('-', ' ')}</p>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Date Parameter</span>
                <p className="font-semibold text-black font-mono flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-neutral-400" />
                  {formatDate(selectedEvent.date)}
                </p>
              </div>

              <div className="space-y-1 text-xs border-t border-neutral-100 pt-4">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Internal notes</span>
                <p className="text-neutral-500 leading-relaxed bg-neutral-50 p-3 rounded-xl border border-neutral-100/50">
                  {selectedEvent.details}
                </p>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-[#f0f0f2] flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm"
                >
                  Close Detail
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
