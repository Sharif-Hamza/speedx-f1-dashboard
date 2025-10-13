"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { AppPromo } from "@/components/app-promo"
import { ChallengesEvents } from "@/components/challenges-events"
import { MaxSpeedLeaderboard } from "@/components/max-speed-leaderboard"
import { DistanceLeaderboard } from "@/components/distance-leaderboard"
import { WeatherPanel } from "@/components/weather-panel"
import { ActiveUsersLive } from "@/components/active-users-live"
import { SpeedStats } from "@/components/speed-stats"
import { StatsActivity } from "@/components/stats-activity"
import { TickerTape } from "@/components/ticker-tape"
import { PitControls } from "@/components/pit-controls"

export default function MissionControl() {
  const [mounted, setMounted] = useState(false)
  const [activeSection, setActiveSection] = useState("lobby")
  const { user, profile, waitlistStatus, loading } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Check authentication and waitlist approval
  useEffect(() => {
    if (!loading && mounted) {
      console.log('🔍 Dashboard Auth Check:', {
        hasUser: !!user,
        hasProfile: !!profile,
        profileApproved: profile?.waitlist_approved,
        waitlistStatus: waitlistStatus?.status || null,
      })

      if (!user) {
        // No user logged in, redirect to waitlist
        console.log('❌ No user, redirecting to waitlist')
        router.push("/waitlist")
        return
      }
      
      // Check if user should be blocked
      const shouldBlock = (
        (waitlistStatus && waitlistStatus.status === "pending") || // Pending in waitlist
        (profile && profile.waitlist_approved === false) // Explicitly not approved
      )

      if (shouldBlock) {
        console.log('🚫 User not approved, redirecting to pending')
        router.push("/pending")
        return
      }

      // User is approved in any of these cases:
      // 1. No waitlist entry (existing user before waitlist)
      // 2. Waitlist status is "approved"
      // 3. Profile has waitlist_approved = true
      // 4. Profile is null (very old user, no profile yet)
      console.log('✅ User approved, showing dashboard')
      setIsChecking(false)
    }
  }, [user, profile, waitlistStatus, loading, mounted, router])

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
      setActiveSection(sectionId)
    }
  }, [])

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null
  }

  // Show loading state while auth is being checked
  if (loading || isChecking) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E10600] mx-auto mb-4"></div>
          <p className="text-[#9E9E9E]">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F5F5F5] font-sans vignette grain pb-20 md:pb-0" style={{ scrollBehavior: "smooth" }}>
      <header className="sticky top-0 z-50 border-b-2 border-[#E10600] bg-gradient-to-r from-black via-[#0D0D0D] to-black p-3 md:p-4 overflow-hidden">
        <div className="motion-streak" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <div
              className="text-xl md:text-3xl font-bold text-[#E10600] font-[family-name:var(--font-heading)] tracking-tight animate-logo-pulse"
              style={{ letterSpacing: "0.05em" }}
            >
              SPEED<span className="text-[#F5F5F5]">X</span>
            </div>
            <div className="flex gap-1 md:gap-2 items-center">
              <div className="h-2 w-2 md:h-3 md:w-3 rounded-full bg-[#00FF7F] animate-pulse-led" />
              <span className="text-xs md:text-sm text-[#9E9E9E] font-[family-name:var(--font-mono)]">LIVE</span>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-6">
            <div className="hidden sm:flex items-center gap-2">
              <svg className="h-4 w-4 md:h-5 md:w-5 text-[#E10600]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
              </svg>
              <span className="text-xs md:text-sm text-[#9E9E9E]">3</span>
            </div>
            <button
              onClick={() => router.push("/profile")}
              className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-[#0C0C0C] border-2 border-[#E10600] hover:border-[#00D9FF] flex items-center justify-center shadow-lg transition-all transform hover:scale-110 active:scale-95"
            >
              <svg className="h-5 w-5 md:h-6 md:w-6 text-[#F5F5F5]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="p-2 md:p-3 lg:p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-2 auto-rows-min">
        <div id="lobby" className="lg:col-span-4" style={{ animationDelay: "0ms" }}>
          <ActiveUsersLive />
        </div>
        <div id="speed" className="lg:col-span-4" style={{ animationDelay: "100ms" }}>
          <SpeedStats />
        </div>
        <div id="lap" className="lg:col-span-4" style={{ animationDelay: "200ms" }}>
          <StatsActivity />
        </div>

        <div id="app" className="lg:col-span-8" style={{ animationDelay: "300ms" }}>
          <AppPromo />
        </div>

        <div id="leaderboards" className="lg:col-span-4 flex flex-col gap-2" style={{ animationDelay: "400ms" }}>
          <MaxSpeedLeaderboard />
          <DistanceLeaderboard />
        </div>

        <div id="challenges" className="lg:col-span-8" style={{ animationDelay: "500ms" }}>
          <ChallengesEvents />
        </div>

        <div id="weather" className="lg:col-span-4" style={{ animationDelay: "600ms" }}>
          <WeatherPanel />
        </div>

        <div id="pit" className="lg:col-span-12" style={{ animationDelay: "700ms" }}>
          <PitControls />
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0D0D0D] border-t-2 border-[#E10600] md:hidden">
        <div className="flex justify-around items-center py-2 px-2 overflow-x-auto scrollbar-hide">
          {[
            { id: "lobby", label: "Lobby", icon: "👥" },
            { id: "speed", label: "Speed", icon: "⚡" },
            { id: "lap", label: "Stats", icon: "📊" },
            { id: "app", label: "App", icon: "📱" },
            { id: "board", label: "Board", icon: "🏆" },
            { id: "weather", label: "Weather", icon: "🌤️" },
            { id: "pit", label: "Pit", icon: "🔧" },
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded transition-all touch-target ${
                activeSection === section.id ? "text-[#E10600] bg-[#1A1A1A]" : "text-[#9E9E9E] hover:text-[#F5F5F5]"
              }`}
              style={{ borderRadius: "8px" }}
            >
              <span className="text-base">{section.icon}</span>
              <span className="text-[10px] font-bold font-[family-name:var(--font-heading)] whitespace-nowrap">
                {section.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Bottom Ticker */}
      <TickerTape />
    </div>
  )
}
