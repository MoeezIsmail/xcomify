import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Calendar, Clock, ArrowRight, Tag } from 'lucide-react'
import ScrollReveal from '../components/ui/ScrollReveal'
import CTASection from '../sections/home/CTASection'

const posts = [
  {
    id: 1, slug: 'amazon-ppc-guide-2024',
    title: 'The Complete Amazon PPC Guide for 2024: From Zero to Profitable',
    excerpt: 'Everything you need to know about Amazon PPC in 2024: campaign structures, bid strategies, and the exact tactics we use to keep ACoS under 20%.',
    category: 'Amazon PPC',
    date: '2024-03-15',
    readTime: '12 min',
    author: 'James Chen',
    featured: true,
    tags: ['Amazon', 'PPC', 'Strategy'],
  },
  {
    id: 2, slug: 'shopify-cvr-optimization',
    title: '15 Conversion Rate Tactics That Took Our Client from 0.9% to 4.2%',
    excerpt: 'The exact conversion rate optimizations we implemented for Luxe Candles Co that quadrupled their revenue in 60 days without increasing ad spend.',
    category: 'Shopify CRO',
    date: '2024-03-08',
    readTime: '8 min',
    author: 'Sarah Mitchell',
    featured: false,
    tags: ['Shopify', 'CRO', 'Revenue'],
  },
  {
    id: 3, slug: 'etsy-algorithm-2024',
    title: 'Decoding the Etsy Algorithm: What Actually Drives Organic Traffic',
    excerpt: 'After analyzing 200+ Etsy shops, we identified the 7 ranking factors that matter most in 2024. The results surprised even us.',
    category: 'Etsy SEO',
    date: '2024-03-01',
    readTime: '10 min',
    author: 'Priya Sharma',
    featured: false,
    tags: ['Etsy', 'SEO', 'Algorithm'],
  },
  {
    id: 4, slug: 'tiktok-shop-launch-strategy',
    title: 'How We Sold 100K Units in 90 Days on TikTok Shop (Full Strategy)',
    excerpt: 'The exact playbook we used to launch a brand from zero on TikTok Shop and hit $1.2M in revenue in 3 months. Including creator outreach templates.',
    category: 'TikTok Shop',
    date: '2024-02-22',
    readTime: '15 min',
    author: 'Marcus Webb',
    featured: false,
    tags: ['TikTok Shop', 'Launch', 'Influencer'],
  },
  {
    id: 5, slug: 'ai-ecommerce-tools',
    title: 'The 10 AI Tools That Are Changing eCommerce in 2024',
    excerpt: 'From demand forecasting to automated copywriting, these AI tools are giving early adopters an unfair competitive advantage.',
    category: 'AI & Tech',
    date: '2024-02-14',
    readTime: '9 min',
    author: 'Marcus Webb',
    featured: false,
    tags: ['AI', 'Tools', 'Automation'],
  },
  {
    id: 6, slug: 'walmart-marketplace-guide',
    title: 'Walmart Marketplace in 2024: The Untapped Goldmine Most Sellers Ignore',
    excerpt: 'Walmart Marketplace is growing faster than Amazon, with less competition and better margins. Here\'s how to capitalize before it gets crowded.',
    category: 'Walmart',
    date: '2024-02-06',
    readTime: '11 min',
    author: 'Sarah Mitchell',
    featured: false,
    tags: ['Walmart', 'Marketplace', 'Strategy'],
  },
]

const categories = ['All', 'Amazon PPC', 'Shopify CRO', 'Etsy SEO', 'TikTok Shop', 'AI & Tech', 'Walmart']

export default function Blog() {
  const [filter, setFilter] = useState('All')
  const filtered = filter === 'All' ? posts : posts.filter((p) => p.category === filter)
  const featured = posts.find((p) => p.featured)
  const rest = posts.filter((p) => !p.featured)

  return (
    <main className="pt-24">
      <section className="py-20 bg-[#0A0A0F] text-center">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="text-xs tracking-[0.3em] uppercase text-[#00D4FF] font-medium mb-4 block">eCommerce Intelligence</span>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-6" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
              The <span className="gradient-text">xComify Blog</span>
            </h1>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              Actionable strategies, platform guides, and insider insights from our team of eCommerce experts.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured post */}
      {featured && (
        <section className="py-12 bg-[#050508]">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="group rounded-3xl border border-white/8 overflow-hidden hover:border-white/20 transition-all duration-300 grid md:grid-cols-2 bg-white/2">
              <div className="h-64 md:h-auto bg-gradient-to-br from-[#00D4FF]/20 to-[#7C3AED]/20 flex items-center justify-center relative">
                <span className="text-8xl opacity-30">📊</span>
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
                <h2 className="text-2xl font-black text-white mb-3 leading-tight" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>{featured.title}</h2>
                <p className="text-white/50 text-sm leading-relaxed mb-6">{featured.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-white/30">
                    <span className="flex items-center gap-1"><Calendar size={11} /> {featured.date}</span>
                    <span className="flex items-center gap-1"><Clock size={11} /> {featured.readTime} read</span>
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
      <section className="py-8 bg-[#050508] sticky top-20 z-50 border-b border-white/8">
        <div className="max-w-7xl mx-auto px-6">
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

      {/* Grid */}
      <section className="py-16 bg-[#050508]">
        <div className="max-w-7xl mx-auto px-6">
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
                  <span className="text-5xl opacity-40">📝</span>
                  <div className="absolute top-3 left-3 px-2 py-1 rounded-md text-xs font-medium bg-[#7C3AED]/20 text-[#A78BFA] border border-[#7C3AED]/30">
                    {post.category}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3 text-xs text-white/30">
                    <span className="flex items-center gap-1"><Calendar size={10} /> {post.date}</span>
                    <span className="flex items-center gap-1"><Clock size={10} /> {post.readTime}</span>
                  </div>
                  <h3 className="text-white font-bold text-base leading-tight mb-3 group-hover:text-[#00D4FF] transition-colors" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
                    {post.title}
                  </h3>
                  <p className="text-white/40 text-sm leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/30">By {post.author}</span>
                    <Link to={`/blog/${post.slug}`} className="text-xs text-[#00D4FF] flex items-center gap-1 hover:gap-2 transition-all">
                      Read <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </main>
  )
}
