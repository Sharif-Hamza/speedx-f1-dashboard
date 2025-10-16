"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Menu, X } from "lucide-react"
import { useBanner } from "@/contexts/BannerContext"

export function Header() {
  const { hasBanner } = useBanner()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
      if (mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [mobileMenuOpen])

  // Close mobile menu when clicking outside or pressing escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element
      if (mobileMenuOpen && !target.closest('[data-mobile-menu]')) {
        setMobileMenuOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [mobileMenuOpen])

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/support", label: "Support" },
    { href: "/privacy", label: "Privacy" },
  ]

  return (
    <>
      <header
        className={cn(
          "fixed left-0 right-0 z-50 transition-all duration-300",
          scrolled ? "bg-background/95 backdrop-blur-sm py-2 sm:py-3" : "bg-transparent py-3 sm:py-4",
        )}
        style={{
          top: hasBanner ? "60px" : "0",
        }}
      >
        <nav className="container mx-auto px-4 max-w-[1200px]" aria-label="Main navigation">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-1 text-lg sm:text-xl font-[family-name:var(--font-rajdhani)] font-semibold z-60"
            >
              <span className="text-foreground">Speed</span>
              <span className="text-primary">X</span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
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

            {/* Desktop CTA Buttons */}
            <div className="hidden sm:flex items-center gap-2 lg:gap-3">
              <Link
                href="/login"
                className="px-4 lg:px-6 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Login
              </Link>
              <Link
                href="/waitlist"
                className="px-4 lg:px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium transition-all hover:scale-105 green-glow-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
              >
                Join Waitlist
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-primary transition-colors z-60 relative"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              data-mobile-menu
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 md:hidden"
          data-mobile-menu
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
          
          {/* Menu Content */}
          <div className="fixed top-0 right-0 h-full w-64 bg-card border-l border-border shadow-2xl">
            <div className="flex flex-col pt-20 p-6 space-y-6">
              {/* Navigation Links */}
              <nav className="space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "block text-lg font-medium transition-colors",
                      pathname === link.href ? "text-primary" : "text-foreground hover:text-primary",
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Mobile CTA Buttons */}
              <div className="flex flex-col gap-3 pt-6 border-t border-border">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-6 py-3 text-center font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/waitlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg text-center font-medium transition-all hover:scale-105 green-glow-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card"
                >
                  Join Waitlist
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
