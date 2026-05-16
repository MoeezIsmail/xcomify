import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { platforms } from '../../data/platforms'
import ScrollReveal from '../../components/ui/ScrollReveal'

const platformColors = {
  amazon: '#FF9900',
  ebay: '#E53238',
  etsy: '#F56400',
  shopify: '#96BF48',
  walmart: '#0071CE',
  tiktok: '#FF0050',
  private: '#7C3AED',
}

const PlatformIcon = ({ id, name, color }) => {
  const icons = {
    amazon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path d="M13.958 10.09c0 1.232.029 2.256-.591 3.351-.502.891-1.301 1.438-2.186 1.438-1.214 0-1.922-.924-1.922-2.292 0-2.692 2.415-3.182 4.7-3.182v.685zm3.186 7.705c-.209.189-.512.201-.745.074-1.047-.871-1.234-1.276-1.814-2.106-1.734 1.767-2.962 2.297-5.209 2.297-2.661 0-4.731-1.642-4.731-4.927 0-2.565 1.391-4.309 3.37-5.164 1.715-.756 4.11-.891 5.942-1.097V6.3c0-.756.06-1.649-.385-2.306-.385-.587-1.124-.829-1.773-.829-1.205 0-2.277.618-2.54 1.898-.054.285-.261.567-.549.582l-3.061-.333c-.258-.056-.548-.266-.472-.661.701-3.665 4.014-4.772 6.984-4.772 1.521 0 3.507.405 4.706 1.556 1.521 1.421 1.375 3.316 1.375 5.379v4.873c0 1.467.607 2.109 1.177 2.906.201.283.244.621-.009.831l-2.236 1.851zm3.666.889c-2.723 2.015-6.673 3.088-10.072 3.088-4.762 0-9.051-1.762-12.293-4.695-.255-.228-.027-.542.279-.364 3.501 2.038 7.826 3.264 12.294 3.264 3.014 0 6.327-.625 9.373-1.921.46-.196.845.302.419.628zm1.194-1.35c-.346-.447-2.289-.212-3.161-.107-.265.034-.306-.199-.067-.367 1.548-1.089 4.09-.775 4.386-.41.299.367-.079 2.901-1.532 4.11-.224.188-.437.088-.337-.16.327-.814 1.056-2.62.711-3.066z"/>
      </svg>
    ),
    ebay: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path d="M0 7.671l3.287-3.287h5.152l.862.862-2.425 2.425H8.44v8.663h-2.01V9.332H5.152l-5.152-1.661zm14.756-3.287h2.01v12.013h-2.01V4.384zm-4.956 0H12.1v12.013H9.8V4.384zM24 11.497c0 2.671-2.158 4.83-4.83 4.83-2.671 0-4.83-2.159-4.83-4.83s2.159-4.83 4.83-4.83c2.672 0 4.83 2.159 4.83 4.83z"/>
      </svg>
    ),
    etsy: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path d="M9.194 8.069C8.917 9.09 8.7 10.085 8.527 11h1.924c.346 0 .624.277.624.622a.624.624 0 01-.624.622H8.3c-.147.97-.246 1.87-.296 2.662 0 .692.138 1.108.415 1.246.277.138.762.215 1.454.231h.554c.345 0 .622.277.622.622a.622.622 0 01-.622.622h-.554c-.969 0-1.723-.162-2.262-.484-.54-.323-.809-.924-.809-1.8 0-.693.1-1.562.277-2.577-.139 0-.277.015-.416.015a.622.622 0 01-.622-.622c0-.345.278-.622.622-.622h.693c.17-.877.37-1.847.622-2.93H7.14a.622.622 0 01-.622-.623c0-.346.278-.623.622-.623h1.177c.092-.415.184-.83.277-1.23.484-1.97 1.384-3.047 2.7-3.047.623 0 1.154.23 1.454.669.3.415.438.97.438 1.638a.622.622 0 01-.623.622.622.622 0 01-.622-.622c0-.416-.069-.716-.231-.9-.162-.184-.392-.277-.692-.277-.692 0-1.246.739-1.661 2.177z"/>
      </svg>
    ),
    shopify: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path d="M15.337 23.979l7.216-1.561s-2.604-17.613-2.625-17.73c-.018-.116-.116-.194-.213-.194s-1.929-.136-1.929-.136-.388-.388-1.289-1.289c-.116-.097-.213-.194-.291-.233L15.337 23.979zm-2.508.021L14.2 0s-.446.116-.932.291c-.058.019-.097.039-.135.058C12.609.543 9.64 1.396 9.64 1.396c-1.289-.039-1.928.272-2.817.951C5.843 3.22 5.107 4.51 5.107 4.51l.019.116c-.776.233-1.484.447-2.121.641.194 2.257 1.832 8.933 1.832 8.933s-.137 2.178-.252 3.37L6.82 22.76l6.009 1.24zM12.28 1.862c-.019-.447-.058-.854-.116-1.193.776.272 1.24 1.154 1.532 1.921l-1.416-.728z"/>
      </svg>
    ),
    walmart: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path d="M12 0L14.5 9h9l-7.3 5.3 2.8 8.7-7-5.1-7 5.1 2.8-8.7L.5 9h9L12 0z"/>
      </svg>
    ),
    tiktok: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.3 6.3 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.84 1.56V6.79a4.85 4.85 0 01-1.07-.1z"/>
      </svg>
    ),
    private: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4.18l6 2.67v4.15c0 3.87-2.62 7.5-6 8.6-3.38-1.1-6-4.73-6-8.6V7.85l6-2.67z"/>
      </svg>
    ),
  }
  return icons[id] || <span className="text-3xl">🛒</span>
}

