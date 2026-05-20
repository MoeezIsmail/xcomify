import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, Search, X, Save, Users } from 'lucide-react'
import { teamAPI } from '../../lib/api'
import toast from 'react-hot-toast'

const emptyMember = {
  name: '', role: '', bio: '', linkedin: '', twitter: '', sort_order: 0,
}

export default function TeamManager() {
  const [members, setMembers] = useState([])
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyMember)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadMembers() }, [])

  const loadMembers = async () => {
    setLoading(true)
    try {
      const res = await teamAPI.getAll()
      setMembers(res.data?.data || res.data || [])
    } catch {
      toast.error('Failed to load team members')
      setMembers([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = members.filter((m) =>
    !search || m.name?.toLowerCase().includes(search.toLowerCase()) || m.role?.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => { setForm(emptyMember); setEditing('new') }
  const openEdit = (member) => { setForm({ ...emptyMember, ...member }); setEditing(member.id) }

  const handleSave = async () => {
    if (!form.name || !form.role) return toast.error('Name and role are required')
    setSaving(true)
    try {
      if (editing === 'new') {
        const res = await teamAPI.create(form)
        setMembers((prev) => [...prev, { ...form, id: res.data?.id || Date.now() }])
        toast.success('Team member added!')
      } else {
        await teamAPI.update(editing, form)
        setMembers((prev) => prev.map((m) => m.id === editing ? { ...m, ...form } : m))
        toast.success('Team member updated!')
      }
      setEditing(null)
    } catch {
      toast.error('Failed to save team member')
    } finally {
      setSaving(false)
    }
  }

  const deleteMember = async (id) => {
    if (!confirm('Delete this team member?')) return
    try {
      await teamAPI.delete(id)
      setMembers((prev) => prev.filter((m) => m.id !== id))
      toast.success('Team member deleted')
    } catch {
      toast.error('Failed to delete team member')
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Team Manager</h1>
          <p className="text-white/40 text-xs">{members.length} team members</p>
        </div>
        <button onClick={openCreate}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white text-sm font-semibold">
          <Plus size={15} /> Add Member
        </button>
      </div>

      <div className="relative mb-4 max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search team..."
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
              <Users size={40} className="mx-auto text-white/10 mb-4" />
              <p className="text-white/30 text-sm">No team members yet. Add your first!</p>
            </div>
          ) : filtered.map((member) => (
            <motion.div key={member.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="border border-white/8 rounded-xl p-5 bg-white/2 hover:border-white/15 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00D4FF]/30 to-[#7C3AED]/30 flex items-center justify-center text-white font-bold text-sm">
                    {member.name?.[0]}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">{member.name}</div>
                    <div className="text-[#00D4FF] text-xs">{member.role}</div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(member)} className="w-7 h-7 rounded flex items-center justify-center text-white/30 hover:text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-all">
                    <Edit size={13} />
                  </button>
                  <button onClick={() => deleteMember(member.id)} className="w-7 h-7 rounded flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              {member.bio && <p className="text-white/40 text-xs leading-relaxed line-clamp-2">{member.bio}</p>}
              {(member.linkedin || member.twitter) && (
                <div className="flex gap-2 mt-3">
                  {member.linkedin && <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">LinkedIn</span>}
                  {member.twitter && <span className="text-xs px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">Twitter</span>}
                </div>
              )}
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
                  {editing === 'new' ? 'Add Team Member' : 'Edit Team Member'}
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
                    <label className="block text-xs text-white/50 mb-1.5">Role *</label>
                    <input value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50"
                      placeholder="Amazon PPC Specialist" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-white/50 mb-1.5">Bio</label>
                  <textarea rows={3} value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50 resize-none" />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-1.5">LinkedIn URL</label>
                    <input value={form.linkedin} onChange={(e) => setForm((p) => ({ ...p, linkedin: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50"
                      placeholder="https://linkedin.com/in/..." />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1.5">Twitter URL</label>
                    <input value={form.twitter} onChange={(e) => setForm((p) => ({ ...p, twitter: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50"
                      placeholder="https://twitter.com/..." />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-white/50 mb-1.5">Sort Order</label>
                  <input type="number" value={form.sort_order} onChange={(e) => setForm((p) => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50" />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-xl border border-white/10 text-white/50 text-sm hover:text-white transition-colors">Cancel</button>
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white text-sm font-semibold disabled:opacity-50">
                    <Save size={14} /> {saving ? 'Saving...' : 'Save Member'}
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
