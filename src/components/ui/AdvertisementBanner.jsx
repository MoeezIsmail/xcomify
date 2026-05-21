import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { X, ArrowRight, Sparkles, Zap, ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { advertisementAPI } from '../../lib/api'

const AUTO_ROTATE_MS = 6000

export default function AdvertisementBanner() {
  const [ads, setAds] = useState([])
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [dir, setDir] = useState(1) // 1 = forward, -1 = backward

  const dragStart = useRef(null)
  const bannerRef = useRef(null)
  const timerRef = useRef(null)
  const navigate = useNavigate()

  // 3D tilt
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useSpring(useTransform(mouseY, [-60, 60], [8, -8]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(mouseX, [-120, 120], [-8, 8]), { stiffness: 300, damping: 30 })

  useEffect(() => {
    advertisementAPI.getActive()
      .then((res) => {
        const list = res.data?.data || []
        if (!list.length) return
        setAds(list)
        setTimeout(() => setVisible(true), 2000)
      })
      .catch(() => {})
  }, [])

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current)
    if (ads.length <= 1) return
    timerRef.current = setInterval(() => {
      setDir(1)
      setIdx((i) => (i + 1) % ads.length)
    }, AUTO_ROTATE_MS)
  }, [ads.length])

  useEffect(() => {
    if (!visible || minimized) { clearInterval(timerRef.current); return }
    startTimer()
    return () => clearInterval(timerRef.current)
  }, [visible, minimized, startTimer])

  // Reset image error when slide changes
  useEffect(() => setImgError(false), [idx])

  const goTo = (newIdx, direction) => {
    setDir(direction)
    setIdx(newIdx)
    startTimer()
  }

  const dismiss = () => setVisible(false)

  // Drag
  const onMouseDown = useCallback((e) => {
    if (e.target.closest('a') || e.target.closest('button')) return
    e.preventDefault()
    setDragging(true)
    dragStart.current = { mouseX: e.clientX, mouseY: e.clientY, posX: position.x, posY: position.y }
  }, [position])

  const onMouseMove = useCallback((e) => {
    if (!dragging || !dragStart.current) return
    setPosition({
      x: dragStart.current.posX + (e.clientX - dragStart.current.mouseX),
      y: dragStart.current.posY + (e.clientY - dragStart.current.mouseY),
    })
  }, [dragging])

  const onMouseUp = useCallback(() => { setDragging(false); dragStart.current = null }, [])

  useEffect(() => {
    if (!dragging) return
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp) }
  }, [dragging, onMouseMove, onMouseUp])

  const handle3DMove = useCallback((e) => {
    if (!bannerRef.current || dragging) return
    const rect = bannerRef.current.getBoundingClientRect()
    mouseX.set(e.clientX - (rect.left + rect.width / 2))
    mouseY.set(e.clientY - (rect.top + rect.height / 2))
  }, [dragging, mouseX, mouseY])

  const handle3DLeave = useCallback(() => {
    mouseX.set(0); mouseY.set(0); setHovered(false)
  }, [mouseX, mouseY])

  const handleCTA = (ad) => {
    dismiss()
    const link = ad.cta_link
    if (!link) return
    if (link.startsWith('http://') || link.startsWith('https://')) {
      window.open(link, '_blank', 'noopener,noreferrer')
    } else {
      navigate(link)
    }
  }

  if (!ads.length || !visible) return null

  const ad = ads[idx]
  const accent = ad.bg_color || '#00D4FF'
  const multi = ads.length > 1

  const slideVariants = {
    enter: (d) => ({ opacity: 0, x: d > 0 ? 30 : -30 }),
    center: { opacity: 1, x: 0 },
    exit: (d) => ({ opacity: 0, x: d > 0 ? -30 : 30 }),
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 80 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 50 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          style={{
            position: 'fixed',
            right: 24 - position.x,
            bottom: 24 - position.y,
            zIndex: 9999,
            cursor: dragging ? 'grabbing' : 'default',
            userSelect: 'none',
            perspective: 800,
          }}
          className="w-80"
          onMouseDown={onMouseDown}
        >
          {minimized ? (
            <motion.button
              onClick={() => setMinimized(false)}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2.5 pl-3 pr-4 py-3 rounded-2xl text-white text-xs font-bold shadow-2xl"
              style={{
                background: `linear-gradient(135deg, ${accent}ee, #7C3AED)`,
                boxShadow: `0 8px 32px ${accent}50, 0 2px 8px rgba(0,0,0,0.4)`,
              }}
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: accent }} />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              <span className="max-w-[140px] truncate">{ad.badge_text || ad.title}</span>
              {multi && (
                <span
                  className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                  style={{ background: 'rgba(255,255,255,0.2)' }}
                >
                  {idx + 1}/{ads.length}
                </span>
              )}
            </motion.button>
          ) : (
            <motion.div
              ref={bannerRef}
              style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
              onMouseMove={handle3DMove}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={handle3DLeave}
            >
              {/* Outer glow */}
              <motion.div
                className="absolute -inset-3 rounded-3xl blur-2xl pointer-events-none"
                animate={{ opacity: hovered ? 0.35 : 0.18 }}
                transition={{ duration: 0.4 }}
                style={{ background: `radial-gradient(ellipse, ${accent}, #7C3AED, transparent)` }}
              />

              {/* Card */}
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{
                  background: 'linear-gradient(160deg, rgba(18,18,28,0.98), rgba(10,10,18,0.99))',
                  border: `1px solid ${accent}35`,
                  boxShadow: `0 24px 64px rgba(0,0,0,0.6), 0 1px 0 ${accent}25 inset`,
                  backdropFilter: 'blur(24px)',
                }}
              >
                {/* Animated top border */}
                <div className="relative h-0.5 w-full overflow-hidden">
                  <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, transparent, ${accent}, #7C3AED, ${accent}, transparent)` }} />
                  <motion.div
                    className="absolute inset-0 w-2/5"
                    animate={{ x: ['-100%', '350%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)' }}
                  />
                </div>

                {/* Header bar */}
                <div
                  className="relative flex items-center justify-between px-4 pt-3 pb-2.5"
                  style={{ background: `linear-gradient(135deg, ${accent}12, #7C3AED0a)` }}
                >
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: [0, 15, -10, 15, 0], scale: [1, 1.2, 1, 1.1, 1] }}
                      transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                      className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{ background: `${accent}20`, border: `1px solid ${accent}40` }}
                    >
                      <Zap size={11} style={{ color: accent }} />
                    </motion.div>
                    <span className="text-white/35 text-[10px] uppercase tracking-widest font-semibold">
                      {multi ? `Offer ${idx + 1} of ${ads.length}` : 'Special Offer'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); setMinimized(true) }}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-white/25 hover:text-white/70 hover:bg-white/8 transition-all text-sm leading-none"
                    >
                      ─
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); dismiss() }}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <X size={11} />
                    </button>
                  </div>
                </div>

                {/* Slide content */}
                <div className="relative overflow-hidden">
                  <AnimatePresence custom={dir} mode="wait">
                    <motion.div
                      key={ad.id}
                      custom={dir}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.28, ease: 'easeInOut' }}
                      className="px-4 pb-4 pt-2"
                    >
                      {/* Badge */}
                      {ad.badge_text && (
                        <div className="mb-2.5">
                          <motion.span
                            animate={{ boxShadow: [`0 0 0px ${accent}00`, `0 0 12px ${accent}60`, `0 0 0px ${accent}00`] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase"
                            style={{ color: accent, background: `${accent}15`, border: `1px solid ${accent}40` }}
                          >
                            <Sparkles size={8} />
                            {ad.badge_text}
                          </motion.span>
                        </div>
                      )}

                      {/* Image */}
                      {ad.image_url && !imgError && (
                        <div className="mb-3 rounded-xl overflow-hidden h-28 relative bg-white/5">
                          <img
                            src={ad.image_url}
                            alt={ad.title}
                            className="w-full h-full object-cover"
                            onError={() => setImgError(true)}
                          />
                          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,10,18,0.65), transparent)' }} />
                        </div>
                      )}

                      {/* Title */}
                      <h4
                        className="text-white font-black text-sm mb-1.5 leading-snug"
                        style={{ fontFamily: 'Syne, sans-serif', textShadow: `0 0 20px ${accent}30` }}
                      >
                        {ad.title}
                      </h4>

                      {/* Description */}
                      {ad.description && (
                        <p className="text-white/45 text-xs leading-relaxed mb-3">
                          {ad.description}
                        </p>
                      )}

                      {/* CTA */}
                      {ad.cta_text && ad.cta_link && (
                        <motion.button
                          onClick={() => handleCTA(ad)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          className="relative flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold text-white overflow-hidden"
                          style={{
                            background: `linear-gradient(135deg, ${accent}, #7C3AED)`,
                            boxShadow: `0 4px 20px ${accent}40`,
                          }}
                        >
                          <motion.div
                            className="absolute inset-0 pointer-events-none w-2/5"
                            animate={{ x: ['-100%', '350%'] }}
                            transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2.5, ease: 'easeInOut' }}
                            style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)' }}
                          />
                          <span className="relative z-10">{ad.cta_text}</span>
                          <motion.span
                            className="relative z-10"
                            animate={{ x: [0, 3, 0] }}
                            transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1.5 }}
                          >
                            <ArrowRight size={11} />
                          </motion.span>
                        </motion.button>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Multi-ad navigation */}
                {multi && (
                  <div className="flex items-center justify-between px-4 pb-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); goTo((idx - 1 + ads.length) % ads.length, -1) }}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/8 transition-all"
                    >
                      <ChevronLeft size={13} />
                    </button>

                    {/* Dots */}
                    <div className="flex items-center gap-1.5">
                      {ads.map((_, i) => (
                        <button
                          key={i}
                          onClick={(e) => { e.stopPropagation(); goTo(i, i > idx ? 1 : -1) }}
                          className="rounded-full transition-all duration-300"
                          style={{
                            width: i === idx ? 16 : 6,
                            height: 6,
                            background: i === idx ? accent : 'rgba(255,255,255,0.2)',
                          }}
                        />
                      ))}
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); goTo((idx + 1) % ads.length, 1) }}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/8 transition-all"
                    >
                      <ChevronRight size={13} />
                    </button>
                  </div>
                )}

                {/* Auto-rotate progress bar (multi only) */}
                {multi && !minimized && (
                  <motion.div
                    key={`${idx}-progress`}
                    className="absolute bottom-0 left-0 h-0.5 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: AUTO_ROTATE_MS / 1000, ease: 'linear' }}
                    style={{ background: `linear-gradient(90deg, ${accent}, #7C3AED)` }}
                  />
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
