"use client"

import { useEffect, useState, useCallback } from "react"
import { MonitorPanel } from "./monitor-panel"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"
import { BadgeDetailCard } from "./ios-badge"

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earned_at: string
  category: string
  rarity?: "common" | "rare" | "epic" | "legendary"
}

interface Trip {
  id: string
  mode: string
  max_speed_mps: number
  avg_speed_mps: number
  distance_m: number
  duration_seconds: number
  started_at: string
  ended_at: string
  route_coordinates?: any[]
  route_snapshot_url?: string
}

interface UserStats {
  totalTrips: number
  totalDistance: number // miles
  maxSpeed: number // mph
  avgSpeed: number // mph
  totalDuration: number // seconds
  blitzCompleted: number
  simpleCompleted: number
}

// Badge Collection - matches iOS BadgeCollection exactly
const BADGE_COLLECTION: Record<string, { name: string; description: string; icon: string; category: string; rarity: "common" | "rare" | "epic" | "legendary" }> = {
  blitz_rookie: {
    name: "Blitz Rookie",
    description: "Complete your first Blitz challenge",
    icon: "bolt.fill",
    category: "blitz",
    rarity: "common"
  },
  blitz_master: {
    name: "Blitz Master",
    description: "Complete 10 Blitz challenges",
    icon: "bolt.badge.checkmark",
    category: "blitz",
    rarity: "rare"
  },
  blitz_legend: {
    name: "Blitz Legend",
    description: "Complete 50 Blitz challenges",
    icon: "bolt.shield.fill",
    category: "blitz",
    rarity: "epic"
  },
  speed_demon: {
    name: "Speed Demon",
    description: "Reach 100 MPH",
    icon: "gauge.high",
    category: "speed",
    rarity: "rare"
  },
  velocity_master: {
    name: "Velocity Master",
    description: "Reach 150 MPH",
    icon: "flame.fill",
    category: "speed",
    rarity: "epic"
  },
  hypersonic: {
    name: "Hypersonic",
    description: "Reach 200 MPH",
    icon: "airplane.departure",
    category: "speed",
    rarity: "legendary"
  },
  road_warrior: {
    name: "Road Warrior",
    description: "Travel 100 miles",
    icon: "road.lanes",
    category: "distance",
    rarity: "common"
  },
  distance_king: {
    name: "Distance King",
    description: "Travel 1,000 miles",
    icon: "crown.fill",
    category: "distance",
    rarity: "rare"
  },
  globe_trotter: {
    name: "Globe Trotter",
    description: "Travel 10,000 miles",
    icon: "globe.americas.fill",
    category: "distance",
    rarity: "legendary"
  },
  night_rider: {
    name: "Night Rider",
    description: "Complete 25 trips at night",
    icon: "moon.stars.fill",
    category: "special",
    rarity: "rare"
  },
  ceo_verified: {
    name: "CEO Verified",
    description: "Verified by SpeedX CEO",
    icon: "checkmark.seal.fill",
    category: "special",
    rarity: "legendary"
  },
  insanity: {
    name: "Insanity",
    description: "You've done the impossible",
    icon: "exclamationmark.triangle.fill",
    category: "special",
    rarity: "legendary"
  },
  perfect_blitz: {
    name: "Perfect Blitz",
    description: "Beat Blitz with 100% accuracy",
    icon: "star.fill",
    category: "blitz",
    rarity: "epic"
  },
  marathoner: {
    name: "Marathoner",
    description: "Complete 100 trips",
    icon: "figure.run",
    category: "general",
    rarity: "epic"
  }
}

function getBadgeInfo(badgeId: string) {
  return BADGE_COLLECTION[badgeId] || {
    name: badgeId.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
    description: "Achievement unlocked!",
    icon: "trophy",
    category: "general",
    rarity: "common" as const
  }
}

