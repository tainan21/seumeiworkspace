import { Navbar } from "~/components/layout/header/navbar"
import { HeroSection } from "~/components/sections/hero-section"
import { ImpactSection } from "~/components/sections/impact-section"
import { FeaturesSection } from "~/components/sections/features-section"
import { TestimonialsSection } from "~/components/sections/testimonials-section"
import { PricingSection } from "~/components/sections/pricing-section"
import { CtaSection } from "~/components/sections/cta-section"
import Footer from "~/components/layout/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950">
      <Navbar />
      <HeroSection />
      <ImpactSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <CtaSection />
      <Footer />

    </main>
  )
}
