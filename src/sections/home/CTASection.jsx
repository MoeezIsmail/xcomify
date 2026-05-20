import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Zap } from 'lucide-react'
import MagneticButton from '../../components/ui/MagneticButton'

function DrawLine({ delay = 0, fromRight = false }) {
  return (
    <motion.div
      className="h-px w-full"
      style={{
        background: 'linear-gradient(90deg, transparent, #00D4FF60, #7C3AED60, transparent)',
        transformOrigin: fromRight ? 'right' : 'left',
      }}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
    />
  )
}

function WordReveal({ children, delay = 0, className = '', style = {} }) {
  return (
    <span style={{ display: 'inline-block', overflow: 'hidden', ...style }}>
      <motion.span
        style={{ display: 'inline-block' }}
        className={className}
        initial={{ y: '110%' }}
        whileInView={{ y: '0%' }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.span>
    </span>
  )
}

function CharReveal({ text, delay = 0, className = '' }) {
  return (
    <span style={{ display: 'inline-flex', overflow: 'hidden', paddingBottom: '0.12em', marginBottom: '-0.12em' }}>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          className={className}
          style={{ display: 'inline-block' }}
          initial={{ y: '110%', opacity: 0 }}
          whileInView={{ y: '0%', opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            delay: delay + i * 0.035,
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  )
}

const ticker = ['500+ Clients', '$12M+ Revenue Generated', '97% Satisfaction', '7 Platforms', 'Since 2018', 'Premium Management']

export default function CTASection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="py-14 sm:py-20 lg:py-32 bg-[#050508] relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="w-[900px] h-[450px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, #00D4FF 0%, #7C3AED 40%, transparent 70%)', filter: 'blur(90px)' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.18 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </div>

      {/* Large editorial background text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <motion.span
          className="text-[18vw] font-black text-white/[0.02] leading-none tracking-tighter whitespace-nowrap"
          style={{ fontFamily: 'Syne, sans-serif' }}
          initial={{ opacity: 0, scale: 1.08 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        >
          DOMINATE
        </motion.span>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">

        {/* Top rule */}
        <div className="mb-10">
          <DrawLine delay={0.1} />
        </div>

        {/* Badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#F59E0B]/30 bg-[#F59E0B]/8 mb-10"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <Zap size={14} className="text-[#F59E0B]" />
          <span className="text-sm text-[#F59E0B] font-medium">Limited spots available for Q3 onboarding</span>
        </motion.div>

        {/* Headline — editorial word reveal */}
        <h2
          className="text-2xl sm:text-4xl md:text-6xl font-black text-white mb-3 leading-[1.05] tracking-tight"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          <span className="flex flex-wrap justify-center gap-x-4">
            <WordReveal delay={0.45}>Ready</WordReveal>
            <WordReveal delay={0.55}>to</WordReveal>
          </span>
        </h2>

        {/* "DOMINATE" — character-level reveal with glow */}
        <div className="mb-3 overflow-visible">
          <CharReveal
            text="DOMINATE"
            delay={0.62}
            className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black gradient-text tracking-tight"
          />
        </div>

        <h2
          className="text-4xl md:text-6xl font-black text-white mb-6 leading-[1.05] tracking-tight"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          <span className="flex flex-wrap justify-center gap-x-4">
            <WordReveal delay={0.95}>Your</WordReveal>
            <WordReveal delay={1.05}>Marketplace?</WordReveal>
          </span>
        </h2>

        {/* Divider after headline */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex-1">
            <DrawLine delay={1.15} fromRight />
          </div>
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] shrink-0"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1.2, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          />
          <div className="flex-1">
            <DrawLine delay={1.15} />
          </div>
        </div>

        {/* Subtext */}
        <motion.p
          className="text-white/50 text-lg mb-12 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 1.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          Join 500+ clients who've scaled past 6 and 7 figures with xComify.
          Your free consultation is one click away.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-4 mb-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 1.38, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <MagneticButton>
            <Link
              to="/contact"
              className="group flex items-center gap-2.5 px-6 sm:px-10 py-4 sm:py-5 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white font-bold text-lg shadow-[0_0_50px_rgba(0,212,255,0.3)] hover:shadow-[0_0_70px_rgba(0,212,255,0.5)] transition-shadow duration-300"
            >
              Book Free Strategy Call
              <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </MagneticButton>

          <MagneticButton>
            <Link
              to="/pricing"
              className="flex items-center gap-2 px-6 sm:px-10 py-4 sm:py-5 rounded-xl border border-white/15 text-white/80 font-semibold text-lg hover:border-white/30 hover:text-white hover:bg-white/4 transition-all duration-200"
            >
              View Pricing Plans
            </Link>
          </MagneticButton>
        </motion.div>

        {/* Trust badges — staggered left slide */}
        <div className="flex items-center justify-center gap-8 flex-wrap mb-12">
          {['No long-term contracts', 'Cancel anytime', '30-day results guarantee'].map((item, i) => (
            <motion.div
              key={item}
              className="flex items-center gap-2 text-sm text-white/40"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 1.5 + i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#00D4FF]" />
              {item}
            </motion.div>
          ))}
        </div>

        {/* Bottom rule */}
        <DrawLine delay={1.7} />
      </div>

      {/* Scrolling ticker */}
      <div className="mt-14 overflow-hidden border-t border-b border-white/5 py-3">
        <motion.div
          className="flex gap-16 whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
        >
          {[...ticker, ...ticker].map((item, i) => (
            <span key={i} className="text-xs font-semibold tracking-[0.2em] uppercase text-white/25 shrink-0" style={{ fontFamily: 'Syne, sans-serif' }}>
              {item}
              <span className="ml-16 text-[#00D4FF]/30">◆</span>
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
