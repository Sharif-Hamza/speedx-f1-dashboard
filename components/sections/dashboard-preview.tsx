import { Activity, Clock, Trophy } from "lucide-react"

export function DashboardPreview() {
  const cards = [
    {
      icon: Activity,
      title: "Speed Graph",
      description: "Real-time velocity tracking with min, max, and average speed visualization.",
    },
    {
      icon: Clock,
      title: "Lap Timer",
      description: "Precision timing with split analysis and performance deltas per session.",
    },
    {
      icon: Trophy,
      title: "Leaderboard",
      description: "Weekly Blitz challenges. Compete globally and climb the rankings.",
    },
  ]

  return (
    <section className="py-24 px-4 border-t border-border">
      <div className="container mx-auto max-w-[1200px]">
        <div className="text-center mb-16 space-y-4">
          <h2 className="font-[family-name:var(--font-rajdhani)]">
            Your <span className="text-primary">cockpit</span> awaits
          </h2>
          <p className="text-muted-foreground max-w-[68ch] mx-auto">
            Three core instruments designed for drivers who demand precision.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <div
              key={index}
              className="group bg-card rounded-lg p-6 carbon-texture border border-border transition-all hover:border-primary/40 hover:-translate-y-1 green-glow-hover"
            >
              <div className="mb-4 w-12 h-12 rounded-lg bg-secondary flex items-center justify-center border border-border group-hover:border-primary/60 transition-colors">
                <card.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-[family-name:var(--font-rajdhani)] mb-2">{card.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
