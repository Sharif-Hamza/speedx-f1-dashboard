"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function Header() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/support", label: "Support" },
    { href: "/privacy", label: "Privacy" },
  ]

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-background/95 backdrop-blur-sm py-3" : "bg-transparent py-4",
      )}
    >
      <nav className="container mx-auto px-4 max-w-[1200px]" aria-label="Main navigation">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-1 text-xl font-[family-name:var(--font-rajdhani)] font-semibold"
          >
            <span className="text-foreground">Speed</span>
            <span className="text-primary">X</span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm transition-colors hover:text-primary",
                  pathname === link.href ? "text-primary" : "text-muted-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-6 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Login
            </Link>
            <Link
              href="/waitlist"
              className="px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium transition-all hover:scale-105 green-glow-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            >
              Join Waitlist
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}
