import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Calendar, Clock, ArrowRight, Tag } from 'lucide-react'
import CTASection from '../sections/home/CTASection'
import { blogAPI } from '../lib/api'

export default function Blog() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [categories, setCategories] = useState(['All'])

  useEffect(() => {
    blogAPI.getAll({ status: 'published' })
      .then((res) => {
        const data = res.data?.data || res.data || []
        setPosts(data)
        const cats = ['All', ...new Set(data.map((p) => p.category).filter(Boolean))]
        setCategories(cats)
      })
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'All' ? posts : posts.filter((p) => p.category === filter)
  const featured = posts.find((p) => p.is_featured || p.featured)
  const rest = featured ? posts.filter((p) => p.id !== featured.id) : posts

  const SkeletonCard = () => (
    <div className="border border-white/8 rounded-2xl overflow-hidden bg-white/2 animate-pulse">
      <div className="h-44 bg-white/5" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-white/10 rounded w-1/3" />
        <div className="h-4 bg-white/10 rounded w-4/5" />
        <div className="h-3 bg-white/5 rounded w-full" />
        <div className="h-3 bg-white/5 rounded w-2/3" />
      </div>
    </div>
  )

  return (
    <main className="pt-24">
      <section className="py-10 sm:py-14 lg:py-20 bg-[#0A0A0F] text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="text-xs tracking-[0.3em] uppercase text-[#00D4FF] font-medium mb-4 block">eCommerce Intelligence</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-4 sm:mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>
              The <span className="gradient-text">xComify Blog</span>
            </h1>
            <p className="text-white/50 text-sm sm:text-base md:text-lg max-w-xl mx-auto">
              Actionable strategies, platform guides, and insider insights from our team of eCommerce experts.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured post */}
      {!loading && featured && (
        <section className="py-6 sm:py-10 lg:py-12 bg-[#050508]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="group rounded-3xl border border-white/8 overflow-hidden hover:border-white/20 transition-all duration-300 grid md:grid-cols-2 bg-white/2">
              <div className="h-64 md:h-auto bg-gradient-to-br from-[#00D4FF]/20 to-[#7C3AED]/20 flex items-center justify-center relative">
                {featured.image_path ? (
                  <img src={featured.image_path} alt={featured.title} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <span className="text-8xl opacity-30">📊</span>
                )}
                <div className="absolute inset-0 bg-gradient-to-br from-[#00D4FF]/10 to-transparent" />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#00D4FF]/20 border border-[#00D4FF]/30 text-xs text-[#00D4FF] font-medium">
                  Featured
                </div>
              </div>
              <div className="p-8 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-3">
                  <Tag size={12} className="text-[#00D4FF]" />
                  <span className="text-xs text-[#00D4FF] font-medium">{featured.category}</span>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-3 leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>{featured.title}</h2>
                <p className="text-white/50 text-sm leading-relaxed mb-6">{featured.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-white/30">
                    <span className="flex items-center gap-1"><Calendar size={11} /> {featured.created_at?.split('T')[0] || featured.date}</span>
                    {featured.read_time && <span className="flex items-center gap-1"><Clock size={11} /> {featured.read_time} read</span>}
                  </div>
                  <Link to={`/blog/${featured.slug}`} className="flex items-center gap-1.5 text-sm text-[#00D4FF] font-semibold group-hover:gap-2.5 transition-all">
                    Read more <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Filter */}
      {!loading && categories.length > 1 && (
        <section className="py-8 bg-[#050508] sticky top-20 z-50 border-b border-white/8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button key={cat} onClick={() => setFilter(cat)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                    filter === cat ? 'bg-[#00D4FF] text-[#0A0A0F]' : 'border border-white/15 text-white/50 hover:text-white'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Grid */}
      <section className="py-8 sm:py-12 lg:py-16 bg-[#050508]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 && !featured ? (
            <div className="text-center py-24">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-white font-bold text-xl mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>No posts yet</h3>
              <p className="text-white/40 text-sm">Check back soon for eCommerce insights and strategies.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(filter === 'All' ? rest : filtered).map((post, i) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="group border border-white/8 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 bg-white/2"
                >
                  <div className="h-44 bg-gradient-to-br from-white/5 to-white/2 flex items-center justify-center relative overflow-hidden">
                    {post.image_path ? (
                      <img src={post.image_path} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <span className="text-5xl opacity-40">📝</span>
                    )}
                    <div className="absolute top-3 left-3 px-2 py-1 rounded-md text-xs font-medium bg-[#7C3AED]/20 text-[#A78BFA] border border-[#7C3AED]/30">
                      {post.category}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3 text-xs text-white/30">
                      <span className="flex items-center gap-1"><Calendar size={10} /> {post.created_at?.split('T')[0] || post.date}</span>
                      {post.read_time && <span className="flex items-center gap-1"><Clock size={10} /> {post.read_time}</span>}
                    </div>
                    <h3 className="text-white font-bold text-lg leading-tight mb-3 group-hover:text-[#00D4FF] transition-colors" style={{ fontFamily: 'Syne, sans-serif' }}>
                      {post.title}
                    </h3>
                    <p className="text-white/40 text-sm leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/30">{post.author ? `By ${post.author}` : ''}</span>
                      <Link to={`/blog/${post.slug}`} className="text-xs text-[#00D4FF] flex items-center gap-1 hover:gap-2 transition-all">
                        Read <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      <CTASection />
    </main>
  )
}
