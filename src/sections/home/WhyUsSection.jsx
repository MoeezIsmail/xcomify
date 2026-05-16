import { motion } from 'framer-motion'
import { Shield, Zap, BarChart3, Users, Clock, Trophy } from 'lucide-react'
import ScrollReveal from '../../components/ui/ScrollReveal'

const reasons = [
  {
    icon: Trophy,
    title: 'Proven Track Record',
    description: '500+ clients scaled. $12M+ in revenue generated. 97% client satisfaction. Our results aren\'t promises — they\'re facts.',
    color: '#F59E0B',
  },
  {
    icon: Users,
    title: 'Dedicated Expert Team',
    description: 'Platform-certified specialists assigned to your account. Not generalists — domain experts who live and breathe eCommerce.',
    color: '#00D4FF',
  },
  {
    icon: Zap,
    title: 'AI-Powered Execution',
    description: 'We combine human expertise with cutting-edge AI tools to move faster, optimize smarter, and capture opportunities others miss.',
    color: '#7C3AED',
  },
  {
    icon: BarChart3,
    title: 'Full Transparency',
    description: 'Real-time dashboards. Weekly reports. No hiding behind vanity metrics. You always know exactly what we\'re doing and why.',
    color: '#10B981',
  },
  {
    icon: Clock,
    title: 'Fast Turnaround',
    description: 'Onboard in 48 hours. See first optimizations in 7 days. Measurable results in 30 days. We move at startup speed.',
    color: '#F59E0B',
  },
  {
    icon: Shield,
    title: 'Risk-Free Guarantee',
    description: 'No long-term contracts. Cancel anytime. We back our work with a 30-day results guarantee because we\'re that confident.',
    color: '#00D4FF',
  },
]

export default function WhyUsSection() {
  return (
    <section className="py-32 bg-[#0A0A0F] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <ScrollReveal direction="left">
            <span className="text-xs tracking-[0.3em] uppercase text-[#00D4FF] font-medium mb-4 block">Why xComify</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
              Not Just an Agency.{' '}
              <span className="gradient-text">Your Growth Partner.</span>
            </h2>
            <p className="text-white/50 leading-relaxed mb-8">
              We don't just manage stores — we build eCommerce empires. Our vertically integrated approach means you get strategy, execution, and optimization under one roof, with experts who eat, sleep, and breathe your platform.
            </p>

            {/* Mini stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '#1', label: 'Rated Agency 2024' },
                { value: '48h', label: 'Onboarding Time' },
                { value: '30d', label: 'Results Guaranteed' },
                { value: '24/7', label: 'Support Coverage' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-white/8 p-4 bg-white/2">
                  <div className="text-2xl font-black text-[#00D4FF] mb-1" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>{s.value}</div>
                  <div className="text-white/50 text-xs">{s.label}</div>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Right — grid of reasons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reasons.map((reason, i) => (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="group rounded-xl border border-white/8 p-5 hover:border-white/15 hover:bg-white/2 transition-all duration-300"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110"
                  style={{ color: reason.color, background: `${reason.color}15`, border: `1px solid ${reason.color}25` }}
                >
                  <reason.icon size={20} />
                </div>
                <h3 className="text-white font-bold text-sm mb-1.5">{reason.title}</h3>
                <p className="text-white/40 text-xs leading-relaxed">{reason.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
