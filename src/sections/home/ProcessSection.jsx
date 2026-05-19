import { motion } from 'framer-motion'
import { processSteps } from '../../data/platforms'
import ScrollReveal from '../../components/ui/ScrollReveal'

export default function ProcessSection() {
  return (
    <section className="py-14 sm:py-20 lg:py-32 bg-[#050508] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <ScrollReveal className="text-center mb-10 sm:mb-14 lg:mb-20">
          <span className="text-xs tracking-[0.3em] uppercase text-[#00D4FF] font-medium mb-4 block">How It Works</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3 sm:mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
            From Zero to{' '}
            <span className="gradient-text">7 Figures</span>
          </h2>
          <p className="text-white/50 text-base md:text-lg max-w-xl mx-auto">
            Our battle-tested process gets you results in 30 days or less.
          </p>
        </ScrollReveal>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute top-8 left-8 right-8 hidden lg:block">
            <div className="h-px bg-gradient-to-r from-[#00D4FF]/20 via-[#7C3AED]/20 to-[#00D4FF]/20" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {processSteps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative group"
              >
                <div className="border border-white/8 rounded-2xl p-6 hover:border-white/15 transition-all duration-300 hover:bg-white/2">
                  {/* Step number */}
                  <div className="flex items-start gap-4 mb-5">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00D4FF]/20 to-[#7C3AED]/10 border border-white/10 flex items-center justify-center">
                        <span className="text-2xl">{step.icon}</span>
                      </div>
                      <div
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#0A0A0F] border border-white/15 flex items-center justify-center"
                        style={{ boxShadow: '0 0 10px rgba(0,212,255,0.2)' }}
                      >
                        <span className="text-[#00D4FF] font-bold text-xs">{step.step}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-white/30 mb-1">{step.duration}</div>
                      <h3 className="text-white font-bold text-lg md:text-xl leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
                        {step.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-white/50 text-sm md:text-base leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
