import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Zap } from 'lucide-react'
import ScrollReveal from '../../components/ui/ScrollReveal'
import MagneticButton from '../../components/ui/MagneticButton'

export default function CTASection() {
  return (
    <section className="py-32 bg-[#050508] relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[800px] h-[400px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(ellipse, #00D4FF 0%, #7C3AED 40%, transparent 70%)', filter: 'blur(80px)' }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <ScrollReveal>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#F59E0B]/30 bg-[#F59E0B]/8 mb-8">
            <Zap size={14} className="text-[#F59E0B]" />
            <span className="text-sm text-[#F59E0B] font-medium">Limited spots available for Q3 onboarding</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-black text-white mb-6" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
            Ready to{' '}
            <span className="gradient-text">Dominate</span>{' '}
            Your Marketplace?
          </h2>

          <p className="text-white/50 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
            Join 500+ clients who've scaled past 6 and 7 figures with xComify.
            Your free consultation is one click away.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <MagneticButton>
              <Link
                to="/contact"
                className="group flex items-center gap-2.5 px-10 py-5 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white font-bold text-lg shadow-[0_0_50px_rgba(0,212,255,0.3)] hover:shadow-[0_0_70px_rgba(0,212,255,0.5)] transition-shadow duration-300"
              >
                Book Free Strategy Call
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </MagneticButton>

            <MagneticButton>
              <Link
                to="/pricing"
                className="flex items-center gap-2 px-10 py-5 rounded-xl border border-white/15 text-white/80 font-semibold text-lg hover:border-white/30 hover:text-white hover:bg-white/4 transition-all duration-200"
              >
                View Pricing Plans
              </Link>
            </MagneticButton>
          </div>

          <div className="mt-10 flex items-center justify-center gap-8 flex-wrap">
            {['No long-term contracts', 'Cancel anytime', '30-day results guarantee'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-white/40">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00D4FF]" />
                {item}
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
