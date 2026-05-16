import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

const DOT_SIZE = 8   // w-2 h-2 in px
const RING_SIZE = 36 // w-9 h-9 in px

export default function CustomCursor() {
  const [hovering, setHovering] = useState(false)
  const [visible, setVisible] = useState(false)

  const mouseX = useMotionValue(-200)
  const mouseY = useMotionValue(-200)

  // Dot follows instantly (high stiffness)
  const dotSpringX = useSpring(mouseX, { stiffness: 800, damping: 40, mass: 0.5 })
  const dotSpringY = useSpring(mouseY, { stiffness: 800, damping: 40, mass: 0.5 })

  // Ring lags behind (lower stiffness)
  const ringSpringX = useSpring(mouseX, { stiffness: 180, damping: 28, mass: 0.8 })
  const ringSpringY = useSpring(mouseY, { stiffness: 180, damping: 28, mass: 0.8 })

  // Offset by half element size so the center aligns with pointer
  const dotX = useTransform(dotSpringX, v => v - DOT_SIZE / 2)
  const dotY = useTransform(dotSpringY, v => v - DOT_SIZE / 2)
  const ringX = useTransform(ringSpringX, v => v - RING_SIZE / 2)
  const ringY = useTransform(ringSpringY, v => v - RING_SIZE / 2)

  useEffect(() => {
    const onMove = (e) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
      if (!visible) setVisible(true)
    }

    const onOver = (e) => {
      const clickable = e.target.closest('a, button, [role="button"], input, textarea, select, label, [data-cursor-hover]')
      setHovering(!!clickable)
    }

    const onLeave = () => setVisible(false)
    const onEnter = () => setVisible(true)

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
    }
  }, [mouseX, mouseY, visible])

  return (
    <>
      {/* Dot — snappy, disappears on hover */}
      <motion.div
        className="fixed top-0 left-0 rounded-full bg-[#00D4FF] pointer-events-none z-[99999]"
        style={{
          width: DOT_SIZE,
          height: DOT_SIZE,
          x: dotX,
          y: dotY,
        }}
        animate={{
          opacity: visible ? (hovering ? 0 : 1) : 0,
          scale: hovering ? 0 : 1,
        }}
        transition={{ duration: 0.15 }}
      />

      {/* Ring — lags, expands on hover */}
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[99998]"
        style={{
          width: RING_SIZE,
          height: RING_SIZE,
          x: ringX,
          y: ringY,
          border: '1px solid',
        }}
        animate={{
          opacity: visible ? 1 : 0,
          scale: hovering ? 1.6 : 1,
          borderColor: hovering ? 'rgba(0,212,255,0.8)' : 'rgba(255,255,255,0.3)',
        }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      />
    </>
  )
}