export default function PlatformsSection() {
  const [active, setActive] = useState(platforms[0])

  return (
    <section className="py-32 bg-[#0A0A0F] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(rgba(0,212,255,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal className="text-center mb-16">
          <span className="text-xs tracking-[0.3em] uppercase text-[#00D4FF] font-medium mb-4 block">Platforms We Dominate</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
            One Agency.{' '}
            <span className="gradient-text">Every Platform.</span>
          </h2>
          <p className="text-white/50 max-w-xl mx-auto">
            We've built proven systems for every major eCommerce platform. Pick your battlefield — we'll win it for you.
          </p>
        </ScrollReveal>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Platform selector */}
          <div className="lg:col-span-2 flex flex-col gap-2">
            {platforms.map((platform, i) => (
              <motion.button
                key={platform.id}
                onClick={() => setActive(platform)}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={`flex items-center gap-4 px-5 py-4 rounded-xl border text-left transition-all duration-300 ${
                  active.id === platform.id
                    ? 'border-white/20 bg-white/6'
                    : 'border-white/6 bg-transparent hover:bg-white/3 hover:border-white/12'
                }`}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300"
                  style={{
                    color: platform.color,
                    background: `${platform.color}15`,
                    border: `1px solid ${platform.color}30`,
                    boxShadow: active.id === platform.id ? `0 0 15px ${platform.color}30` : 'none',
                  }}
                >
                  <PlatformIcon id={platform.id} name={platform.name} color={platform.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm">{platform.name}</div>
                  <div className="text-white/40 text-xs truncate">{platform.description}</div>
                </div>
                {active.id === platform.id && (
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: platform.color }} />
                )}
              </motion.button>
            ))}
          </div>

          {/* Detail panel */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-2xl border border-white/8 p-8 flex flex-col justify-between overflow-hidden relative"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                <div className="absolute inset-0 opacity-30 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 30% 0%, ${active.color}15 0%, transparent 60%)` }}
                />

                <div>
                  <div className="flex items-start justify-between mb-6">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ color: active.color, background: `${active.color}15`, border: `1px solid ${active.color}30`, boxShadow: `0 0 30px ${active.color}20` }}
                    >
                      <PlatformIcon id={active.id} name={active.name} color={active.color} />
                    </div>
                    <div className="flex gap-6">
                      <div className="text-right">
                        <div className="text-2xl font-black text-white" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>{active.services}</div>
                        <div className="text-xs text-white/40">Services</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-white" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>{active.clients}</div>
                        <div className="text-xs text-white/40">Active Clients</div>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-3xl font-black text-white mb-3" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
                    {active.name}
                  </h3>
                  <p className="text-white/50 leading-relaxed mb-8">{active.description}</p>
                </div>

                <div>
                  <div className="h-px bg-white/8 mb-6" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/40">Average client growth on {active.name}</span>
                    <span className="font-bold text-lg" style={{ color: active.color }}>+340%</span>
                  </div>
                  <div className="mt-3 h-1.5 bg-white/8 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${active.color}, ${active.color}80)` }}
                      initial={{ width: 0 }}
                      animate={{ width: '78%' }}
                      transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
