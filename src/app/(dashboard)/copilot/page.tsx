import { Bot, Send, Sparkles } from 'lucide-react'

export default function CopilotPage() {
  return (
    <div className="flex h-full flex-col space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#0f172a]">AI Copilot</h1>
        <p className="mt-1 text-sm text-[#64748b]">
          Your intelligent business assistant powered by AI
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center rounded-xl glass shadow-sm ring-1 ring-[#e2e8f0]">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#6d28d9] shadow-lg shadow-primary/25">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-[#0f172a]">
            How can I help you today?
          </h2>
          <p className="mt-1 max-w-sm text-sm text-[#94a3b8]">
            Ask me anything about your business — invoices, customer insights, revenue trends, and more.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {['Summarize revenue', 'Draft an invoice', 'Customer insights', 'Overdue payments'].map((s) => (
              <button
                key={s}
                className="rounded-full border border-[#e2e8f0] px-4 py-2 text-xs font-medium text-[#64748b] transition-colors hover:border-[#7c3aed] hover:text-[#7c3aed]"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Ask the AI Copilot anything..."
          className="h-12 w-full rounded-xl glass pl-5 pr-12 text-sm text-[#0f172a] ring-1 ring-[#e2e8f0] placeholder:text-[#94a3b8] outline-none focus:ring-2 focus:ring-[#7c3aed]/30"
        />
        <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-primary p-2 text-white transition-colors hover:bg-primary/90">
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
