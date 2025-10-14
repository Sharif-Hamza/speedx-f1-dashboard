"use client"

import type React from "react"
import { useRouter } from "next/navigation"

export function WaitlistBlock() {
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Redirect to the full waitlist page
    router.push("/waitlist")
  }

  return (
    <section id="waitlist" className="py-24 px-4 border-t border-border">
      <div className="container mx-auto max-w-[600px]">
        <div className="bg-card rounded-lg p-8 md:p-12 carbon-texture panel-glow text-center space-y-6">
          <h2 className="font-[family-name:var(--font-rajdhani)]">
            Be first on the <span className="text-primary">grid</span>
          </h2>

          <p className="text-muted-foreground">
            Join over <span className="text-primary font-[family-name:var(--font-geist-mono)]">2,500</span> drivers
            waiting for launch.
          </p>

          <button
            onClick={handleSubmit}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium transition-all hover:scale-105 green-glow-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card"
          >
            Join Waitlist
          </button>

          <p className="text-xs text-muted-foreground">No spam. Opt-out anytime. We respect your inbox.</p>
        </div>
      </div>
    </section>
  )
}
