import { motion } from 'framer-motion'
import { Check, X, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { pricingPlans } from '../data/platforms'
import ScrollReveal from '../components/ui/ScrollReveal'
import MagneticButton from '../components/ui/MagneticButton'

export default function Pricing() {
  return (
    <main className="pt-24">
      <section className="py-10 sm:py-14 lg:py-20 bg-[#0A0A0F] text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="text-xs tracking-[0.3em] uppercase text-[#00D4FF] font-medium mb-4 block">Simple Pricing</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-4 sm:mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>
              Transparent Pricing,{' '}
              <span className="gradient-text">Extraordinary Results</span>
            </h1>
            <p className="text-white/50 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
              No hidden fees. No long-term lock-ins. Pay for results, not promises. All plans include a 30-day results guarantee.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-10 sm:py-16 lg:py-24 bg-[#050508]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.6 }}
                className={`relative rounded-2xl border flex flex-col overflow-hidden ${
                  plan.highlight
                    ? 'border-[#7C3AED]/50 shadow-[0_0_50px_rgba(124,58,237,0.15)]'
                    : 'border-white/8'
                }`}
                style={{ background: plan.highlight ? 'rgba(124,58,237,0.05)' : 'rgba(255,255,255,0.02)' }}
              >
                {plan.badge && (
                  <div className="absolute top-0 inset-x-0 flex justify-center">
                    <div className="px-4 py-1 rounded-b-xl text-xs font-bold" style={{ background: plan.color, color: '#0A0A0F' }}>
                      {plan.badge}
                    </div>
                  </div>
                )}

                <div className={`p-8 flex-1 ${plan.badge ? 'pt-10' : ''}`}>
                  <div className="mb-6">
                    <h3 className="text-white font-black text-2xl mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>{plan.name}</h3>
                    <p className="text-white/40 text-sm">{plan.description}</p>
                  </div>

                  <div className="mb-8">
                    {plan.price ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl md:text-5xl font-black" style={{ fontFamily: 'Syne, sans-serif', color: plan.color }}>${plan.price}</span>
                        <span className="text-white/40 text-sm">/month</span>
                      </div>
                    ) : (
                      <div className="text-3xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Custom</div>
                    )}
                  </div>

                  <ul className="flex flex-col gap-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm text-white/70">
                        <Check size={15} className="mt-0.5 shrink-0" style={{ color: plan.color }} />
                        {feature}
                      </li>
                    ))}
                    {plan.notIncluded.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm text-white/25">
                        <X size={15} className="mt-0.5 shrink-0 text-white/20" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-8 pt-0">
                  <MagneticButton className="w-full">
                    <Link
                      to="/contact"
                      className="group w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200"
                      style={plan.highlight
                        ? { background: `linear-gradient(135deg, ${plan.color}, #00D4FF)`, color: '#fff', boxShadow: `0 0 30px ${plan.color}40` }
                        : { border: `1px solid ${plan.color}40`, color: plan.color, background: `${plan.color}08` }
                      }
                    >
                      {plan.cta}
                      <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                  </MagneticButton>
                </div>
              </motion.div>
            ))}
          </div>

          <ScrollReveal className="mt-16 text-center">
            <div className="border border-white/8 rounded-2xl p-8 bg-white/2">
              <h3 className="text-white font-bold text-xl md:text-2xl mb-3">Not sure which plan is right for you?</h3>
              <p className="text-white/40 mb-6">Book a free 30-minute strategy call and we'll recommend the perfect plan for your situation.</p>
              <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white font-semibold text-sm hover:shadow-[0_0_30px_rgba(0,212,255,0.3)] transition-shadow">
                Book Free Consultation <ArrowRight size={16} />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  )
}
