import { motion } from 'framer-motion'
import { services } from '../data/services'
import ServiceCard from '../components/ui/ServiceCard'
import ScrollReveal from '../components/ui/ScrollReveal'
import CTASection from '../sections/home/CTASection'

export default function Services() {
  return (
    <main className="pt-24">
      <section className="py-20 bg-[#0A0A0F] relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="text-xs tracking-[0.3em] uppercase text-[#00D4FF] font-medium mb-4 block">What We Offer</span>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-6" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
              Every Service You Need to{' '}
              <span className="gradient-text">Dominate eCommerce</span>
            </h1>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              12 specialized services. Hundreds of success stories. One agency that does it all.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-[#050508]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <div id={service.slug} key={service.id}>
                <ServiceCard service={service} index={i} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </main>
  )
}
