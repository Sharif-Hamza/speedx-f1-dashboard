"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, waitlistStatus, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!loading && mounted) {
      console.log('🔒 Dashboard Layout Check:', {
        hasUser: !!user,
        hasProfile: !!profile,
        profileApproved: profile?.waitlist_approved,
        waitlistStatus: waitlistStatus?.status || 'null'
      })

      // Not logged in
      if (!user) {
        console.log('⛔ No user - redirecting to waitlist')
        router.push("/waitlist")
        return
      }

      // Only block if explicitly denied
      const shouldBlock = (
        (waitlistStatus && waitlistStatus.status === "pending") || // Pending in waitlist
        (waitlistStatus && waitlistStatus.status === "rejected") || // Rejected
        (profile && profile.waitlist_approved === false) // Explicitly not approved
      )

      if (shouldBlock) {
        console.log('⛔ User blocked - redirecting to pending')
        router.push("/pending")
        return
      }

      // Allow access for:
      // - No waitlist entry (existing user before waitlist)
      // - Waitlist approved
      // - Profile with waitlist_approved = true
      // - Profile is null (very old user)
      console.log('✅ Dashboard access allowed')
    }
  }, [user, profile, waitlistStatus, loading, mounted, router])

  // Prevent hydration mismatch
  if (!mounted) {
    return null
  }

  // Show loading while checking
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FF7F]" />
      </div>
    )
  }

  // Block access if user is not authorized
  if (!user) {
    return null  // Will redirect in useEffect
  }
  
  // Only block if explicitly should block
  const shouldBlock = (
    (waitlistStatus && (waitlistStatus.status === 'pending' || waitlistStatus.status === 'rejected')) ||
    (profile && profile.waitlist_approved === false)
  )

  if (shouldBlock) {
    return null  // Will redirect in useEffect
  }

  return <>{children}</>
}
