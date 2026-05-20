import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Clock, Check, MessageSquare, Send } from 'lucide-react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import ScrollReveal from '../components/ui/ScrollReveal'
import { useSettings } from '../context/SettingsContext'

export default function Contact() {
  const { settings } = useSettings()
  const contactInfo = [
    { icon: Mail, label: 'Email Us', value: settings.email || 'hello@xcomify.com', href: `mailto:${settings.email || 'hello@xcomify.com'}` },
    { icon: Phone, label: 'Call Us', value: settings.phone || '+1 (234) 567-890', href: `tel:${(settings.phone || '').replace(/\D/g, '')}` },
    { icon: MapPin, label: 'Visit Us', value: settings.address || 'New York, NY 10001', href: '#' },
    { icon: Clock, label: 'Business Hours', value: 'Mon–Fri, 9AM–6PM EST', href: null },
  ]
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', platform: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await axios.post('/api/contact', form)
      setSubmitted(true)
      toast.success('Message sent! We\'ll reply within 24 hours.')
    } catch {
      toast.error('Something went wrong. Please email us directly.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="pt-24">
      <Toaster position="top-right" toastOptions={{ style: { background: '#111118', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />

      <section className="py-10 sm:py-14 lg:py-20 bg-[#0A0A0F] text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="text-xs tracking-[0.3em] uppercase text-[#00D4FF] font-medium mb-4 block">Get in Touch</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-4 sm:mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>
              Let's Build Something{' '}
              <span className="gradient-text">Extraordinary</span>
            </h1>
            <p className="text-white/50 text-sm sm:text-base md:text-lg max-w-xl mx-auto">
              Schedule a free strategy call or send us a message. We respond to every inquiry within 24 hours.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-10 sm:py-16 lg:py-24 bg-[#050508]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-5 gap-8 sm:gap-10 lg:gap-12">
            {/* Left - info */}
            <div className="lg:col-span-2">
              <ScrollReveal direction="left">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 sm:mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>Contact Information</h2>
                <div className="flex flex-col gap-4 mb-8">
                  {contactInfo.map((item) => (
                    <div key={item.label} className="flex items-center gap-4 p-4 rounded-xl border border-white/8 hover:border-white/15 transition-colors bg-white/2">
                      <div className="w-10 h-10 rounded-lg bg-[#00D4FF]/10 border border-[#00D4FF]/20 flex items-center justify-center">
                        <item.icon size={18} className="text-[#00D4FF]" />
                      </div>
                      <div>
                        <div className="text-white/40 text-xs mb-0.5">{item.label}</div>
                        {item.href ? (
                          <a href={item.href} className="text-white font-medium text-sm hover:text-[#00D4FF] transition-colors">{item.value}</a>
                        ) : (
                          <span className="text-white font-medium text-sm">{item.value}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border border-white/8 rounded-2xl p-6 bg-white/2">
                  <div className="flex items-center gap-3 mb-3">
                    <MessageSquare size={18} className="text-[#7C3AED]" />
                    <span className="text-white font-semibold">Free Strategy Call</span>
                  </div>
                  <p className="text-white/40 text-sm leading-relaxed">
                    Book a 30-minute free consultation with one of our eCommerce specialists. No sales pitch — just honest advice.
                  </p>
                </div>
              </ScrollReveal>
            </div>

            {/* Right - form */}
            <div className="lg:col-span-3">
              <ScrollReveal direction="right">
                {submitted ? (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-14 sm:py-20 lg:py-24 border border-[#00D4FF]/30 rounded-2xl bg-[#00D4FF]/5">
                    <div className="w-16 h-16 rounded-full bg-[#00D4FF]/20 flex items-center justify-center mx-auto mb-4">
                      <Check size={28} className="text-[#00D4FF]" />
                    </div>
                    <h3 className="text-white font-bold text-xl mb-2">Message Sent!</h3>
                    <p className="text-white/50">We'll get back to you within 24 hours. Check your inbox!</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="border border-white/8 rounded-2xl p-8 bg-white/2 flex flex-col gap-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      {[
                        { name: 'name', label: 'Full Name', type: 'text', required: true },
                        { name: 'email', label: 'Email Address', type: 'email', required: true },
                        { name: 'phone', label: 'Phone Number', type: 'tel' },
                        { name: 'company', label: 'Company / Store Name', type: 'text' },
                      ].map((f) => (
                        <div key={f.name}>
                          <label className="block text-sm text-white/60 mb-1.5">{f.label}{f.required && <span className="text-[#00D4FF] ml-1">*</span>}</label>
                          <input
                            type={f.type}
                            name={f.name}
                            required={f.required}
                            value={form[f.name]}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#00D4FF]/50 transition-colors"
                          />
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="block text-sm text-white/60 mb-1.5">Platform of Interest</label>
                      <select
                        name="platform"
                        value={form.platform}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50 transition-colors"
                      >
                        <option value="">Select a platform...</option>
                        {['Amazon', 'eBay', 'Etsy', 'Shopify', 'Walmart', 'TikTok Shop', 'Private Label', 'Multiple Platforms'].map((p) => (
                          <option key={p} value={p} className="bg-[#111118]">{p}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-white/60 mb-1.5">Message <span className="text-[#00D4FF]">*</span></label>
                      <textarea
                        name="message"
                        required
                        rows={5}
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Tell us about your store, current challenges, and goals..."
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#00D4FF]/50 transition-colors resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="group flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white font-bold text-base hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] transition-shadow disabled:opacity-50"
                    >
                      {submitting ? 'Sending...' : 'Send Message'}
                      {!submitting && <Send size={18} className="transition-transform group-hover:translate-x-1" />}
                    </button>
                  </form>
                )}
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
