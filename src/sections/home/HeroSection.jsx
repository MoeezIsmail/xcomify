import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Play, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import MagneticButton from '../../components/ui/MagneticButton'

export default function HeroSection() {
  const canvasRef = useRef(null)

  // Particle background
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf

    const dpr = window.devicePixelRatio || 1
    const resize = () => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      canvas.width  = w * dpr
      canvas.height = h * dpr
      canvas.style.width  = w + 'px'
      canvas.style.height = h + 'px'
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      alpha: Math.random() * 0.5 + 0.1,
      pulse: Math.random() * Math.PI * 2,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        p.x = (p.x + p.vx + canvas.width) % canvas.width
        p.y = (p.y + p.vy + canvas.height) % canvas.height
        p.pulse += 0.015
        const a = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse))
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0, 212, 255, ${a})`
        ctx.fill()
      })
      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  const wordVariants = {
    hidden: { opacity: 0, y: 60, rotateX: -90 },
    visible: (i) => ({
      opacity: 1, y: 0, rotateX: 0,
      transition: { delay: 0.6 + i * 0.12, duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    }),
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0A0A0F]">
      {/* Morph transition continuation — center glow matching splash gradient, fades as iris opens */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(0,212,255,0.22) 0%, rgba(124,58,237,0.12) 28%, transparent 58%)',
          zIndex: 50,
        }}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
      />

      {/* Particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />

      {/* Ambient glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #00D4FF 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      {/* Grid lines */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,212,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,1) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center pt-32 pb-20">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00D4FF]/30 bg-[#00D4FF]/8 mb-8"
        >
          <Sparkles size={14} className="text-[#00D4FF]" />
          <span className="text-sm text-[#00D4FF] font-medium tracking-wide">Premium eCommerce Management Since 2018</span>
        </motion.div>

        {/* Headline */}
        <div className="overflow-hidden mb-6" style={{ perspective: '1000px' }}>
          {['Scale Your', 'eCommerce Empire'].map((line, li) => (
            <div key={li} className="overflow-hidden">
              <div className="flex flex-wrap justify-center gap-3">
                {line.split(' ').map((word, wi) => (
                  <motion.span
                    key={`${li}-${wi}`}
                    custom={li * 2 + wi}
                    variants={wordVariants}
                    initial="hidden"
                    animate="visible"
                    className={`text-6xl md:text-7xl lg:text-8xl font-black leading-none tracking-tight ${
                      li === 1 ? 'gradient-text' : 'text-white'
                    }`}
                    style={{ fontFamily: 'Cabinet Grotesk, sans-serif', display: 'inline-block' }}
                  >
                    {word}
                  </motion.span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sub headline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Full-service eCommerce management across Amazon, eBay, Etsy, Shopify, Walmart & TikTok Shop.
          We handle everything — you collect the profits.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap items-center justify-center gap-4 mb-20"
        >
          <MagneticButton>
            <Link
              to="/contact"
              className="group flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white font-semibold text-base shadow-[0_0_40px_rgba(0,212,255,0.3)] hover:shadow-[0_0_60px_rgba(0,212,255,0.5)] transition-shadow duration-300"
            >
              Get Free Consultation
              <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </MagneticButton>

          <MagneticButton>
            <Link
              to="/portfolio"
              className="group flex items-center gap-2.5 px-8 py-4 rounded-xl border border-white/15 text-white/80 font-semibold text-base hover:border-[#00D4FF]/40 hover:text-white hover:bg-white/4 transition-all duration-200"
            >
              <Play size={16} className="text-[#00D4FF]" />
              View Case Studies
            </Link>
          </MagneticButton>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/8 rounded-2xl overflow-hidden border border-white/8"
        >
          {[
            { value: '500+', label: 'Active Clients' },
            { value: '$12M+', label: 'Revenue Generated' },
            { value: '97%', label: 'Client Satisfaction' },
            { value: '7+', label: 'Platforms' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 + i * 0.1 }}
              className="bg-[#0A0A0F] px-6 py-5 text-center"
            >
              <div className="text-2xl md:text-3xl font-black text-white mb-1" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
                {stat.value}
              </div>
              <div className="text-xs text-white/40 tracking-wide">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-white/30 tracking-widest uppercase">Scroll</span>
        <motion.div
          className="w-px h-12 bg-gradient-to-b from-[#00D4FF]/60 to-transparent"
          animate={{ scaleY: [0, 1, 0], y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  )
}
