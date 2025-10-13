"use client"

import { useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const { user, profile, waitlistStatus, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      console.log('🔍 ROUTING DEBUG:', {
        hasUser: !!user,
        userId: user?.id?.substring(0, 8),
        email: user?.email,
        emailConfirmed: user?.confirmed_at,
        waitlistStatus: waitlistStatus?.status || 'null (no entry)',
        profileExists: !!profile
      })
      
      if (!user) {
        // No user logged in - show waitlist
        console.log('➡️ Redirecting to /waitlist (no user)')
        router.push("/waitlist")
      } else {
        // User is logged in - check waitlist status
        if (waitlistStatus === null) {
          // No waitlist entry - check if they have a profile
          // If no profile = new user who bypassed waitlist signup, BLOCK THEM
          // If has profile = existing user (created before waitlist), allow through
          if (!profile) {
            console.log('⛔ BLOCKING: No waitlist entry AND no profile = not approved')
            router.push("/pending")
          } else {
            console.log('➡️ Redirecting to /dashboard (has profile = existing user)')
            router.push("/dashboard")
          }
        } else if (waitlistStatus.status === "pending") {
          // User signed up via waitlist and is waiting for approval
          // Block dashboard access until approved
          console.log('➡️ Redirecting to /pending (status = pending)')
          router.push("/pending")
        } else if (waitlistStatus.status === "approved") {
          // User has been approved - allow dashboard access
          console.log('➡️ Redirecting to /dashboard (status = approved)')
          router.push("/dashboard")
        } else if (waitlistStatus.status === "rejected") {
          // User was rejected - show pending page with rejection message
          console.log('➡️ Redirecting to /pending (status = rejected)')
          router.push("/pending")
        }
      }
    }
  }, [user, waitlistStatus, loading, router])

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E10600]" />
    </div>
  )
}
