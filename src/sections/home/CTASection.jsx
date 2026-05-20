import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
    ArrowRight,
    Zap,
    Rocket,
    PlayCircle,
    Users,
    DollarSign,
    Star,
    Box,
    ShieldCheck,
} from 'lucide-react'
import MagneticButton from '../../components/ui/MagneticButton'

function DrawLine({ delay = 0, fromRight = false }) {
    return (
        <motion.div
            className="h-px w-full"
            style={{
                background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.7), rgba(124,58,237,0.7), transparent)',
                transformOrigin: fromRight ? 'right' : 'left',
                boxShadow: '0 0 18px rgba(0,212,255,0.45)',
            }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0 }}
            transition={{ delay, duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
        />
    )
}

const ticker = [
    '500+ Clients', '$12M+ Revenue Generated', '97% Satisfaction',
    '7 Platforms', 'Since 2018', 'Premium Management',
]

const stats = [
    { icon: Users,       value: '500+',  label: 'Clients'            },
    { icon: DollarSign,  value: '$12M+', label: 'Revenue Generated'  },
    { icon: Star,        value: '97%',   label: 'Satisfaction'       },
    { icon: Box,         value: '7',     label: 'Platforms'          },
    { icon: ShieldCheck, value: 'Since', label: '2018'               },
]

/* Font size that fills ~90 % of any viewport width for "DOMINATE" (8 bold chars,
   tracking −0.08em → ~0.82 em per glyph). Formula: 0.9 / (8 × 0.82) ≈ 13.7 vw */
const DOMINATE_SIZE = 'clamp(1rem, 12vw, 220px)'

