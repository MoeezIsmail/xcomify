import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Globe, Mail, Phone, MapPin, Eye, EyeOff, Loader2, CheckCircle, XCircle, Wifi } from 'lucide-react'
import { settingsAPI } from '../../lib/api'
import { useSettings } from '../../context/SettingsContext'
import { testHFConnection, HF_URL } from '../../lib/huggingface'
import toast from 'react-hot-toast'

const initialSettings = {
  site_name: 'xComify',
  tagline: 'Premium eCommerce Management',
  description: 'Full-service eCommerce management across Amazon, eBay, Etsy, Shopify, Walmart & TikTok Shop.',
  email: 'hello@xcomify.com',
  phone: '+1 (234) 567-890',
  address: 'New York, NY 10001',
  twitter: 'https://twitter.com/xcomify',
  linkedin: 'https://linkedin.com/company/xcomify',
  instagram: 'https://instagram.com/xcomify',
  youtube: '',
  google_analytics: '',
  facebook_pixel: '',
  hero_headline: 'Scale Your e-Commerce Empire',
  hero_subline: 'Full-service eCommerce management across Amazon, eBay, Etsy, Shopify, Walmart & TikTok Shop.',
  cta_text: 'Get Free Consultation',
  maintenance_mode: false,
  animations_enabled: true,
  dark_mode: true,
}

const inputCls = 'w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#00D4FF]/50 transition-colors'

function Input({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div>
      <label className="block text-xs text-white/50 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputCls}
      />
    </div>
  )
}

function Toggle({ label, desc, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/8 last:border-0">
      <div>
        <div className="text-white text-sm font-medium">{label}</div>
        {desc && <div className="text-white/40 text-xs">{desc}</div>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full transition-all duration-200 relative ${value ? 'bg-[#00D4FF]' : 'bg-white/15'}`}
      >
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${value ? 'left-5' : 'left-0.5'}`} />
      </button>
    </div>
  )
}

