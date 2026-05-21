import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Bell, MessageSquare, Users, CheckCheck, RefreshCw, Inbox } from 'lucide-react'
import { timeAgo } from '../../lib/dates'

const TYPE_META = {
  contact:     { icon: MessageSquare, color: '#00D4FF', href: '/admin/inquiries',    label: 'Inquiry' },
  application: { icon: Users,         color: '#7C3AED', href: '/admin/applications', label: 'Application' },
}

export default function NotificationsDropdown({ open, onClose, notifications, newCount, loading, onMarkAllRead, onRefresh }) {
  const dropRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose])

  const handleItem = (n) => {
    const meta = TYPE_META[n.type]
    if (meta) navigate(meta.href)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={dropRef}
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="absolute right-0 top-full mt-2 w-80 rounded-2xl overflow-hidden z-50"
          style={{
            background: 'linear-gradient(160deg, rgba(16,16,24,0.98), rgba(10,10,18,0.99))',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.05) inset',
            backdropFilter: 'blur(24px)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-white/60" />
              <span className="text-white text-sm font-semibold" style={{ fontFamily: 'Syne, sans-serif' }}>
                Notifications
              </span>
              {newCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #00D4FF, #7C3AED)' }}>
                  {newCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onRefresh(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/8 transition-all"
                title="Refresh"
              >
                <RefreshCw size={12} />
              </button>
              {newCount > 0 && (
                <button
                  onClick={onMarkAllRead}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-white/40 hover:text-[#00D4FF] hover:bg-[#00D4FF]/8 transition-all"
                >
                  <CheckCheck size={11} /> Mark all read
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-5 h-5 rounded-full border-2 border-[#00D4FF] border-t-transparent animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Inbox size={28} className="text-white/15" />
                <p className="text-white/30 text-xs">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map((n) => {
                  const meta = TYPE_META[n.type] || TYPE_META.contact
                  const Icon = meta.icon
                  return (
                    <motion.button
                      key={n.id}
                      onClick={() => handleItem(n)}
                      className="w-full flex items-start gap-3 px-4 py-3 text-left transition-all hover:bg-white/4 relative"
                      whileHover={{ x: 2 }}
                    >
                      {/* New indicator */}
                      {n.is_new && (
                        <div
                          className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r"
                          style={{ background: meta.color }}
                        />
                      )}

                      {/* Icon */}
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: `${meta.color}18`, border: `1px solid ${meta.color}30` }}
                      >
                        <Icon size={13} style={{ color: meta.color }} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span
                            className="text-xs font-semibold truncate"
                            style={{ color: n.is_new ? '#fff' : 'rgba(255,255,255,0.6)' }}
                          >
                            {n.title}
                          </span>
                          <span className="text-[10px] text-white/25 shrink-0">{timeAgo(n.created_at_iso || n.created_at)}</span>
                        </div>
                        <p className="text-[11px] text-white/50 truncate">{n.body}</p>
                        {n.preview && (
                          <p className="text-[10px] text-white/25 truncate mt-0.5">{n.preview}</p>
                        )}
                      </div>

                      {n.is_new && (
                        <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: meta.color }} />
                      )}
                    </motion.button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/8 px-4 py-2.5 flex items-center justify-between">
            <span className="text-[10px] text-white/25">{notifications.length} shown</span>
            <button
              onClick={() => { navigate('/admin/notifications'); onClose() }}
              className="text-[11px] text-[#00D4FF]/70 hover:text-[#00D4FF] transition-colors font-medium"
            >
              View full log →
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
