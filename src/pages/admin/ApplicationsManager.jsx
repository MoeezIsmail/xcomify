import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Download, Eye, Trash2, CheckCircle, Clock, XCircle } from 'lucide-react'
import { applicationsAPI } from '../../lib/api'
import toast from 'react-hot-toast'

const mockData = [
  { id: 1, full_name: 'Ahmad Hassan', email: 'ahmad@email.com', phone: '+92-300-1234567', city: 'Lahore, Pakistan', skills: 'Amazon PPC, FBA', experience: '3 years Amazon', expected_salary: '$800', portfolio_link: 'linkedin.com/in/ahmad', status: 'pending', created_at: '2024-03-15T10:00:00Z' },
  { id: 2, full_name: 'Fatima Khan', email: 'fatima@email.com', phone: '+92-321-9876543', city: 'Karachi, Pakistan', skills: 'Shopify Development, CSS', experience: '2 years Shopify', expected_salary: '$1200', portfolio_link: 'github.com/fatima', status: 'reviewed', created_at: '2024-03-14T15:30:00Z' },
  { id: 3, full_name: 'Omar Malik', email: 'omar@email.com', phone: '+92-333-4567890', city: 'Islamabad, Pakistan', skills: 'Etsy SEO, Product Research', experience: '4 years Etsy', expected_salary: '$700', portfolio_link: '', status: 'hired', created_at: '2024-03-13T09:00:00Z' },
  { id: 4, full_name: 'Zara Ahmed', email: 'zara@email.com', phone: '+1-212-5556789', city: 'New York, USA', skills: 'Content Writing, SEO', experience: '2 years content', expected_salary: '$1500', portfolio_link: 'zaraahmad.com', status: 'rejected', created_at: '2024-03-12T14:00:00Z' },
]

const statusConfig = {
  pending: { label: 'Pending', color: '#F59E0B', bg: 'bg-[#F59E0B]/10', icon: Clock },
  reviewed: { label: 'Reviewed', color: '#00D4FF', bg: 'bg-[#00D4FF]/10', icon: Eye },
  hired: { label: 'Hired', color: '#10B981', bg: 'bg-emerald-400/10', icon: CheckCircle },
  rejected: { label: 'Rejected', color: '#EF4444', bg: 'bg-red-400/10', icon: XCircle },
}

export default function ApplicationsManager() {
  const [apps, setApps] = useState(mockData)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    applicationsAPI.getAll()
      .then((res) => setApps(res.data.data || mockData))
      .catch(() => setApps(mockData))
  }, [])

  const filtered = apps.filter((a) => {
    const matchSearch = !search || a.full_name?.toLowerCase().includes(search.toLowerCase()) || a.email?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || a.status === statusFilter
    return matchSearch && matchStatus
  })

  const updateStatus = async (id, status) => {
    try {
      await applicationsAPI.update(id, { status })
      setApps((prev) => prev.map((a) => a.id === id ? { ...a, status } : a))
      toast.success(`Status updated to ${status}`)
    } catch {
      setApps((prev) => prev.map((a) => a.id === id ? { ...a, status } : a))
      toast.success(`Status updated to ${status}`)
    }
  }

  const deleteApp = async (id) => {
    if (!confirm('Delete this application?')) return
    try {
      await applicationsAPI.delete(id)
    } catch {}
    setApps((prev) => prev.filter((a) => a.id !== id))
    toast.success('Application deleted')
    if (selected?.id === id) setSelected(null)
  }

  return (
    <div className="flex gap-6 h-full">
      {/* List */}
      <div className={`${selected ? 'hidden lg:flex' : 'flex'} flex-col flex-1 min-w-0`}>
        <div className="flex items-center gap-4 mb-6">
          <div>
            <h1 className="text-xl font-black text-white" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>Applications</h1>
            <p className="text-white/40 text-xs">{apps.length} total applications</p>
          </div>
          <div className="ml-auto flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 text-xs text-white/50 hover:text-white transition-colors">
              <Download size={13} /> Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search applicants..."
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#00D4FF]/50"
            />
          </div>
          <div className="flex gap-1">
            {['all', 'pending', 'reviewed', 'hired', 'rejected'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all capitalize ${
                  statusFilter === s ? 'bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/30' : 'border border-white/10 text-white/40 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="border border-white/8 rounded-xl overflow-hidden bg-white/2 flex-1">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/8">
                  {['Applicant', 'Skills', 'Salary', 'Date', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-white/40 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/6">
                {filtered.map((app) => {
                  const sc = statusConfig[app.status] || statusConfig.pending
                  return (
                    <motion.tr
                      key={app.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-white/2 transition-colors cursor-pointer"
                      onClick={() => setSelected(app)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00D4FF]/30 to-[#7C3AED]/30 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {app.full_name?.[0]}
                          </div>
                          <div>
                            <div className="text-white text-sm font-medium">{app.full_name}</div>
                            <div className="text-white/30 text-xs">{app.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white/60 text-xs max-w-[150px] truncate">{app.skills}</td>
                      <td className="px-4 py-3 text-white/60 text-xs">{app.expected_salary}</td>
                      <td className="px-4 py-3 text-white/40 text-xs">{app.created_at?.split('T')[0]}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${sc.bg}`} style={{ color: sc.color }}>
                          <sc.icon size={10} /> {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={app.status}
                            onChange={(e) => updateStatus(app.id, e.target.value)}
                            className="px-2 py-1 rounded text-xs bg-white/5 border border-white/10 text-white/60 focus:outline-none"
                          >
                            {Object.keys(statusConfig).map((s) => <option key={s} value={s} className="bg-[#111118]">{s}</option>)}
                          </select>
                          <button onClick={() => deleteApp(app.id)} className="w-7 h-7 rounded flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-80 shrink-0 border border-white/8 rounded-xl bg-white/2 p-5 flex flex-col gap-4 h-fit"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm">Application Detail</h3>
            <button onClick={() => setSelected(null)} className="text-white/30 hover:text-white transition-colors">
              <XCircle size={16} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#7C3AED] flex items-center justify-center text-white font-bold">
              {selected.full_name?.[0]}
            </div>
            <div>
              <div className="text-white font-semibold">{selected.full_name}</div>
              <div className="text-white/40 text-xs">{selected.city}</div>
            </div>
          </div>

          {[
            { label: 'Email', value: selected.email },
            { label: 'Phone', value: selected.phone },
            { label: 'Skills', value: selected.skills },
            { label: 'Experience', value: selected.experience },
            { label: 'Expected Salary', value: selected.expected_salary },
            { label: 'Portfolio', value: selected.portfolio_link },
          ].map((f) => f.value && (
            <div key={f.label}>
              <div className="text-white/30 text-xs mb-0.5">{f.label}</div>
              <div className="text-white/80 text-sm">{f.value}</div>
            </div>
          ))}

          {selected.cover_letter && (
            <div>
              <div className="text-white/30 text-xs mb-1">Cover Letter</div>
              <p className="text-white/60 text-xs leading-relaxed">{selected.cover_letter}</p>
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t border-white/8">
            <button
              onClick={() => updateStatus(selected.id, 'hired')}
              className="flex-1 py-2 rounded-lg text-xs font-medium bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 hover:bg-emerald-400/20 transition-all"
            >
              Mark Hired
            </button>
            <button
              onClick={() => updateStatus(selected.id, 'rejected')}
              className="flex-1 py-2 rounded-lg text-xs font-medium bg-red-400/10 text-red-400 border border-red-400/20 hover:bg-red-400/20 transition-all"
            >
              Reject
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
