import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { testimonials } from '../../data/platforms'
import ScrollReveal from '../../components/ui/ScrollReveal'

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)

  const next = () => {
    setDirection(1)
    setCurrent((c) => (c + 1) % testimonials.length)
  }

  const prev = () => {
    setDirection(-1)
    setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length)
  }

  useEffect(() => {
    const id = setInterval(next, 5000)
    return () => clearInterval(id)
  }, [])

  const t = testimonials[current]

  return (
    <section className="py-32 bg-[#0A0A0F] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 opacity-5"
        style={{ background: 'radial-gradient(ellipse at 50% 50%, #7C3AED 0%, transparent 60%)' }}
      />

      <div className="max-w-5xl mx-auto px-6">
        <ScrollReveal className="text-center mb-16">
          <span className="text-xs tracking-[0.3em] uppercase text-[#00D4FF] font-medium mb-4 block">Client Stories</span>
          <h2 className="text-4xl md:text-5xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
            Don't Take{' '}
            <span className="gradient-text">Our Word for It</span>
          </h2>
        </ScrollReveal>

        <div className="relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              initial={{ opacity: 0, x: direction * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -60 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-3xl border border-white/8 p-8 md:p-12 relative overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              {/* Quote icon */}
              <div className="absolute top-8 right-8 opacity-10">
                <Quote size={80} className="text-[#00D4FF]" />
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={18} className="text-[#F59E0B] fill-[#F59E0B]" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-xl md:text-2xl text-white font-medium leading-relaxed mb-8" style={{ fontFamily: 'Syne, sans-serif' }}>
                "{t.content}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#7C3AED] flex items-center justify-center text-white font-bold text-lg">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-base">{t.name}</div>
                    <div className="text-white/50 text-sm">{t.role}, {t.company}</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="px-3 py-1.5 rounded-full border border-white/10 bg-white/4 text-xs text-white/60">
                    {t.platform}
                  </div>
                  <div className="px-3 py-1.5 rounded-full border border-[#00D4FF]/30 bg-[#00D4FF]/8 text-xs text-[#00D4FF] font-semibold">
                    {t.revenue}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center justify-between mt-8">
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i) }}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === current ? 'w-8 bg-[#00D4FF]' : 'w-4 bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={prev}
                className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={next}
                className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
