import {useState, useRef} from 'react'
import {Link} from 'react-router-dom'
import {motion, useMotionValue, useSpring, useTransform} from 'framer-motion'
import {ArrowUpRight, Send} from 'lucide-react'

/* ── Social SVG icons ────────────────────────────────────────── */
const TwitterIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[15px] h-[15px]">
        <path
            d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
)
const LinkedinIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[15px] h-[15px]">
        <path
            d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
)
const InstagramIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[15px] h-[15px]">
        <path
            d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
)
const YoutubeIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[15px] h-[15px]">
        <path
            d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
)

/* ── Data ────────────────────────────────────────────────────── */
const footerLinks = {
    Services: [
        {label: 'Amazon VA Services', href: '/services#amazon-va'},
        {label: 'Shopify Development', href: '/services#shopify-development'},
        {label: 'PPC Management', href: '/services#ppc-management'},
        {label: 'Product Hunting', href: '/services#product-hunting'},
        {label: 'AI Automation', href: '/services#ai-automation'},
    ],
    Company: [
        {label: 'About Us', href: '/about'},
        {label: 'Our Team', href: '/team'},
        {label: 'Portfolio', href: '/portfolio'},
        {label: 'Blog', href: '/blog'},
        {label: 'Careers', href: '/careers'},
    ],
    Support: [
        {label: 'Contact Us', href: '/contact'},
        {label: 'Pricing Plans', href: '/pricing'},
        {label: 'Testimonials', href: '/testimonials'},
        {label: 'Client Success', href: '/client-success'},
        {label: 'Privacy Policy', href: '/privacy'},
    ],
}

const socials = [
    {icon: TwitterIcon, href: '#', label: 'Twitter'},
    {icon: LinkedinIcon, href: '#', label: 'LinkedIn'},
    {icon: InstagramIcon, href: '#', label: 'Instagram'},
    {icon: YoutubeIcon, href: '#', label: 'YouTube'},
]

