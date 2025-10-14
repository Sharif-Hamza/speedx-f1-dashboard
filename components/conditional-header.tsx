"use client"

import { usePathname } from "next/navigation"
import { Header } from "./header"

export function ConditionalHeader() {
  const pathname = usePathname()
  
  // Show the landing page header on home, support, and privacy pages
  // Don't show it on dashboard, waitlist, login, pending, or profile pages
  const showHeader = pathname === "/" || pathname === "/support" || pathname === "/privacy"
  
  if (!showHeader) return null
  
  return <Header />
}
