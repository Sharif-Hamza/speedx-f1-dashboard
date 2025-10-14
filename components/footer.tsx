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
      <div className="container mx-auto max-w-[1200px] px-4 py-8 sm:py-10 lg:py-12">
        <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Brand */}
          <div className="space-y-3 sm:space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-1 text-lg sm:text-xl font-[family-name:var(--font-rajdhani)] font-semibold">
              <span className="text-foreground">Speed</span>
              <span className="text-primary">X</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto md:mx-0">Track every drive. Master your speed.</p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 sm:space-y-4 text-center md:text-left">
            <h4 className="text-xs sm:text-sm font-[family-name:var(--font-rajdhani)] uppercase tracking-wider font-medium">Quick Links</h4>
            <nav className="flex flex-col gap-1.5 sm:gap-2" aria-label="Footer navigation">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Social */}
          <div className="space-y-3 sm:space-y-4 text-center md:text-left">
            <h4 className="text-xs sm:text-sm font-[family-name:var(--font-rajdhani)] uppercase tracking-wider font-medium">Connect</h4>
            <div className="flex gap-3 sm:gap-4 justify-center md:justify-start">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 green-glow-hover transition-all"
                >
                  <social.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6 sm:pt-8 border-t border-border text-center text-xs sm:text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SpeedX. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
