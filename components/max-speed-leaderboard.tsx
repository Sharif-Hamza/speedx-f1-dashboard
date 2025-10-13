"use client"

import { useEffect, useState } from "react"
import { MonitorPanel } from "./monitor-panel"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"

interface LeaderboardEntry {
  position: number
  user_id: string
  username: string
  max_speed_mph: number
  change: number
  is_current_user: boolean
}

export function MaxSpeedLeaderboard() {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"weekly" | "alltime">("weekly")

  // Fetch leaderboard data
  const fetchLeaderboard = async () => {
    try {
      console.log("🏁 [MaxSpeedLeaderboard] Fetching leaderboard data for mode:", viewMode)
      
      // Calculate start of current week (Sunday at midnight)
      const now = new Date()
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay()) // Go back to Sunday
      startOfWeek.setHours(0, 0, 0, 0)
      
      console.log("📅 [MaxSpeedLeaderboard] Week starts:", startOfWeek.toISOString())
      
      // Get all users with their max speed from trips
      // First, get max speed per user
      let query = supabase
        .from("trips")
        .select(`
          user_id,
          max_speed_mps,
          started_at
        `)
      
      // If weekly mode, only get trips from this week
      if (viewMode === "weekly") {
        query = query.gte("started_at", startOfWeek.toISOString())
        console.log("📆 [MaxSpeedLeaderboard] Filtering for trips since:", startOfWeek.toISOString())
      }
      
      const { data: maxSpeeds, error } = await query.order("max_speed_mps", { ascending: false })

      console.log(`📊 [MaxSpeedLeaderboard] Fetched ${maxSpeeds?.length || 0} trips from database`)
      
      if (error) {
        console.error("❌ [MaxSpeedLeaderboard] Error fetching trips:", error)
        throw error
      }

      if (!maxSpeeds || maxSpeeds.length === 0) {
        console.log("⚠️ [MaxSpeedLeaderboard] No trips found in database")
        setLeaderboard([])
        setLoading(false)
        return
      }

      // Group by user_id and get their max speed
      const userMaxSpeeds = maxSpeeds.reduce((acc, trip) => {
        if (!acc[trip.user_id] || trip.max_speed_mps > acc[trip.user_id]) {
          acc[trip.user_id] = trip.max_speed_mps
        }
        return acc
      }, {} as Record<string, number>)
      
      console.log(`👥 [MaxSpeedLeaderboard] Found ${Object.keys(userMaxSpeeds).length} unique users`)

      // Get usernames from profiles (try both table names for compatibility)
      const userIds = Object.keys(userMaxSpeeds)
      
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

      if (profilesError) {
        console.error("❌ [MaxSpeedLeaderboard] Error fetching profiles:", profilesError)
        throw profilesError
      }

      console.log(`📝 [MaxSpeedLeaderboard] Fetched ${profiles?.length || 0} user profiles`)

      // Create username map
      const usernameMap = profiles?.reduce((acc, profile) => {
        acc[profile.id] = profile.username
        return acc
      }, {} as Record<string, string>) || {}

      // Build leaderboard entries
      const entries: LeaderboardEntry[] = Object.entries(userMaxSpeeds)
        .map(([userId, maxSpeedMps]) => ({
          user_id: userId,
          username: usernameMap[userId] || "Unknown",
          max_speed_mph: maxSpeedMps * 2.23694, // Convert MPS to MPH
          position: 0, // Will be set below
          change: 0, // Will be calculated below
          is_current_user: user?.id === userId,
        }))
        .sort((a, b) => b.max_speed_mph - a.max_speed_mph)
        .slice(0, 10) // Top 10 only

      // Assign positions
      entries.forEach((entry, index) => {
        entry.position = index + 1
      })
      
      console.log(`🏆 [MaxSpeedLeaderboard] Top 10:`, entries.map(e => `${e.position}. ${e.username} - ${Math.round(e.max_speed_mph)} mph`))

      // Calculate position changes from last week's snapshot
      const lastWeekStart = new Date(startOfWeek)
      lastWeekStart.setDate(lastWeekStart.getDate() - 7)
      const lastWeekStartDate = lastWeekStart.toISOString().split('T')[0]
      
      console.log(`📊 [MaxSpeedLeaderboard] Fetching last week positions from:`, lastWeekStartDate)
      
      // Fetch last week's positions from database
      const { data: lastWeekData, error: lastWeekError } = await supabase
        .from('weekly_leaderboard_snapshots')
        .select('user_id, position')
        .eq('week_start', lastWeekStartDate)
        .eq('leaderboard_type', 'max_speed')
      
      if (lastWeekError) {
        console.warn('⚠️ [MaxSpeedLeaderboard] Could not fetch last week positions:', lastWeekError)
      }
      
      const lastWeekPositions: Record<string, number> = {}
      lastWeekData?.forEach(record => {
        lastWeekPositions[record.user_id] = record.position
      })
      
      console.log(`📈 [MaxSpeedLeaderboard] Last week positions:`, lastWeekPositions)

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
      console.log("✅ [MaxSpeedLeaderboard] Leaderboard updated successfully")
    } catch (error) {
      console.error("❌ [MaxSpeedLeaderboard] Error fetching leaderboard:", error)
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
      .channel("max-speed-leaderboard-updates")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to ALL changes (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "trips",
        },
        () => {
          console.log("🔄 Trip change detected, refreshing max speed leaderboard...")
          fetchLeaderboard()
        }
      )
      .subscribe()

    // Aggressive polling: Refresh every 5 seconds
    const pollInterval = setInterval(() => {
      console.log("⏰ [MaxSpeedLeaderboard] Auto-refresh (5s poll)")
      fetchLeaderboard()
    }, 5000) // 5 seconds

    return () => {
      supabase.removeChannel(channel)
      clearInterval(pollInterval)
    }
  }, [user, viewMode])

  return (
    <MonitorPanel 
      title="MAX SPEED LEADERBOARD"
      indicator="yellow"
      variant="primary"
    >
      <div className="bg-[#0C0C0C] rounded border border-[#222] overflow-hidden flex flex-col" style={{ borderRadius: "8px", maxHeight: "500px" }}>
        {/* Tab Navigation */}
        <div className="flex gap-2 p-2 border-b border-[#222]">
          <button
            onClick={() => setViewMode("alltime")}
            className={`flex-1 px-3 py-2 text-xs font-bold rounded transition-all ${
              viewMode === "alltime" ? "bg-[#E10600] text-[#F5F5F5]" : "bg-[#1A1A1A] text-[#9E9E9E] hover:bg-[#222]"
            }`}
            style={{ borderRadius: "8px" }}
          >
            ALL-TIME
          </button>
          <button
            onClick={() => setViewMode("weekly")}
            className={`flex-1 px-3 py-2 text-xs font-bold rounded transition-all ${
              viewMode === "weekly" ? "bg-[#E10600] text-[#F5F5F5]" : "bg-[#1A1A1A] text-[#9E9E9E] hover:bg-[#222]"
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
                SPEED
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
                  <div className="text-3xl mb-2">🏁</div>
                  <div className="text-xs md:text-sm text-[#9E9E9E]">
                    No speeds recorded yet. Be the first!
                  </div>
                </td>
              </tr>
            ) : (
              leaderboard.map((entry, idx) => (
                <tr
                  key={entry.user_id}
                  className={`border-b border-[#1A1A1A] hover:bg-[#0D0D0D] transition-colors ${
                    idx === 0 ? "bg-[#E10600]/10" : ""
                  } ${entry.is_current_user ? "bg-[#FFB300]/10" : ""}`}
                >
                  <td className="p-2 md:p-3">
                    <span
                      className={`font-bold text-xs md:text-sm font-[family-name:var(--font-mono)] ${
                        idx === 0 ? "text-[#E10600]" : entry.is_current_user ? "text-[#FFB300]" : "text-[#F5F5F5]"
                      }`}
                    >
                      {entry.position}
                    </span>
                  </td>
                  <td className="p-2 md:p-3">
                    <div className="flex items-center gap-2">
                      {idx === 0 && <span className="text-base">🏆</span>}
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
                      {Math.round(entry.max_speed_mph)}
                    </span>
                    <span className="text-[#9E9E9E] ml-1">MPH</span>
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
                : "👑 Top 10 fastest of all time"}
            </div>
          </div>
        )}
        </div> {/* Close scrollable container */}
      </div>
    </MonitorPanel>
  )
}
