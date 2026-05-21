import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, Users, RefreshCw, ChevronLeft, ChevronRight, Inbox } from 'lucide-react'
import { notificationsAPI } from '../../lib/api'
import { timeAgo, timeOnly } from '../../lib/dates'
import toast from 'react-hot-toast'

const TYPE = {
  contact:     { icon: MessageSquare, color: '#00D4FF', label: 'Inquiry',     href: '/admin/inquiries' },
  application: { icon: Users,         color: '#7C3AED', label: 'Application', href: '/admin/applications' },
}

export default function NotificationLog() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const res = await notificationsAPI.getLog(p)
      setItems(res.data?.data || [])
      setTotal(res.data?.total || 0)
      setPage(p)
    } catch {
      toast.error('Failed to load log')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => load(1), 0)
    return () => clearTimeout(timer)
  }, [load])

  const totalPages = Math.ceil(total / 30)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Notification Log</h1>
          <p className="text-white/40 text-xs mt-0.5">{total} total events</p>
        </div>
        <button onClick={() => load(page)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 text-white/50 text-sm hover:text-white hover:border-white/20 transition-all">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 rounded-full border-2 border-[#00D4FF] border-t-transparent animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Inbox size={40} className="text-white/10" />
          <p className="text-white/30 text-sm">No notifications yet</p>
        </div>
      ) : (
        <div className="border border-white/8 rounded-2xl overflow-hidden">
          <div className="divide-y divide-white/5">
            {items.map((n, i) => {
              const meta = TYPE[n.type] || TYPE.contact
              const Icon = meta.icon
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => navigate(meta.href)}
                  className="flex items-start gap-4 px-5 py-4 hover:bg-white/3 cursor-pointer transition-all relative group"
                >
                  {/* New bar */}
                  {n.is_new && (
                    <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r" style={{ background: meta.color }} />
                  )}

                  {/* Icon */}
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: `${meta.color}18`, border: `1px solid ${meta.color}30` }}>
                    <Icon size={14} style={{ color: meta.color }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: `${meta.color}18`, color: meta.color }}>
                        {meta.label}
                      </span>
                      {n.is_new && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
                          style={{ background: 'linear-gradient(135deg, #00D4FF, #7C3AED)' }}>
                          NEW
                        </span>
                      )}
                    </div>
                    <p className={`text-sm mb-0.5 ${n.is_new ? 'text-white font-medium' : 'text-white/70'}`}>{n.body}</p>
                    {n.preview && <p className="text-xs text-white/35 truncate">{n.preview}</p>}
                  </div>

                  {/* Time */}
                  <div className="text-right shrink-0">
                    <p className="text-xs text-white/30">{timeAgo(n.created_at_iso || n.created_at)}</p>
                    <p className="text-[10px] text-white/20 mt-0.5">
                      {timeOnly(n.created_at_iso || n.created_at)}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-white/30 text-xs">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => load(page - 1)} disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/50 hover:text-white disabled:opacity-30 transition-all">
              <ChevronLeft size={12} /> Prev
            </button>
            <button onClick={() => load(page + 1)} disabled={page >= totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/50 hover:text-white disabled:opacity-30 transition-all">
              Next <ChevronRight size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
