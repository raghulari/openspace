import { FolderOpen, Upload, Search } from 'lucide-react'

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#0f172a]">Documents</h1>
          <p className="mt-1 text-sm text-[#64748b]">
            Organize and manage all your business documents
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/25 transition-colors hover:bg-primary/90">
          <Upload className="h-4 w-4" />
          Upload Document
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
        <input
          type="text"
          placeholder="Search documents..."
          className="h-10 w-full rounded-xl glass pl-10 pr-4 text-sm text-[#0f172a] ring-1 ring-[#e2e8f0] placeholder:text-[#94a3b8] outline-none focus:ring-2 focus:ring-[#7c3aed]/30"
        />
      </div>

      <div className="flex h-64 items-center justify-center rounded-xl glass shadow-sm ring-1 ring-[#e2e8f0]">
        <div className="text-center">
          <FolderOpen className="mx-auto h-12 w-12 text-[#7c3aed]/30" />
          <p className="mt-3 text-sm font-medium text-[#64748b]">
            Your documents will appear here
          </p>
          <p className="mt-1 text-xs text-[#94a3b8]">
            Upload or connect your cloud storage to get started
          </p>
        </div>
      </div>
    </div>
  )
}
