import { useState, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ServiceCard({ service, index = 0 }) {
  const [hovered, setHovered] = useState(false)
  const cardRef = useRef(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 })

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
    setHovered(false)
  }

  return (
    <motion.div
      ref={cardRef}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1000, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: (index % 4) * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="group relative rounded-2xl p-6 border border-white/8 bg-white/3 overflow-hidden h-full flex flex-col"
    >
      {/* Glow on hover */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 0%, ${service.glowColor || 'rgba(0,212,255,0.15)'} 0%, transparent 60%)` }}
      />

      {/* Shimmer sweep */}
      {hovered && (
        <motion.div
          className="absolute -inset-1 opacity-30 pointer-events-none"
          style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)' }}
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{ duration: 0.7, ease: 'linear' }}
        />
      )}

      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-50"
        style={{ background: `linear-gradient(90deg, transparent, ${service.color || '#00D4FF'}, transparent)` }}
      />

      {/* Icon */}
      <div className="mb-5 flex items-start justify-between">
        <motion.div
          animate={hovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
          transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ background: `${service.color || '#00D4FF'}15`, border: `1px solid ${service.color || '#00D4FF'}30` }}
        >
          {service.icon}
        </motion.div>
        <motion.div
          animate={hovered ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: -4, y: 4 }}
          transition={{ duration: 0.2 }}
          className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center"
        >
          <ArrowUpRight size={14} className="text-white/60" />
        </motion.div>
      </div>

      {/* Title */}
      <h3 className="text-white font-bold text-lg mb-2 leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
        {service.title}
      </h3>

      {/* Short description */}
      <p className="text-white/50 text-sm leading-relaxed mb-4 flex-1">
        {service.short}
      </p>

      {/* Features */}
      <div className="flex flex-wrap gap-1.5 mt-auto pt-4 border-t border-white/8">
        {service.features.slice(0, 3).map((feat) => (
          <span
            key={feat}
            className="text-xs px-2 py-1 rounded-md border"
            style={{
              color: service.color || '#00D4FF',
              borderColor: `${service.color || '#00D4FF'}30`,
              background: `${service.color || '#00D4FF'}08`,
            }}
          >
            {feat}
          </span>
        ))}
      </div>
    </motion.div>
  )
}
