import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { services } from '../../data/services'
import ServiceCard from '../../components/ui/ServiceCard'

const TOTAL    = services.length   // 12
const SN       = 0.62              // neighbour scale (3-card desktop)
const FH_RATIO = 1.40
const MIN_FH   = 300               // content safety floor

/*
  Desktop: orbit fills the right 60% column at full viewport height.
    Height constraint: fw = ((1-piv)*vh − 50) / (1+SN+FH_RATIO/2)
    Width constraint:  fw = (orbitW − 50)    / (1+2·SN)
    fw = min(both). r = fw·(1+SN)+50, capped to fit.
    Narrow mode when gap < 0.

  Mobile: orbit fills flex-1 below compact heading.
    Card centre at 50% of orbit area, pivot at 8%.
*/
function getOrbitDims(vw, vh) {
  if (vw < 768) {
    const orbitH  = Math.max(300, vh - 145)
    const fw      = Math.min(vw - 24, 320)
    const fh      = Math.max(MIN_FH, Math.min(Math.round(fw * FH_RATIO), Math.round(orbitH * 0.84)))
    const pivFrac = 0.08
    const r       = Math.round((0.50 - pivFrac) * orbitH)
    return { fw, fh, r, mobile: true, narrow: false, pivot: `${Math.round(pivFrac * 100)}%` }
  }

  const orbitH  = vh
  const orbitW  = Math.round(vw * 0.60)
  const pivFrac = 0.15
  const denomH  = 1 + SN + FH_RATIO / 2        // 2.32
  const denomW  = 1 + 2 * SN                   // 2.24
  const rawFwH  = ((1 - pivFrac) * orbitH - 50) / denomH
  const rawFwW  = (orbitW - 50) / denomW
  const fw      = Math.min(330, Math.max(240, Math.round(Math.min(rawFwH, rawFwW))))
  const fh      = Math.max(MIN_FH, Math.round(fw * FH_RATIO))
  const idealR  = Math.round(fw * (1 + SN) + 50)
  const maxRH   = Math.max(fw, Math.floor((1 - pivFrac) * orbitH - fh / 2))
  const maxRW   = Math.max(fw, Math.floor(orbitW - fw * SN))
  const r       = Math.min(idealR, Math.min(maxRH, maxRW))
  const gap     = 0.5 * r - fw * (1 + SN) / 2

  if (gap >= 0) {
    return { fw, fh, r, mobile: false, narrow: false, pivot: `${Math.round(pivFrac * 100)}%` }
  }

  // Narrow fallback — 1 card, bigger width
  const fw1 = Math.min(Math.round(orbitW * 0.72), 360)
  const r1  = Math.round(0.42 * orbitH)
  const fh1 = Math.max(MIN_FH, Math.min(Math.round(fw1 * FH_RATIO), Math.round(orbitH * 0.80)))
  return { fw: fw1, fh: fh1, r: r1, mobile: false, narrow: true, pivot: '8%' }
}

function baseAngle(i) { return 90 + (i / TOTAL) * 360 }

/* ─── OrbitCard ─────────────────────────────────────────────────────────── */
function OrbitCard({ service, index, rotation, negatedRotation, r, fw, fh, oneCard }) {
  const base = baseAngle(index)
  const rad  = (base * Math.PI) / 180
  const ox   = Math.cos(rad) * r
  const oy   = Math.sin(rad) * r

  const dist = (v) => {
    const eff = ((base + v - 90) % 360 + 360) % 360
    return eff <= 180 ? eff : 360 - eff
  }

  const scale = useTransform(rotation, v => {
    const d = dist(v)
    if (d < 14) return 1
    if (oneCard) {
      if (d < 22) return 1 - ((d - 14) / 8) * 0.15
      return 0.85
    }
    if (d < 30) return 1 - ((d - 14) / 16) * (1 - SN)
    return SN
  })

  const opacity = useTransform(rotation, v => {
    const d = dist(v)
    if (d < 14) return 1
    if (oneCard) {
      if (d < 22) return 1 - (d - 14) / 8
      return 0
    }
    if (d < 38) return 0.84
    if (d < 52) return 0.84 * (1 - (d - 38) / 14)
    return 0
  })

  const zIndex = useTransform(rotation, v => dist(v) < 20 ? 100 : 50)

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: `calc(50% + ${ox}px)`,
        top:  `calc(50% + ${oy}px)`,
        width: fw,
        marginLeft: -(fw / 2),
        marginTop:  -(fh / 2),
        opacity, scale, rotate: negatedRotation, zIndex,
        transformOrigin: 'center center',
      }}
    >
      <div style={{ height: fh }}>
        <ServiceCard service={service} index={index} />
      </div>
    </motion.div>
  )
}

