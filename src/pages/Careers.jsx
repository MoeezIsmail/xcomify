import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, Check, Briefcase, Globe, Heart, Zap } from 'lucide-react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import ScrollReveal from '../components/ui/ScrollReveal'

const perks = [
  { icon: Globe, title: 'Remote First', description: 'Work from anywhere in the world. We\'re a distributed team across 15+ countries.' },
  { icon: Zap, title: 'Growth Fast-Track', description: 'Clear promotion paths and performance-based raises every 6 months.' },
  { icon: Heart, title: 'People-First Culture', description: 'Mental health support, flexible hours, and a team that genuinely cares.' },
  { icon: Briefcase, title: 'Top-Tier Equipment', description: '$1,500 equipment budget and premium software tools fully covered.' },
]

const openRoles = [
  { title: 'Amazon PPC Specialist', type: 'Full-time', location: 'Remote', level: 'Mid-Senior' },
  { title: 'Shopify Developer', type: 'Full-time', location: 'Remote', level: 'Senior' },
  { title: 'eCommerce Virtual Assistant', type: 'Full-time', location: 'Remote', level: 'Entry-Mid' },
  { title: 'Content Writer (eCommerce)', type: 'Part-time', location: 'Remote', level: 'Mid' },
  { title: 'Product Research Analyst', type: 'Full-time', location: 'Remote', level: 'Mid' },
]

const initialForm = {
  full_name: '', email: '', phone: '', city: '',
  skills: '', experience: '', portfolio_link: '',
  expected_salary: '', cover_letter: '', cv: null,
}

export default function Careers() {
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    const { name, value, files } = e.target
    setForm((prev) => ({ ...prev, [name]: files ? files[0] : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v) })
      await axios.post('/api/applications', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setSubmitted(true)
      toast.success('Application submitted! We\'ll be in touch within 3 business days.')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="pt-24">
      <Toaster position="top-right" toastOptions={{ style: { background: '#111118', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />

      {/* Hero */}
      <section className="py-20 bg-[#0A0A0F] text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="text-xs tracking-[0.3em] uppercase text-[#00D4FF] font-medium mb-4 block">We're Hiring</span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>
              Join the Team That's{' '}
              <span className="gradient-text">Reshaping eCommerce</span>
            </h1>
            <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto">
              We're looking for ambitious, talented people who want to build the future of eCommerce. Remote-first, results-driven, people-first.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Perks */}
      <section className="py-16 bg-[#050508]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {perks.map((perk, i) => (
              <motion.div key={perk.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="border border-white/8 rounded-2xl p-6 text-center hover:border-white/15 hover:bg-white/2 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/20 flex items-center justify-center mx-auto mb-4">
                  <perk.icon size={22} className="text-[#00D4FF]" />
                </div>
                <h3 className="text-white font-bold text-base md:text-lg mb-2">{perk.title}</h3>
                <p className="text-white/40 text-sm">{perk.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Roles */}
      <section className="py-16 bg-[#0A0A0F]">
        <div className="max-w-5xl mx-auto px-6">
          <ScrollReveal className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
              Open <span className="gradient-text">Positions</span>
            </h2>
          </ScrollReveal>
          <div className="flex flex-col gap-3">
            {openRoles.map((role, i) => (
              <motion.div key={role.title} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="group border border-white/8 rounded-xl px-6 py-5 flex items-center justify-between hover:border-white/20 hover:bg-white/2 transition-all duration-200">
                <div>
                  <div className="text-white font-semibold text-base mb-1">{role.title}</div>
                  <div className="flex gap-3">
                    <span className="text-xs text-white/40">{role.type}</span>
                    <span className="text-xs text-white/40">{role.location}</span>
                    <span className="text-xs text-[#00D4FF]">{role.level}</span>
                  </div>
                </div>
                <a href="#apply" className="px-4 py-2 rounded-lg text-xs font-medium bg-[#00D4FF]/10 border border-[#00D4FF]/30 text-[#00D4FF] hover:bg-[#00D4FF]/20 transition-all">
                  Apply Now
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="py-24 bg-[#050508]">
        <div className="max-w-3xl mx-auto px-6">
          <ScrollReveal className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>
              Apply Now
            </h2>
            <p className="text-white/40">Fill out the form below and we'll get back to you within 3 business days.</p>
          </ScrollReveal>

          {submitted ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="text-center py-20 border border-[#00D4FF]/30 rounded-2xl bg-[#00D4FF]/5">
              <div className="w-16 h-16 rounded-full bg-[#00D4FF]/20 flex items-center justify-center mx-auto mb-4">
                <Check size={28} className="text-[#00D4FF]" />
              </div>
              <h3 className="text-white font-bold text-xl mb-2">Application Received!</h3>
              <p className="text-white/50">We review applications within 3 business days. Check your email for confirmation.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="border border-white/8 rounded-2xl p-8 bg-white/2 flex flex-col gap-5">
              <div className="grid sm:grid-cols-2 gap-5">
                {[
                  { name: 'full_name', label: 'Full Name', type: 'text', required: true },
                  { name: 'email', label: 'Email Address', type: 'email', required: true },
                  { name: 'phone', label: 'Phone Number', type: 'tel' },
                  { name: 'city', label: 'City / Country', type: 'text' },
                  { name: 'expected_salary', label: 'Expected Salary (USD/month)', type: 'text' },
                  { name: 'portfolio_link', label: 'Portfolio / LinkedIn URL', type: 'url' },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm text-white/60 mb-1.5">{field.label}{field.required && <span className="text-[#00D4FF] ml-1">*</span>}</label>
                    <input
                      type={field.type}
                      name={field.name}
                      required={field.required}
                      value={form[field.name]}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#00D4FF]/50 transition-colors"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1.5">Skills <span className="text-[#00D4FF]">*</span></label>
                <input
                  name="skills"
                  required
                  value={form.skills}
                  onChange={handleChange}
                  placeholder="e.g. Amazon PPC, Shopify, Listing Optimization, Data Analysis"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#00D4FF]/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1.5">Experience Level & Years</label>
                <input
                  name="experience"
                  value={form.experience}
                  onChange={handleChange}
                  placeholder="e.g. 3 years Amazon FBA management, 2 years PPC"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#00D4FF]/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1.5">Cover Letter</label>
                <textarea
                  name="cover_letter"
                  rows={5}
                  value={form.cover_letter}
                  onChange={handleChange}
                  placeholder="Tell us why you want to join xComify and what makes you the perfect fit..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#00D4FF]/50 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1.5">Upload CV / Resume</label>
                <label className="flex items-center gap-3 px-4 py-4 rounded-xl bg-white/5 border border-dashed border-white/20 cursor-pointer hover:border-[#00D4FF]/40 transition-colors">
                  <Upload size={18} className="text-white/40" />
                  <span className="text-sm text-white/40">
                    {form.cv ? form.cv.name : 'Click to upload PDF, DOC, or DOCX (max 5MB)'}
                  </span>
                  <input type="file" name="cv" accept=".pdf,.doc,.docx" onChange={handleChange} className="hidden" />
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white font-bold text-base hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}
