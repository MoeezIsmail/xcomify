import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, Search, X, Save, Briefcase } from 'lucide-react'
import { servicesAPI } from '../../lib/api'
import toast from 'react-hot-toast'

const emptyService = {
  title: '', slug: '', icon: '🛒', short_desc: '', features: '', color: '#00D4FF', sort_order: 0,
}

export default function ServicesManager() {
  const [services, setServices] = useState([])
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyService)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadServices() }, [])

  const loadServices = async () => {
    setLoading(true)
    try {
      const res = await servicesAPI.getAll()
      setServices(res.data?.data || res.data || [])
    } catch {
      toast.error('Failed to load services')
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = services.filter((s) =>
    !search || s.title?.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => { setForm(emptyService); setEditing('new') }
  const openEdit = (service) => {
    setForm({
      ...emptyService, ...service,
      features: Array.isArray(service.features)
        ? service.features.join(', ')
        : (service.features || ''),
    })
    setEditing(service.id)
  }

  const handleSave = async () => {
    if (!form.title) return toast.error('Title is required')
    setSaving(true)
    const payload = {
      ...form,
      slug: form.slug || form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      sort_order: parseInt(form.sort_order) || 0,
    }
    try {
      if (editing === 'new') {
        const res = await servicesAPI.create(payload)
        setServices((prev) => [...prev, { ...payload, id: res.data?.id || Date.now() }])
        toast.success('Service created!')
      } else {
        await servicesAPI.update(editing, payload)
        setServices((prev) => prev.map((s) => s.id === editing ? { ...s, ...payload } : s))
        toast.success('Service updated!')
      }
      setEditing(null)
    } catch {
      toast.error('Failed to save service')
    } finally {
      setSaving(false)
    }
  }

  const deleteService = async (id) => {
    if (!confirm('Delete this service?')) return
    try {
      await servicesAPI.delete(id)
      setServices((prev) => prev.filter((s) => s.id !== id))
      toast.success('Service deleted')
    } catch {
      toast.error('Failed to delete service')
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Services Manager</h1>
          <p className="text-white/40 text-xs">{services.length} services</p>
        </div>
        <button onClick={openCreate}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white text-sm font-semibold">
          <Plus size={15} /> Add Service
        </button>
      </div>

      <div className="relative mb-4 max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search services..."
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#00D4FF]/50" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 rounded-full border-2 border-[#00D4FF] border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-3 text-center py-16">
              <Briefcase size={40} className="mx-auto text-white/10 mb-4" />
              <p className="text-white/30 text-sm">No services yet. Add your first service!</p>
            </div>
          ) : filtered.map((service) => (
            <motion.div key={service.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="border border-white/8 rounded-xl p-5 bg-white/2 hover:border-white/15 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: `${service.color || '#00D4FF'}15` }}>
                    {service.icon || '🛒'}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">{service.title}</div>
                    <div className="text-white/30 text-xs">/{service.slug}</div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(service)} className="w-7 h-7 rounded flex items-center justify-center text-white/30 hover:text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-all">
                    <Edit size={13} />
                  </button>
                  <button onClick={() => deleteService(service.id)} className="w-7 h-7 rounded flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              {service.short_desc && <p className="text-white/40 text-xs leading-relaxed line-clamp-2">{service.short_desc}</p>}
              <div className="flex items-center gap-2 mt-3">
                <div className="w-3 h-3 rounded-full" style={{ background: service.color || '#00D4FF' }} />
                <span className="text-white/30 text-xs">Order: {service.sort_order || 0}</span>
              </div>
            </motion.div>
          ))}
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
                  {editing === 'new' ? 'New Service' : 'Edit Service'}
                </h2>
                <button onClick={() => setEditing(null)} className="text-white/40 hover:text-white"><X size={18} /></button>
              </div>

              <div className="grid gap-4">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-1.5">Icon (emoji)</label>
                    <input value={form.icon} onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-lg text-center focus:outline-none focus:border-[#00D4FF]/50" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-white/50 mb-1.5">Title *</label>
                    <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-white/50 mb-1.5">Slug (auto-generated if empty)</label>
                  <input value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50"
                    placeholder="amazon-ppc-management" />
                </div>

                <div>
                  <label className="block text-xs text-white/50 mb-1.5">Short Description</label>
                  <textarea rows={2} value={form.short_desc} onChange={(e) => setForm((p) => ({ ...p, short_desc: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50 resize-none" />
                </div>

                <div>
                  <label className="block text-xs text-white/50 mb-1.5">Features (comma-separated)</label>
                  <textarea rows={3} value={form.features} onChange={(e) => setForm((p) => ({ ...p, features: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50 resize-none"
                    placeholder="PPC Campaign Setup, Keyword Research, Bid Optimization" />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-1.5">Accent Color</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={form.color} onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
                        className="h-10 w-12 rounded-lg bg-white/5 border border-white/10 cursor-pointer" />
                      <input value={form.color} onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1.5">Sort Order</label>
                    <input type="number" value={form.sort_order} onChange={(e) => setForm((p) => ({ ...p, sort_order: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50" />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-xl border border-white/10 text-white/50 text-sm hover:text-white transition-colors">Cancel</button>
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white text-sm font-semibold disabled:opacity-50">
                    <Save size={14} /> {saving ? 'Saving...' : 'Save Service'}
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
