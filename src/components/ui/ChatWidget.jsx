import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot } from 'lucide-react'
import { chatAPI } from '../../lib/api'

const WELCOME = 'Hi! I\'m xComify\'s AI assistant. How can I help you scale your eCommerce business today? 🚀'

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([{ role: 'bot', text: WELCOME }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      inputRef.current?.focus()
    }
  }, [open, messages])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', text }])
    setLoading(true)
    try {
      const res = await chatAPI.send(text)
      const reply = res.data?.reply
      setMessages((prev) => [...prev, { role: 'bot', text: reply || "I'm here to help! Please contact our team for detailed assistance." }])
    } catch {
      setMessages((prev) => [...prev, {
        role: 'bot',
        text: "I'm having trouble connecting right now. Please try again or contact us directly at hello@xcomify.com",
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="fixed bottom-6 left-6 z-[9998]">
      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute bottom-16 left-0 w-80 rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(10, 10, 15, 0.97)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 212, 255, 0.2)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(0,212,255,0.1)',
              height: 500,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/8 bg-gradient-to-r from-[#00D4FF]/5 to-[#7C3AED]/5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#7C3AED] flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="text-white font-semibold text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>xComify AI</div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 text-xs">Online</span>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={15} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'bot' && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00D4FF]/20 to-[#7C3AED]/20 border border-[#00D4FF]/30 flex items-center justify-center mr-2 mt-0.5 shrink-0">
                      <Bot size={11} className="text-[#00D4FF]" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-[#00D4FF] to-[#0099bb] text-white rounded-tr-sm'
                        : 'bg-white/6 border border-white/8 text-white/80 rounded-tl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Loading dots */}
              {loading && (
                <div className="flex justify-start">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00D4FF]/20 to-[#7C3AED]/20 border border-[#00D4FF]/30 flex items-center justify-center mr-2 mt-0.5 shrink-0">
                    <Bot size={11} className="text-[#00D4FF]" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white/6 border border-white/8 flex gap-1 items-center">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-[#00D4FF]"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/8">
              <div className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask about our services..."
                  rows={1}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/20 focus:outline-none focus:border-[#00D4FF]/50 resize-none leading-relaxed max-h-20"
                />
                <button
                  onClick={send}
                  disabled={!input.trim() || loading}
                  className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00D4FF] to-[#7C3AED] flex items-center justify-center text-white disabled:opacity-40 transition-opacity hover:shadow-[0_0_15px_rgba(0,212,255,0.3)] shrink-0"
                >
                  <Send size={14} />
                </button>
              </div>
              <p className="text-white/15 text-xs text-center mt-1.5">Powered by xComify AI</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        onClick={() => setOpen((p) => !p)}
        className="w-14 h-14 rounded-full flex items-center justify-center text-white relative"
        style={{
          background: open
            ? 'rgba(255,255,255,0.1)'
            : 'linear-gradient(135deg, #00D4FF, #7C3AED)',
          boxShadow: open ? 'none' : '0 8px 32px rgba(0,212,255,0.4)',
          border: open ? '1px solid rgba(255,255,255,0.15)' : 'none',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X size={20} />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle size={22} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse ring */}
        {!open && (
          <div className="absolute inset-0 rounded-full border-2 border-[#00D4FF]/40 animate-ping" />
        )}
      </motion.button>
    </div>
  )
}
