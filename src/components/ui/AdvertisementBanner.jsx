import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, GripHorizontal } from 'lucide-react'
import { advertisementAPI } from '../../lib/api'

export default function AdvertisementBanner() {
  const [ad, setAd] = useState(null)
  const [visible, setVisible] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef(null)
  const bannerRef = useRef(null)

  useEffect(() => {
    advertisementAPI.getActive()
      .then((res) => {
        const data = res.data
        if (!data || !data.id || !data.title) return
        const dismissed = sessionStorage.getItem('ad_dismissed')
        if (dismissed === String(data.id)) return
        setAd(data)
        setTimeout(() => setVisible(true), 2000)
      })
      .catch(() => {})
  }, [])

  const dismiss = () => {
    setVisible(false)
    if (ad) sessionStorage.setItem('ad_dismissed', String(ad.id))
  }

  const onMouseDown = useCallback((e) => {
    if (e.target.closest('a') || e.target.closest('button:not([data-drag])')) return
    e.preventDefault()
    setDragging(true)
    dragStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: position.x,
      posY: position.y,
    }
  }, [position])

  const onMouseMove = useCallback((e) => {
    if (!dragging || !dragStart.current) return
    const dx = e.clientX - dragStart.current.mouseX
    const dy = e.clientY - dragStart.current.mouseY
    setPosition({ x: dragStart.current.posX + dx, y: dragStart.current.posY + dy })
  }, [dragging])

  const onMouseUp = useCallback(() => {
    setDragging(false)
    dragStart.current = null
  }, [])

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', onMouseUp)
      return () => {
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('mouseup', onMouseUp)
      }
    }
  }, [dragging, onMouseMove, onMouseUp])

  if (!ad || !visible) return null

  const accentColor = ad.bg_color || '#00D4FF'

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={bannerRef}
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          style={{
            position: 'fixed',
            right: 24 + (-position.x),
            bottom: 24 + (-position.y),
            zIndex: 9999,
            cursor: dragging ? 'grabbing' : 'default',
            userSelect: 'none',
          }}
          className="w-72"
          onMouseDown={onMouseDown}
        >
          {/* Minimized pill */}
          {minimized ? (
            <button
              onClick={() => setMinimized(false)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-white text-xs font-semibold shadow-lg shadow-black/30 transition-all hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${accentColor}, #7C3AED)`,
                boxShadow: `0 8px 32px ${accentColor}40`,
              }}
            >
              <span>🎯</span> Special Offer
            </button>
          ) : (
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(10, 10, 15, 0.95)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${accentColor}40`,
                boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 40px ${accentColor}20`,
              }}
            >
              {/* Gradient border top */}
              <div
                className="h-0.5 w-full"
                style={{ background: `linear-gradient(90deg, ${accentColor}, #7C3AED)` }}
              />

              {/* Drag handle */}
              <div
                data-drag="true"
                className="flex items-center justify-between px-4 pt-3 pb-1 cursor-grab active:cursor-grabbing"
                onMouseDown={onMouseDown}
              >
                <GripHorizontal size={14} className="text-white/20" />
                <div className="flex gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); setMinimized(true) }}
                    className="w-6 h-6 rounded flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all text-xs"
                  >
                    —
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); dismiss() }}
                    className="w-6 h-6 rounded flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>

              <div className="px-4 pb-4">
                {/* Badge */}
                {ad.badge_text && (
                  <div className="mb-3">
                    <span
                      className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ color: accentColor, background: `${accentColor}15`, border: `1px solid ${accentColor}30` }}
                    >
                      {ad.badge_text}
                    </span>
                  </div>
                )}

                {/* Image */}
                {ad.image_url && (
                  <div className="mb-3 rounded-xl overflow-hidden h-32">
                    <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Content */}
                <h4
                  className="text-white font-bold text-sm mb-1.5 leading-snug"
                  style={{ fontFamily: 'Syne, sans-serif' }}
                >
                  {ad.title}
                </h4>
                {ad.description && (
                  <p className="text-white/50 text-xs leading-relaxed mb-3">{ad.description}</p>
                )}

                {/* CTA */}
                {ad.cta_text && ad.cta_link && (
                  <a
                    href={ad.cta_link}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90"
                    style={{ background: `linear-gradient(135deg, ${accentColor}, #7C3AED)` }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {ad.cta_text} <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
