import Link from "next/link"
import { DeviceMockups } from "@/components/device-mockups"

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16 px-4">
      {/* Background effect */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-[120px] opacity-20 animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/80 rounded-full blur-[120px] opacity-15 animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="container mx-auto max-w-[1200px] relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: Content */}
          <div className="space-y-8 pt-8">
            <h1 className="font-[family-name:var(--font-rajdhani)] text-balance text-5xl md:text-6xl lg:text-7xl font-bold">
              Track every drive. <span className="text-primary">Master your speed.</span>
            </h1>

            <p className="text-muted-foreground text-lg leading-relaxed max-w-[68ch]">
              SpeedX transforms your iPhone into a precision racing instrument. Real-time metrics, detailed analytics,
              and competitive challenges—all in your pocket.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/waitlist"
                className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium transition-all hover:scale-105 green-glow-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
              >
                Join Waitlist
              </Link>
              <Link
                href="/dashboard"
                className="px-8 py-3 border-2 border-primary text-primary rounded-lg font-medium transition-all hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
              >
                View Dashboard
              </Link>
            </div>
          </div>

          {/* Right: Device Mockups */}
          <div className="relative h-[600px] lg:h-[650px] w-full">
            <DeviceMockups />
          </div>
        </div>
      </div>
    </section>
  )
}
