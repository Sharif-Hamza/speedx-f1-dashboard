"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useBanner } from "@/contexts/BannerContext"

interface BannerAnnouncement {
  id: string
  title: string
  message: string
  type: "static" | "countdown" | "live_update"
  countdown_target_date: string | null
  style: {
    backgroundColor?: string
    textColor?: string
  }
  active: boolean
  priority: number
}

export function BannerAnnouncement() {
  const pathname = usePathname()
  const { setHasBanner } = useBanner()
  const [banner, setBanner] = useState<BannerAnnouncement | null>(null)
  const [countdown, setCountdown] = useState<string>("")
  
  // Only show banner on landing page
  const shouldShowBanner = pathname === "/"

  useEffect(() => {
    fetchBanner()

    // Subscribe to real-time updates
    const channel = supabase
      .channel("banner-announcements")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "banner_announcements",
        },
        () => {
          fetchBanner()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    if (banner?.type === "countdown" && banner.countdown_target_date) {
      const interval = setInterval(() => {
        calculateCountdown()
      }, 1000)

      calculateCountdown() // Initial calculation

      return () => clearInterval(interval)
    }
  }, [banner])

  async function fetchBanner() {
    const { data, error } = await supabase
      .from("banner_announcements")
      .select("*")
      .eq("active", true)
      .order("priority", { ascending: false })
      .limit(1)
      .single()

    if (data && !error) {
      setBanner(data)
      setHasBanner(true)
    } else {
      setBanner(null)
      setHasBanner(false)
    }
  }

  function calculateCountdown() {
    if (!banner?.countdown_target_date) return

    const now = new Date().getTime()
    const target = new Date(banner.countdown_target_date).getTime()
    const distance = target - now

    if (distance < 0) {
      setCountdown("LIVE NOW!")
      return
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24))
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((distance % (1000 * 60)) / 1000)

    if (days > 0) {
      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`)
    } else if (hours > 0) {
      setCountdown(`${hours}h ${minutes}m ${seconds}s`)
    } else if (minutes > 0) {
      setCountdown(`${minutes}m ${seconds}s`)
    } else {
      setCountdown(`${seconds}s`)
    }
  }

  useEffect(() => {
    setHasBanner(banner !== null && shouldShowBanner)
  }, [banner, setHasBanner, shouldShowBanner])

  if (!banner || !shouldShowBanner) return null

  const bgColor = banner.style?.backgroundColor || "#00FF7F"
  const textColor = banner.style?.textColor || "#000000"

  return (
    <div
      className="fixed top-0 left-0 right-0 w-full py-3 px-4 overflow-hidden animate-in slide-in-from-top duration-500 z-[60]"
      style={{
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 20px)',
        }} />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="flex items-center justify-center gap-3 text-center flex-wrap">
          {/* Title */}
          <div className="font-bold text-sm sm:text-base md:text-lg tracking-wide">
            {banner.title}
          </div>

          {/* Message or Countdown */}
          {banner.type === "countdown" ? (
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <span className="text-xs sm:text-sm">{banner.message}</span>
              <div 
                className="font-mono font-bold text-base sm:text-lg md:text-xl px-3 py-1 rounded-full border-2 min-w-[140px] sm:min-w-[180px] text-center tabular-nums"
                style={{
                  borderColor: textColor,
                  backgroundColor: `${bgColor}dd`,
                }}
              >
                {countdown}
              </div>
            </div>
          ) : (
            <div className="text-xs sm:text-sm">{banner.message}</div>
          )}
        </div>
      </div>
    </div>
  )
}
