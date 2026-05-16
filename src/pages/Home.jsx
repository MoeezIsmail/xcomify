import HeroSection from '../sections/home/HeroSection'
import StatsSection from '../sections/home/StatsSection'
import ServicesSection from '../sections/home/ServicesSection'
import PlatformsSection from '../sections/home/PlatformsSection'
import WhyUsSection from '../sections/home/WhyUsSection'
import ProcessSection from '../sections/home/ProcessSection'
import TestimonialsSection from '../sections/home/TestimonialsSection'
import CTASection from '../sections/home/CTASection'

export default function Home() {
  return (
    <main>
      <HeroSection />
      <StatsSection />
      <ServicesSection />
      <PlatformsSection />
      <WhyUsSection />
      <ProcessSection />
      <TestimonialsSection />
      <CTASection />
    </main>
  )
}
