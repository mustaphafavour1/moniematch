import Nav            from '@/components/layout/Nav'
import Footer         from '@/components/layout/Footer'
import Hero           from '@/components/sections/Hero'
import Ticker         from '@/components/sections/Ticker'
import Features       from '@/components/sections/Features'
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
        <Ticker />
        <Features />
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
