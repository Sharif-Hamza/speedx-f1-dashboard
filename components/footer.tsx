import Link from "next/link"
import { Twitter, Github, Instagram } from "lucide-react"

export function Footer() {
  const socialLinks = [
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Instagram, href: "#", label: "Instagram" },
  ]

  const footerLinks = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/support", label: "Support" },
    { href: "/privacy", label: "Privacy" },
  ]

  return (
    <footer className="border-t border-border bg-gradient-to-b from-background to-black">
      <div className="container mx-auto max-w-[1200px] px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-1 text-xl font-[family-name:var(--font-rajdhani)] font-semibold">
              <span className="text-foreground">Speed</span>
              <span className="text-primary">X</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">Track every drive. Master your speed.</p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-[family-name:var(--font-rajdhani)] uppercase tracking-wider">Quick Links</h4>
            <nav className="flex flex-col gap-2" aria-label="Footer navigation">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h4 className="text-sm font-[family-name:var(--font-rajdhani)] uppercase tracking-wider">Connect</h4>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 green-glow-hover transition-all"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SpeedX. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
