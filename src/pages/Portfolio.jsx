import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import CTASection from '../sections/home/CTASection'
import { portfolioAPI } from '../lib/api'

export default function Portfolio() {
  const [caseStudies, setCaseStudies] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [categories, setCategories] = useState(['All'])

  useEffect(() => {
    portfolioAPI.getAll()
      .then((res) => {
        const data = res.data?.data || res.data || []
        setCaseStudies(data.map((item) => ({
          ...item,
          metrics: typeof item.metrics === 'string' ? (() => { try { return JSON.parse(item.metrics) } catch { return {} } })() : (item.metrics || {}),
          tags: typeof item.tags === 'string' ? item.tags.split(',').map((t) => t.trim()).filter(Boolean) : (item.tags || []),
        })))
        const cats = ['All', ...new Set(data.map((c) => c.category).filter(Boolean))]
        setCategories(cats)
      })
      .catch(() => setCaseStudies([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'All' ? caseStudies : caseStudies.filter((c) => c.category === filter)

  const SkeletonCard = () => (
    <div className="rounded-2xl border border-white/8 overflow-hidden bg-white/2 animate-pulse">
      <div className="h-36 bg-white/5" />
      <div className="p-6 space-y-3">
        <div className="h-4 bg-white/10 rounded w-3/4" />
        <div className="h-3 bg-white/5 rounded w-full" />
        <div className="grid grid-cols-2 gap-2 mt-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-white/5 rounded-lg" />)}
        </div>
      </div>
    </div>
  )

  return (
    <main className="pt-24">
      <section className="py-10 sm:py-14 lg:py-20 bg-[#0A0A0F] relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="text-xs tracking-[0.3em] uppercase text-[#00D4FF] font-medium mb-4 block">Case Studies</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-4 sm:mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>
              <span className="gradient-text">Real Results</span>{' '}
              from Real Clients
            </h1>
            <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto">
              Not case studies built on cherry-picked data. Real businesses, real challenges, and the exact strategies we used to solve them.
            </p>
          </motion.div>
        </div>
      </section>

      {!loading && categories.length > 1 && (
        <section className="py-6 sm:py-10 lg:py-12 bg-[#050508] sticky top-20 z-50 border-b border-white/8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
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
      )}

      <section className="py-10 sm:py-14 lg:py-20 bg-[#050508]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-white font-bold text-xl mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>No case studies yet</h3>
              <p className="text-white/40 text-sm">Our portfolio is being updated. Check back soon.</p>
            </div>
          ) : (
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
                      style={{ background: `linear-gradient(135deg, ${cs.color || '#00D4FF'}20, ${cs.color || '#00D4FF'}08)` }}
                    >
                      <div className="absolute inset-0 opacity-20"
                        style={{ background: `radial-gradient(circle at 30% 50%, ${cs.color || '#00D4FF'}, transparent 60%)` }}
                      />
                      {cs.image_path ? (
                        <img src={cs.image_path} alt={cs.title} className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <div className="text-center relative z-10">
                          <div className="text-2xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                            {cs.result?.split(' ')[0] || '+'}
                          </div>
                          <div className="text-sm text-white/60">{cs.result?.split(' ').slice(1).join(' ')}</div>
                        </div>
                      )}
                      <div className="absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-medium"
                        style={{ color: cs.color || '#00D4FF', background: `${cs.color || '#00D4FF'}20` }}
                      >
                        {cs.category}
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-white font-bold text-xl" style={{ fontFamily: 'Syne, sans-serif' }}>{cs.title}</h3>
                        <TrendingUp size={18} style={{ color: cs.color || '#00D4FF' }} />
                      </div>
                      <p className="text-white/40 text-sm mb-4 leading-relaxed">{cs.challenge}</p>

                      {/* Metrics */}
                      {cs.metrics && Object.keys(cs.metrics).length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {Object.entries(cs.metrics).slice(0, 4).map(([key, val]) => (
                            <div key={key} className="bg-white/4 rounded-lg p-2 text-center">
                              <div className="text-sm font-bold text-white">{val}</div>
                              <div className="text-xs text-white/30 capitalize">{key}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {cs.tags && cs.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {cs.tags.map((tag) => (
                            <span key={tag} className="text-xs px-2 py-1 rounded-md border border-white/10 text-white/40">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </section>

      <CTASection />
    </main>
  )
}
