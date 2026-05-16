import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { services } from '../../data/services'
import ServiceCard from '../../components/ui/ServiceCard'
import ScrollReveal from '../../components/ui/ScrollReveal'

export default function ServicesSection() {
  return (
    <section className="py-32 bg-[#050508] relative">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal className="text-center mb-16">
          <span className="text-xs tracking-[0.3em] uppercase text-[#00D4FF] font-medium mb-4 block">What We Do</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
            Services Built for{' '}
            <span className="gradient-text">7-Figure Growth</span>
          </h2>
          <p className="text-white/50 max-w-xl mx-auto">
            Every service is engineered around one goal: maximizing your eCommerce revenue while minimizing your operational headaches.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {services.map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} />
          ))}
        </div>

        <ScrollReveal className="text-center mt-12">
          <Link
            to="/services"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-white/15 text-white font-semibold hover:border-[#00D4FF]/40 hover:bg-white/4 transition-all duration-200"
          >
            Explore All Services
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </ScrollReveal>
      </div>
    </section>
  )
}
