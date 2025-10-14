import Link from "next/link"
import { DeviceMockups } from "@/components/device-mockups"

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 sm:pt-20 lg:pt-24 pb-12 sm:pb-16 px-4">
      {/* Background effect */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-64 sm:w-80 lg:w-96 h-64 sm:h-80 lg:h-96 bg-primary rounded-full blur-[80px] sm:blur-[100px] lg:blur-[120px] opacity-20 animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-64 sm:w-80 lg:w-96 h-64 sm:h-80 lg:h-96 bg-primary/80 rounded-full blur-[80px] sm:blur-[100px] lg:blur-[120px] opacity-15 animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="container mx-auto max-w-[1200px] relative z-10">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center lg:items-start">
          {/* Content - Comes first on mobile for better UX */}
          <div className="space-y-6 sm:space-y-8 text-center lg:text-left lg:pt-8 order-2 lg:order-1">
            <h1 className="font-[family-name:var(--font-rajdhani)] text-balance text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Track every drive. <span className="text-primary">Master your speed.</span>
            </h1>

            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-[68ch] mx-auto lg:mx-0">
              SpeedX transforms your iPhone into a precision racing instrument. Real-time metrics, detailed analytics,
              and competitive challenges—all in your pocket.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center lg:justify-start">
              <Link
                href="/waitlist"
                className="px-6 sm:px-8 py-2.5 sm:py-3 bg-primary text-primary-foreground rounded-lg font-medium transition-all hover:scale-105 green-glow-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background text-sm sm:text-base"
              >
                Join Waitlist
              </Link>
              <Link
                href="/dashboard"
                className="px-6 sm:px-8 py-2.5 sm:py-3 border-2 border-primary text-primary rounded-lg font-medium transition-all hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background text-sm sm:text-base"
              >
                View Dashboard
              </Link>
            </div>
          </div>

          {/* Device Mockups - Shows iPhone on mobile, both devices on desktop */}
          <div className="relative h-[450px] sm:h-[500px] lg:h-[600px] xl:h-[650px] w-full order-1 lg:order-2">
            <DeviceMockups />
          </div>
        </div>
      </div>
    </section>
  )
}
