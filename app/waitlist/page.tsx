"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"

// Railway production URL
const EMAIL_AUTH_SERVICE_URL = 'https://speedx-email-auth-production.up.railway.app/api'

export default function WaitlistPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showEmailVerification, setShowEmailVerification] = useState(false)
  const [showConfirmedMessage, setShowConfirmedMessage] = useState(false)
  const [confirmedEmail, setConfirmedEmail] = useState("")
  const [resendingEmail, setResendingEmail] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check if user was redirected after email confirmation
  useEffect(() => {
    const confirmed = searchParams.get('confirmed')
    const confirmedEmailParam = searchParams.get('email')
    
    if (confirmed === 'true' && confirmedEmailParam) {
      setConfirmedEmail(confirmedEmailParam)
      setShowConfirmedMessage(true)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    // Validate password length
    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      setLoading(false)
      return
    }

    // Validate username
    if (!username || username.length < 3) {
      setError("Username must be at least 3 characters")
      setLoading(false)
      return
    }

    try {
      // Call email auth service
      const response = await fetch(`${EMAIL_AUTH_SERVICE_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password,
          metadata: {
            full_name: username,
            username: username
          }
        })
      })

      const data = await response.json()

      if (response.ok) {
        setShowEmailVerification(true)
        setLoading(false)
      } else {
        setError(data.error || 'Signup failed. Please try again.')
        setLoading(false)
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.')
      setLoading(false)
    }
  }

  const handleResendEmail = async () => {
    setResendingEmail(true)
    setError("")

    try {
      const response = await fetch(`${EMAIL_AUTH_SERVICE_URL}/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()
      
      if (response.ok) {
        setError("") // Clear any errors
        alert(data.message || 'Confirmation email sent!')
      } else {
        setError(data.error || 'Failed to resend email.')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setResendingEmail(false)
    }
  }

  // Show email verification message
  if (showEmailVerification) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(225,6,0,0.1),transparent_50%)]" />
        </div>
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md text-center"
          >
            <div className="bg-[#1A1A1A]/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-zinc-800/50">
              <div className="w-20 h-20 bg-gradient-to-br from-[#00FF7F] to-[#8B0000] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📧</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4 font-[family-name:var(--font-heading)]">
                Check Your Email!
              </h2>
              <p className="text-zinc-300 mb-2">
                We've sent a verification link to:
              </p>
              <p className="text-[#00FF7F] font-bold mb-6">{email}</p>
              <div className="bg-[#0D0D0D] border border-zinc-700 rounded-xl p-4 mb-4 text-left">
                <h3 className="text-white font-semibold mb-2 text-sm">✅ What to Do Now:</h3>
                <ol className="text-zinc-400 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-[#00FF7F] font-bold">1.</span>
                    <span>Check your email inbox</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#00FF7F] font-bold">2.</span>
                    <span>Click the verification link</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#00FF7F] font-bold">3.</span>
                    <span>You're on the waitlist!</span>
                  </li>
                </ol>
              </div>
              <div className="bg-[#FF3131]/10 border border-[#FF3131]/30 rounded-xl p-3 mb-6 text-left">
                <p className="text-white text-xs font-medium mb-1">⚠️ App Not Released Yet</p>
                <p className="text-zinc-400 text-xs">
                  When SpeedX launches, admins will review all waitlist accounts. Approved users will get instant access.
                </p>
              </div>
              <p className="text-xs text-zinc-500 mb-4">
                Didn't receive the email? Check your spam folder.
              </p>
              <button
                onClick={handleResendEmail}
                disabled={resendingEmail}
                className="w-full py-3 bg-gradient-to-r from-[#00FF7F]/20 to-[#FF3131]/20 border border-[#00FF7F]/30 text-white font-semibold rounded-xl hover:border-[#00FF7F] transition-all disabled:opacity-50"
              >
                {resendingEmail ? 'Sending...' : '🔄 Resend Confirmation Email'}
              </button>
              <button
                onClick={() => setShowEmailVerification(false)}
                className="mt-4 text-[#00FF7F] hover:text-[#FF3131] text-sm font-semibold"
              >
                ← Back to waitlist
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(225,6,0,0.1),transparent_50%)]" />
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23E10600' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Blurred Dashboard Preview */}
      <div className="absolute inset-0 blur-xl opacity-20 pointer-events-none">
        <div className="grid grid-cols-3 gap-4 p-8">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-gradient-to-br from-[#00FF7F] to-[#8B0000] rounded-lg animate-pulse"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        {/* Go Back Button */}
        <Link
          href="/"
          className="absolute top-8 left-8 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-[#00FF7F] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-7xl"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00FF7F] to-[#8B0000] flex items-center justify-center shadow-2xl border border-[#00FF7F]/20">
                <span className="text-3xl font-bold text-white font-[family-name:var(--font-heading)]">SX</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 font-[family-name:var(--font-heading)] tracking-tight">
              SPEED<span className="text-[#00FF7F]">X</span>
            </h1>
            <p className="text-zinc-400 text-sm">Track. Drive. Compete.</p>
          </motion.div>

          {/* Two Column Layout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="grid lg:grid-cols-2 gap-6 lg:gap-8"
          >
            {/* LEFT SIDE - FORM */}
            <div className="bg-[#1A1A1A]/80 backdrop-blur-xl rounded-3xl p-6 lg:p-8 shadow-2xl border border-zinc-800/50 h-fit lg:sticky lg:top-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2 font-[family-name:var(--font-heading)]">
                  Join the Waitlist
                </h2>
                <p className="text-zinc-400 text-sm">
                  Be among the first to experience high-speed trip tracking
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-zinc-300 mb-2">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    pattern="[a-zA-Z0-9_]{3,20}"
                    className="w-full px-4 py-3 bg-[#0D0D0D] border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#00FF7F] focus:ring-1 focus:ring-[#00FF7F] transition-all"
                    placeholder="johndoe123"
                  />
                  <p className="text-xs text-zinc-500 mt-1">3-20 characters, letters, numbers, and underscores only</p>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-[#0D0D0D] border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#00FF7F] focus:ring-1 focus:ring-[#00FF7F] transition-all"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 bg-[#0D0D0D] border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#00FF7F] focus:ring-1 focus:ring-[#00FF7F] transition-all"
                    placeholder="••••••••"
                  />
                  <p className="text-xs text-zinc-500 mt-1">Minimum 6 characters</p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-500/10 border border-[#00FF7F]/20 rounded-xl text-red-400 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-[#00FF7F] to-[#FF3131] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-target font-[family-name:var(--font-heading)]"
                >
                  {loading ? "Joining..." : "Join Waitlist"}
                </motion.button>
              </form>

              <div className="mt-6 pt-6 border-t border-zinc-800">
                <p className="text-center text-sm text-zinc-400">
                  Already a user?{" "}
                  <button
                    onClick={() => router.push("/login")}
                    className="text-[#00FF7F] hover:text-[#FF3131] font-semibold transition-colors"
                  >
                    Log in
                  </button>
                </p>
              </div>
            </div>

            {/* RIGHT SIDE - EXPLANATIONS */}
            <div className="space-y-6">

              {/* App Status */}
              <div className="p-5 bg-gradient-to-br from-[#FF3131]/10 to-[#00FF7F]/10 border-2 border-[#00FF7F]/30 rounded-xl bg-[#1A1A1A]/90 backdrop-blur-xl">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <h3 className="text-white font-bold text-base mb-1">App Not Released Yet</h3>
                    <p className="text-zinc-300 text-sm leading-relaxed">
                      SpeedX is currently in development. By joining the waitlist, you secure your spot for when we launch.
                    </p>
                  </div>
                </div>
                <div className="bg-[#0D0D0D]/60 border border-zinc-700/50 rounded-lg p-3 mt-3">
                  <p className="text-[#00FF7F] font-semibold text-xs mb-2">📋 What Happens Next:</p>
                  <ul className="text-zinc-400 text-xs space-y-1.5 pl-3">
                    <li>• You sign up and verify your email</li>
                    <li>• Your account is created and saved</li>
                    <li>• <span className="text-white font-medium">When we launch</span>, admins will review all accounts</li>
                    <li>• Approved users get instant access on launch day</li>
                  </ul>
                </div>
              </div>

              {/* Why Join */}
              <div className="p-4 bg-[#1A1A1A]/80 backdrop-blur-xl border border-zinc-700/50 rounded-xl">
                <h3 className="text-white font-semibold mb-3 text-sm flex items-center gap-2">
                  <span className="text-[#00FF7F]">🎁</span>
                  Founder Benefits
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="w-1.5 h-1.5 bg-[#00FF7F] rounded-full"></span>
                    <span>Exclusive Founder badge</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="w-1.5 h-1.5 bg-[#00FF7F] rounded-full"></span>
                    <span>Free forever (no hidden fees)</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="w-1.5 h-1.5 bg-[#00FF7F] rounded-full"></span>
                    <span>Priority support access</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="w-1.5 h-1.5 bg-[#00FF7F] rounded-full"></span>
                    <span>Early feature access</span>
                  </div>
                </div>
              </div>

              {/* What You Get */}
              <div className="p-4 bg-[#1A1A1A]/80 backdrop-blur-xl border border-zinc-700/30 rounded-xl">
                <h3 className="text-white font-semibold mb-3 text-sm flex items-center gap-2">
                  <span className="text-[#FF3131]">⚡</span>
                  Features You'll Get
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="w-1.5 h-1.5 bg-[#00FF7F] rounded-full"></span>
                    <span>Real-time tracking</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="w-1.5 h-1.5 bg-[#00FF7F] rounded-full"></span>
                    <span>Blitz challenges</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="w-1.5 h-1.5 bg-[#00FF7F] rounded-full"></span>
                    <span>Leaderboards</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="w-1.5 h-1.5 bg-[#00FF7F] rounded-full"></span>
                    <span>Performance analytics</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="w-1.5 h-1.5 bg-[#00FF7F] rounded-full"></span>
                    <span>Social racing</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="w-1.5 h-1.5 bg-[#00FF7F] rounded-full"></span>
                    <span>Achievements</span>
                  </div>
                </div>
              </div>

              {/* Support */}
              <div className="p-4 bg-[#1A1A1A]/80 backdrop-blur-xl border border-zinc-700/30 rounded-xl">
                <h3 className="text-white font-semibold mb-2 text-sm flex items-center gap-2">
                  <span>💬</span>
                  Need Help?
                </h3>
                <p className="text-zinc-400 text-xs mb-2">Questions about the waitlist or launch?</p>
                <a href="mailto:support@speed-x.us" className="inline-flex items-center gap-2 text-[#00FF7F] hover:text-[#FF3131] text-xs font-medium transition-colors">
                  <span>📧</span>
                  support@speed-x.us
                </a>
              </div>
            </div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-8 grid grid-cols-3 gap-4 text-center"
          >
            {[
              { icon: "⚡", label: "Blitz Mode" },
              { icon: "📊", label: "Live Stats" },
              { icon: "🏆", label: "Compete" },
            ].map((feature, i) => (
              <div key={i} className="p-4 bg-[#1A1A1A]/50 backdrop-blur-sm rounded-xl border border-zinc-800/30">
                <div className="text-2xl mb-1">{feature.icon}</div>
                <div className="text-xs text-zinc-400">{feature.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-center text-xs text-zinc-600 mt-8"
          >
            By joining, you agree to our Terms of Service and Privacy Policy
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}