export function StatsActivity() {
  const { user } = useAuth()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [badges, setBadges] = useState<Badge[]>([])
  const [recentTrip, setRecentTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"stats" | "badges" | "recent">("stats")
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  const fetchUserData = useCallback(async () => {
    if (!user?.id) {
      console.log("⚠️ [StatsActivity] No user ID, skipping fetch")
      return
    }

    try {
      console.log("📊 [StatsActivity] Fetching user data for:", user.id)
      console.log("🔄 [StatsActivity] Timestamp:", new Date().toISOString())
      
      // Fetch user trips with more details
      const { data: trips, error: tripsError, count } = await supabase
        .from("trips")
        .select("*", { count: 'exact' })
        .eq("user_id", user.id)
        .order("started_at", { ascending: false })

      if (tripsError) {
        console.error("❌ [StatsActivity] Error fetching trips:", tripsError)
        throw tripsError
      }
      
      console.log(`✅ [StatsActivity] Fetched ${trips?.length || 0} trips (count: ${count})`)

      // Fetch user badges (no join needed - badge details come from BadgeCollection)
      const { data: userBadges, error: badgesError } = await supabase
        .from("user_badges")
        .select("id, badge_name, earned_at")
        .eq("user_id", user.id)
        .order("earned_at", { ascending: false })

      if (badgesError) {
        console.error("❌ [StatsActivity] Error fetching badges:", badgesError)
      } else {
        console.log("🔍 [StatsActivity] Raw badges from DB:", userBadges)
      }

      // Calculate stats from trips
      if (trips && trips.length > 0) {
        // Log any trips with missing data
        const tripsWithoutDistance = trips.filter(t => !t.distance_m || t.distance_m === 0)
        if (tripsWithoutDistance.length > 0) {
          console.warn(`⚠️ [StatsActivity] ${tripsWithoutDistance.length} trips missing distance_m`)
        }
        
        const totalDistance = trips.reduce((sum, t) => sum + (t.distance_m || 0), 0) * 0.000621371 // to miles
        const maxSpeed = Math.max(...trips.map(t => (t.max_speed_mps || 0) * 2.23694)) // to mph
        const avgSpeedMps = trips.reduce((sum, t) => sum + (t.avg_speed_mps || 0), 0) / trips.length
        const avgSpeed = avgSpeedMps * 2.23694 // to mph
        const totalDuration = trips.reduce((sum, t) => sum + (t.duration_seconds || 0), 0)
        const blitzCompleted = trips.filter(t => t.mode === "blitz").length
        const simpleCompleted = trips.filter(t => t.mode === "simple").length

        setStats({
          totalTrips: trips.length,
          totalDistance,
          maxSpeed,
          avgSpeed,
          totalDuration,
          blitzCompleted,
          simpleCompleted
        })

        // Set most recent trip - handle duplicate trips with same timestamp
        const newRecentTrip = trips[0]
        console.log('📸 Most recent trip ID:', newRecentTrip.id, 'Snapshot:', newRecentTrip.route_snapshot_url || 'NULL')
        
        // If the most recent trip doesn't have a snapshot, look for a duplicate with the same started_at
        if (!newRecentTrip.route_snapshot_url) {
          const duplicateWithSnapshot = trips.find(t => 
            t.started_at === newRecentTrip.started_at && 
            t.id !== newRecentTrip.id && 
            t.route_snapshot_url
          )
          
          if (duplicateWithSnapshot) {
            console.log('♻️ Found duplicate trip with snapshot URL:', duplicateWithSnapshot.route_snapshot_url)
            newRecentTrip.route_snapshot_url = duplicateWithSnapshot.route_snapshot_url
          } else if (recentTrip?.started_at === newRecentTrip.started_at && recentTrip.route_snapshot_url) {
            // Fallback: preserve from previous state if same timestamp
            console.log('♻️ Preserving snapshot from previous state')
            newRecentTrip.route_snapshot_url = recentTrip.route_snapshot_url
          }
        }
        
        setRecentTrip(newRecentTrip)

        console.log("✅ [StatsActivity] Stats calculated:", {
          trips: trips.length,
          distance: totalDistance.toFixed(2),
          maxSpeed: maxSpeed.toFixed(0)
        })
      }

      // Format badges using BadgeCollection (same as iOS)
      if (userBadges && userBadges.length > 0) {
        const formattedBadges = userBadges
          .map(ub => {
            const badgeInfo = getBadgeInfo(ub.badge_name)
            return {
              id: ub.id,
              name: badgeInfo.name,
              description: badgeInfo.description,
              icon: badgeInfo.icon,
              earned_at: ub.earned_at,
              category: badgeInfo.category,
              rarity: badgeInfo.rarity
            }
          })
        
        setBadges(formattedBadges)
        console.log("🏅 [StatsActivity] Badges loaded:", formattedBadges.length, formattedBadges)
      }

    } catch (error) {
      console.error("❌ [StatsActivity] Error fetching user data:", error)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (user?.id) {
      fetchUserData()
      
      // Subscribe to real-time trip updates (for route snapshot URLs)
      const tripsChannel = supabase
        .channel('trips-updates')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'trips',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('🔄 [StatsActivity] Trip updated:', payload)
            // Refresh data when trips change
            fetchUserData()
          }
        )
        .subscribe()

      // Aggressive polling: Refresh every 5 seconds
      const pollInterval = setInterval(() => {
        console.log("⏰ [StatsActivity] Auto-refresh (5s poll)")
        fetchUserData()
      }, 5000)

      // Cleanup subscription on unmount
      return () => {
        console.log('🧹 [StatsActivity] Cleaning up trips subscription')
        supabase.removeChannel(tripsChannel)
        clearInterval(pollInterval)
      }
    }
  }, [user?.id, fetchUserData])

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  return (
    <MonitorPanel title="STATS & ACTIVITY" indicator="cyan" variant="primary">
      <div className="bg-[#0C0C0C] rounded border border-[#222] overflow-hidden flex flex-col" style={{ borderRadius: "8px", maxHeight: "600px" }}>
        {/* Tab Navigation */}
        <div className="flex gap-1 p-2 border-b border-[#222] bg-[#0D0D0D]">
          <button
            onClick={() => setActiveTab("stats")}
            className={`flex-1 px-3 py-2 text-xs font-bold rounded transition-all ${
              activeTab === "stats" ? "bg-[#00D9FF] text-[#0D0D0D]" : "bg-[#1A1A1A] text-[#9E9E9E] hover:bg-[#222]"
            }`}
            style={{ borderRadius: "6px" }}
          >
            📊 STATS
          </button>
          <button
            onClick={() => setActiveTab("badges")}
            className={`flex-1 px-3 py-2 text-xs font-bold rounded transition-all ${
              activeTab === "badges" ? "bg-[#00D9FF] text-[#0D0D0D]" : "bg-[#1A1A1A] text-[#9E9E9E] hover:bg-[#222]"
            }`}
            style={{ borderRadius: "6px" }}
          >
            🏅 BADGES
          </button>
          <button
            onClick={() => setActiveTab("recent")}
            className={`flex-1 px-3 py-2 text-xs font-bold rounded transition-all ${
              activeTab === "recent" ? "bg-[#00D9FF] text-[#0D0D0D]" : "bg-[#1A1A1A] text-[#9E9E9E] hover:bg-[#222]"
            }`}
            style={{ borderRadius: "6px" }}
          >
            🚗 RECENT
          </button>
        </div>

        {/* Content Area - Scrollable */}
        <div className="overflow-y-auto flex-1 p-3" style={{ maxHeight: "520px" }}>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00D9FF] mx-auto mb-4"></div>
                <p className="text-[#9E9E9E] text-sm">Loading your data...</p>
              </div>
            </div>
          ) : (
            <>
              {/* STATS TAB */}
              {activeTab === "stats" && (
                <div className="space-y-3">
                  {stats ? (
                    <>
                      {/* Primary Stats Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#0D0D0D] rounded p-3 border border-[#1A1A1A]" style={{ borderRadius: "8px" }}>
                          <div className="text-[10px] text-[#9E9E9E] font-[family-name:var(--font-heading)] tracking-wide mb-1">
                            TOTAL TRIPS
                          </div>
                          <div className="text-2xl font-bold text-[#F5F5F5] font-[family-name:var(--font-mono)]">
                            {stats.totalTrips}
                          </div>
                          <div className="text-[9px] text-[#00FF7F] mt-1">
                            🏁 {stats.simpleCompleted} Simple • ⚡ {stats.blitzCompleted} Blitz
                          </div>
                        </div>

                        <div className="bg-[#0D0D0D] rounded p-3 border border-[#1A1A1A]" style={{ borderRadius: "8px" }}>
                          <div className="text-[10px] text-[#9E9E9E] font-[family-name:var(--font-heading)] tracking-wide mb-1">
                            TOTAL DISTANCE
                          </div>
                          <div className="text-2xl font-bold text-[#F5F5F5] font-[family-name:var(--font-mono)]">
                            {stats.totalDistance.toFixed(1)}
                          </div>
                          <div className="text-[9px] text-[#9E9E9E]">MILES</div>
                        </div>

                        <div className="bg-[#0D0D0D] rounded p-3 border border-[#1A1A1A]" style={{ borderRadius: "8px" }}>
                          <div className="text-[10px] text-[#9E9E9E] font-[family-name:var(--font-heading)] tracking-wide mb-1">
                            MAX SPEED
                          </div>
                          <div className="text-2xl font-bold text-[#E10600] font-[family-name:var(--font-mono)]">
                            {Math.round(stats.maxSpeed)}
                          </div>
                          <div className="text-[9px] text-[#9E9E9E]">MPH</div>
                        </div>

                        <div className="bg-[#0D0D0D] rounded p-3 border border-[#1A1A1A]" style={{ borderRadius: "8px" }}>
                          <div className="text-[10px] text-[#9E9E9E] font-[family-name:var(--font-heading)] tracking-wide mb-1">
                            AVG SPEED
                          </div>
                          <div className="text-2xl font-bold text-[#00D9FF] font-[family-name:var(--font-mono)]">
                            {Math.round(stats.avgSpeed)}
                          </div>
                          <div className="text-[9px] text-[#9E9E9E]">MPH</div>
                        </div>
                      </div>

                      {/* Total Time Driven */}
                      <div className="bg-[#0D0D0D] rounded p-3 border border-[#1A1A1A]" style={{ borderRadius: "8px" }}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-[10px] text-[#9E9E9E] font-[family-name:var(--font-heading)] tracking-wide mb-1">
                              TOTAL TIME DRIVEN
                            </div>
                            <div className="text-xl font-bold text-[#F5F5F5] font-[family-name:var(--font-mono)]">
                              {formatDuration(stats.totalDuration)}
                            </div>
                          </div>
                          <div className="text-4xl opacity-20">⏱️</div>
                        </div>
                      </div>

                      {/* Performance Bars */}
                      <div className="space-y-2">
                        <div className="text-[10px] text-[#9E9E9E] font-[family-name:var(--font-heading)] tracking-wide">
                          PERFORMANCE BREAKDOWN
                        </div>
                        
                        {/* Blitz vs Simple */}
                        <div>
                          <div className="flex justify-between text-[9px] text-[#9E9E9E] mb-1">
                            <span>Blitz Mode</span>
                            <span>{stats.blitzCompleted} trips</span>
                          </div>
                          <div className="h-2 bg-[#0D0D0D] rounded overflow-hidden">
                            <div 
                              className="h-full bg-[#E10600]" 
                              style={{ width: `${(stats.blitzCompleted / stats.totalTrips) * 100}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[9px] text-[#9E9E9E] mb-1">
                            <span>Simple Drive</span>
                            <span>{stats.simpleCompleted} trips</span>
                          </div>
                          <div className="h-2 bg-[#0D0D0D] rounded overflow-hidden">
                            <div 
                              className="h-full bg-[#00FF7F]" 
                              style={{ width: `${(stats.simpleCompleted / stats.totalTrips) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-3">📊</div>
                      <p className="text-[#9E9E9E] text-sm">No trips yet</p>
                      <p className="text-[#666] text-xs mt-1">Start driving to see your stats!</p>
                    </div>
                  )}
                </div>
              )}

              {/* BADGES TAB */}
              {activeTab === "badges" && (
                <div className="space-y-3">
                  {badges.length > 0 ? (
                    <>
                      <div className="text-[10px] text-[#9E9E9E] mb-3 font-[family-name:var(--font-heading)] tracking-wide">
                        {badges.length} BADGE{badges.length !== 1 ? 'S' : ''} EARNED
                      </div>
                      {badges.map((badge) => (
                        <BadgeDetailCard
                          key={badge.id}
                          name={badge.name}
                          description={badge.description}
                          icon={badge.icon}
                          rarity={badge.rarity || "common"}
                          isEarned={true}
                          earnedAt={badge.earned_at}
                        />
                      ))}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-3">🏅</div>
                      <p className="text-[#9E9E9E] text-sm">No badges yet</p>
                      <p className="text-[#666] text-xs mt-1">Complete challenges to earn badges!</p>
                    </div>
                  )}
                </div>
              )}

              {/* RECENT DRIVE TAB */}
              {activeTab === "recent" && (
                <div className="space-y-3">
                  {recentTrip ? (
                    <>
                      {/* Trip Header */}
                      <div className="bg-[#0D0D0D] rounded p-3 border border-[#1A1A1A]" style={{ borderRadius: "8px" }}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">
                              {recentTrip.mode === "blitz" ? "⚡" : "🏁"}
                            </span>
                            <div>
                              <div className="text-sm font-bold text-[#F5F5F5] font-[family-name:var(--font-heading)]">
                                {recentTrip.mode === "blitz" ? "BLITZ MODE" : "SIMPLE DRIVE"}
                              </div>
                              <div className="text-[9px] text-[#9E9E9E]">
                                {formatDate(recentTrip.started_at)} • {formatTime(recentTrip.started_at)}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs px-2 py-1 bg-[#00FF7F]/20 text-[#00FF7F] rounded font-bold">
                            LATEST
                          </div>
                        </div>
                      </div>

                      {/* Trip Stats Grid */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-[#0D0D0D] rounded p-2 border border-[#1A1A1A] text-center" style={{ borderRadius: "8px" }}>
                          <div className="text-[9px] text-[#9E9E9E] mb-1">MAX SPEED</div>
                          <div className="text-lg font-bold text-[#E10600] font-[family-name:var(--font-mono)]">
                            {Math.round(recentTrip.max_speed_mps * 2.23694)}
                          </div>
                          <div className="text-[8px] text-[#9E9E9E]">MPH</div>
                        </div>

                        <div className="bg-[#0D0D0D] rounded p-2 border border-[#1A1A1A] text-center" style={{ borderRadius: "8px" }}>
                          <div className="text-[9px] text-[#9E9E9E] mb-1">DISTANCE</div>
                          <div className="text-lg font-bold text-[#00D9FF] font-[family-name:var(--font-mono)]">
                            {(recentTrip.distance_m * 0.000621371).toFixed(1)}
                          </div>
                          <div className="text-[8px] text-[#9E9E9E]">MI</div>
                        </div>

                        <div className="bg-[#0D0D0D] rounded p-2 border border-[#1A1A1A] text-center" style={{ borderRadius: "8px" }}>
                          <div className="text-[9px] text-[#9E9E9E] mb-1">DURATION</div>
                          <div className="text-lg font-bold text-[#00FF7F] font-[family-name:var(--font-mono)]">
                            {Math.floor(recentTrip.duration_seconds / 60)}
                          </div>
                          <div className="text-[8px] text-[#9E9E9E]">MIN</div>
                        </div>
                      </div>

                      {/* Average Speed */}
                      <div className="bg-[#0D0D0D] rounded p-3 border border-[#1A1A1A]" style={{ borderRadius: "8px" }}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-[9px] text-[#9E9E9E] mb-1">AVERAGE SPEED</div>
                            <div className="text-xl font-bold text-[#F5F5F5] font-[family-name:var(--font-mono)]">
                              {Math.round(recentTrip.avg_speed_mps * 2.23694)} MPH
                            </div>
                          </div>
                          <div className="text-3xl opacity-20">🎯</div>
                        </div>
                      </div>

                      {/* Route Map */}
                      <div className="bg-[#0D0D0D] rounded p-3 border border-[#1A1A1A]" style={{ borderRadius: "8px" }}>
                        <div className="text-[10px] text-[#9E9E9E] font-[family-name:var(--font-heading)] tracking-wide mb-2">
                          ROUTE MAP
                        </div>
                        {recentTrip.route_snapshot_url ? (
                          <div className="aspect-video bg-[#1A1A1A] rounded overflow-hidden relative" style={{ borderRadius: "6px" }}>
                            {imageLoading && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00D9FF]"></div>
                              </div>
                            )}
                            <img 
                              src={recentTrip.route_snapshot_url} 
                              alt="Route map" 
                              className="w-full h-full object-cover"
                              onLoad={() => {
                                console.log('✅ Route map loaded successfully:', recentTrip.route_snapshot_url)
                                setImageLoading(false)
                                setImageError(false)
                              }}
                              onError={(e) => {
                                console.error('❌ Route map failed to load:', recentTrip.route_snapshot_url)
                                setImageLoading(false)
                                setImageError(true)
                              }}
                            />
                            {imageError && (
                              <div className="absolute inset-0 flex items-center justify-center bg-[#1A1A1A]">
                                <div className="text-center">
                                  <div className="text-3xl mb-2">🗺️</div>
                                  <p className="text-xs text-[#666]">Failed to load route map</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="aspect-video bg-[#1A1A1A] rounded flex items-center justify-center" style={{ borderRadius: "6px" }}>
                            <div className="text-center">
                              <div className="text-3xl mb-2">🗺️</div>
                              <p className="text-xs text-[#666]">Route map unavailable</p>
                              <p className="text-[10px] text-[#444] mt-1">Captured after trip</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Trip Timeline */}
                      <div className="bg-[#0D0D0D] rounded p-3 border border-[#1A1A1A]" style={{ borderRadius: "8px" }}>
                        <div className="text-[10px] text-[#9E9E9E] font-[family-name:var(--font-heading)] tracking-wide mb-2">
                          TRIP TIMELINE
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-[10px]">
                            <div className="w-2 h-2 rounded-full bg-[#00FF7F]"></div>
                            <span className="text-[#9E9E9E]">Started:</span>
                            <span className="text-[#F5F5F5] font-[family-name:var(--font-mono)]">
                              {formatTime(recentTrip.started_at)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px]">
                            <div className="w-2 h-2 rounded-full bg-[#E10600]"></div>
                            <span className="text-[#9E9E9E]">Ended:</span>
                            <span className="text-[#F5F5F5] font-[family-name:var(--font-mono)]">
                              {formatTime(recentTrip.ended_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-3">🚗</div>
                      <p className="text-[#9E9E9E] text-sm">No recent drives</p>
                      <p className="text-[#666] text-xs mt-1">Your last trip will appear here!</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MonitorPanel>
  )
}
