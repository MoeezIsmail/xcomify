import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, Search, X, Save, Megaphone, CheckCircle, XCircle, Link, Globe } from 'lucide-react'
import { advertisementAPI } from '../../lib/api'
import toast from 'react-hot-toast'

const emptyAd = {
  title: '', description: '', image_url: '', badge_text: '', cta_text: 'Learn More',
  cta_link: '', bg_color: '#00D4FF', is_active: true, starts_at: '', ends_at: '',
}

const PAGE_OPTIONS = [
  { label: 'Home',         path: '/',             emoji: '🏠' },
  { label: 'Services',     path: '/services',     emoji: '⚡' },
  { label: 'Portfolio',    path: '/portfolio',    emoji: '📁' },
  { label: 'Careers',      path: '/careers',      emoji: '💼' },
  { label: 'Contact',      path: '/contact',      emoji: '📩' },
  { label: 'About',        path: '/about',        emoji: '👥' },
  { label: 'Blog',         path: '/blog',         emoji: '📝' },
  { label: 'Pricing',      path: '/pricing',      emoji: '💰' },
  { label: 'Testimonials', path: '/testimonials', emoji: '⭐' },
  { label: 'Team',         path: '/team',         emoji: '🤝' },
]

export default function AdvertisementManager() {
  const [ads, setAds] = useState([])
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyAd)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadAds() }, [])

  const loadAds = async () => {
    setLoading(true)
    try {
      const res = await advertisementAPI.getAll()
      setAds(res.data?.data || res.data || [])
    } catch {
      toast.error('Failed to load advertisements')
      setAds([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = ads.filter((a) =>
    !search || a.title?.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => { setForm(emptyAd); setEditing('new') }
  const openEdit = (ad) => {
    setForm({
      ...emptyAd, ...ad,
      is_active: Boolean(ad.is_active),
      starts_at: ad.starts_at ? ad.starts_at.substring(0, 16) : '',
      ends_at: ad.ends_at ? ad.ends_at.substring(0, 16) : '',
    })
    setEditing(ad.id)
  }

  const handleSave = async () => {
    if (!form.title) return toast.error('Title is required')
    setSaving(true)
    const payload = { ...form, is_active: form.is_active ? 1 : 0 }
    try {
      if (editing === 'new') {
        const res = await advertisementAPI.create(payload)
        setAds((prev) => [{ ...payload, id: res.data?.id || Date.now() }, ...prev])
        toast.success('Advertisement created!')
      } else {
        await advertisementAPI.update(editing, payload)
        setAds((prev) => prev.map((a) => a.id === editing ? { ...a, ...payload } : a))
        toast.success('Advertisement updated!')
      }
      setEditing(null)
    } catch {
      toast.error('Failed to save advertisement')
    } finally {
      setSaving(false)
    }
  }

  const deleteAd = async (id) => {
    if (!confirm('Delete this advertisement?')) return
    try {
      await advertisementAPI.delete(id)
      setAds((prev) => prev.filter((a) => a.id !== id))
      toast.success('Advertisement deleted')
    } catch {
      toast.error('Failed to delete advertisement')
    }
  }

  const toggleActive = async (ad) => {
    try {
      await advertisementAPI.update(ad.id, { ...ad, is_active: ad.is_active ? 0 : 1 })
      setAds((prev) => prev.map((a) => a.id === ad.id ? { ...a, is_active: a.is_active ? 0 : 1 } : a))
      toast.success('Status updated')
    } catch {
      toast.error('Failed to update status')
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Advertisements</h1>
          <p className="text-white/40 text-xs">{ads.length} banners — only 1 active shown at a time</p>
        </div>
        <button onClick={openCreate}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white text-sm font-semibold">
          <Plus size={15} /> New Ad
        </button>
      </div>

      <div className="relative mb-4 max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ads..."
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#00D4FF]/50" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 rounded-full border-2 border-[#00D4FF] border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="border border-white/8 rounded-xl overflow-x-auto bg-white/2">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {['Advertisement', 'Badge', 'CTA', 'Dates', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-white/40 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <Megaphone size={32} className="mx-auto text-white/10 mb-3" />
                    <p className="text-white/30 text-sm">No advertisements yet</p>
                  </td>
                </tr>
              ) : filtered.map((ad) => (
                <tr key={ad.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${ad.bg_color || '#00D4FF'}20` }}>
                        <Megaphone size={14} style={{ color: ad.bg_color || '#00D4FF' }} />
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">{ad.title}</div>
                        <div className="text-white/30 text-xs line-clamp-1 max-w-[180px]">{ad.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {ad.badge_text && (
                      <span className="px-2 py-0.5 rounded text-xs" style={{ color: ad.bg_color, background: `${ad.bg_color}20` }}>
                        {ad.badge_text}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-white/60 text-xs">{ad.cta_text}</td>
                  <td className="px-4 py-3 text-white/40 text-xs">
                    {ad.starts_at && <div>From: {ad.starts_at?.split('T')[0]}</div>}
                    {ad.ends_at && <div>To: {ad.ends_at?.split('T')[0]}</div>}
                    {!ad.starts_at && !ad.ends_at && <span>Always</span>}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(ad)} className="flex items-center gap-1.5">
                      {ad.is_active ? (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-400/15 text-emerald-400">
                          <CheckCircle size={10} /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-white/10 text-white/40">
                          <XCircle size={10} /> Inactive
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => openEdit(ad)} className="w-7 h-7 rounded flex items-center justify-center text-white/30 hover:text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-all">
                        <Edit size={13} />
                      </button>
                      <button onClick={() => deleteAd(ad.id)} className="w-7 h-7 rounded flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {editing !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/10 rounded-2xl bg-[#0A0A0F] p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-bold text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>
                  {editing === 'new' ? 'New Advertisement' : 'Edit Advertisement'}
                </h2>
                <button onClick={() => setEditing(null)} className="text-white/40 hover:text-white"><X size={18} /></button>
              </div>

              <div className="grid gap-4">
                <div>
                  <label className="block text-xs text-white/50 mb-1.5">Title *</label>
                  <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50" />
                </div>

                <div>
                  <label className="block text-xs text-white/50 mb-1.5">Description</label>
                  <textarea rows={2} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50 resize-none" />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-1.5">Badge Text</label>
                    <input value={form.badge_text} onChange={(e) => setForm((p) => ({ ...p, badge_text: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50"
                      placeholder="Special Offer" />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1.5">Image URL</label>
                    <input value={form.image_url} onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50"
                      placeholder="https://..." />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-white/50 mb-1.5">CTA Button Text</label>
                  <input value={form.cta_text} onChange={(e) => setForm((p) => ({ ...p, cta_text: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50" />
                </div>

                <div>
                  <label className="block text-xs text-white/50 mb-2">Button Destination</label>
                  <div className="grid grid-cols-5 gap-1.5 mb-2">
                    {PAGE_OPTIONS.map((p) => {
                      const active = form.cta_link === p.path
                      return (
                        <button
                          key={p.path}
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, cta_link: p.path }))}
                          className="flex flex-col items-center gap-1 px-1 py-2 rounded-xl border text-center transition-all"
                          style={{
                            background: active ? '#00D4FF18' : 'rgba(255,255,255,0.03)',
                            borderColor: active ? '#00D4FF60' : 'rgba(255,255,255,0.08)',
                          }}
                        >
                          <span className="text-base leading-none">{p.emoji}</span>
                          <span className="text-[10px] font-medium" style={{ color: active ? '#00D4FF' : 'rgba(255,255,255,0.4)' }}>
                            {p.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Globe size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                      <input
                        value={form.cta_link}
                        onChange={(e) => setForm((p) => ({ ...p, cta_link: e.target.value }))}
                        placeholder="Or type a custom URL..."
                        className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50 placeholder-white/20"
                      />
                    </div>
                    {form.cta_link && (
                      <a
                        href={form.cta_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white text-xs transition-colors whitespace-nowrap"
                      >
                        <Link size={11} /> Preview
                      </a>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-white/50 mb-1.5">Background / Accent Color</label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={form.bg_color} onChange={(e) => setForm((p) => ({ ...p, bg_color: e.target.value }))}
                      className="h-10 w-12 rounded-lg bg-white/5 border border-white/10 cursor-pointer" />
                    <input value={form.bg_color} onChange={(e) => setForm((p) => ({ ...p, bg_color: e.target.value }))}
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-1.5">Start Date/Time</label>
                    <input type="datetime-local" value={form.starts_at} onChange={(e) => setForm((p) => ({ ...p, starts_at: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50" />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1.5">End Date/Time</label>
                    <input type="datetime-local" value={form.ends_at} onChange={(e) => setForm((p) => ({ ...p, ends_at: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50" />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, is_active: !p.is_active }))}
                    className={`w-11 h-6 rounded-full transition-all duration-200 relative ${form.is_active ? 'bg-[#00D4FF]' : 'bg-white/15'}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${form.is_active ? 'left-5' : 'left-0.5'}`} />
                  </button>
                  <span className="text-white/60 text-sm">Active (visible to website visitors)</span>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-xl border border-white/10 text-white/50 text-sm hover:text-white transition-colors">Cancel</button>
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white text-sm font-semibold disabled:opacity-50">
                    <Save size={14} /> {saving ? 'Saving...' : 'Save Ad'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
