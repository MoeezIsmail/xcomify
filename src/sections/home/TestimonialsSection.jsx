import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import { testimonials } from '../../data/platforms'
import ScrollReveal from '../../components/ui/ScrollReveal'

/* ── card content (shared between mobile + desktop) ─────────── */
function CardContent({ t }) {
  return (
    <>
      <div className="absolute top-5 right-5 opacity-[0.07] pointer-events-none">
        <Quote size={68} className="text-[#00D4FF]" />
      </div>

      <div className="flex gap-1 mb-5">
        {Array.from({ length: t.rating }).map((_, s) => (
          <Star key={s} size={16} className="text-[#F59E0B] fill-[#F59E0B]" />
        ))}
      </div>

      <blockquote className="flex-1 text-white/80 text-sm sm:text-base leading-relaxed mb-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
        "{t.content}"
      </blockquote>

      <div className="h-px bg-white/8 mb-5" />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-white font-black text-base flex-shrink-0"
            style={{
              background:  'linear-gradient(135deg, #00D4FF, #7C3AED)',
              boxShadow:   '0 0 16px rgba(0,212,255,0.3)',
            }}
          >
            {t.name[0]}
          </div>
          <div>
            <div className="text-white font-bold text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>{t.name}</div>
            <div className="text-white/40 text-xs mt-0.5">{t.role}, {t.company}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 rounded-full text-[11px] border border-white/10 bg-white/5 text-white/50">{t.platform}</span>
          <span className="px-3 py-1 rounded-full text-[11px] font-bold border border-[#00D4FF]/35 bg-[#00D4FF]/10 text-[#00D4FF]">{t.revenue}</span>
        </div>
      </div>
    </>
  )
}

/* ── dot indicators ──────────────────────────────────────────── */
function Dots({ count, active, onSelect }) {
  return (
    <div className="flex justify-center items-center gap-2.5 mt-8">
      {Array.from({ length: count }).map((_, i) => (
        <motion.button
          key={i}
          onClick={() => onSelect(i)}
          animate={{
            width:      i === active ? 28 : 8,
            background: i === active ? '#00D4FF' : 'rgba(255,255,255,0.2)',
            boxShadow:  i === active ? '0 0 10px rgba(0,212,255,0.65)' : 'none',
          }}
          transition={{ duration: 0.28 }}
          className="h-1.5 rounded-full border-none outline-none p-0 cursor-pointer"
        />
      ))}
    </div>
  )
}

/* ── book-page variants (mobile) ─────────────────────────────── */
const pageVariants = {
  initial: (d) => ({
    rotateY: d > 0 ? 88 : -88,
    opacity: 0,
    scale:   0.88,
  }),
  animate: {
    rotateY: 0,
    opacity: 1,
    scale:   1,
  },
  exit: (d) => ({
    rotateY: d > 0 ? -88 : 88,
    opacity: 0,
    scale:   0.88,
  }),
}

