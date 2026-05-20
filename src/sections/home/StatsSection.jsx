import {motion} from 'framer-motion'
import AnimatedCounter from '../../components/ui/AnimatedCounter'
import ScrollReveal from '../../components/ui/ScrollReveal'

const stats = [
    {value: 500, suffix: '+', label: 'Active Clients', sub: 'Across 7+ platforms', color: '#00D4FF'},
    {value: 12, suffix: 'M+', label: 'Revenue Generated', sub: 'For clients in 2024', color: '#7C3AED'},
    {value: 97, suffix: '%', label: 'Client Satisfaction', sub: 'Average NPS score', color: '#F59E0B'},
    {value: 340, suffix: '%', label: 'Average Growth', sub: 'Within first 6 months', color: '#10B981'},
]

export default function StatsSection() {
    return (
        <section className="py-10 sm:py-14 md:py-16 lg:py-20 xl:py-24 bg-[#0A0A0F] relative overflow-hidden">
            {/* Animated glow line */}
            <div className="absolute top-0 left-0 right-0 h-px">
                <div className="h-full bg-gradient-to-r from-transparent via-[#00D4FF]/40 to-transparent"/>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <ScrollReveal className="text-center mb-6 sm:mb-10 md:mb-12 lg:mb-14 xl:mb-16">
                    <h2
                        className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-white mb-2"
                        style={{fontFamily: 'Syne, sans-serif'}}
                    >
                        Numbers That{' '}
                        <span className="gradient-text">Speak for Themselves</span>
                    </h2>
                    <p className="text-white/40 text-xs sm:text-sm md:text-base">Real results from real clients. Updated
                        monthly.</p>
                </ScrollReveal>

                {/* 2 cols on mobile → 4 cols from md */}
                <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-4 lg:gap-5 xl:gap-6">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{opacity: 0, y: 40}}
                            whileInView={{opacity: 1, y: 0}}
                            viewport={{once: true}}
                            transition={{delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1]}}
                            className="relative rounded-xl sm:rounded-2xl border border-white/8 p-3 sm:p-4 md:p-4 lg:p-5 xl:p-6 text-center overflow-hidden group hover:border-white/15 transition-colors duration-300 flex flex-col gap-2 justify-center"
                            style={{background: 'rgba(255,255,255,0.02)'}}
                        >
                            <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                                style={{background: `radial-gradient(circle at 50% 100%, ${stat.color}12 0%, transparent 60%)`}}
                            />

                            {/* Number */}
                            <div
                                className="font-black tabular-nums leading-none mb-1.5 md:mb-2"
                                style={{
                                    fontFamily: 'Syne, sans-serif',
                                    color: stat.color,
                                    fontSize: 'clamp(1.6rem, 5.5vw, 3.75rem)',
                                }}
                            >
                                <AnimatedCounter value={stat.value} suffix={stat.suffix}/>
                            </div>

                            {/* Label */}
                            <div
                                className="text-white font-semibold mb-0.5 sm:mb-1 leading-tight"
                                style={{fontSize: 'clamp(0.65rem, 1.4vw, 1rem)'}}
                            >
                                {stat.label}
                            </div>

                            {/* Sub */}
                            <div
                                className="text-white/40 leading-tight"
                                style={{fontSize: 'clamp(0.6rem, 1.1vw, 0.75rem)'}}
                            >
                                {stat.sub}
                            </div>

                            {/* Bottom accent */}
                            <div
                                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px opacity-50"
                                style={{background: stat.color, width: 'clamp(2.5rem, 6vw, 4rem)'}}
                            />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
