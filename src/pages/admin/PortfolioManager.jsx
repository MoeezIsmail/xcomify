import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, Search, X, Save, Star } from 'lucide-react'
import { portfolioAPI } from '../../lib/api'
import toast from 'react-hot-toast'

const emptyItem = {
  title: '', category: '', challenge: '', solution: '', result: '',
  metrics: '', tags: '', color: '#00D4FF', is_featured: false,
}

export default function PortfolioManager() {
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyItem)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadItems() }, [])

  const loadItems = async () => {
    setLoading(true)
    try {
      const res = await portfolioAPI.getAll()
      setItems(res.data?.data || res.data || [])
    } catch {
      toast.error('Failed to load portfolio')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = items.filter((i) =>
    !search || i.title?.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => { setForm(emptyItem); setEditing('new') }
  const openEdit = (item) => {
    setForm({
      ...emptyItem, ...item,
      metrics: typeof item.metrics === 'object' ? JSON.stringify(item.metrics, null, 2) : (item.metrics || ''),
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || ''),
      is_featured: Boolean(item.is_featured),
    })
    setEditing(item.id)
  }

  const handleSave = async () => {
    if (!form.title) return toast.error('Title is required')
    setSaving(true)
    try {
      const payload = { ...form, is_featured: form.is_featured ? 1 : 0 }
      if (editing === 'new') {
        const res = await portfolioAPI.create(payload)
        setItems((prev) => [{ ...payload, id: res.data?.id || Date.now() }, ...prev])
        toast.success('Portfolio item created!')
      } else {
        await portfolioAPI.update(editing, payload)
        setItems((prev) => prev.map((i) => i.id === editing ? { ...i, ...payload } : i))
        toast.success('Portfolio item updated!')
      }
      setEditing(null)
    } catch {
      toast.error('Failed to save item')
    } finally {
      setSaving(false)
    }
  }

  const deleteItem = async (id) => {
    if (!confirm('Delete this portfolio item?')) return
    try {
      await portfolioAPI.delete(id)
      setItems((prev) => prev.filter((i) => i.id !== id))
      toast.success('Item deleted')
    } catch {
      toast.error('Failed to delete item')
    }
  }

  const Field = ({ label, children }) => (
    <div>
      <label className="block text-xs text-white/50 mb-1.5">{label}</label>
      {children}
    </div>
  )

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Portfolio Manager</h1>
          <p className="text-white/40 text-xs">{items.length} case studies</p>
        </div>
        <button onClick={openCreate}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white text-sm font-semibold">
          <Plus size={15} /> New Case Study
        </button>
      </div>

      <div className="relative mb-4 max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search portfolio..."
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#00D4FF]/50" />
      </div>

      <div className="border border-white/8 rounded-xl overflow-hidden bg-white/2">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-[#00D4FF] border-t-transparent animate-spin" />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {['Title', 'Category', 'Result', 'Featured', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-white/40 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-white/30 text-sm">No portfolio items found</td></tr>
              ) : filtered.map((item) => (
                <tr key={item.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3 text-white text-sm font-medium">{item.title}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-xs" style={{ color: item.color || '#00D4FF', background: `${item.color || '#00D4FF'}20` }}>
                      {item.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/60 text-xs max-w-[200px] truncate">{item.result}</td>
                  <td className="px-4 py-3">
                    {item.is_featured ? (
                      <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    ) : (
                      <Star size={14} className="text-white/20" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => openEdit(item)} className="w-7 h-7 rounded flex items-center justify-center text-white/30 hover:text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-all">
                        <Edit size={13} />
                      </button>
                      <button onClick={() => deleteItem(item.id)} className="w-7 h-7 rounded flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AnimatePresence>
        {editing !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/10 rounded-2xl bg-[#0A0A0F] p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-bold text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>
                  {editing === 'new' ? 'New Case Study' : 'Edit Case Study'}
                </h2>
                <button onClick={() => setEditing(null)} className="text-white/40 hover:text-white"><X size={18} /></button>
              </div>

              <div className="grid gap-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Title *">
                    <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50" />
                  </Field>
                  <Field label="Category">
                    <input value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50"
                      placeholder="Amazon, Shopify, Etsy..." />
                  </Field>
                </div>

                <Field label="Challenge">
                  <textarea rows={2} value={form.challenge} onChange={(e) => setForm((p) => ({ ...p, challenge: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50 resize-none" />
                </Field>

                <Field label="Solution">
                  <textarea rows={2} value={form.solution} onChange={(e) => setForm((p) => ({ ...p, solution: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50 resize-none" />
                </Field>

                <Field label="Result">
                  <input value={form.result} onChange={(e) => setForm((p) => ({ ...p, result: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50"
                    placeholder="+350% Revenue in 6 months" />
                </Field>

                <Field label='Metrics (JSON, e.g. {"revenue":"$180K/mo","growth":"+350%"})'>
                  <textarea rows={3} value={form.metrics} onChange={(e) => setForm((p) => ({ ...p, metrics: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50 resize-none font-mono text-xs" />
                </Field>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Tags (comma-separated)">
                    <input value={form.tags} onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50"
                      placeholder="Amazon, PPC, SEO" />
                  </Field>
                  <Field label="Accent Color">
                    <div className="flex gap-2 items-center">
                      <input type="color" value={form.color} onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
                        className="h-10 w-12 rounded-lg bg-white/5 border border-white/10 cursor-pointer" />
                      <input value={form.color} onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50" />
                    </div>
                  </Field>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, is_featured: !p.is_featured }))}
                    className={`w-11 h-6 rounded-full transition-all duration-200 relative ${form.is_featured ? 'bg-[#00D4FF]' : 'bg-white/15'}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${form.is_featured ? 'left-5' : 'left-0.5'}`} />
                  </button>
                  <span className="text-white/60 text-sm">Featured case study</span>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-xl border border-white/10 text-white/50 text-sm hover:text-white transition-colors">Cancel</button>
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white text-sm font-semibold disabled:opacity-50">
                    <Save size={14} /> {saving ? 'Saving...' : 'Save'}
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
