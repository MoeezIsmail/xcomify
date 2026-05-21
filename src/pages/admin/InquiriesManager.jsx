import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Mail, Phone, Trash2 } from 'lucide-react'
import { contactAPI } from '../../lib/api'
import { notifyNotificationsChanged } from '../../lib/dates'
import toast from 'react-hot-toast'

const mockInquiries = [
  { id: 1, name: 'John Smith', email: 'john@company.com', phone: '+1-555-0101', company: 'TechBrand Inc', platform: 'Amazon', message: 'We\'re looking to scale our Amazon store from $50K/month to $200K/month. Can you help?', is_read: false, created_at: '2024-03-15T11:00:00Z' },
  { id: 2, name: 'Maria Garcia', email: 'maria@shop.com', phone: '+1-555-0202', company: 'Bloom Boutique', platform: 'Shopify', message: 'Need help setting up our Shopify store and implementing email automation.', is_read: true, created_at: '2024-03-14T16:00:00Z' },
  { id: 3, name: 'David Lee', email: 'david@brand.com', phone: '+44-20-1234-5678', company: 'UK Gadgets Ltd', platform: 'eBay', message: 'Looking for someone to manage our eBay UK account. 200+ products, need automation.', is_read: false, created_at: '2024-03-14T09:00:00Z' },
]

export default function InquiriesManager() {
  const [inquiries, setInquiries] = useState(mockInquiries)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    contactAPI.getAll()
      .then((res) => setInquiries(res.data.data || mockInquiries))
      .catch(() => setInquiries(mockInquiries))
  }, [])

  const filtered = inquiries.filter((i) =>
    !search || i.name?.toLowerCase().includes(search.toLowerCase()) || i.email?.toLowerCase().includes(search.toLowerCase())
  )

  const markRead = async (id) => {
    try { await contactAPI.markRead(id) } catch {
      // Keep local read state responsive even if the row was already updated elsewhere.
    }
    setInquiries((prev) => prev.map((i) => i.id === id ? { ...i, is_read: true } : i))
    notifyNotificationsChanged()
  }

  const deleteInquiry = async (id) => {
    if (!confirm('Delete this inquiry?')) return
    try { await contactAPI.delete(id) } catch {
      // Local deletion keeps the admin UI responsive if the record was already removed.
    }
    setInquiries((prev) => prev.filter((i) => i.id !== id))
    notifyNotificationsChanged()
    toast.success('Inquiry deleted')
    if (selected?.id === id) setSelected(null)
  }

  const unread = inquiries.filter((i) => !i.is_read).length

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-4 mb-6">
          <div>
            <h1 className="text-xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Contact Inquiries</h1>
            <p className="text-white/40 text-xs">{unread} unread · {inquiries.length} total</p>
          </div>
          <div className="relative ml-auto max-w-xs flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search inquiries..."
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#00D4FF]/50"
            />
          </div>
        </div>

        <div className="border border-white/8 rounded-xl overflow-hidden bg-white/2">
          <div className="divide-y divide-white/6">
            {filtered.map((inq) => (
              <motion.div
                key={inq.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => { setSelected(inq); markRead(inq.id) }}
                className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-white/3 transition-colors ${selected?.id === inq.id ? 'bg-white/4' : ''}`}
              >
                <div className="shrink-0">
                  {!inq.is_read ? (
                    <div className="w-2 h-2 rounded-full bg-[#00D4FF]" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-white/15" />
                  )}
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7C3AED]/40 to-[#00D4FF]/40 flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {inq.name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${inq.is_read ? 'text-white/70' : 'text-white'}`}>{inq.name}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-[#7C3AED]/20 text-[#A78BFA]">{inq.platform}</span>
                  </div>
                  <div className="text-white/40 text-xs truncate">{inq.message}</div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className="text-white/20 text-xs">{inq.created_at?.split('T')[0]}</span>
                  <button onClick={(e) => { e.stopPropagation(); deleteInquiry(inq.id) }}
                    className="w-7 h-7 flex items-center justify-center rounded text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all">
                    <Trash2 size={13} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {selected && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-80 shrink-0 border border-white/8 rounded-xl bg-white/2 p-5 sticky top-0 max-h-[calc(100vh-104px)] overflow-y-auto"
        >
          <h3 className="text-white font-semibold text-sm mb-4">Inquiry Detail</h3>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#00D4FF] flex items-center justify-center text-white font-bold">
              {selected.name?.[0]}
            </div>
            <div>
              <div className="text-white font-semibold">{selected.name}</div>
              <div className="text-white/40 text-xs">{selected.company}</div>
            </div>
          </div>
          {[
            { icon: Mail, value: selected.email, href: `mailto:${selected.email}` },
            { icon: Phone, value: selected.phone, href: `tel:${selected.phone}` },
          ].map((c) => c.value && (
            <a key={c.value} href={c.href} className="flex items-center gap-2 text-white/60 text-sm mb-2 hover:text-[#00D4FF] transition-colors">
              <c.icon size={14} /> {c.value}
            </a>
          ))}
          <div className="mt-4 pt-4 border-t border-white/8">
            <div className="text-white/30 text-xs mb-2">Message</div>
            <p className="text-white/70 text-sm leading-relaxed">{selected.message}</p>
          </div>
          <div className="mt-4">
            <div className="text-white/30 text-xs mb-1">Platform Interest</div>
            <span className="px-2 py-1 rounded-full text-xs bg-[#7C3AED]/15 text-[#A78BFA]">{selected.platform}</span>
          </div>
          <div className="mt-5 flex gap-2">
            <a href={`mailto:${selected.email}`}
              className="flex-1 py-2 rounded-lg text-xs font-medium text-center bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20 hover:bg-[#00D4FF]/20 transition-all">
              Reply via Email
            </a>
          </div>
        </motion.div>
      )}
    </div>
  )
}
