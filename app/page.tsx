import Nav            from '@/components/layout/Nav'
import Footer         from '@/components/layout/Footer'
import Hero           from '@/components/sections/Hero'
import Features       from '@/components/sections/Features'
import AppFeatures    from '@/components/sections/AppFeatures'
import Problems       from '@/components/sections/Problems'
import HowItWorks     from '@/components/sections/HowItWorks'
import ForInvestors   from '@/components/sections/ForInvestors'
import ForBusinesses  from '@/components/sections/ForBusinesses'
import AppComingSoon  from '@/components/sections/AppComingSoon'
import FAQ            from '@/components/sections/FAQ'
import Contact        from '@/components/sections/Contact'
import Waitlist       from '@/components/sections/Waitlist'
import ProgressBar    from '@/components/ui/ProgressBar'
import ScrollReveal   from '@/components/ui/ScrollReveal'

export default function LandingPage() {
  return (
    <>
      <ProgressBar />
      <Nav />
      <main>
        <Hero />
        <Features />
        <AppFeatures />
        <Problems />
        <HowItWorks />
        <ForInvestors />
        <ForBusinesses />
        <AppComingSoon />
        <FAQ />
        <Contact />
        <Waitlist />
      </main>
      <Footer />
      <ScrollReveal />
    </>
  )
}
