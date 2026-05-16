import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Target, Heart, Lightbulb, Globe } from 'lucide-react'
import { team } from '../data/platforms'
import ScrollReveal from '../components/ui/ScrollReveal'
import CTASection from '../sections/home/CTASection'

const values = [
  { icon: Target, title: 'Results-Obsessed', description: 'Everything we do is measured against one metric: your growth. Vanity metrics don\'t pay bills — revenue does.', color: '#00D4FF' },
  { icon: Heart, title: 'Client-First Always', description: 'Your success is our success. We embed into your business and treat your store like our own.', color: '#EC4899' },
  { icon: Lightbulb, title: 'Innovation-Driven', description: 'We invest heavily in AI tools, data analytics, and emerging platform features to keep you ahead of competitors.', color: '#F59E0B' },
  { icon: Globe, title: 'Global Perspective', description: 'With clients across 30+ countries, we bring global insights and market intelligence to every engagement.', color: '#7C3AED' },
]

export default function About() {
  return (
    <main className="pt-24">
      {/* Hero */}
      <section className="py-20 bg-[#0A0A0F] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,212,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-xs tracking-[0.3em] uppercase text-[#00D4FF] font-medium mb-4 block">Our Story</span>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-6" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
              Built by Sellers,{' '}
              <span className="gradient-text">for Sellers</span>
            </h1>
            <p className="text-white/50 text-lg leading-relaxed max-w-2xl mx-auto">
              xComify was founded in 2018 by a team of Amazon sellers and eCommerce veterans who were frustrated by agencies that didn't understand how marketplaces actually work. So we built the agency we always wanted.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 bg-[#050508]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal direction="left">
              <span className="text-xs tracking-[0.3em] uppercase text-[#00D4FF] font-medium mb-4 block">Our Mission</span>
              <h2 className="text-4xl font-black text-white mb-6" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
                Democratizing Access to{' '}
                <span className="gradient-text">Elite eCommerce Expertise</span>
              </h2>
              <p className="text-white/50 leading-relaxed mb-6">
                We believe every brand deserves access to the same caliber of expertise that Fortune 500 companies have. Our mission is to level the playing field by giving ambitious entrepreneurs and growing businesses the tools, talent, and strategy to compete at the highest level.
              </p>
              <p className="text-white/50 leading-relaxed mb-8">
                Since 2018, we've helped over 500 businesses across 30+ countries generate more than $12M in combined revenue. And we're just getting started.
              </p>
              <Link
                to="/contact"
                className="group inline-flex items-center gap-2 text-[#00D4FF] font-semibold hover:gap-3 transition-all duration-200"
              >
                Start your journey <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </ScrollReveal>

            <ScrollReveal direction="right">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { y: '2018', label: 'Founded' },
                  { y: '30+', label: 'Countries' },
                  { y: '500+', label: 'Clients Served' },
                  { y: '$12M+', label: 'Revenue Generated' },
                ].map((s, i) => (
                  <div key={s.label} className="rounded-2xl border border-white/8 p-6 text-center bg-white/2">
                    <div className="text-3xl font-black text-white mb-1" style={{ fontFamily: 'Cabinet Grotesk, sans-serif', color: i % 2 === 0 ? '#00D4FF' : '#7C3AED' }}>{s.y}</div>
                    <div className="text-white/40 text-sm">{s.label}</div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-[#0A0A0F]">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal className="text-center mb-16">
            <span className="text-xs tracking-[0.3em] uppercase text-[#00D4FF] font-medium mb-4 block">Our Values</span>
            <h2 className="text-4xl font-black text-white" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
              What Drives{' '}
              <span className="gradient-text">Everything We Do</span>
            </h2>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="border border-white/8 rounded-2xl p-6 hover:border-white/15 hover:bg-white/2 transition-all duration-300 text-center"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ color: v.color, background: `${v.color}15`, border: `1px solid ${v.color}25` }}>
                  <v.icon size={24} />
                </div>
                <h3 className="text-white font-bold mb-2" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>{v.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{v.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-[#050508]">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal className="text-center mb-16">
            <span className="text-xs tracking-[0.3em] uppercase text-[#00D4FF] font-medium mb-4 block">Leadership Team</span>
            <h2 className="text-4xl font-black text-white" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
              The People Behind Your{' '}
              <span className="gradient-text">Success</span>
            </h2>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="group rounded-2xl border border-white/8 overflow-hidden hover:border-white/15 transition-all duration-300"
              >
                <div className="h-48 bg-gradient-to-br from-[#00D4FF]/20 to-[#7C3AED]/20 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#7C3AED] flex items-center justify-center text-white font-black text-2xl" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-white font-bold" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>{member.name}</h3>
                  <p className="text-[#00D4FF] text-sm mb-2">{member.role}</p>
                  <p className="text-white/40 text-xs leading-relaxed">{member.bio}</p>
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
