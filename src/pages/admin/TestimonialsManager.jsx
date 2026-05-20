import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, Search, X, Save, Star } from 'lucide-react'
import { testimonialsAPI } from '../../lib/api'
import toast from 'react-hot-toast'

const emptyTestimonial = {
  name: '', company: '', role: '', content: '', rating: 5,
  platform: '', revenue: '', is_featured: false,
}

const platforms = ['Amazon', 'Etsy', 'Shopify', 'TikTok Shop', 'Walmart', 'eBay', 'Google', 'Other']

export default function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState([])
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyTestimonial)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadTestimonials() }, [])

  const loadTestimonials = async () => {
    setLoading(true)
    try {
      const res = await testimonialsAPI.getAll()
      setTestimonials(res.data?.data || res.data || [])
    } catch {
      toast.error('Failed to load testimonials')
      setTestimonials([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = testimonials.filter((t) =>
    !search || t.name?.toLowerCase().includes(search.toLowerCase()) || t.company?.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => { setForm(emptyTestimonial); setEditing('new') }
  const openEdit = (t) => { setForm({ ...emptyTestimonial, ...t, is_featured: Boolean(t.is_featured) }); setEditing(t.id) }

  const handleSave = async () => {
    if (!form.name || !form.content) return toast.error('Name and content are required')
    setSaving(true)
    try {
      const payload = { ...form, is_featured: form.is_featured ? 1 : 0, rating: parseInt(form.rating) || 5 }
      if (editing === 'new') {
        const res = await testimonialsAPI.create(payload)
        setTestimonials((prev) => [{ ...payload, id: res.data?.id || Date.now() }, ...prev])
        toast.success('Testimonial added!')
      } else {
        await testimonialsAPI.update(editing, payload)
        setTestimonials((prev) => prev.map((t) => t.id === editing ? { ...t, ...payload } : t))
        toast.success('Testimonial updated!')
      }
      setEditing(null)
    } catch {
      toast.error('Failed to save testimonial')
    } finally {
      setSaving(false)
    }
  }

  const deleteTestimonial = async (id) => {
    if (!confirm('Delete this testimonial?')) return
    try {
      await testimonialsAPI.delete(id)
      setTestimonials((prev) => prev.filter((t) => t.id !== id))
      toast.success('Testimonial deleted')
    } catch {
      toast.error('Failed to delete testimonial')
    }
  }

  const StarRating = ({ value, onChange }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" onClick={() => onChange(star)}>
          <Star size={16} className={star <= value ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'} />
        </button>
      ))}
    </div>
  )

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Testimonials Manager</h1>
          <p className="text-white/40 text-xs">{testimonials.length} testimonials</p>
        </div>
        <button onClick={openCreate}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white text-sm font-semibold">
          <Plus size={15} /> Add Testimonial
        </button>
      </div>

      <div className="relative mb-4 max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search testimonials..."
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#00D4FF]/50" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 rounded-full border-2 border-[#00D4FF] border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="border border-white/8 rounded-xl overflow-hidden bg-white/2">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {['Name', 'Company', 'Platform', 'Rating', 'Featured', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-white/40 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-white/30 text-sm">No testimonials found</td></tr>
              ) : filtered.map((t) => (
                <tr key={t.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-white text-sm font-medium">{t.name}</div>
                    <div className="text-white/30 text-xs">{t.role}</div>
                  </td>
                  <td className="px-4 py-3 text-white/60 text-sm">{t.company}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-xs bg-[#7C3AED]/20 text-[#A78BFA]">{t.platform}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} size={11} className={s <= (t.rating || 5) ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'} />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {t.is_featured ? <Star size={14} className="text-yellow-400 fill-yellow-400" /> : <Star size={14} className="text-white/20" />}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => openEdit(t)} className="w-7 h-7 rounded flex items-center justify-center text-white/30 hover:text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-all">
                        <Edit size={13} />
                      </button>
                      <button onClick={() => deleteTestimonial(t.id)} className="w-7 h-7 rounded flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all">
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
                  {editing === 'new' ? 'Add Testimonial' : 'Edit Testimonial'}
                </h2>
                <button onClick={() => setEditing(null)} className="text-white/40 hover:text-white"><X size={18} /></button>
              </div>

              <div className="grid gap-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-1.5">Name *</label>
                    <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50" />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1.5">Company</label>
                    <input value={form.company} onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-1.5">Role / Title</label>
                    <input value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50" />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1.5">Platform</label>
                    <select value={form.platform} onChange={(e) => setForm((p) => ({ ...p, platform: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50">
                      <option value="" className="bg-[#111118]">Select platform</option>
                      {platforms.map((pl) => <option key={pl} value={pl} className="bg-[#111118]">{pl}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-white/50 mb-1.5">Content *</label>
                  <textarea rows={4} value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50 resize-none" />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-2">Rating</label>
                    <StarRating value={form.rating} onChange={(v) => setForm((p) => ({ ...p, rating: v }))} />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1.5">Revenue / Result</label>
                    <input value={form.revenue} onChange={(e) => setForm((p) => ({ ...p, revenue: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50"
                      placeholder="$50K/month" />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, is_featured: !p.is_featured }))}
                    className={`w-11 h-6 rounded-full transition-all duration-200 relative ${form.is_featured ? 'bg-[#00D4FF]' : 'bg-white/15'}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${form.is_featured ? 'left-5' : 'left-0.5'}`} />
                  </button>
                  <span className="text-white/60 text-sm">Featured testimonial</span>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-xl border border-white/10 text-white/50 text-sm hover:text-white transition-colors">Cancel</button>
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white text-sm font-semibold disabled:opacity-50">
                    <Save size={14} /> {saving ? 'Saving...' : 'Save Testimonial'}
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
