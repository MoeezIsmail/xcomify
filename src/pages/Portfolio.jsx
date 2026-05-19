import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, TrendingUp } from 'lucide-react'
import ScrollReveal from '../components/ui/ScrollReveal'
import CTASection from '../sections/home/CTASection'

const caseStudies = [
  {
    id: 1,
    title: 'AlphaPet Supplies',
    category: 'Amazon',
    challenge: 'Struggling with low visibility and 45% ACoS eating all margins',
    solution: 'Complete listing overhaul, PPC restructure, and brand story development',
    result: '+350% Revenue in 6 months',
    metrics: { revenue: '$180K/mo', growth: '+350%', acos: '18%', timeframe: '6 months' },
    tags: ['Amazon', 'PPC', 'Listing Optimization'],
    color: '#FF9900',
  },
  {
    id: 2,
    title: 'Bloom Home Decor',
    category: 'Etsy',
    challenge: 'Zero organic traffic despite quality products and 5-star reviews',
    solution: 'Keyword research overhaul, photography guidance, and shop branding',
    result: '3x Sales in 3 months',
    metrics: { revenue: '$45K/mo', growth: '+200%', position: 'Top 10', timeframe: '3 months' },
    tags: ['Etsy', 'SEO', 'Branding'],
    color: '#F56400',
  },
  {
    id: 3,
    title: 'TechGear Pro',
    category: 'Amazon',
    challenge: 'High ACoS (45%) with stagnant sales growth',
    solution: 'Campaign restructuring, negative keyword mining, and bid optimization',
    result: 'ACoS from 45% to 18%',
    metrics: { revenue: '$320K/mo', acos: '18%', roas: '5.6x', timeframe: '90 days' },
    tags: ['Amazon', 'PPC', 'Automation'],
    color: '#00D4FF',
  },
  {
    id: 4,
    title: 'Luxe Candles Co',
    category: 'Shopify',
    challenge: '0.8% conversion rate on a beautiful but underperforming store',
    solution: 'Full funnel redesign, CRO optimization, and email automation',
    result: 'CVR from 0.8% to 4.2%',
    metrics: { cvr: '4.2%', revenue: '$85K/mo', growth: '+425%', timeframe: '60 days' },
    tags: ['Shopify', 'CRO', 'Email'],
    color: '#EC4899',
  },
  {
    id: 5,
    title: 'SportsFit Essentials',
    category: 'Walmart',
    challenge: 'Breaking into Walmart Marketplace from scratch',
    solution: 'Full marketplace setup, product mapping, and catalog optimization',
    result: '$2M GMV in 8 months',
    metrics: { revenue: '$2M GMV', growth: 'Zero to Hero', rank: 'Top Seller', timeframe: '8 months' },
    tags: ['Walmart', 'Marketplace', 'Launch'],
    color: '#0071CE',
  },
  {
    id: 6,
    title: 'ViralStyle TikTok',
    category: 'TikTok Shop',
    challenge: 'New brand wanting to capitalize on TikTok Shop\'s explosive growth',
    solution: 'Creator partnerships, live commerce strategy, and viral product selection',
    result: '100K units sold in 90 days',
    metrics: { units: '100K+', revenue: '$1.2M', growth: '+800%', timeframe: '90 days' },
    tags: ['TikTok Shop', 'Influencer', 'Live Commerce'],
    color: '#FF0050',
  },
]

const categories = ['All', 'Amazon', 'Etsy', 'Shopify', 'Walmart', 'TikTok Shop']

export default function Portfolio() {
  const [filter, setFilter] = useState('All')
  const filtered = filter === 'All' ? caseStudies : caseStudies.filter((c) => c.category === filter)

  return (
    <main className="pt-24">
      <section className="py-20 bg-[#0A0A0F] relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="text-xs tracking-[0.3em] uppercase text-[#00D4FF] font-medium mb-4 block">Case Studies</span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>
              <span className="gradient-text">Real Results</span>{' '}
              from Real Clients
            </h1>
            <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto">
              Not case studies built on cherry-picked data. Real businesses, real challenges, and the exact strategies we used to solve them.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 bg-[#050508] sticky top-20 z-50 border-b border-white/8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filter === cat
                    ? 'bg-[#00D4FF] text-[#0A0A0F]'
                    : 'border border-white/15 text-white/60 hover:text-white hover:border-white/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#050508]">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={filter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filtered.map((cs, i) => (
                <motion.div
                  key={cs.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="group rounded-2xl border border-white/8 overflow-hidden hover:border-white/20 transition-all duration-300 bg-white/2"
                >
                  {/* Header */}
                  <div className="h-36 flex items-center justify-center relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${cs.color}20, ${cs.color}08)` }}
                  >
                    <div className="absolute inset-0 opacity-20"
                      style={{ background: `radial-gradient(circle at 30% 50%, ${cs.color}, transparent 60%)` }}
                    />
                    <div className="text-center relative z-10">
                      <div className="text-2xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>{cs.result.split(' ')[0]}</div>
                      <div className="text-sm text-white/60">{cs.result.split(' ').slice(1).join(' ')}</div>
                    </div>
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-medium"
                      style={{ color: cs.color, background: `${cs.color}20` }}
                    >
                      {cs.category}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-white font-bold text-xl" style={{ fontFamily: 'Syne, sans-serif' }}>{cs.title}</h3>
                      <TrendingUp size={18} style={{ color: cs.color }} />
                    </div>
                    <p className="text-white/40 text-sm mb-4 leading-relaxed">{cs.challenge}</p>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {Object.entries(cs.metrics).slice(0, 4).map(([key, val]) => (
                        <div key={key} className="bg-white/4 rounded-lg p-2 text-center">
                          <div className="text-sm font-bold text-white">{val}</div>
                          <div className="text-xs text-white/30 capitalize">{key}</div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {cs.tags.map((tag) => (
                        <span key={tag} className="text-xs px-2 py-1 rounded-md border border-white/10 text-white/40">{tag}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <CTASection />
    </main>
  )
}
