import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Download, Eye, Trash2, CheckCircle, Clock, XCircle, FileText, Brain, X, Settings2 } from 'lucide-react'
import { applicationsAPI, aiAPI } from '../../lib/api'
import { useSettings } from '../../context/SettingsContext'
import { callHF } from '../../lib/huggingface'
import toast from 'react-hot-toast'

const statusConfig = {
  pending: { label: 'Pending', color: '#F59E0B', bg: 'bg-[#F59E0B]/10', icon: Clock },
  reviewed: { label: 'Reviewed', color: '#00D4FF', bg: 'bg-[#00D4FF]/10', icon: Eye },
  hired: { label: 'Hired', color: '#10B981', bg: 'bg-emerald-400/10', icon: CheckCircle },
  rejected: { label: 'Rejected', color: '#EF4444', bg: 'bg-red-400/10', icon: XCircle },
}

export default function ApplicationsManager() {
  const { settings } = useSettings()
  const [apps, setApps] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [showCriteria, setShowCriteria] = useState(false)
  const [criteria, setCriteria] = useState({
    required_skills: 'Amazon PPC, Shopify, eCommerce, SEO',
    min_experience: '1 year',
    preferred_platforms: 'Amazon, Etsy, Shopify, TikTok Shop',
    scoring_focus: 'skills match, experience level, communication',
  })
  const [savingCriteria, setSavingCriteria] = useState(false)

  useEffect(() => {
    loadApps()
    loadCriteria()
  }, [])

  const loadApps = async () => {
    setLoading(true)
    try {
      const res = await applicationsAPI.getAll()
      setApps(res.data?.data || res.data || [])
    } catch {
      setApps([])
      toast.error('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const loadCriteria = async () => {
    try {
      const res = await aiAPI.getCriteria()
      if (res.data) setCriteria(res.data)
    } catch {}
  }

  const filtered = apps.filter((a) => {
    const matchSearch = !search || a.full_name?.toLowerCase().includes(search.toLowerCase()) || a.email?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || a.status === statusFilter
    return matchSearch && matchStatus
  })

  const updateStatus = async (id, status) => {
    try {
      await applicationsAPI.update(id, { status })
      setApps((prev) => prev.map((a) => a.id === id ? { ...a, status } : a))
      if (selected?.id === id) setSelected((p) => ({ ...p, status }))
      toast.success(`Status updated to ${status}`)
    } catch {
      toast.error('Failed to update status')
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

  const analyzeCV = async () => {
    if (!selected) return
    const token = settings.huggingface_token
    if (!token) return toast.error('HuggingFace token not set — go to Settings → AI Integration')

    setAnalyzing(true)
    setAnalysis(null)
    try {
      const systemPrompt = 'You are an HR analyst at xComify. Output plain text only — no markdown, no asterisks, no # headers. No preamble, no closing remarks, no suggestions. Only the structured evaluation below.'
      const userPrompt   = `Evaluate this candidate for an eCommerce role at xComify.

Hiring criteria: required skills: ${criteria.required_skills} | min experience: ${criteria.min_experience} | platforms: ${criteria.preferred_platforms} | focus: ${criteria.scoring_focus}

Candidate:
Name: ${selected.full_name}
Skills: ${selected.skills || 'Not specified'}
Experience: ${selected.experience || 'Not specified'}
City: ${selected.city || 'Not specified'}
Salary: ${selected.expected_salary || 'Not specified'}
Cover letter: ${(selected.cover_letter || 'None').substring(0, 300)}

Reply using EXACTLY this format, nothing else:

Score: X/10

Strengths:
• [strength 1]
• [strength 2]

Concerns:
• [concern 1]

Decision: [Hire / Review / Reject] — [one sentence reason]`

      const result = await callHF(token, systemPrompt, userPrompt, 350, 0.3)
      setAnalysis(result)
    } catch (err) {
      if (err.message === 'MODEL_LOADING') {
        toast.error('AI model is warming up — try again in 30 seconds.')
      } else {
        toast.error(err.message || 'Analysis failed.')
      }
    } finally {
      setAnalyzing(false)
    }
  }

  const saveCriteria = async () => {
    setSavingCriteria(true)
    try {
      await aiAPI.saveCriteria(criteria)
      toast.success('AI criteria saved!')
      setShowCriteria(false)
    } catch {
      toast.error('Failed to save criteria')
    } finally {
      setSavingCriteria(false)
    }
  }

  return (
    <div className="flex gap-6">
      {/* List */}
      <div className={`${selected ? 'hidden lg:flex' : 'flex'} flex-col flex-1 min-w-0`}>
        <div className="flex items-center gap-4 mb-6">
          <div>
            <h1 className="text-xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Applications</h1>
            <p className="text-white/40 text-xs">{apps.length} total applications</p>
          </div>
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => setShowCriteria(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 text-xs text-white/50 hover:text-white transition-colors"
            >
              <Settings2 size={13} /> AI Criteria
            </button>
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
        <div className="border border-white/8 rounded-xl overflow-x-auto bg-white/2">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 rounded-full border-2 border-[#00D4FF] border-t-transparent animate-spin" />
            </div>
          ) : (
            <table className="w-full">
                <thead>
                  <tr className="border-b border-white/8">
                    {['Applicant', 'Skills', 'Salary', 'Date', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs text-white/40 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-white/30 text-sm">No applications found</td>
                    </tr>
                  ) : filtered.map((app) => {
                    const sc = statusConfig[app.status] || statusConfig.pending
                    return (
                      <motion.tr
                        key={app.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-white/2 transition-colors cursor-pointer"
                        onClick={() => { setSelected(app); setAnalysis(null) }}
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
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-96 shrink-0 border border-white/8 rounded-xl bg-white/2 p-5 flex flex-col gap-4 self-start sticky top-0 max-h-[calc(100vh-104px)] overflow-y-auto"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm">Application Detail</h3>
            <button onClick={() => { setSelected(null); setAnalysis(null) }} className="text-white/30 hover:text-white transition-colors">
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

          {/* CV Buttons */}
          {selected.cv_path && (
            <div className="border border-white/8 rounded-xl p-3">
              <div className="text-white/30 text-xs mb-2 flex items-center gap-1.5">
                <FileText size={12} /> CV / Resume
              </div>
              <div className="flex gap-2">
                <a
                  href={`https://xcomify.rf.gd${selected.cv_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 rounded-lg text-xs font-medium bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20 hover:bg-[#00D4FF]/20 transition-all text-center"
                >
                  View CV
                </a>
                <a
                  href={`https://xcomify.rf.gd${selected.cv_path}`}
                  download
                  className="flex-1 py-2 rounded-lg text-xs font-medium bg-[#7C3AED]/10 text-[#A78BFA] border border-[#7C3AED]/20 hover:bg-[#7C3AED]/20 transition-all text-center"
                >
                  Download CV
                </a>
              </div>
            </div>
          )}

          {/* AI Analyze Button */}
          <button
            onClick={analyzeCV}
            disabled={analyzing}
            className="w-full py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#7C3AED]/20 to-[#00D4FF]/20 text-white border border-[#7C3AED]/30 hover:border-[#00D4FF]/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {analyzing ? (
              <><div className="w-3.5 h-3.5 rounded-full border-2 border-[#00D4FF] border-t-transparent animate-spin" /> Analyzing...</>
            ) : (
              <><Brain size={14} /> AI Analyze CV</>
            )}
          </button>

          {/* Analysis Result */}
          {analysis && (
            <div className="border border-[#7C3AED]/30 rounded-xl p-4 bg-[#7C3AED]/5">
              <div className="flex items-center gap-2 mb-3">
                <Brain size={14} className="text-[#A78BFA]" />
                <span className="text-white font-semibold text-xs">AI Analysis</span>
              </div>
              <p className="text-white/70 text-xs leading-relaxed whitespace-pre-wrap">{analysis}</p>
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

      {/* AI Criteria Modal */}
      <AnimatePresence>
        {showCriteria && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-lg border border-white/10 rounded-2xl bg-[#0A0A0F] p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-white font-bold text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>AI Criteria</h2>
                  <p className="text-white/40 text-xs">Configure how AI scores applications</p>
                </div>
                <button onClick={() => setShowCriteria(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
              </div>
              <div className="grid gap-4">
                {[
                  { key: 'required_skills', label: 'Required Skills' },
                  { key: 'min_experience', label: 'Minimum Experience' },
                  { key: 'preferred_platforms', label: 'Preferred Platforms' },
                  { key: 'scoring_focus', label: 'Scoring Focus' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-xs text-white/50 mb-1.5">{label}</label>
                    <input
                      value={criteria[key] || ''}
                      onChange={(e) => setCriteria((p) => ({ ...p, [key]: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50"
                    />
                  </div>
                ))}
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setShowCriteria(false)} className="px-4 py-2 rounded-xl border border-white/10 text-white/50 text-sm hover:text-white">Cancel</button>
                  <button
                    onClick={saveCriteria}
                    disabled={savingCriteria}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white text-sm font-semibold disabled:opacity-50"
                  >
                    {savingCriteria ? 'Saving...' : 'Save Criteria'}
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
