import { useState } from 'react'
import { Wand2, Send, Copy, CheckCheck, Loader2, FileText, Mail, AlertCircle } from 'lucide-react'
import { proposalAPI } from '../../lib/api'
import { useSettings } from '../../context/SettingsContext'
import { callHF } from '../../lib/huggingface'
import toast from 'react-hot-toast'

const platforms = ['Amazon', 'Etsy', 'Shopify', 'TikTok Shop', 'Walmart', 'eBay', 'Multiple Platforms']
const serviceTypes = [
  'Amazon FBA Management', 'Amazon PPC Management', 'Etsy Shop Management', 'Shopify Store Development',
  'TikTok Shop Setup', 'Walmart Marketplace Setup', 'Full eCommerce Management', 'Product Research & Hunting',
  'Brand Building & Consulting',
]

const inputCls = 'w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50 transition-colors'
const labelCls = 'block text-xs text-white/50 mb-1.5'

export default function ProposalManager() {
  const { settings } = useSettings()
  const [clientName, setClientName]       = useState('')
  const [toEmail, setToEmail]             = useState('')
  const [serviceType, setServiceType]     = useState(serviceTypes[0])
  const [platform, setPlatform]           = useState(platforms[0])
  const [budget, setBudget]               = useState('')
  const [requirements, setRequirements]   = useState('')
  const [proposal, setProposal]           = useState('')
  const [subject, setSubject]             = useState('Business Proposal from xComify')
  const [generating, setGenerating]       = useState(false)
  const [sending, setSending]             = useState(false)
  const [copied, setCopied]               = useState(false)

  const generateProposal = async () => {
    if (!clientName) return toast.error('Client name is required')

    const token = settings.huggingface_token
    if (!token) return toast.error('HuggingFace token not set — go to Settings → AI Integration')

    setGenerating(true)
    setProposal('')
    try {
      const systemPrompt = 'You are a business development manager at xComify. Write the proposal directly — no preamble like "Here is a proposal", no closing AI remarks. Plain text only, no markdown, no asterisks, no # symbols.'
      const userPrompt   = `Write a business proposal for this client:
Client: ${clientName}
Service: ${serviceType}
Platform: ${platform}
Budget: ${budget || 'to be discussed'}
Notes: ${requirements || 'none'}

Use EXACTLY this structure, no deviations:

Dear ${clientName},

EXECUTIVE SUMMARY
[2-3 sentences about what xComify will do for this client]

OUR APPROACH
[2-3 sentences on methodology and process]

KEY DELIVERABLES
1. [specific deliverable]
2. [specific deliverable]
3. [specific deliverable]
4. [specific deliverable]

TIMELINE
Phase 1 — [name] ([duration]): [brief description]
Phase 2 — [name] ([duration]): [brief description]
Phase 3 — [name] ([duration]): [brief description]

INVESTMENT & EXPECTED ROI
[2-3 sentences on pricing and measurable outcomes]

WHY CHOOSE XCOMIFY
[2-3 sentences on competitive advantage and track record]

Best regards,
xComify Team`

      const result = await callHF(token, systemPrompt, userPrompt, 700, 0.7)
      setProposal(result)
      toast.success('Proposal generated!')
    } catch (err) {
      if (err.message === 'MODEL_LOADING') {
        toast.error('AI model is warming up — try again in 30 seconds.')
      } else {
        toast.error(err.message || 'Failed to generate proposal.')
      }
    } finally {
      setGenerating(false)
    }
  }

  const sendProposal = async () => {
    if (!toEmail) return toast.error('Email address is required')
    if (!proposal) return toast.error('Generate a proposal first')
    setSending(true)
    try {
      await proposalAPI.send({ client_name: clientName, to_email: toEmail, proposal, subject })
      toast.success(`Proposal sent to ${toEmail}!`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send email')
    } finally {
      setSending(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(proposal).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success('Copied!')
    })
  }

  const noToken = !settings.huggingface_token

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Proposal Generator</h1>
        <p className="text-white/40 text-xs">AI-powered business proposal generation and email delivery</p>
      </div>

      {noToken && (
        <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 text-sm">
          <AlertCircle size={15} className="shrink-0" />
          HuggingFace token not configured — go to <strong className="mx-1">Settings → AI Integration</strong> to add your free token.
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left — Form */}
        <div className="border border-white/8 rounded-xl p-6 bg-white/2 flex flex-col gap-4">
          <h3 className="text-white font-semibold text-sm border-b border-white/8 pb-3 flex items-center gap-2">
            <FileText size={14} className="text-[#00D4FF]" />
            Proposal Details
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Client Name *</label>
              <input value={clientName} onChange={(e) => setClientName(e.target.value)}
                placeholder="John Smith / Acme Corp" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Client Email</label>
              <input type="email" value={toEmail} onChange={(e) => setToEmail(e.target.value)}
                placeholder="client@email.com" className={inputCls} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Service Type</label>
              <select value={serviceType} onChange={(e) => setServiceType(e.target.value)} className={inputCls}>
                {serviceTypes.map((s) => <option key={s} value={s} className="bg-[#111118]">{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Platform</label>
              <select value={platform} onChange={(e) => setPlatform(e.target.value)} className={inputCls}>
                {platforms.map((p) => <option key={p} value={p} className="bg-[#111118]">{p}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Budget</label>
            <input value={budget} onChange={(e) => setBudget(e.target.value)}
              placeholder="$1,500/month or negotiable" className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Requirements / Notes</label>
            <textarea rows={4} value={requirements} onChange={(e) => setRequirements(e.target.value)}
              placeholder="Specific goals, current situation, special requests..."
              className={`${inputCls} resize-none`} />
          </div>

          <button onClick={generateProposal} disabled={generating || noToken}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-all disabled:opacity-50">
            {generating
              ? <><Loader2 size={15} className="animate-spin" /> Generating with AI...</>
              : <><Wand2 size={15} /> Generate Proposal</>}
          </button>
        </div>

        {/* Right — Preview + Send */}
        <div className="border border-white/8 rounded-xl p-6 bg-white/2 flex flex-col gap-4 sticky top-0 max-h-[calc(100vh-104px)] overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/8 pb-3">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <Mail size={14} className="text-[#00D4FF]" />
              Generated Proposal
            </h3>
            {proposal && (
              <button onClick={copyToClipboard} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors">
                {copied ? <CheckCheck size={13} className="text-emerald-400" /> : <Copy size={13} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>

          {generating ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#00D4FF] border-t-transparent animate-spin" />
              <p className="text-white/40 text-sm">AI is crafting your proposal...</p>
            </div>
          ) : proposal ? (
            <textarea value={proposal} onChange={(e) => setProposal(e.target.value)}
              className="flex-1 min-h-[180px] px-3.5 py-2.5 rounded-xl bg-white/3 border border-white/8 text-white/80 text-sm focus:outline-none focus:border-[#00D4FF]/30 resize-none leading-relaxed overflow-y-auto" />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                <Wand2 size={24} className="text-white/20" />
              </div>
              <p className="text-white/30 text-sm text-center">
                Fill in the details and click "Generate Proposal"<br />to create an AI-powered proposal
              </p>
            </div>
          )}

          {proposal && (
            <div className="border-t border-white/8 pt-4 grid gap-3 shrink-0">
              <div>
                <label className={labelCls}>Email Subject</label>
                <input value={subject} onChange={(e) => setSubject(e.target.value)} className={inputCls} />
              </div>
              <button onClick={sendProposal} disabled={sending || !toEmail}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#00D4FF] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all disabled:opacity-50">
                {sending
                  ? <><Loader2 size={15} className="animate-spin" /> Sending...</>
                  : <><Send size={15} /> Send to {toEmail || 'client email'}</>}
              </button>
              {!toEmail && <p className="text-white/30 text-xs text-center">Add client email address to enable sending</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