export default function CTASection() {
    const ref = useRef(null)

    return (
        <section
            ref={ref}
            className="relative overflow-hidden bg-[#050508] py-12 sm:py-20 md:py-24 lg:py-26"
        >
            {/* ── Backgrounds ── */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Ambient ellipse */}
                <motion.div
                    className="absolute left-1/2 top-1/2 h-[620px] w-[920px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                        background: 'radial-gradient(ellipse, rgba(0,212,255,0.18) 0%, rgba(124,58,237,0.12) 38%, transparent 70%)',
                        filter: 'blur(95px)',
                    }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0 }}
                    transition={{ duration: 1.4, ease: 'easeOut' }}
                />
                {/* Pulsing bottom glow */}
                <motion.div
                    className="absolute bottom-[-180px] left-1/2 h-[360px] w-[360px] -translate-x-1/2 rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(0,212,255,0.35), rgba(124,58,237,0.14), transparent 70%)',
                        filter: 'blur(50px)',
                    }}
                    animate={{ opacity: [0.35, 0.75, 0.35], scale: [1, 1.08, 1] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                />
            </div>

            {/* Cyber grid */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.035]"
                style={{
                    backgroundImage: 'linear-gradient(rgba(0,212,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,1) 1px, transparent 1px)',
                    backgroundSize: '72px 72px',
                }}
            />

            {/* Floating particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {Array.from({ length: 18 }).map((_, i) => (
                    <motion.span
                        key={i}
                        className="absolute h-1 w-1 rounded-full bg-[#00D4FF]/50"
                        style={{
                            left: `${(i * 17) % 100}%`,
                            top: `${(i * 29) % 100}%`,
                            boxShadow: '0 0 12px rgba(0,212,255,0.8)',
                        }}
                        animate={{ y: [0, -18, 0], opacity: [0.15, 0.85, 0.15], scale: [0.7, 1.2, 0.7] }}
                        transition={{ duration: 3.5 + (i % 5), repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }}
                    />
                ))}
            </div>

            {/* ── Main content ── */}
            <div className="relative z-10 mx-auto max-w-full text-center">

                {/* Top rule */}
                <div className="mx-auto mb-10 max-w-4xl px-4 sm:px-6">
                    <DrawLine delay={0.1} />
                </div>

                {/* Badge */}
                <motion.div
                    className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#F59E0B]/35 bg-[#F59E0B]/10 px-4 py-2 shadow-[0_0_26px_rgba(245,158,11,0.12)]"
                    initial={{ opacity: 0, y: -18, filter: 'blur(8px)' }}
                    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    viewport={{ once: true, amount: 0 }}
                    transition={{ delay: 0.2, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                >
                    <motion.span
                        animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <Zap size={14} className="text-[#F59E0B]" />
                    </motion.span>
                    <span className="text-xs font-semibold text-[#F59E0B] sm:text-sm">
                        Limited spots available for Q3 onboarding
                    </span>
                </motion.div>

                {/* ── Headline ── */}
                <div style={{ fontFamily: 'Syne, sans-serif' }}>

                    {/* "Ready to" */}
                    <motion.h2
                        className="mb-1 font-black leading-tight tracking-tight text-white"
                        style={{ fontSize: 'clamp(1.6rem, 5vw, 4.2rem)' }}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0 }}
                        transition={{ delay: 0.25, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                    >
                        Ready to
                    </motion.h2>

                    {/* ── DOMINATE — full-bleed ── */}
                    <motion.div
                        className="relative mb-1 w-screen overflow-hidden"
                        style={{ left: '0', transform: 'translateX(-50%)' }}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0 }}
                        transition={{ delay: 0.45, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {/* Soft radial glow */}
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                background: 'radial-gradient(ellipse at center, rgba(0,212,255,0.22) 0%, rgba(124,58,237,0.12) 45%, transparent 72%)',
                                filter: 'blur(32px)',
                            }}
                        />

                        {/* Base DOMINATE — visible, semi-transparent */}
                        <h1
                            className="relative mx-auto w-full select-none text-center font-black uppercase leading-[0.85] tracking-[-0.08em]"
                            style={{
                                fontFamily: 'Syne, sans-serif',
                                fontSize: DOMINATE_SIZE,
                                color: 'rgba(255,255,255,0.12)',
                                WebkitTextStroke: '1.5px rgba(255,255,255,0.18)',
                                textShadow: '0 0 60px rgba(0,212,255,0.15), 0 0 100px rgba(124,58,237,0.1)',
                            }}
                        >
                            DOMINATE
                        </h1>

                        {/* Gradient text — revealed by clip-path under flare */}
                        <motion.h1
                            className="absolute inset-0 mx-auto w-full select-none text-center font-black uppercase leading-[0.85] tracking-[-0.08em]"
                            style={{
                                fontFamily: 'Syne, sans-serif',
                                fontSize: DOMINATE_SIZE,
                                background: 'linear-gradient(90deg, #00D4FF 0%, #58E6FF 35%, #7C3AED 70%, #C084FC 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                filter: 'drop-shadow(0 0 18px rgba(0,212,255,0.7)) drop-shadow(0 0 36px rgba(124,58,237,0.5))',
                                clipPath: 'polygon(-25% 0, -8% 0, 5% 100%, -12% 100%)',
                            }}
                            animate={{
                                clipPath: [
                                    'polygon(-25% 0, -8% 0,  5% 100%, -12% 100%)',
                                    'polygon( 18% 0,  35% 0, 48% 100%,  31% 100%)',
                                    'polygon( 62% 0,  79% 0, 92% 100%,  75% 100%)',
                                    'polygon(105% 0, 122% 0,135% 100%, 118% 100%)',
                                ],
                                opacity: [0, 1, 1, 0],
                            }}
                            transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 2.6, ease: 'easeInOut' }}
                        >
                            DOMINATE
                        </motion.h1>
                    </motion.div>

                    {/* "Your Marketplace?" */}
                    <motion.h2
                        className="mb-8 px-4 font-black leading-tight tracking-tight text-white sm:px-6"
                        style={{ fontSize: 'clamp(1.4rem, 4.5vw, 3.8rem)' }}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0 }}
                        transition={{ delay: 0.65, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                    >
                        Your Marketplace?
                    </motion.h2>
                </div>

                {/* Cinematic beam */}
                <motion.div
                    className="mx-auto mb-8 h-px rounded-full"
                    style={{
                        width: 'min(460px, 78vw)',
                        background: 'linear-gradient(90deg, transparent, #00D4FF, #7C3AED, transparent)',
                        boxShadow: '0 0 20px rgba(0,212,255,0.6), 0 0 35px rgba(124,58,237,0.3)',
                    }}
                    initial={{ scaleX: 0, opacity: 0 }}
                    whileInView={{ scaleX: 1, opacity: 1 }}
                    viewport={{ once: true, amount: 0 }}
                    transition={{ delay: 0.8, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                />

                {/* Subtext */}
                <motion.p
                    className="mx-auto mb-10 max-w-2xl px-4 text-sm leading-relaxed text-white/50 sm:px-6 sm:text-base md:text-lg"
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0 }}
                    transition={{ delay: 0.9, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                >
                    End-to-end eCommerce management that scales your brand across every
                    major marketplace and beyond.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    className="mb-12 flex flex-col items-center justify-center gap-4 px-4 sm:flex-row sm:px-6"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0 }}
                    transition={{ delay: 1.0, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                    <MagneticButton>
                        <Link
                            to="/contact"
                            className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl px-7 py-4 text-base font-bold text-white shadow-[0_0_45px_rgba(0,212,255,0.32)] transition-shadow duration-300 hover:shadow-[0_0_70px_rgba(124,58,237,0.55)] sm:w-auto sm:px-9 sm:py-5 sm:text-lg"
                            style={{ background: 'linear-gradient(135deg, #00D4FF, #7C3AED)' }}
                        >
                            <span
                                className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                style={{
                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.24), transparent)',
                                    transform: 'translateX(-100%)',
                                }}
                            />
                            <Rocket size={18} className="relative z-10" />
                            <span className="relative z-10">Book Free Strategy Call</span>
                            <ArrowRight size={20} className="relative z-10 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </MagneticButton>

                    <MagneticButton>
                        <Link
                            to="/pricing"
                            className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.03] px-7 py-4 text-base font-semibold text-white/80 backdrop-blur-md transition-all duration-200 hover:border-[#00D4FF]/45 hover:bg-[#00D4FF]/8 hover:text-white sm:w-auto sm:px-9 sm:py-5 sm:text-lg"
                        >
                            <PlayCircle size={20} className="text-[#00D4FF] transition-transform group-hover:scale-110" />
                            See How It Works
                        </Link>
                    </MagneticButton>
                </motion.div>

                {/* Trust badges */}
                <motion.div
                    className="mb-10 flex flex-wrap items-center justify-center gap-4 px-4 sm:gap-8 sm:px-6"
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0 }}
                    transition={{ delay: 1.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                    {['No long-term contracts', 'Cancel anytime', '30-day results guarantee'].map((item) => (
                        <div key={item} className="flex items-center gap-2 text-sm text-white/40">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#00D4FF] shadow-[0_0_10px_rgba(0,212,255,0.9)]" />
                            {item}
                        </div>
                    ))}
                </motion.div>

                {/* Bottom rule */}
                <div className="mx-auto max-w-4xl px-4 sm:px-6">
                    <DrawLine delay={0} />
                </div>
            </div>

            {/* Scrolling ticker */}
            <div className="relative z-10 mt-14 overflow-hidden border-y border-white/5 bg-white/[0.015] py-4">
                <motion.div
                    className="flex gap-16 whitespace-nowrap"
                    animate={{ x: ['0%', '-50%'] }}
                    transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
                >
                    {[...ticker, ...ticker].map((item, i) => (
                        <span
                            key={i}
                            className="shrink-0 text-xs font-semibold uppercase tracking-[0.22em] text-white/30"
                            style={{ fontFamily: 'Syne, sans-serif' }}
                        >
                            {item}
                            <span className="ml-16 text-[#00D4FF]/40">◆</span>
                        </span>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