export default function SiteSettings() {
  const { refreshSettings } = useSettings()
  const [settings, setSettings] = useState(initialSettings)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('general')
  const [hfToken, setHfToken] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [savingToken, setSavingToken] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)

  useEffect(() => {
    settingsAPI.get()
      .then((res) => {
        const data = res.data || {}
        setSettings((prev) => ({
          ...prev,
          ...Object.fromEntries(
            Object.entries(data).filter(([k]) => k in initialSettings)
              .map(([k, v]) => [k, v === '1' ? true : v === '0' ? false : v])
          ),
        }))
        if (data.huggingface_token) setHfToken(data.huggingface_token)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (key, value) => setSettings((p) => ({ ...p, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await settingsAPI.update(settings)
      refreshSettings()
      toast.success('Settings saved!')
    } catch {
      toast.error('Failed to save settings. Check your connection.')
    } finally {
      setSaving(false)
    }
  }

  const saveHFToken = async () => {
    setSavingToken(true)
    try {
      await settingsAPI.update({ huggingface_token: hfToken })
      refreshSettings()
      setTestResult(null)
      toast.success('HuggingFace token saved!')
    } catch {
      toast.error('Failed to save token')
    } finally {
      setSavingToken(false)
    }
  }

  const runConnectionTest = async () => {
    setTesting(true)
    setTestResult(null)
    const result = await testHFConnection(hfToken)
    setTestResult(result)
    setTesting(false)
  }

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'contact', label: 'Contact & Social' },
    { id: 'content', label: 'Homepage Content' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'ai', label: 'AI Integration' },
    { id: 'advanced', label: 'Advanced' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Site Settings</h1>
          <p className="text-white/40 text-xs">Manage your website configuration</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white text-sm font-semibold hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-shadow disabled:opacity-50"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {loading ? 'Loading...' : saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-white/8 pb-1">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              tab === t.id ? 'bg-[#00D4FF]/15 text-[#00D4FF]' : 'text-white/40 hover:text-white'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6">
        {tab === 'general' && (
          <motion.div key="general" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-white/8 rounded-xl p-6 bg-white/2 grid gap-4">
            <h3 className="text-white font-semibold text-sm border-b border-white/8 pb-3">General Settings</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Site Name" value={settings.site_name} onChange={(v) => handleChange('site_name', v)} />
              <Input label="Tagline" value={settings.tagline} onChange={(v) => handleChange('tagline', v)} />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Site Description</label>
              <textarea rows={3} value={settings.description} onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50 resize-none" />
            </div>
          </motion.div>
        )}

        {tab === 'contact' && (
          <motion.div key="contact" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-white/8 rounded-xl p-6 bg-white/2 grid gap-4">
            <h3 className="text-white font-semibold text-sm border-b border-white/8 pb-3">Contact Information</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Email" value={settings.email} onChange={(v) => handleChange('email', v)} type="email" />
              <Input label="Phone" value={settings.phone} onChange={(v) => handleChange('phone', v)} />
            </div>
            <Input label="Address" value={settings.address} onChange={(v) => handleChange('address', v)} />
            <h3 className="text-white font-semibold text-sm border-b border-white/8 pb-3 mt-2">Social Links</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Twitter / X" value={settings.twitter} onChange={(v) => handleChange('twitter', v)} />
              <Input label="LinkedIn" value={settings.linkedin} onChange={(v) => handleChange('linkedin', v)} />
              <Input label="Instagram" value={settings.instagram} onChange={(v) => handleChange('instagram', v)} />
              <Input label="YouTube" value={settings.youtube} onChange={(v) => handleChange('youtube', v)} />
            </div>
          </motion.div>
        )}

        {tab === 'content' && (
          <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-white/8 rounded-xl p-6 bg-white/2 grid gap-4">
            <h3 className="text-white font-semibold text-sm border-b border-white/8 pb-3">Homepage Content</h3>
            <Input label="Hero Headline" value={settings.hero_headline} onChange={(v) => handleChange('hero_headline', v)} />
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Hero Subheadline</label>
              <textarea rows={2} value={settings.hero_subline} onChange={(e) => handleChange('hero_subline', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50 resize-none" />
            </div>
            <Input label="Primary CTA Text" value={settings.cta_text} onChange={(v) => handleChange('cta_text', v)} />
          </motion.div>
        )}

        {tab === 'integrations' && (
          <motion.div key="integrations" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-white/8 rounded-xl p-6 bg-white/2 grid gap-4">
            <h3 className="text-white font-semibold text-sm border-b border-white/8 pb-3">Analytics & Tracking</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Google Analytics ID" value={settings.google_analytics} onChange={(v) => handleChange('google_analytics', v)} placeholder="G-XXXXXXXXXX" />
              <Input label="Facebook Pixel ID" value={settings.facebook_pixel} onChange={(v) => handleChange('facebook_pixel', v)} placeholder="123456789012345" />
            </div>
          </motion.div>
        )}

        {tab === 'ai' && (
          <motion.div key="ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-white/8 rounded-xl p-6 bg-white/2 grid gap-4">
            <h3 className="text-white font-semibold text-sm border-b border-white/8 pb-3">AI Integration</h3>

            {/* Token field */}
            <div>
              <label className="block text-xs text-white/50 mb-1.5">HuggingFace API Token</label>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={hfToken}
                  onChange={(e) => { setHfToken(e.target.value); setTestResult(null) }}
                  placeholder="hf_xxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#00D4FF]/50 transition-colors"
                />
                <button type="button" onClick={() => setShowToken((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                  {showToken ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <p className="text-white/30 text-xs mt-1.5">
                Get a free token at{' '}
                <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-[#00D4FF] hover:underline">
                  huggingface.co/settings/tokens
                </a>
                {' '}→ click <strong className="text-white/40">New token</strong> → type: <strong className="text-white/40">Read</strong>
              </p>
            </div>

            {/* Save + Test buttons */}
            <div className="flex gap-3 pt-2 border-t border-white/8">
              <button onClick={saveHFToken} disabled={savingToken || !hfToken}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white text-sm font-semibold hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-shadow disabled:opacity-50">
                {savingToken ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {savingToken ? 'Saving...' : 'Save Token'}
              </button>
              <button onClick={runConnectionTest} disabled={testing || !hfToken}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/15 text-white/70 text-sm font-semibold hover:border-[#00D4FF]/40 hover:text-white transition-all disabled:opacity-50">
                {testing ? <Loader2 size={14} className="animate-spin" /> : <Wifi size={14} />}
                {testing ? 'Testing...' : 'Test Connection'}
              </button>
            </div>

            {/* Test result panel */}
            {testResult && (
              <div className={`rounded-xl border p-4 text-xs font-mono space-y-2 ${testResult.success ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                <div className="flex items-center gap-2 mb-3">
                  {testResult.success
                    ? <CheckCircle size={14} className="text-emerald-400" />
                    : <XCircle size={14} className="text-red-400" />}
                  <span className={`text-sm font-semibold ${testResult.success ? 'text-emerald-400' : 'text-red-400'}`}>
                    {testResult.success ? 'Connection OK — AI is working!' : 'Connection Failed'}
                  </span>
                </div>
                <div className="space-y-1 text-white/50">
                  <div><span className="text-white/30">Token: </span>{testResult.token || '(empty)'}</div>
                  <div><span className="text-white/30">URL: </span>{testResult.url}</div>
                  {testResult.status && <div><span className="text-white/30">HTTP: </span>{testResult.status}</div>}
                  {testResult.error && (
                    <div className="mt-2 p-2 rounded-lg bg-white/5 text-red-300 whitespace-pre-wrap break-all">
                      {testResult.error}
                    </div>
                  )}
                  {testResult.success && testResult.status === 200 && (
                    <div className="text-emerald-400/70">AI responded successfully. Proposals and CV analysis will work.</div>
                  )}
                  {testResult.success && testResult.status === 503 && (
                    <div className="text-amber-400/70">Token is valid but model is loading. Wait 30s then try Proposal Generator.</div>
                  )}
                </div>
              </div>
            )}

            {/* Info box */}
            <div className="rounded-xl bg-white/3 border border-white/8 p-4 text-xs text-white/40 space-y-1.5">
              <div className="text-white/60 font-semibold text-sm mb-2">Troubleshooting</div>
              <div>• <strong className="text-white/50">Token revoked?</strong> Your old token may have been exposed — generate a new one.</div>
              <div>• <strong className="text-white/50">Network error / DNS?</strong> HuggingFace might be blocked on your browser/network. Try a VPN.</div>
              <div>• <strong className="text-white/50">503 loading?</strong> Normal on free tier cold start — wait 30s and retry.</div>
              <div>• <strong className="text-white/50">401 / 403?</strong> Token is wrong or expired — get a new one from the link above.</div>
            </div>
          </motion.div>
        )}

        {tab === 'advanced' && (
          <motion.div key="advanced" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-white/8 rounded-xl p-6 bg-white/2">
            <h3 className="text-white font-semibold text-sm border-b border-white/8 pb-3 mb-4">Advanced Options</h3>
            <Toggle label="Maintenance Mode" desc="Show a maintenance page to visitors" value={settings.maintenance_mode} onChange={(v) => handleChange('maintenance_mode', v)} />
            <Toggle label="Enable Animations" desc="Toggle all page animations on/off" value={settings.animations_enabled} onChange={(v) => handleChange('animations_enabled', v)} />
            <Toggle label="Dark Mode" desc="Switch between light and dark theme" value={settings.dark_mode} onChange={(v) => handleChange('dark_mode', v)} />
          </motion.div>
        )}
      </div>
    </div>
  )
}
