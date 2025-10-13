"use client"

import { useEffect, useState } from "react"
import { MonitorPanel } from "./monitor-panel"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"

interface SpeedStats {
  maxSpeed: number // in mph
  avgSpeed: number // in mph
  totalDistance: number // in miles
  totalTrips: number
}

export function SpeedStats() {
  const { user } = useAuth()
  const [stats, setStats] = useState<SpeedStats>({
    maxSpeed: 0,
    avgSpeed: 0,
    totalDistance: 0,
    totalTrips: 0,
  })
  const [loading, setLoading] = useState(true)
  const [animatedSpeed, setAnimatedSpeed] = useState(0)

  // Fetch user's speed stats from trips table
  const fetchSpeedStats = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      // Fetch all trips for the user
      const { data: trips, error } = await supabase
        .from("trips")
        .select("max_speed_mps, avg_speed_mps, distance_m")
        .eq("user_id", user.id)
        .order("max_speed_mps", { ascending: false })

      if (error) throw error

      if (trips && trips.length > 0) {
        // Convert MPS to MPH (1 m/s = 2.23694 mph)
        const mpsToMph = 2.23694

        // Get max speed from all trips
        const maxSpeedMph = trips[0].max_speed_mps * mpsToMph

        // Calculate average speed across all trips
        const totalAvgSpeed = trips.reduce((sum, trip) => sum + trip.avg_speed_mps, 0)
        const avgSpeedMph = (totalAvgSpeed / trips.length) * mpsToMph

        // Calculate total distance in miles (1 meter = 0.000621371 miles)
        const metersToMiles = 0.000621371
        const totalDistanceMiles = trips.reduce((sum, trip) => sum + trip.distance_m, 0) * metersToMiles

        setStats({
          maxSpeed: maxSpeedMph,
          avgSpeed: avgSpeedMph,
          totalDistance: totalDistanceMiles,
          totalTrips: trips.length,
        })
      }
    } catch (error) {
      console.error("Error fetching speed stats:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch on mount and when user changes
  useEffect(() => {
    fetchSpeedStats()
  }, [user])

  // Animate the speed gauge
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedSpeed((prev) => {
        const diff = stats.maxSpeed - prev
        if (Math.abs(diff) < 0.1) return stats.maxSpeed
        return prev + diff * 0.15
      })
    }, 50)

    return () => clearInterval(interval)
  }, [stats.maxSpeed])

  // Subscribe to new trips for real-time updates
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel("speed-stats-updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "trips",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          console.log("🔄 New trip detected, refreshing speed stats...")
          fetchSpeedStats()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  // Calculate gauge rotation (0-180 degrees for 0-200 mph)
  const maxDisplaySpeed = 200
  const rotation = Math.min((animatedSpeed / maxDisplaySpeed) * 180, 180)

  // Determine gauge color based on speed
  const getGaugeColor = (speed: number) => {
    if (speed < 50) return "#00FF7F" // Green
    if (speed < 100) return "#FFB300" // Yellow
    return "#E10600" // Red
  }

  return (
    <MonitorPanel title="MAX SPEED" indicator="green" variant="primary">
      <div
        className="bg-[#0C0C0C] rounded border border-[#222] p-3 flex flex-col h-full"
        style={{ borderRadius: "8px" }}
      >
        {/* Circular Speed Gauge */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-48 h-48 md:w-56 md:h-56">
            {/* Background arc */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 200 200">
              {/* Track */}
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke="#222"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray="267 267"
                strokeDashoffset="0"
              />
              {/* Progress */}
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke={getGaugeColor(animatedSpeed)}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray="267 267"
                strokeDashoffset={267 - (rotation / 180) * 267}
                className="transition-all duration-500"
                style={{
                  filter: `drop-shadow(0 0 8px ${getGaugeColor(animatedSpeed)})`,
                }}
              />
            </svg>

            {/* Center display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-5xl md:text-6xl font-bold text-[#F5F5F5] leading-none font-[family-name:var(--font-mono)] animate-flicker">
                {loading ? "--" : Math.round(animatedSpeed)}
              </div>
              <div className="text-sm md:text-base text-[#9E9E9E] font-[family-name:var(--font-mono)] mt-1">
                MPH
              </div>
              <div className="text-xs text-[#E10600] font-bold mt-2 font-[family-name:var(--font-heading)] tracking-wide">
                {loading ? "LOADING..." : "PERSONAL BEST"}
              </div>
            </div>

            {/* Speed markers */}
            <div className="absolute inset-0">
              {[0, 50, 100, 150, 200].map((speed, i) => {
                const angle = (i * 45 - 90) * (Math.PI / 180)
                const x = 100 + Math.cos(angle) * 95
                const y = 100 + Math.sin(angle) * 95
                return (
                  <div
                    key={speed}
                    className="absolute text-[10px] text-[#666] font-[family-name:var(--font-mono)]"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {speed}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 md:gap-3 w-full mt-4 pt-4 border-t border-[#222] text-xs md:text-sm">
          <div className="text-center">
            <div className="text-[#9E9E9E] text-[10px] md:text-xs font-[family-name:var(--font-heading)] tracking-wide mb-1">
              AVG SPEED
            </div>
            <div className="font-bold text-[#F5F5F5] font-[family-name:var(--font-mono)] text-sm md:text-base">
              {loading ? "--" : Math.round(stats.avgSpeed)} MPH
            </div>
          </div>
          <div className="text-center">
            <div className="text-[#9E9E9E] text-[10px] md:text-xs font-[family-name:var(--font-heading)] tracking-wide mb-1">
              DISTANCE
            </div>
            <div className="font-bold text-[#00FF7F] font-[family-name:var(--font-mono)] text-sm md:text-base">
              {loading ? "--" : stats.totalDistance.toFixed(1)} MI
            </div>
          </div>
          <div className="text-center">
            <div className="text-[#9E9E9E] text-[10px] md:text-xs font-[family-name:var(--font-heading)] tracking-wide mb-1">
              TRIPS
            </div>
            <div className="font-bold text-[#FFB300] font-[family-name:var(--font-mono)] text-sm md:text-base">
              {loading ? "--" : stats.totalTrips}
            </div>
          </div>
        </div>

        {/* Progress to next milestone */}
        <div className="mt-4 pt-4 border-t border-[#222]">
          <div className="text-[10px] md:text-xs text-[#9E9E9E] mb-2 font-semibold tracking-wide font-[family-name:var(--font-heading)]">
            NEXT MILESTONE
          </div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs md:text-sm text-[#F5F5F5] font-[family-name:var(--font-mono)]">
              {loading ? "--" : Math.round(animatedSpeed)} MPH
            </div>
            <div className="text-xs md:text-sm text-[#E10600] font-bold font-[family-name:var(--font-mono)]">
              {animatedSpeed < 50 ? "50 MPH" : animatedSpeed < 100 ? "100 MPH" : animatedSpeed < 150 ? "150 MPH" : "200 MPH"}
            </div>
          </div>
          <div className="w-full h-2 bg-[#0D0D0D] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00FF7F] via-[#FFB300] to-[#E10600] transition-all duration-500"
              style={{
                width: `${
                  animatedSpeed < 50
                    ? (animatedSpeed / 50) * 100
                    : animatedSpeed < 100
                      ? ((animatedSpeed - 50) / 50) * 100
                      : animatedSpeed < 150
                        ? ((animatedSpeed - 100) / 50) * 100
                        : ((animatedSpeed - 150) / 50) * 100
                }%`,
              }}
            />
          </div>
        </div>

        {/* Performance rating */}
        <div className="mt-3 pt-3 border-t border-[#222] text-center">
          <div className="text-[10px] md:text-xs text-[#9E9E9E] mb-1 font-semibold tracking-wide font-[family-name:var(--font-heading)]">
            PERFORMANCE RATING
          </div>
          <div className="flex items-center justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-8 md:w-10 rounded-full transition-all ${
                  i < Math.floor(animatedSpeed / 40)
                    ? "bg-[#E10600] shadow-[0_0_6px_#E10600]"
                    : "bg-[#222]"
                }`}
              />
            ))}
          </div>
          <div className="text-xs md:text-sm text-[#F5F5F5] font-bold mt-2 font-[family-name:var(--font-mono)]">
            {animatedSpeed < 40 ? "ROOKIE" : animatedSpeed < 80 ? "AMATEUR" : animatedSpeed < 120 ? "PROFESSIONAL" : animatedSpeed < 160 ? "EXPERT" : "LEGEND"}
          </div>
        </div>
      </div>
    </MonitorPanel>
  )
}
