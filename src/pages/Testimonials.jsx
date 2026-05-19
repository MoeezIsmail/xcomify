import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import { testimonials } from '../data/platforms'
import ScrollReveal from '../components/ui/ScrollReveal'
import CTASection from '../sections/home/CTASection'

export default function Testimonials() {
  return (
    <main className="pt-24">
      <section className="py-20 bg-[#0A0A0F] text-center">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="text-xs tracking-[0.3em] uppercase text-[#00D4FF] font-medium mb-4 block">What Clients Say</span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>
              500+ Clients.{' '}
              <span className="gradient-text">500+ Success Stories.</span>
            </h1>
            <p className="text-white/50 text-lg md:text-xl max-w-xl mx-auto">
              Don't take our word for it. Here's what our clients say about working with xComify.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-[#050508]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...testimonials, ...testimonials].map((t, i) => (
              <motion.div
                key={`${t.id}-${i}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 3) * 0.1, duration: 0.6 }}
                className="border border-white/8 rounded-2xl p-6 hover:border-white/15 hover:bg-white/2 transition-all duration-300 flex flex-col gap-4 relative"
              >
                <div className="absolute top-5 right-5 opacity-10">
                  <Quote size={32} className="text-[#00D4FF]" />
                </div>

                <div className="flex gap-1">
                  {Array.from({ length: t.rating }).map((_, ri) => (
                    <Star key={ri} size={14} className="text-[#F59E0B] fill-[#F59E0B]" />
                  ))}
                </div>

                <p className="text-white/70 text-sm md:text-base leading-relaxed flex-1">"{t.content}"</p>

                <div className="flex items-center justify-between pt-4 border-t border-white/8">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#7C3AED] flex items-center justify-center text-white font-bold text-sm">
                      {t.name[0]}
                    </div>
                    <div>
                      <div className="text-white font-semibold text-base">{t.name}</div>
                      <div className="text-white/40 text-sm">{t.company}</div>
                    </div>
                  </div>
                  <div className="px-2 py-1 rounded-md text-xs font-medium bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20">
                    {t.revenue}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </main>
  )
}