/* ─── ServicesSection ───────────────────────────────────────────────────── */
export default function ServicesSection() {
  const sectionRef = useRef(null)

  const [dims, setDims] = useState(() => getOrbitDims(
    typeof window !== 'undefined' ? window.innerWidth  : 1280,
    typeof window !== 'undefined' ? window.innerHeight : 900
  ))

  useEffect(() => {
    const onResize = () => setDims(getOrbitDims(window.innerWidth, window.innerHeight))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const { r, fw, fh, mobile, narrow, pivot } = dims
  const oneCard = mobile || narrow
  const showDecor = !oneCard
  const OW = (r + fw / 2 + 56) * 2
  const OH = (r + fh / 2 + 56) * 2

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  const rawRotation     = useTransform(scrollYProgress, [0, 1], [0, -330])
  const rotation        = useSpring(rawRotation, { stiffness: 28, damping: 24, mass: 1 })
  const negatedRotation = useTransform(rotation, v => -v)

  return (
    <section ref={sectionRef} style={{ height: '260vh' }} className="relative">
      {/*
        Desktop: side-by-side — left 40% heading, right 60% orbit.
        Mobile:  stacked    — compact heading top, orbit flex-1 below.
      */}
      <div className="sticky top-0 h-screen flex flex-col md:flex-row bg-[#050508] overflow-hidden">

        {/* ── Left column (desktop) / Top strip (mobile) ── */}
        <div className="
          md:w-[40%] md:flex-shrink-0 md:h-full
          flex flex-col md:justify-center xl:justify-end
          px-6 md:px-10 lg:px-14
          pt-7 pb-3 md:pt-0 md:pb-0
          md:border-r md:border-white/[0.06]
        ">
          <span className="text-xs tracking-[0.3em] uppercase text-[#00D4FF] font-medium mb-3 md:mb-4 block">
            What We Do
          </span>
          <h2
            className="text-4xl md:text-5xl xl:text-6xl font-black text-white mb-0 md:mb-5 leading-tight"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            Services Built for{' '}
            <span className="gradient-text">7-Figure Growth</span>
          </h2>

          {/* Description + CTA — desktop only */}
          <p className="hidden md:block text-white/50 text-base md:text-lg leading-relaxed mb-8 max-w-sm">
            Every service is engineered around one goal: maximising your eCommerce revenue
            while minimising your operational headaches.
          </p>
          <Link
            to="/services"
            className="hidden md:inline-flex group items-center gap-2 px-6 py-3 rounded-xl border border-white/15 text-white font-semibold text-sm hover:border-[#00D4FF]/40 hover:bg-white/4 transition-all duration-200 w-fit"
          >
            Explore All Services
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* ── Right column (desktop) / Bottom orbit area (mobile) ── */}
        <div className="flex-1 relative overflow-hidden min-h-0">

          {/* Glow — stronger on mobile for card clarity */}
          <div className="absolute pointer-events-none" style={{
            left: '50%',
            top: `calc(${pivot} + ${r}px)`,
            transform: 'translate(-50%, -50%)',
            width:  fw * (mobile ? 2.6 : 2.0),
            height: fw * (mobile ? 2.6 : 2.0),
            borderRadius: '50%',
            background: mobile
              ? 'radial-gradient(circle, rgba(0,212,255,0.20) 0%, rgba(124,58,237,0.10) 38%, transparent 68%)'
              : 'radial-gradient(circle, rgba(0,212,255,0.10) 0%, transparent 70%)',
            filter: `blur(${mobile ? 36 : 52}px)`,
          }} />

          {/* Outer decorative ring — 3-card only */}
          {showDecor && (
            <div className="absolute rounded-full pointer-events-none" style={{
              width: (r + 90) * 2, height: (r + 90) * 2,
              border: '1px solid rgba(255,255,255,0.03)',
              left: '50%', top: pivot, transform: 'translate(-50%, -50%)',
            }} />
          )}

          {/* Dashed orbit track — brighter on mobile */}
          <div className="absolute rounded-full pointer-events-none" style={{
            width: r * 2, height: r * 2,
            border: `1px dashed rgba(255,255,255,${mobile ? '0.22' : '0.13'})`,
            left: '50%', top: pivot, transform: 'translate(-50%, -50%)',
          }} />

          {/* ── Rotating wrapper ── */}
          <motion.div style={{
            position: 'absolute',
            width: OW, height: OH,
            left: '50%', top: pivot,
            x: -(OW / 2), y: -(OH / 2),
            rotate: rotation,
          }}>
            {services.map((service, i) => (
              <OrbitCard
                key={`${service.id}-${r}-${oneCard}`}
                service={service} index={i}
                rotation={rotation} negatedRotation={negatedRotation}
                r={r} fw={fw} fh={fh} oneCard={oneCard}
              />
            ))}
          </motion.div>

          {/* Gradient — top */}
          <div className="absolute top-0 left-0 right-0 pointer-events-none"
            style={{ height: mobile ? 16 : 60, background: 'linear-gradient(to bottom, #050508, transparent)' }} />
          {/* Gradient — bottom */}
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none"
            style={{ height: 56, background: 'linear-gradient(to top, #050508, transparent)' }} />


          {/* Scroll hint */}
          <div className={`absolute bottom-6 pointer-events-none flex flex-col items-center gap-2 ${mobile ? 'left-1/2 -translate-x-1/2' : 'right-5 hidden sm:flex'}`}>
            <motion.div
              className="w-px h-8 bg-gradient-to-b from-[#00D4FF]/50 to-transparent"
              animate={{ scaleY: [0, 1, 0], y: [0, 5, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <span className={`text-white/25 tracking-widest uppercase ${mobile ? 'text-[10px]' : 'text-xs'}`}
              style={mobile ? undefined : { writingMode: 'vertical-rl' }}>scroll</span>
          </div>
        </div>

        {/* Mobile CTA — below orbit */}
        <div className="md:hidden flex-shrink-0 text-center py-3 px-6">
          <Link
            to="/services"
            className="group inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-white/15 text-white font-semibold text-sm hover:border-[#00D4FF]/40 hover:bg-white/4 transition-all duration-200"
          >
            Explore All Services
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  )
}
