import { CheckSquare, Plus } from 'lucide-react'

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#0f172a]">Tasks</h1>
          <p className="mt-1 text-sm text-[#64748b]">
            Track and manage all your tasks and to-dos
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/25 transition-colors hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Add Task
        </button>
      </div>

      <div className="flex h-64 items-center justify-center rounded-xl glass shadow-sm ring-1 ring-[#e2e8f0]">
        <div className="text-center">
          <CheckSquare className="mx-auto h-12 w-12 text-[#7c3aed]/30" />
          <p className="mt-3 text-sm font-medium text-[#64748b]">
            Your tasks will appear here
          </p>
          <p className="mt-1 text-xs text-[#94a3b8]">
            Stay organized and productive with task management
          </p>
        </div>
      </div>
    </div>
  )
}
