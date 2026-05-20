import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const ITEMS = [
  { text: 'Amazon Growth', icon: '⚡' },
  { text: 'Shopify Scaling', icon: '🚀' },
  { text: 'TikTok Shop', icon: '🎯' },
  { text: 'eBay Optimization', icon: '📈' },
  { text: '7-Figure Revenue', icon: '💰' },
  { text: 'PPC Mastery', icon: '🔥' },
  { text: 'Private Label', icon: '🏆' },
  { text: 'eCommerce Growth', icon: '⭐' },
  { text: 'Proven Results', icon: '✅' },
  { text: 'Brand Building', icon: '💎' },
  { text: 'Walmart Ads', icon: '⚡' },
  { text: 'Etsy Success', icon: '🎯' },
]

function MarqueeRow({ items, direction = 1, speed = 35 }) {
  const doubled = [...items, ...items]
  const duration = doubled.length * speed * 0.18

  return (
    <div className="overflow-hidden flex" style={{ maskImage: 'linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)' }}>
      <motion.div
        className="flex gap-0 shrink-0"
        animate={{ x: direction > 0 ? ['0%', '-50%'] : ['-50%', '0%'] }}
        transition={{ duration, ease: 'linear', repeat: Infinity }}
      >
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center shrink-0">
            <span
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold whitespace-nowrap"
              style={{ color: i % 3 === 0 ? '#00D4FF' : i % 3 === 1 ? '#7C3AED' : 'rgba(255,255,255,0.45)' }}
            >
              <span className="text-xs">{item.icon}</span>
              {item.text}
            </span>
            <span className="text-white/15 text-xs px-1">•</span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export default function MarqueeStrip() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const skewX = useTransform(scrollYProgress, [0, 1], [-1, 1])

  return (
    <div ref={ref} className="relative overflow-hidden bg-[#07070C] py-0">
      {/* Top border glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00D4FF]/30 to-transparent" />

      <motion.div style={{ skewX }} className="py-4 flex flex-col gap-3">
        <MarqueeRow items={ITEMS} direction={1} speed={40} />
        <MarqueeRow items={[...ITEMS].reverse()} direction={-1} speed={50} />
      </motion.div>

      {/* Bottom border glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#7C3AED]/30 to-transparent" />
    </div>
  )
}
