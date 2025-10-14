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
    <section className="py-24 px-4 border-t border-border">
      <div className="container mx-auto max-w-[1200px]">
        <div className="text-center mb-16 space-y-4">
          <h2 className="font-[family-name:var(--font-rajdhani)]">
            How it <span className="text-primary">works</span>
          </h2>
        </div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-16 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />

          <div className="grid md:grid-cols-3 gap-12 relative">
            {steps.map((step, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="relative inline-flex items-center justify-center w-24 h-24 mx-auto">
                  <div className="absolute inset-0 bg-primary rounded-full opacity-20 blur-xl" />
                  <div className="relative w-16 h-16 rounded-full bg-card border-2 border-primary flex items-center justify-center">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h3 className="font-[family-name:var(--font-rajdhani)]">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[32ch] mx-auto">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
