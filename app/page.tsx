import { Hero } from "@/components/sections/hero"
import { HowItWorks } from "@/components/sections/how-it-works"
import { WaitlistBlock } from "@/components/sections/waitlist-block"
import { TrustCards } from "@/components/sections/trust-cards"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <WaitlistBlock />
      <TrustCards />
      <Footer />
    </main>
  )
}
