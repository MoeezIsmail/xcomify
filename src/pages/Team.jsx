import { motion } from 'framer-motion'
const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[14px] h-[14px]">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)
const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[14px] h-[14px]">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)
import { team } from '../data/platforms'
import ScrollReveal from '../components/ui/ScrollReveal'
import CTASection from '../sections/home/CTASection'

const allTeam = [
  ...team,
  { id: 5, name: 'Aisha Patel', role: 'Amazon PPC Specialist', bio: '4+ years running Amazon ad campaigns with a portfolio of $3M+ in managed spend.', image: null, linkedin: '#', twitter: '#' },
  { id: 6, name: 'Lucas Fernandez', role: 'Shopify Developer', bio: 'Certified Shopify Partner with 80+ custom stores built and a focus on conversion-first design.', image: null, linkedin: '#', twitter: '#' },
  { id: 7, name: 'Emma Wilson', role: 'Content & SEO Lead', bio: 'Former agency copywriter turned eCommerce content strategist with expertise across all platforms.', image: null, linkedin: '#', twitter: '#' },
  { id: 8, name: 'Raj Kumar', role: 'Data & Analytics', bio: 'Data scientist who builds custom dashboards and predictive models for eCommerce brands.', image: null, linkedin: '#', twitter: '#' },
]

export default function Team() {
  return (
    <main className="pt-24">
      <section className="py-20 bg-[#0A0A0F] text-center">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="text-xs tracking-[0.3em] uppercase text-[#00D4FF] font-medium mb-4 block">Meet the Team</span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>
              The Experts Behind{' '}
              <span className="gradient-text">Your Growth</span>
            </h1>
            <p className="text-white/50 text-lg md:text-xl max-w-xl mx-auto">
              50+ specialists across every eCommerce discipline. Each one hand-picked for expertise, results, and passion.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-[#050508]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {allTeam.map((member, i) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 4) * 0.1, duration: 0.6 }}
                className="group border border-white/8 rounded-2xl overflow-hidden hover:border-white/20 hover:bg-white/2 transition-all duration-300"
              >
                <div className="h-52 bg-gradient-to-br from-[#00D4FF]/15 to-[#7C3AED]/15 flex items-center justify-center relative overflow-hidden">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#7C3AED] flex items-center justify-center text-white font-black text-3xl shadow-[0_0_30px_rgba(0,212,255,0.3)]" style={{ fontFamily: 'Syne, sans-serif' }}>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent opacity-40" />
                </div>
                <div className="p-5">
                  <h3 className="text-white font-bold text-base md:text-lg mb-0.5" style={{ fontFamily: 'Syne, sans-serif' }}>{member.name}</h3>
                  <p className="text-[#00D4FF] text-sm mb-3">{member.role}</p>
                  <p className="text-white/40 text-sm leading-relaxed mb-4">{member.bio}</p>
                  <div className="flex gap-2">
                    <a href={member.linkedin} className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-white/40 hover:text-[#00D4FF] hover:border-[#00D4FF]/30 transition-all">
                      <LinkedinIcon />
                    </a>
                    <a href={member.twitter} className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-white/40 hover:text-[#00D4FF] hover:border-[#00D4FF]/30 transition-all">
                      <TwitterIcon />
                    </a>
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
