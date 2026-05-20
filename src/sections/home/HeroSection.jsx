import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion'
import { ArrowRight, Play, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import MagneticButton from '../../components/ui/MagneticButton'

function WordReveal({ children, delay = 0, className = '' }) {
  return (
    <span style={{ display: 'inline-block', overflow: 'hidden' }}>
      <motion.span
        style={{ display: 'inline-block' }}
        className={className}
        initial={{ y: '110%' }}
        animate={{ y: '0%' }}
        transition={{ delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.span>
    </span>
  )
}

function CharReveal({ text, delay = 0, className = '' }) {
  return (
    <span style={{ display: 'inline-flex', flexWrap: 'wrap' }}>
      {text.split('').map((char, i) => (
        <span key={i} style={{ display: 'inline-block', overflow: 'hidden' }}>
          <motion.span
            style={{ display: 'inline-block' }}
            className={className}
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            transition={{
              delay: delay + i * 0.032,
              duration: 0.65,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {char}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

function DrawLine({ delay = 0, fromRight = false }) {
  return (
    <motion.div
      className="h-px w-full"
      style={{
        background: 'linear-gradient(90deg, transparent, #00D4FF50, #7C3AED50, transparent)',
        transformOrigin: fromRight ? 'right' : 'left',
      }}
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ delay, duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
    />
  )
}

const ORBITAL_RINGS = [
  { size: 880, duration: 70, dir: 1,  border: 'rgba(0,212,255,0.07)',   dot: '#00D4FF', dotR: 3 },
  { size: 600, duration: 50, dir: -1, border: 'rgba(124,58,237,0.09)',  dot: '#7C3AED', dotR: 2.5 },
  { size: 360, duration: 32, dir: 1,  border: 'rgba(0,212,255,0.065)',  dot: '#00D4FF', dotR: 2 },
]

export default function HeroSection() {
  const canvasRef = useRef(null)
  const sectionRef = useRef(null)

  const rawX = useMotionValue(-500)
  const rawY = useMotionValue(-500)
  const springX = useSpring(rawX, { stiffness: 120, damping: 20 })
  const springY = useSpring(rawY, { stiffness: 120, damping: 20 })
  const gridMask = useMotionTemplate`radial-gradient(circle 220px at ${springX}px ${springY}px, black 0%, transparent 100%)`

  const handleMouseMove = (e) => {
    const rect = sectionRef.current?.getBoundingClientRect()
    if (!rect) return
    rawX.set(e.clientX - rect.left)
    rawY.set(e.clientY - rect.top)
  }
  const handleMouseLeave = () => {
    rawX.set(-500)
    rawY.set(-500)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf
    let lastMeteorTime = 0

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

    const W = () => canvas.offsetWidth
    const H = () => canvas.offsetHeight

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      alpha: Math.random() * 0.5 + 0.1,
      pulse: Math.random() * Math.PI * 2,
    }))

    const meteors = []
    const spawnMeteor = () => {
      meteors.push({
        x: Math.random() * W() * 1.3,
        y: -8,
        vx: -2.2 - Math.random() * 2,
        vy: 1.6 + Math.random() * 2,
        life: 1,
        alpha: 0.7 + Math.random() * 0.3,
        len: 55 + Math.random() * 75,
      })
    }

    const draw = (ts) => {
      ctx.clearRect(0, 0, W(), H())

      /* Spawn meteors every ~3 s */
      if (ts - lastMeteorTime > 3000) {
        spawnMeteor()
        if (Math.random() > 0.4) spawnMeteor()
        lastMeteorTime = ts
      }

      /* Constellation lines */
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(0,212,255,${0.13 * (1 - dist / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      /* Particles */
      particles.forEach((p) => {
        p.x = (p.x + p.vx + W()) % W()
        p.y = (p.y + p.vy + H()) % H()
        p.pulse += 0.015
        const a = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse))
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,212,255,${a})`
        ctx.fill()
      })

      /* Meteor streaks */
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i]
        m.x += m.vx
        m.y += m.vy
        m.life -= 0.007

        if (m.life <= 0 || m.y > H() + 50) {
          meteors.splice(i, 1)
          continue
        }

        const spd = Math.sqrt(m.vx * m.vx + m.vy * m.vy)
        const tx = m.x - (m.vx / spd) * m.len
        const ty = m.y - (m.vy / spd) * m.len

        const g = ctx.createLinearGradient(m.x, m.y, tx, ty)
        g.addColorStop(0,   `rgba(255,255,255,${m.alpha * m.life})`)
        g.addColorStop(0.2, `rgba(0,212,255,${m.alpha * m.life * 0.85})`)
        g.addColorStop(1,   'rgba(0,212,255,0)')

        ctx.beginPath()
        ctx.moveTo(m.x, m.y)
        ctx.lineTo(tx, ty)
        ctx.strokeStyle = g
        ctx.lineWidth = 1.5
        ctx.stroke()

        /* Head glow */
        ctx.beginPath()
        ctx.arc(m.x, m.y, 1.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${m.alpha * m.life})`
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0A0A0F]"
    >

      {/* Morph transition continuation */}
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

      {/* Constellation + meteor canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />

      {/* Orbital rings */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        {ORBITAL_RINGS.map((ring, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: ring.size,
              height: ring.size,
              border: `1px solid ${ring.border}`,
            }}
            animate={{ rotate: ring.dir === 1 ? 360 : -360 }}
            transition={{ duration: ring.duration, repeat: Infinity, ease: 'linear' }}
          >
            {/* Orbiting glowing dot */}
            <span
              className="absolute rounded-full"
              style={{
                width:  ring.dotR * 2 + 2,
                height: ring.dotR * 2 + 2,
                background: ring.dot,
                boxShadow: `0 0 8px ${ring.dot}, 0 0 18px ${ring.dot}90`,
                top:  -(ring.dotR + 1),
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Ambient glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #00D4FF 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      {/* Grid lines — dim base layer */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,212,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,1) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* Grid lines — cursor-glow layer */}
      <motion.div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,212,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,1) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          maskImage: gridMask,
          WebkitMaskImage: gridMask,
        }}
      />

      {/* Editorial sidebar — left vertical rule + label */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-4 z-20">
        <motion.div
          className="text-[10px] font-semibold tracking-[0.25em] uppercase text-white/20 [writing-mode:vertical-rl] rotate-180"
          style={{ fontFamily: 'Syne, sans-serif' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          Premium eCommerce
        </motion.div>
        <motion.div
          className="w-px bg-gradient-to-b from-transparent via-[#00D4FF]/40 to-transparent"
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{ delay: 1.6, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          style={{ height: '120px', transformOrigin: 'top' }}
        />
        <motion.div
          className="text-[10px] font-semibold tracking-[0.25em] uppercase text-white/20"
          style={{ fontFamily: 'Syne, sans-serif' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.6 }}
        >
          01
        </motion.div>
      </div>

      {/* Editorial corner label — top right */}
      <motion.div
        className="absolute top-24 right-6 hidden lg:flex items-center gap-2 z-20"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.9, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/20" style={{ fontFamily: 'Syne, sans-serif' }}>
          Since 2018
        </span>
        <div className="w-6 h-px bg-white/20" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20">

        {/* Top rule */}
        <div className="mb-8 max-w-sm mx-auto">
          <DrawLine delay={0.2} />
        </div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00D4FF]/30 bg-[#00D4FF]/8 mb-10"
        >
          <Sparkles size={14} className="text-[#00D4FF]" />
          <span className="text-sm text-[#00D4FF] font-medium tracking-wide">Premium eCommerce Management Since 2018</span>
        </motion.div>

        {/* Headline — editorial reveal */}
        <div className="mb-2" style={{ perspective: '1200px' }}>
          {/* Line 1: "Scale Your" */}
          <div className="flex flex-wrap justify-center gap-4 mb-1">
            <h1
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black leading-none tracking-tight text-white"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              <WordReveal delay={0.55}>Scale</WordReveal>
              {' '}
              <WordReveal delay={0.68}>Your</WordReveal>
            </h1>
          </div>

          {/* Line 2: "eCommerce" — char by char */}
          <div className="flex justify-center mb-1">
            <h1
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black leading-none tracking-tight gradient-text"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              <CharReveal text="eCommerce" delay={0.78} />
            </h1>
          </div>

          {/* Line 3: "Empire" */}
          <div className="flex justify-center">
            <h1
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black leading-none tracking-tight text-white"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              <WordReveal delay={1.1}>Empire</WordReveal>
            </h1>
          </div>
        </div>

        {/* Rule after headline */}
        <div className="my-8 flex items-center gap-4 max-w-lg mx-auto">
          <div className="flex-1">
            <DrawLine delay={1.28} fromRight />
          </div>
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] shrink-0"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.35, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          />
          <div className="flex-1">
            <DrawLine delay={1.28} />
          </div>
        </div>

        {/* Sub headline */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-white/50 text-sm sm:text-base md:text-xl max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed"
        >
          Full-service eCommerce management across Amazon, eBay, Etsy, Shopify, Walmart & TikTok Shop.
          We handle everything — you collect the profits.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.55, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 md:mb-20"
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.7, duration: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/8 rounded-2xl overflow-hidden border border-white/8"
        >
          {[
            { value: '500+', label: 'Active Clients' },
            { value: '$12M+', label: 'Revenue Generated' },
            { value: '97%', label: 'Client Satisfaction' },
            { value: '7+', label: 'Platforms' },
          ].map((stat, i) => (
            <div key={stat.label} className="bg-[#0A0A0F] px-6 py-5 text-center overflow-hidden">
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.75 + i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
                  {stat.value}
                </div>
                <div className="text-xs text-white/40 tracking-wide">{stat.label}</div>
              </motion.div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] text-white/30 tracking-widest uppercase" style={{ fontFamily: 'Syne, sans-serif' }}>Scroll</span>
        <motion.div
          className="w-px h-12 bg-gradient-to-b from-[#00D4FF]/60 to-transparent"
          animate={{ scaleY: [0, 1, 0], y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  )
}
