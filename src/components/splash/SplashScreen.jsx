import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'

export default function SplashScreen({ onComplete }) {
  const canvasRef = useRef(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const [showLogo, setShowLogo] = useState(false)
  const [showText, setShowText] = useState(false)
  const [exiting, setExiting]   = useState(false)

  // Motion value for the progress bar — no re-render churn
  const progressMV = useMotionValue(0)
  const barWidth   = useTransform(progressMV, v => `${v}%`)

  // ── Particle canvas ────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf

    // Track dimensions in a ref so the draw loop always reads the latest values
    // without recreating the particle array on every resize
    const size = { w: window.innerWidth, h: window.innerHeight }
    canvas.width  = size.w
    canvas.height = size.h

    const particles = Array.from({ length: 100 }, () => ({
      x: Math.random() * size.w,
      y: Math.random() * size.h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 2 + 0.4,
      alpha: Math.random() * 0.5 + 0.15,
      pulse: Math.random() * Math.PI * 2,
      cyan: Math.random() > 0.5,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, size.w, size.h)

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.x    += p.vx
        p.y    += p.vy
        p.pulse += 0.018

        // Wrap edges instead of bouncing (no velocity flip jitter)
        if (p.x < 0)      p.x = size.w
        if (p.x > size.w) p.x = 0
        if (p.y < 0)      p.y = size.h
        if (p.y > size.h) p.y = 0

        const a = p.alpha * (0.65 + 0.35 * Math.sin(p.pulse))
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.cyan
          ? `rgba(0,212,255,${a})`
          : `rgba(124,58,237,${a})`
        ctx.fill()

        // Connection lines — only compare forward pairs (O(n²/2))
        for (let j = i + 1; j < particles.length; j++) {
          const p2   = particles[j]
          const dx   = p.x - p2.x
          const dy   = p.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 110) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(0,212,255,${0.07 * (1 - dist / 110)})`
            ctx.lineWidth   = 0.5
            ctx.stroke()
          }
        }
      }

      raf = requestAnimationFrame(draw)
    }
    draw()

    const onResize = () => {
      size.w        = window.innerWidth
      size.h        = window.innerHeight
      canvas.width  = size.w
      canvas.height = size.h
      // Clamp particles that are now out-of-bounds
      particles.forEach(p => {
        if (p.x > size.w) p.x = Math.random() * size.w
        if (p.y > size.h) p.y = Math.random() * size.h
      })
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  // ── Sequence + progress ───────────────────────────────────────────────────
  useEffect(() => {
    // Progress bar fills over ~2.8 s
    const duration  = 2800
    const startTime = performance.now()

    const tick = (now) => {
      const elapsed  = now - startTime
      const pct      = Math.min((elapsed / duration) * 100, 100)
      progressMV.set(pct)
      if (pct < 100) rafId = requestAnimationFrame(tick)
    }
    let rafId = requestAnimationFrame(tick)

    const t1 = setTimeout(() => setShowLogo(true),  350)
    const t2 = setTimeout(() => setShowText(true),   1100)
    const t3 = setTimeout(() => setExiting(true),    2900)
    const t4 = setTimeout(() => onCompleteRef.current(), 3650)

    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }, [progressMV])

  const letterVariants = {
    hidden:  { opacity: 0, y: 36, rotateX: -80 },
    visible: (i) => ({
      opacity: 1, y: 0, rotateX: 0,
      transition: { delay: i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    }),
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  }

  const brand = 'xComify'

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0A0A0F] overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0,212,255,0.1) 0%, rgba(124,58,237,0.07) 40%, transparent 70%)',
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center gap-8">

        {/* Logo */}
        <AnimatePresence>
          {showLogo && (
            <motion.div
              key="logo"
              className="relative"
              style={{ transformPerspective: 700 }}
              initial={{ scale: 0.6, opacity: 0, rotateX: 45 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              exit={{ scale: 0.5, opacity: 0, transition: { duration: 0.22 } }}
              transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
            >
              {/* Box background — overflow-hidden so gradient clips to rounded corners */}
              <div
                className="relative w-20 h-20 rounded-2xl overflow-hidden"
                style={{ background: '#0D0D1A' }}
              >
                {/* Gradient floods in when strokes complete */}
                <motion.div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(135deg, #00D4FF 0%, #7C3AED 100%)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.84, duration: 0.28, ease: 'easeOut' }}
                />
                {/* White X settle (on top of gradient) */}
                <svg viewBox="0 0 80 80" className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
                  <motion.path
                    d="M 22 22 L 58 58" stroke="white" strokeWidth={5} strokeLinecap="round" fill="none"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: 1.05, duration: 0.2 }}
                  />
                  <motion.path
                    d="M 58 22 L 22 58" stroke="white" strokeWidth={5} strokeLinecap="round" fill="none"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: 1.05, duration: 0.2 }}
                  />
                </svg>
              </div>

              {/* SVG overlay — NOT inside overflow-hidden so glow bleeds freely */}
              <svg
                viewBox="0 0 80 80"
                className="absolute w-20 h-20 pointer-events-none"
                style={{ top: 0, left: 0, zIndex: 4 }}
                overflow="visible"
              >
                <defs>
                  <linearGradient id="xg1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00D4FF" />
                    <stop offset="100%" stopColor="#7C3AED" />
                  </linearGradient>
                  <linearGradient id="xg2" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#7C3AED" />
                    <stop offset="100%" stopColor="#00D4FF" />
                  </linearGradient>
                  {/* Tight glow — stroke core */}
                  <filter id="xglow" x="-60%" y="-60%" width="220%" height="220%">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                  {/* Wide halo — soft aura */}
                  <filter id="xhalo" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="6" />
                  </filter>
                  {/* Comet head — very bright */}
                  <filter id="xcomet" x="-200%" y="-200%" width="500%" height="500%">
                    <feGaussianBlur stdDeviation="4.5" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>

                {/* ── Border self-trace ── */}
                <motion.rect
                  x={1} y={1} width={78} height={78} rx={16}
                  fill="none" stroke="url(#xg1)" strokeWidth={1.5}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.55 }}
                  transition={{ delay: 0.05, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                />

                {/* ── Glow halos (wide, soft) — both strokes fire simultaneously ── */}
                <motion.path
                  d="M 18 18 L 62 62" stroke="#00D4FF" strokeWidth={16}
                  strokeLinecap="round" fill="none" filter="url(#xhalo)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.18 }}
                  transition={{ delay: 0.37, duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
                />
                <motion.path
                  d="M 62 18 L 18 62" stroke="#7C3AED" strokeWidth={16}
                  strokeLinecap="round" fill="none" filter="url(#xhalo)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.18 }}
                  transition={{ delay: 0.37, duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
                />

                {/* ── Core neon strokes — same delay, simultaneous strike ── */}
                <motion.path
                  d="M 18 18 L 62 62" stroke="url(#xg1)" strokeWidth={3.5}
                  strokeLinecap="round" fill="none" filter="url(#xglow)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.37, duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
                />
                <motion.path
                  d="M 62 18 L 18 62" stroke="url(#xg2)" strokeWidth={3.5}
                  strokeLinecap="round" fill="none" filter="url(#xglow)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.37, duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
                />

                {/* ── Comet heads travel along each stroke ── */}
                <motion.circle
                  cx={18} cy={18} r={5} fill="white" filter="url(#xcomet)"
                  initial={{ opacity: 0 }}
                  animate={{ cx: 62, cy: 62, opacity: [0, 1, 1, 0] }}
                  transition={{ delay: 0.37, duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
                />
                <motion.circle
                  cx={62} cy={18} r={5} fill="white" filter="url(#xcomet)"
                  initial={{ opacity: 0 }}
                  animate={{ cx: 18, cy: 62, opacity: [0, 1, 1, 0] }}
                  transition={{ delay: 0.37, duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
                />

                {/* ── Impact events at 0.85s ── */}
                {/* Shockwave ring 1 */}
                <motion.circle
                  cx={40} cy={40} fill="none" stroke="#00D4FF" strokeWidth={1.5}
                  initial={{ r: 2, opacity: 1 }}
                  animate={{ r: 56, opacity: 0 }}
                  transition={{ delay: 0.84, duration: 0.6, ease: 'easeOut' }}
                />
                {/* Shockwave ring 2 — slight delay, purple */}
                <motion.circle
                  cx={40} cy={40} fill="none" stroke="#7C3AED" strokeWidth={1}
                  initial={{ r: 2, opacity: 0.7 }}
                  animate={{ r: 56, opacity: 0 }}
                  transition={{ delay: 0.97, duration: 0.6, ease: 'easeOut' }}
                />
                {/* Center burst */}
                <motion.circle
                  cx={40} cy={40} fill="white" filter="url(#xglow)"
                  initial={{ r: 0, opacity: 0 }}
                  animate={{ r: [0, 10, 0], opacity: [0, 1, 0] }}
                  transition={{ delay: 0.84, duration: 0.42, ease: 'easeOut' }}
                />
                {/* Endpoint sparks ×4 — tips of each stroke arm */}
                {[
                  [18, 18, '#00D4FF'],
                  [62, 62, '#7C3AED'],
                  [62, 18, '#7C3AED'],
                  [18, 62, '#00D4FF'],
                ].map(([cx, cy, color], i) => (
                  <motion.circle
                    key={i}
                    cx={cx} cy={cy} fill={color} filter="url(#xglow)"
                    initial={{ r: 0, opacity: 0 }}
                    animate={{ r: [0, 7, 0], opacity: [0, 1, 0] }}
                    transition={{ delay: 0.84, duration: 0.38, ease: 'easeOut' }}
                  />
                ))}
              </svg>

              {/* Radial glow burst — erupts on impact */}
              <motion.div
                className="absolute pointer-events-none"
                style={{
                  inset: -36,
                  borderRadius: '36px',
                  background: 'radial-gradient(circle, rgba(0,212,255,0.65) 0%, rgba(124,58,237,0.28) 38%, transparent 68%)',
                }}
                initial={{ opacity: 0, scale: 0.55 }}
                animate={{ opacity: [0, 1, 0], scale: [0.55, 1.7, 2.6] }}
                transition={{ delay: 0.84, duration: 0.9, ease: 'easeOut' }}
              />

              {/* Orbit rings */}
              <motion.div
                className="absolute rounded-full border border-[#00D4FF]/30"
                style={{ inset: -14 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute rounded-full border border-[#7C3AED]/20"
                style={{ inset: -28 }}
                animate={{ rotate: -360 }}
                transition={{ duration: 5.5, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Brand name */}
        <AnimatePresence>
          {showText && (
            <motion.div
              key="brand"
              className="flex"
              style={{ perspective: '800px' }}
              exit={{ opacity: 0, transition: { duration: 0.25 } }}
            >
              {brand.split('').map((char, i) => (
                <motion.span
                  key={i}
                  custom={i}
                  variants={letterVariants}
                  initial="hidden"
                  animate="visible"
                  style={{
                    fontFamily: 'Cabinet Grotesk, sans-serif',
                    color: i === 0 ? '#00D4FF' : '#FFFFFF',
                    display: 'inline-block',
                    fontSize: '3.75rem',
                    fontWeight: 900,
                    letterSpacing: '-0.02em',
                    lineHeight: 1,
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tagline */}
        <AnimatePresence>
          {showText && (
            <motion.p
              key="tagline"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={{ delay: 0.55, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-sm tracking-[0.35em] uppercase text-[#6B7280]"
            >
              Premium eCommerce Management
            </motion.p>
          )}
        </AnimatePresence>

        {/* Progress bar */}
        <div className="w-56 h-px bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              width: barWidth,
              background: 'linear-gradient(90deg, #00D4FF, #7C3AED)',
            }}
          />
        </div>

        {/* Progress % */}
        <motion.span
          className="text-xs text-[#4B5563] tabular-nums -mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.span>{progressMV}</motion.span>
          {/* Rendered via formatted counter below */}
        </motion.span>
        <ProgressLabel value={progressMV} />
      </div>

      {/* Corner brackets */}
      {[
        { pos: 'top-5 left-5',     bt: '1px', bb: '0',   bl: '1px', br: '0'   },
        { pos: 'top-5 right-5',    bt: '1px', bb: '0',   bl: '0',   br: '1px' },
        { pos: 'bottom-5 left-5',  bt: '0',   bb: '1px', bl: '1px', br: '0'   },
        { pos: 'bottom-5 right-5', bt: '0',   bb: '1px', bl: '0',   br: '1px' },
      ].map(({ pos, bt, bb, bl, br }, i) => (
        <motion.div
          key={i}
          className={`absolute ${pos} w-7 h-7`}
          style={{ borderColor: 'rgba(0,212,255,0.3)', borderTopWidth: bt, borderBottomWidth: bb, borderLeftWidth: bl, borderRightWidth: br }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 + i * 0.06, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        />
      ))}
    </motion.div>
  )
}

// Separate tiny component to read the motion value without re-rendering parent
function ProgressLabel({ value }) {
  const display = useTransform(value, v => `${Math.floor(v)}%`)
  return (
    <motion.span
      className="text-xs text-[#4B5563] tabular-nums -mt-6"
      style={{ fontFamily: 'Outfit, sans-serif' }}
    >
      {display}
    </motion.span>
  )
}
