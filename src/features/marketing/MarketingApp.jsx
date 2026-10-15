import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { Preloader } from '@/shared/ui/Preloader'
import { Navbar } from '@/shared/layouts/Navbar'
import { Footer } from '@/shared/layouts/Footer'
import { Hero } from './components/Hero'
import { ProblemSection } from './sections/ProblemSection'
import { ProductSection } from './sections/ProductSection'
import { WorkflowSection } from './sections/WorkflowSection'
import { TrustSection } from './sections/TrustSection'
import { ScaleSection } from './sections/ScaleSection'
import { Channels } from './components/Channels'
import { MobileExperience } from './components/MobileExperience'
import { WhyLeadHive } from './sections/WhyLeadHive'
import { CTA } from './components/CTA'

export default function MarketingApp() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (pathname === '/contact') {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'instant' })
      return
    }
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash])

  return (
    <div className="site-shell">
      <Preloader />
      <Navbar />
      <main>
        <Hero />
        <ProblemSection />
        <ProductSection />
        <WorkflowSection />
        <TrustSection />
        <ScaleSection />
        <Channels />
        <MobileExperience />
        <WhyLeadHive />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}