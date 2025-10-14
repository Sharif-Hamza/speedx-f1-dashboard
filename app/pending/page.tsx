"use client"

import { useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function PendingPage() {
  const { user, waitlistStatus, loading, signOut, checkWaitlistStatus } = useAuth()
  const router = useRouter()
  
  // Check if email is confirmed
  const isEmailConfirmed = user?.confirmed_at != null
  
  // Auto-refresh waitlist status every 5 seconds
  useEffect(() => {
    if (user && waitlistStatus?.status === 'pending') {
      const interval = setInterval(() => {
        console.log('🔄 Checking for approval status update...')
        checkWaitlistStatus()
      }, 5000) // Check every 5 seconds
      
      return () => clearInterval(interval)
    }
  }, [user, waitlistStatus, checkWaitlistStatus])

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/waitlist")
      } else if (waitlistStatus?.status === "approved") {
        router.push("/dashboard")
      }
      // Don't redirect if status is pending or rejected - show the page
    }
  }, [user, waitlistStatus, loading, router])

  // Don't return loading state to avoid hydration mismatch
  // The content will handle loading internally
  
  return (
    <div className="min-h-screen bg-[#0D0D0D] relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(225,6,0,0.1),transparent_50%)]" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        {loading ? (
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FF7F]" />
        ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-lg text-center"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-8 inline-block"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#00FF7F] to-[#8B0000] flex items-center justify-center shadow-2xl border-4 border-[#00FF7F]/20 mx-auto">
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 font-[family-name:var(--font-heading)]">
              {waitlistStatus?.status === "rejected" ? "Application Not Approved" : "You're on the Waitlist!"}
            </h1>
            <p className="text-lg text-zinc-300">
              {waitlistStatus?.status === "rejected" 
                ? "Unfortunately, your application was not approved at this time." 
                : "Complete the steps below to access SpeedX"}
            </p>
          </motion.div>

          {/* Checklist Card */}
          {waitlistStatus?.status !== "rejected" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8 bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl p-6 border border-zinc-800/50 text-left"
            >
              <h3 className="font-bold text-white mb-6 text-lg">Approval Checklist</h3>
              <div className="space-y-4">
                {/* Email Confirmation */}
                <div className="flex items-start gap-4 p-4 rounded-xl bg-[#0D0D0D] border border-zinc-800">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    isEmailConfirmed ? 'bg-green-500/20' : 'bg-zinc-800'
                  }`}>
                    {isEmailConfirmed ? (
                      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-zinc-500 font-bold">1</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold mb-1 ${
                      isEmailConfirmed ? 'text-green-400' : 'text-white'
                    }`}>
                      Confirm Your Email
                    </h4>
                    <p className="text-sm text-zinc-400">
                      {isEmailConfirmed 
                        ? '✓ Email confirmed successfully!' 
                        : 'Check your inbox and click the verification link'}
                    </p>
                  </div>
                </div>

                {/* Admin Approval */}
                <div className="flex items-start gap-4 p-4 rounded-xl bg-[#0D0D0D] border border-zinc-800">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                    <span className="text-zinc-500 font-bold">2</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1">
                      Admin Approval
                    </h4>
                    <p className="text-sm text-zinc-400">
                      Our team is reviewing your application
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                      <span className="text-xs text-yellow-500 font-medium">Pending Review</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 flex gap-4 justify-center"
          >
            <button
              onClick={() => checkWaitlistStatus()}
              className="px-6 py-2 bg-[#00FF7F] hover:bg-[#FF3131] text-white rounded-xl transition-colors"
            >
              Check Status
            </button>
            <button
              onClick={() => signOut()}
              className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors"
            >
              Sign Out
            </button>
          </motion.div>

          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, type: "spring" }}
            className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full"
          >
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-sm font-medium text-yellow-500">Pending Review</span>
          </motion.div>
        </motion.div>
        )}
      </div>
    </div>
  )
}
