import { Shield, Headphones } from "lucide-react"
import Link from "next/link"

export function TrustCards() {
  return (
    <section className="py-24 px-4 border-t border-border">
      <div className="container mx-auto max-w-[1200px]">
        <div className="grid md:grid-cols-2 gap-8">
          <Link
            href="/support"
            className="group bg-card rounded-lg p-8 carbon-texture border border-border transition-all hover:border-primary/40 hover:-translate-y-1"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center border border-border group-hover:green-glow transition-shadow">
                <Headphones className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-[family-name:var(--font-rajdhani)] mb-2">24/7 Support</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Questions? Our team is here to help you get the most out of SpeedX.
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/privacy"
            className="group bg-card rounded-lg p-8 carbon-texture border border-border transition-all hover:border-primary/40 hover:-translate-y-1"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center border border-border group-hover:green-glow transition-shadow">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-[family-name:var(--font-rajdhani)] mb-2">Privacy First</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your data stays yours. We never sell or share your driving information.
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}
