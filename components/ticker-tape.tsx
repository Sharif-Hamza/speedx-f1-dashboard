"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

interface BlitzEntry {
  id: string
  user_id: string
  username: string
  points: number
  time_delta_seconds: number
  distance_meters: number
  created_at: string
}

export function TickerTape() {
  const [entries, setEntries] = useState<BlitzEntry[]>([])
  const [tickerItems, setTickerItems] = useState<string[]>([])

  useEffect(() => {
    fetchBlitzData()
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchBlitzData()
    }, 30000)

    // Subscribe to real-time updates
    const channel = supabase
      .channel('ticker-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blitz_points',
        },
        () => {
          fetchBlitzData()
        }
      )
      .subscribe()

    return () => {
      clearInterval(interval)
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchBlitzData() {
    // Fetch recent blitz entries
    const { data: pointsData, error: pointsError } = await supabase
      .from('blitz_points')
      .select('id, user_id, points, time_delta_seconds, distance_meters, created_at')
      .order('created_at', { ascending: false })
      .limit(100)

    if (!pointsError && pointsData && pointsData.length > 0) {
      // Get unique user IDs
      const userIds = [...new Set(pointsData.map(p => p.user_id.toLowerCase()))]
      
      // Fetch usernames
      const { data: profilesData } = await supabase
        .from('user_profiles')
        .select('*')
        .in('id', userIds)
      
      // Create username map
      const usernameMap = new Map<string, string>()
      profilesData?.forEach((profile: any) => {
        const username = profile.username || profile.name || profile.display_name || profile.email || null
        if (username) {
          usernameMap.set(profile.id, username)
        }
      })
      
      // Map data with usernames
      const mappedData = pointsData.map((entry: any) => ({
        ...entry,
        username: usernameMap.get(entry.user_id.toLowerCase()) || `Driver ${entry.user_id?.slice(0, 6)}`
      }))
      
      setEntries(mappedData)
      generateTickerItems(mappedData)
    }
  }

  function generateTickerItems(data: BlitzEntry[]) {
    const items: string[] = []
    
    data.forEach(entry => {
      const timeSaved = -entry.time_delta_seconds
      const deltaMin = (timeSaved / 60).toFixed(1)
      const distanceKm = (entry.distance_meters / 1000).toFixed(2)
      const isIncomplete = entry.time_delta_seconds === 0 && entry.points === 0
      const isCrazyTime = timeSaved >= 360 // 6+ minutes saved
      
      if (isIncomplete) {
        items.push(`❌ ${entry.username.toUpperCase()}: DNF • ${distanceKm}km`)
      } else if (isCrazyTime) {
        items.push(`🔥 INSANE RUN: ${entry.username.toUpperCase()} • ${entry.points}pts • Δ${deltaMin}m • ${distanceKm}km`)
      } else if (entry.points >= 5) {
        items.push(`⭐ ${entry.username.toUpperCase()}: ${entry.points}pts • Δ${timeSaved > 0 ? '+' : ''}${deltaMin}m • ${distanceKm}km`)
      } else if (entry.points >= 3) {
        items.push(`🏆 ${entry.username.toUpperCase()}: ${entry.points}pts • Δ${timeSaved > 0 ? '+' : ''}${deltaMin}m • ${distanceKm}km`)
      } else if (entry.points >= 1) {
        items.push(`✅ ${entry.username.toUpperCase()}: ${entry.points}pt • Δ${timeSaved > 0 ? '+' : ''}${deltaMin}m • ${distanceKm}km`)
      }
    })
    
    // Always show at least some items
    if (items.length === 0) {
      items.push(
        "🏁 BLITZ MODE: Challenge awaits!",
        "⚡ Beat the ETA to earn points",
        "🎯 Up to 6 points per run"
      )
    }
    
    setTickerItems(items)
  }

  return (
    <div className="fixed bottom-14 md:bottom-0 left-0 right-0 bg-gradient-to-r from-[#00FF7F] via-[#FF3131] to-[#00FF7F] text-[#F5F5F5] py-1.5 md:py-2 overflow-hidden border-t-2 border-[#F5F5F5] shadow-[0_-4px_20px_rgba(225,6,0,0.4)] z-30">
      <div className="flex animate-scroll whitespace-nowrap momentum-scroll">
        {[...tickerItems, ...tickerItems, ...tickerItems].map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center mx-4 md:mx-8 text-[10px] md:text-sm font-bold font-[family-name:var(--font-mono)]"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