/* ── main ────────────────────────────────────────────────────── */
export default function TestimonialsSection() {
  const [active, setActive] = useState(Math.floor(testimonials.length / 2))
  const [dir,    setDir]    = useState(1)
  const [spread, setSpread] = useState(290)

  /* responsive spread for desktop coverflow */
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      setSpread(w < 768 ? 195 : w < 1024 ? 240 : w < 1280 ? 278 : 305)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  /* mobile auto-play — resets timer on every manual change too */
  useEffect(() => {
    const id = setInterval(() => {
      setDir(1)
      setActive(prev => (prev + 1) % testimonials.length)
    }, 3500)
    return () => clearInterval(id)
  }, [active])

  const goTo = (i) => {
    setDir(i > active ? 1 : -1)
    setActive(i)
  }

  const onDragEnd = (_, { offset }) => {
    if      (offset.x < -65 && active < testimonials.length - 1) goTo(active + 1)
    else if (offset.x >  65 && active > 0)                        goTo(active - 1)
  }

  return (
    <section className="py-16 sm:py-24 lg:py-32 bg-[#0A0A0F] relative overflow-hidden">

      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 55% at 50% 65%, rgba(124,58,237,0.07) 0%, transparent 65%)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Heading */}
        <ScrollReveal className="text-center mb-12 sm:mb-16">
          <span className="text-xs tracking-[0.3em] uppercase text-[#00D4FF] font-medium mb-4 block">
            Client Stories
          </span>
          <h2
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            Don't Take <span className="gradient-text">Our Word for It</span>
          </h2>
        </ScrollReveal>

        {/* ══════════════════════════
            MOBILE < sm — book-page auto-carousel
        ══════════════════════════ */}
        <div className="sm:hidden">
          <div
            className="relative"
            style={{ height: 420, perspective: '1100px', perspectiveOrigin: '50% 50%' }}
          >
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={active}
                custom={dir}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0}
                onDragEnd={onDragEnd}
                className="absolute inset-0 rounded-2xl p-6 flex flex-col cursor-grab active:cursor-grabbing overflow-hidden"
                style={{
                  transformStyle: 'preserve-3d',
                  border:     '1px solid rgba(0,212,255,0.3)',
                  background: 'linear-gradient(140deg, rgba(0,212,255,0.08) 0%, rgba(124,58,237,0.06) 100%)',
                  boxShadow:  '0 24px 80px rgba(0,212,255,0.15)',
                  backdropFilter:       'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                }}
              >
                {/* page-edge accent — left rule that looks like a book spine */}
                <div
                  className="absolute left-0 top-[10%] bottom-[10%] w-[3px] rounded-full"
                  style={{ background: 'linear-gradient(180deg, transparent, rgba(0,212,255,0.4), transparent)' }}
                />
                <CardContent t={testimonials[active]} />
              </motion.div>
            </AnimatePresence>
          </div>
          <Dots count={testimonials.length} active={active} onSelect={goTo} />
        </div>

        {/* ══════════════════════════════════
            TABLET + DESKTOP sm+ — 3-D coverflow
        ══════════════════════════════════ */}
        <div className="hidden sm:block">
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0}
            onDragEnd={onDragEnd}
            className="relative select-none cursor-grab active:cursor-grabbing"
            style={{ height: 460, perspective: '1500px', perspectiveOrigin: '50% 44%' }}
          >
            {testimonials.map((t, i) => {
              const pos    = i - active
              const absPos = Math.abs(pos)
              const isAct  = pos === 0

              return (
                <motion.div
                  key={t.id}
                  onClick={() => !isAct && goTo(i)}
                  animate={{
                    x:       `calc(-50% + ${pos * spread}px)`,
                    rotateY: pos * -42,
                    scale:   isAct ? 1.03 : Math.max(0.64, 1 - absPos * 0.14),
                    opacity: isAct ? 1    : Math.max(0.22, 1 - absPos * 0.33),
                  }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col overflow-hidden"
                  style={{
                    position:             'absolute',
                    left:                 '50%',
                    top:                  0,
                    width:                420,
                    maxWidth:             '82vw',
                    height:               440,
                    transformStyle:       'preserve-3d',
                    zIndex:               isAct ? 30 : Math.max(1, 20 - absPos * 6),
                    cursor:               isAct ? 'grab' : 'pointer',
                    userSelect:           'none',
                    borderRadius:         22,
                    padding:              '30px 30px',
                    border:               isAct
                      ? '1px solid rgba(0,212,255,0.32)'
                      : '1px solid rgba(255,255,255,0.06)',
                    background:           isAct
                      ? 'linear-gradient(140deg, rgba(0,212,255,0.08) 0%, rgba(124,58,237,0.06) 100%)'
                      : 'rgba(255,255,255,0.025)',
                    boxShadow:            isAct
                      ? '0 28px 90px rgba(0,212,255,0.18), 0 0 0 1px rgba(0,212,255,0.08) inset'
                      : '0 4px 28px rgba(0,0,0,0.4)',
                    backdropFilter:       isAct ? 'blur(14px)' : 'none',
                    WebkitBackdropFilter: isAct ? 'blur(14px)' : 'none',
                  }}
                >
                  <CardContent t={t} />

                  {/* active top accent */}
                  {isAct && (
                    <div
                      className="absolute top-0 left-[15%] right-[15%] h-0.5 rounded-full"
                      style={{ background: 'linear-gradient(90deg, transparent, #00D4FF, #7C3AED, transparent)' }}
                    />
                  )}
                </motion.div>
              )
            })}
          </motion.div>

          <Dots count={testimonials.length} active={active} onSelect={goTo} />
        </div>

      </div>
    </section>
  )
}
