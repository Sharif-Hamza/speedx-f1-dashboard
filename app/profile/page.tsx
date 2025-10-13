"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

interface UserStats {
  totalTrips: number
  totalDistance: number
  totalDuration: number
}

export default function ProfilePage() {
  const { user, profile, signOut, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!loading && !user && mounted) {
      router.push("/waitlist")
    }
  }, [user, loading, router, mounted])

  useEffect(() => {
    if (user?.id) {
      fetchUserStats()
    }
  }, [user])

  const fetchUserStats = async () => {
    if (!user?.id) return

    try {
      const { data: trips, error } = await supabase
        .from("trips")
        .select("distance_m, duration_seconds")
        .eq("user_id", user.id)

      if (error) {
        console.error("Error fetching stats:", error)
        return
      }

      if (trips) {
        const totalDistance = trips.reduce((sum, t) => sum + (t.distance_m || 0), 0) * 0.000621371 // to miles
        const totalDuration = trips.reduce((sum, t) => sum + (t.duration_seconds || 0), 0)
        
        setStats({
          totalTrips: trips.length,
          totalDistance,
          totalDuration
        })
      }
    } catch (error) {
      console.error("Error fetching user stats:", error)
    } finally {
      setLoadingStats(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E10600] mx-auto mb-4"></div>
          <p className="text-[#9E9E9E]">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F5F5F5] font-sans vignette grain">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b-2 border-[#E10600] bg-gradient-to-r from-black via-[#0D0D0D] to-black p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-[#9E9E9E] hover:text-[#F5F5F5] transition-colors"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-[family-name:var(--font-heading)] text-sm">Back to Dashboard</span>
          </button>
          <div className="text-2xl font-bold text-[#E10600] font-[family-name:var(--font-heading)]">
            SPEED<span className="text-[#F5F5F5]">X</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Profile Card */}
        <div className="bg-[#0C0C0C] rounded-lg border border-[#222] p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#E10600] to-[#00D9FF] flex items-center justify-center shadow-lg">
              <svg className="h-10 w-10 text-[#F5F5F5]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#F5F5F5] font-[family-name:var(--font-heading)]">
                {profile?.username || "Driver"}
              </h1>
              <p className="text-sm text-[#9E9E9E] font-[family-name:var(--font-mono)]">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          {loadingStats ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E10600] mx-auto"></div>
            </div>
          ) : stats ? (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-[#E10600] font-[family-name:var(--font-mono)]">
                  {stats.totalTrips}
                </div>
                <div className="text-xs text-[#9E9E9E] font-[family-name:var(--font-heading)] mt-1">
                  TOTAL TRIPS
                </div>
              </div>
              <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-[#00D9FF] font-[family-name:var(--font-mono)]">
                  {stats.totalDistance.toFixed(1)}
                </div>
                <div className="text-xs text-[#9E9E9E] font-[family-name:var(--font-heading)] mt-1">
                  MILES
                </div>
              </div>
              <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-[#00FF7F] font-[family-name:var(--font-mono)]">
                  {formatDuration(stats.totalDuration)}
                </div>
                <div className="text-xs text-[#9E9E9E] font-[family-name:var(--font-heading)] mt-1">
                  TIME
                </div>
              </div>
            </div>
          ) : null}

          {/* Account Info */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between p-3 bg-[#0D0D0D] border border-[#1A1A1A] rounded">
              <span className="text-sm text-[#9E9E9E]">Account Status</span>
              <span className="text-sm font-bold text-[#00FF7F] font-[family-name:var(--font-heading)]">
                ACTIVE
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#0D0D0D] border border-[#1A1A1A] rounded">
              <span className="text-sm text-[#9E9E9E]">Member Since</span>
              <span className="text-sm font-bold text-[#F5F5F5] font-[family-name:var(--font-mono)]">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { 
                  month: 'short', 
                  year: 'numeric' 
                }) : 'N/A'}
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-[#E10600] to-[#B00500] hover:from-[#FF0700] hover:to-[#E10600] text-[#F5F5F5] font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg font-[family-name:var(--font-heading)] tracking-wide"
          >
            🚪 LOGOUT
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-[#0C0C0C] border border-[#222] hover:border-[#E10600] p-6 rounded-lg transition-all group"
          >
            <div className="text-3xl mb-2">🏁</div>
            <div className="text-sm font-bold text-[#F5F5F5] font-[family-name:var(--font-heading)] group-hover:text-[#E10600]">
              DASHBOARD
            </div>
          </button>
          <button
            onClick={() => window.open("https://apps.apple.com", "_blank")}
            className="bg-[#0C0C0C] border border-[#222] hover:border-[#00D9FF] p-6 rounded-lg transition-all group"
          >
            <div className="text-3xl mb-2">📱</div>
            <div className="text-sm font-bold text-[#F5F5F5] font-[family-name:var(--font-heading)] group-hover:text-[#00D9FF]">
              GET APP
            </div>
          </button>
        </div>
      </main>
    </div>
  )
}
