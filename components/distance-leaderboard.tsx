"use client"

import { useEffect, useState } from "react"
import { MonitorPanel } from "./monitor-panel"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"

interface LeaderboardEntry {
  position: number
  user_id: string
  username: string
  total_distance_miles: number
  change: number
  is_current_user: boolean
}

export function DistanceLeaderboard() {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"weekly" | "alltime">("weekly")

  // Fetch leaderboard data
  const fetchLeaderboard = async () => {
    try {
      console.log("🏎️ [DistanceLeaderboard] Fetching leaderboard data for mode:", viewMode)
      
      // Calculate start of current week (Sunday at midnight)
      const now = new Date()
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay()) // Go back to Sunday
      startOfWeek.setHours(0, 0, 0, 0)
      
      console.log("📅 [DistanceLeaderboard] Week starts:", startOfWeek.toISOString())
      
      // Get total distance per user from trips
      let query = supabase
        .from("trips")
        .select(`
          user_id,
          distance_m,
          started_at
        `)
      
      // If weekly mode, only get trips from this week
      if (viewMode === "weekly") {
        query = query.gte("started_at", startOfWeek.toISOString())
        console.log("📆 [DistanceLeaderboard] Filtering for trips since:", startOfWeek.toISOString())
      }
      
      const { data: trips, error } = await query

      if (error) throw error

      if (!trips || trips.length === 0) {
        setLeaderboard([])
        setLoading(false)
        return
      }

      // Group by user_id and sum their distances
      const userTotalDistances = trips.reduce((acc, trip) => {
        if (!acc[trip.user_id]) {
          acc[trip.user_id] = 0
        }
        acc[trip.user_id] += trip.distance_m
        return acc
      }, {} as Record<string, number>)

      // Get usernames from profiles (try both table names for compatibility)
      const userIds = Object.keys(userTotalDistances)
      
      // Try user_profiles first (iOS app uses this)
      let profiles = null
      let profilesError = null
      
      const result1 = await supabase
        .from("user_profiles")
        .select("id, username")
        .in("id", userIds)
      
      if (result1.error) {
        console.log("Trying 'profiles' table as fallback...")
        // Fallback to profiles table
        const result2 = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", userIds)
        profiles = result2.data
        profilesError = result2.error
      } else {
        profiles = result1.data
        profilesError = result1.error
      }

      if (profilesError) throw profilesError

      // Create username map
      const usernameMap = profiles?.reduce((acc, profile) => {
        acc[profile.id] = profile.username
        return acc
      }, {} as Record<string, string>) || {}

      // Build leaderboard entries
      const entries: LeaderboardEntry[] = Object.entries(userTotalDistances)
        .map(([userId, totalDistanceM]) => ({
          user_id: userId,
          username: usernameMap[userId] || "Unknown",
          total_distance_miles: totalDistanceM * 0.000621371, // Convert meters to miles
          position: 0, // Will be set below
          change: 0, // Will be calculated below
          is_current_user: user?.id === userId,
        }))
        .sort((a, b) => b.total_distance_miles - a.total_distance_miles)
        .slice(0, 10) // Top 10 only

      // Assign positions
      entries.forEach((entry, index) => {
        entry.position = index + 1
      })

      // Calculate position changes from last week's snapshot
      const lastWeekStart = new Date(startOfWeek)
      lastWeekStart.setDate(lastWeekStart.getDate() - 7)
      const lastWeekStartDate = lastWeekStart.toISOString().split('T')[0]
      
      console.log(`📊 [DistanceLeaderboard] Fetching last week positions from:`, lastWeekStartDate)
      
      // Fetch last week's positions from database
      const { data: lastWeekData, error: lastWeekError } = await supabase
        .from('weekly_leaderboard_snapshots')
        .select('user_id, position')
        .eq('week_start', lastWeekStartDate)
        .eq('leaderboard_type', 'distance')
      
      if (lastWeekError) {
        console.warn('⚠️ [DistanceLeaderboard] Could not fetch last week positions:', lastWeekError)
      }
      
      const lastWeekPositions: Record<string, number> = {}
      lastWeekData?.forEach(record => {
        lastWeekPositions[record.user_id] = record.position
      })
      
      console.log(`📈 [DistanceLeaderboard] Last week positions:`, lastWeekPositions)

      // Calculate position changes
      entries.forEach((entry) => {
        const lastPosition = lastWeekPositions[entry.user_id]
        if (lastPosition) {
          entry.change = lastPosition - entry.position // Positive = moved up
          console.log(`  ${entry.username}: was #${lastPosition}, now #${entry.position}, CHG: ${entry.change > 0 ? '+' : ''}${entry.change}`)
        } else {
          entry.change = 0 // New entry or no data from last week
          console.log(`  ${entry.username}: NEW (no last week data)`)
        }
      })

      setLeaderboard(entries)
    } catch (error) {
      console.error("Error fetching distance leaderboard:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch on mount and when viewMode changes
  useEffect(() => {
    fetchLeaderboard()
  }, [user, viewMode])

  // Real-time updates: Subscribe to new trips + aggressive polling
  useEffect(() => {
    // Subscribe to database changes
    const channel = supabase
      .channel("distance-leaderboard-updates")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to ALL changes
          schema: "public",
          table: "trips",
        },
        () => {
          console.log("🔄 Trip change detected, refreshing distance leaderboard...")
          fetchLeaderboard()
        }
      )
      .subscribe()

    // Aggressive polling: Refresh every 5 seconds
    const pollInterval = setInterval(() => {
      console.log("⏰ [DistanceLeaderboard] Auto-refresh (5s poll)")
      fetchLeaderboard()
    }, 5000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(pollInterval)
    }
  }, [user, viewMode])

  return (
    <MonitorPanel 
      title="DISTANCE LEADERBOARD"
      indicator="green"
      variant="primary"
    >
      <div className="bg-[#0C0C0C] rounded border border-[#222] overflow-hidden flex flex-col" style={{ borderRadius: "8px", maxHeight: "500px" }}>
        {/* Tab Navigation */}
        <div className="flex gap-2 p-2 border-b border-[#222]">
          <button
            onClick={() => setViewMode("alltime")}
            className={`flex-1 px-3 py-2 text-xs font-bold rounded transition-all ${
              viewMode === "alltime" ? "bg-[#00FF7F] text-[#0D0D0D]" : "bg-[#1A1A1A] text-[#9E9E9E] hover:bg-[#222]"
            }`}
            style={{ borderRadius: "8px" }}
          >
            ALL-TIME
          </button>
          <button
            onClick={() => setViewMode("weekly")}
            className={`flex-1 px-3 py-2 text-xs font-bold rounded transition-all ${
              viewMode === "weekly" ? "bg-[#00FF7F] text-[#0D0D0D]" : "bg-[#1A1A1A] text-[#9E9E9E] hover:bg-[#222]"
            }`}
            style={{ borderRadius: "8px" }}
          >
            WEEKLY
          </button>
        </div>
        
        {/* Scrollable Table Container */}
        <div className="overflow-y-auto" style={{ maxHeight: "430px" }}>
        <table className="w-full text-xs md:text-sm">
          <thead className="bg-[#0D0D0D] border-b border-[#222]">
            <tr>
              <th className="text-left p-2 text-[10px] md:text-xs text-[#9E9E9E] font-[family-name:var(--font-heading)] tracking-wide">
                POS
              </th>
              <th className="text-left p-2 text-[10px] md:text-xs text-[#9E9E9E] font-[family-name:var(--font-heading)] tracking-wide">
                DRIVER
              </th>
              <th className="text-left p-2 text-[10px] md:text-xs text-[#9E9E9E] font-[family-name:var(--font-heading)] tracking-wide hidden sm:table-cell">
                DISTANCE
              </th>
              <th className="text-center p-2 text-[10px] md:text-xs text-[#9E9E9E] font-[family-name:var(--font-heading)] tracking-wide">
                CHG
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-[#9E9E9E]">
                  Loading leaderboard...
                </td>
              </tr>
            ) : leaderboard.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center">
                  <div className="text-3xl mb-2">🗺️</div>
                  <div className="text-xs md:text-sm text-[#9E9E9E]">
                    No distance recorded yet. Start driving!
                  </div>
                </td>
              </tr>
            ) : (
              leaderboard.map((entry, idx) => (
                <tr
                  key={entry.user_id}
                  className={`border-b border-[#1A1A1A] hover:bg-[#0D0D0D] transition-colors ${
                    idx === 0 ? "bg-[#00FF7F]/10" : ""
                  } ${entry.is_current_user ? "bg-[#FFB300]/10" : ""}`}
                >
                  <td className="p-2 md:p-3">
                    <span
                      className={`font-bold text-xs md:text-sm font-[family-name:var(--font-mono)] ${
                        idx === 0 ? "text-[#00FF7F]" : entry.is_current_user ? "text-[#FFB300]" : "text-[#F5F5F5]"
                      }`}
                    >
                      {entry.position}
                    </span>
                  </td>
                  <td className="p-2 md:p-3">
                    <div className="flex items-center gap-2">
                      {idx === 0 && <span className="text-base">🥇</span>}
                      {entry.is_current_user && <span className="text-base">👤</span>}
                      <div>
                        <div className="font-bold text-xs md:text-sm font-[family-name:var(--font-heading)]">
                          {entry.username.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-2 md:p-3 font-[family-name:var(--font-mono)] text-[10px] md:text-xs hidden sm:table-cell">
                    <span className="text-[#F5F5F5] font-bold">
                      {entry.total_distance_miles.toFixed(1)}
                    </span>
                    <span className="text-[#9E9E9E] ml-1">MI</span>
                  </td>
                  <td className="p-2 md:p-3 text-center">
                    {entry.change > 0 && (
                      <span className="text-[#00FF7F] text-[10px] md:text-xs font-bold font-[family-name:var(--font-mono)]">
                        ▲{entry.change}
                      </span>
                    )}
                    {entry.change < 0 && (
                      <span className="text-[#E10600] text-[10px] md:text-xs font-bold font-[family-name:var(--font-mono)]">
                        ▼{Math.abs(entry.change)}
                      </span>
                    )}
                    {entry.change === 0 && (
                      <span className="text-[#666] text-[10px] md:text-xs font-[family-name:var(--font-mono)]">
                        —
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Reset notice */}
        {!loading && leaderboard.length > 0 && (
          <div className="bg-[#0D0D0D] border-t border-[#222] p-2 text-center">
            <div className="text-[10px] text-[#9E9E9E] font-[family-name:var(--font-mono)]">
              {viewMode === "weekly" 
                ? "🔄 Resets every Sunday • Top 10 this week"
                : "🌍 Top 10 road warriors of all time"}
            </div>
          </div>
        )}
        </div> {/* Close scrollable container */}
      </div>
    </MonitorPanel>
  )
}
