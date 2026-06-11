'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, Sparkles, Loader2 } from 'lucide-react'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Hello! I am your OpenSpace AI assistant. How can I help you manage your business today?' }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const handleSend = () => {
    if (!inputValue.trim()) return

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: inputValue }
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I'm a demo AI assistant for OpenSpace. I see you asked: "${userMessage.content}". I can help you automate workflows, query customer data, and generate reports!`
      }
      setMessages(prev => [...prev, aiMessage])
      setIsTyping(false)
    }, 1500)
  }

  return (
    <>
      {/* ── Floating Chat Window ── */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] max-h-[70vh] z-50 flex flex-col bg-white rounded-3xl shadow-2xl border border-black/10 overflow-hidden animate-scale-in origin-bottom-right">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 bg-white">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full overflow-hidden bg-primary flex items-center justify-center p-1 shadow-sm ring-2 ring-white">
                <img src="/ai-bot-logo.png" alt="AI Logo" className="h-full w-full object-cover scale-110" />
              </div>
              <div>
                <h3 className="font-bold text-foreground leading-none">OpenSpace AI</h3>
                <span className="text-[10px] font-semibold text-primary tracking-widest uppercase mt-1 inline-block">Online</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-black/5 text-muted-foreground transition-colors"
            >
              <X className="h-4.5 w-4.5" strokeWidth={2.5} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#f8fafc]">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-primary text-white rounded-br-sm' 
                    : 'bg-white border border-black/5 text-foreground rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-black/5 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1 shadow-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-black/5">
            <div className="relative flex items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask AI anything..."
                className="w-full bg-white rounded-full pl-4 pr-12 py-3 text-sm border border-black/10 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
              />
              <button 
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
                className="absolute right-1.5 p-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
            <div className="text-center mt-2 flex items-center justify-center gap-1 opacity-50">
               <Sparkles className="h-3 w-3 text-primary" />
               <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">Powered by OpenSpace Intelligence</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating Action Button (FAB) ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full bg-primary text-white shadow-2xl flex items-center justify-center hover:scale-105 transition-transform duration-300 ring-2 ring-primary/20 overflow-hidden"
      >
        <img src="/ai-bot-logo.png" alt="AI Chatbot" className="h-full w-full object-cover scale-110" />
      </button>
    </>
  )
}