/* ── Footer ──────────────────────────────────────────────────── */
export default function Footer() {
    const [email, setEmail] = useState('')
    const footerRef = useRef(null)

    /* spring-driven mouse glow */
    const rawX = useMotionValue(0.5)
    const rawY = useMotionValue(0.5)
    const gX = useSpring(rawX, {stiffness: 45, damping: 18})
    const gY = useSpring(rawY, {stiffness: 45, damping: 18})
    const glowLeft = useTransform(gX, v => `${v * 100}%`)
    const glowTop = useTransform(gY, v => `${v * 100}%`)

    const handleMouseMove = (e) => {
        if (!footerRef.current) return
        const {left, top, width, height} = footerRef.current.getBoundingClientRect()
        rawX.set((e.clientX - left) / width)
        rawY.set((e.clientY - top) / height)
    }
    const handleMouseLeave = () => {
        rawX.set(0.5)
        rawY.set(0.5)
    }

    return (
        <footer
            ref={footerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative bg-[#050507] overflow-hidden"
        >

            {/* ── BIG background XCOMIFY text ─────────────────────── */}
            <div
                className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none select-none"
                aria-hidden="true"
            >
  <span
      style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: 'clamp(70px, 13vw, 220px)',
          fontWeight: 900,
          letterSpacing: '0.06em',
          whiteSpace: 'nowrap',
          lineHeight: 1,
          background:
              'linear-gradient(135deg, rgba(0,212,255,0.22) 0%, rgba(124,58,237,0.28) 50%, rgba(0,212,255,0.22) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          opacity: 1,
      }}
  >
    XCOMIFY
  </span>
            </div>

            {/* ── Interactive mouse-tracked glow ──────────────────── */}
            <motion.div
                className="absolute pointer-events-none rounded-full"
                style={{
                    left: glowLeft,
                    top: glowTop,
                    translateX: '-50%',
                    translateY: '-50%',
                    width: 700,
                    height: 700,
                    background: 'radial-gradient(circle, rgba(0,212,255,0.065) 0%, rgba(124,58,237,0.04) 40%, transparent 68%)',
                    filter: 'blur(36px)',
                }}
            />

            {/* ── Content ─────────────────────────────────────────── */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 lg:pt-28 pb-0">

                {/* Newsletter CTA */}
                <motion.div
                    className="text-center mb-16 sm:mb-20"
                    initial={{opacity: 0, y: 32}}
                    whileInView={{opacity: 1, y: 0}}
                    viewport={{once: true}}
                    transition={{duration: 0.7}}
                >
          <span className="text-[10px] sm:text-xs tracking-[0.35em] uppercase text-[#00D4FF]/80 font-medium mb-3 block">
            Stay in the Loop
          </span>
                    <h2
                        className="text-3xl sm:text-4xl lg:text-[52px] font-black text-white mb-3 leading-tight"
                        style={{fontFamily: 'Syne, sans-serif'}}
                    >
                        Scale Smarter,{' '}
                        <span className="gradient-text">Every Week</span>
                    </h2>
                    <p className="text-white/35 text-sm sm:text-base mb-8 max-w-sm mx-auto">
                        eCommerce insights &amp; growth strategies — delivered weekly. No spam, unsubscribe anytime.
                    </p>
                    <form
                        onSubmit={e => e.preventDefault()}
                        className="flex gap-2 max-w-[390px] mx-auto"
                    >
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            className="flex-1 min-w-0 px-4 py-3.5 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#00D4FF]/50 transition-colors"
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.09)',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                            }}
                        />
                        <motion.button
                            type="submit"
                            whileHover={{scale: 1.05}}
                            whileTap={{scale: 0.96}}
                            className="flex items-center gap-1.5 px-5 py-3.5 rounded-xl text-white text-sm font-bold whitespace-nowrap"
                            style={{
                                background: 'linear-gradient(135deg, #00D4FF, #7C3AED)',
                                boxShadow: '0 0 26px rgba(0,212,255,0.38)',
                            }}
                        >
                            <Send size={13}/>
                            Subscribe
                        </motion.button>
                    </form>
                </motion.div>

                {/* Thin divider */}
                <div className="h-px bg-white/[0.05] mb-12"/>

                {/* Quick Links Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-10 mb-14">
                    {Object.entries(footerLinks).map(([title, links], i) => (
                        <motion.div
                            key={title}
                            initial={{opacity: 0, y: 18}}
                            whileInView={{opacity: 1, y: 0}}
                            viewport={{once: true}}
                            transition={{delay: i * 0.08, duration: 0.5}}
                        >
                            <h4
                                className="text-white/85 font-bold text-[10px] tracking-[0.28em] uppercase mb-5 flex items-center gap-2"
                            >
                                <span className="block w-3.5 h-px bg-[#00D4FF]/65 flex-shrink-0"/>
                                {title}
                            </h4>
                            <ul className="flex flex-col gap-2.5">
                                {links.map(link => (
                                    <li key={link.href}>
                                        <Link
                                            to={link.href}
                                            className="text-[13px] text-white/35 hover:text-white/75 transition-colors duration-200 flex items-center gap-1 group w-fit"
                                        >
                      <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                        {link.label}
                      </span>
                                            <ArrowUpRight
                                                size={11}
                                                className="opacity-0 group-hover:opacity-50 shrink-0 transition-opacity"
                                            />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>

                {/* Socials */}
                <div className="flex justify-center gap-3 mb-10">
                    {socials.map(({icon: Icon, href, label}) => (
                        <motion.a
                            key={label}
                            href={href}
                            aria-label={label}
                            whileHover={{scale: 1.14, y: -3}}
                            whileTap={{scale: 0.90}}
                            className="w-10 h-10 rounded-xl border border-white/8 flex items-center justify-center text-white/35 hover:text-[#00D4FF] hover:border-[#00D4FF]/40 hover:bg-[#00D4FF]/8 hover:shadow-[0_0_18px_rgba(0,212,255,0.25)] transition-all duration-200"
                        >
                            <Icon/>
                        </motion.a>
                    ))}
                </div>

                {/* Animated glow beam */}
                <div className="relative h-[2px] mb-8 rounded-full overflow-hidden">
                    {/* static track */}
                    <div className="absolute inset-0 rounded-full bg-white/[0.05]"/>
                    {/* traveling beam */}
                    <motion.div
                        className="absolute top-0 h-full rounded-full"
                        style={{
                            width: '38%',
                            background: 'linear-gradient(90deg, transparent 0%, #00D4FF 25%, #7C3AED 75%, transparent 100%)',
                            boxShadow: '0 0 18px 5px rgba(0,212,255,0.55), 0 0 38px 10px rgba(124,58,237,0.25)',
                        }}
                        animate={{x: ['-38%', '138%']}}
                        transition={{duration: 2.6, repeat: Infinity, ease: 'linear', repeatDelay: 0.7}}
                    />
                </div>

                {/* Copyright */}
                <div className="pb-6 sm:pb-8 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-white/20 text-xs sm:text-sm">
                        © {new Date().getFullYear()} xComify. All rights reserved.
                    </p>
                    <div className="flex items-center gap-5">
                        <Link to="/privacy"
                              className="text-xs sm:text-sm text-white/20 hover:text-white/50 transition-colors">
                            Privacy Policy
                        </Link>
                        <Link to="/terms"
                              className="text-xs sm:text-sm text-white/20 hover:text-white/50 transition-colors">
                            Terms of Service
                        </Link>
                    </div>
                </div>

            </div>
        </footer>
    )
}
