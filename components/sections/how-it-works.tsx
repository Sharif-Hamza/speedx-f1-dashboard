import { Play, BarChart3, Zap } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      icon: Play,
      title: "Track",
      description: "Start a session and capture live metrics as you drive.",
    },
    {
      icon: BarChart3,
      title: "Analyze",
      description: "Review min/avg/max speeds, deltas, and detailed charts.",
    },
    {
      icon: Zap,
      title: "Compete",
      description: "Join weekly Blitz challenges and climb the leaderboards.",
    },
  ]

  return (
    <section className="py-12 sm:py-16 lg:py-24 px-4 border-t border-border">
      <div className="container mx-auto max-w-[1200px]">
        <div className="text-center mb-12 sm:mb-14 lg:mb-16 space-y-3 sm:space-y-4">
          <h2 className="font-[family-name:var(--font-rajdhani)] text-3xl sm:text-4xl lg:text-5xl font-bold">
            How it <span className="text-primary">works</span>
          </h2>
        </div>

        <div className="relative">
          {/* Connection line - only on desktop */}
          <div className="hidden lg:block absolute top-16 xl:top-20 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />

          <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 relative">
            {steps.map((step, index) => (
              <div key={index} className="text-center space-y-3 sm:space-y-4">
                <div className="relative inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 mx-auto">
                  <div className="absolute inset-0 bg-primary rounded-full opacity-20 blur-xl" />
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-card border-2 border-primary flex items-center justify-center">
                    <step.icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  </div>
                </div>
                <h3 className="font-[family-name:var(--font-rajdhani)] text-xl sm:text-2xl lg:text-3xl font-bold">{step.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-[36ch] sm:max-w-[32ch] mx-auto">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
