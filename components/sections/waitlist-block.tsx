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
    <section id="waitlist" className="py-12 sm:py-16 lg:py-24 px-4 border-t border-border">
      <div className="container mx-auto max-w-[600px]">
        <div className="bg-card rounded-lg p-6 sm:p-8 md:p-12 carbon-texture panel-glow text-center space-y-4 sm:space-y-6">
          <h2 className="font-[family-name:var(--font-rajdhani)] text-2xl sm:text-3xl lg:text-4xl font-bold">
            Be first on the <span className="text-primary">grid</span>
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground">
            Join over <span className="text-primary font-[family-name:var(--font-geist-mono)]">2,500</span> drivers
            waiting for launch.
          </p>

          {/* Features Preview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 my-6">
            <div className="flex flex-col items-center space-y-2 p-3 bg-muted/30 rounded-lg border border-border/50">
              <span className="text-lg sm:text-xl">⚡</span>
              <span className="text-xs sm:text-sm text-muted-foreground font-medium">Blitz Mode</span>
            </div>
            <div className="flex flex-col items-center space-y-2 p-3 bg-muted/30 rounded-lg border border-border/50">
              <span className="text-lg sm:text-xl">📊</span>
              <span className="text-xs sm:text-sm text-muted-foreground font-medium">Analytics</span>
            </div>
            <div className="flex flex-col items-center space-y-2 p-3 bg-muted/30 rounded-lg border border-border/50">
              <span className="text-lg sm:text-xl">🏆</span>
              <span className="text-xs sm:text-sm text-muted-foreground font-medium">Compete</span>
            </div>
            <div className="flex flex-col items-center space-y-2 p-3 bg-muted/30 rounded-lg border border-border/50">
              <span className="text-lg sm:text-xl">🎯</span>
              <span className="text-xs sm:text-sm text-muted-foreground font-medium">Track</span>
            </div>
          </div>

          {/* Waitlist Benefits */}
          <div className="bg-muted/20 rounded-lg p-4 border border-border/30">
            <h3 className="font-semibold text-sm sm:text-base mb-3">Early Access Includes:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <span>Founder badge & priority support</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <span>Free lifetime core features</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <span>Beta feature access</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <span>Influence product development</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="px-6 sm:px-8 py-3 sm:py-4 bg-primary text-primary-foreground rounded-lg font-medium transition-all hover:scale-105 green-glow-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card text-sm sm:text-base font-[family-name:var(--font-rajdhani)] tracking-wide"
          >
            🚀 Join Waitlist - It's Free
          </button>

          <div className="text-center space-y-1">
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              ⚡ Fast approval (24-72 hours) • 🔒 No spam, ever • 🎁 Always free for founders
            </p>
            <p className="text-xs text-muted-foreground/70">
              Secure signup with email verification & manual review
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
