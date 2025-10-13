"use client"

import { useState, useTransition } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { signIn } = useAuth()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { error: signInError } = await signIn(email, password)

      if (signInError) {
        setError(signInError.message)
        setLoading(false)
      } else {
        // Use startTransition for non-blocking navigation
        startTransition(() => {
          router.push("/dashboard")
        })
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(225,6,0,0.1),transparent_50%)]" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E10600] to-[#8B0000] flex items-center justify-center shadow-2xl border border-[#E10600]/20">
                <span className="text-3xl font-bold text-white font-[family-name:var(--font-heading)]">SX</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 font-[family-name:var(--font-heading)] tracking-tight">
              Welcome Back
            </h1>
            <p className="text-zinc-400 text-sm">Sign in to your SpeedX account</p>
          </motion.div>

          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-[#1A1A1A]/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-zinc-800/50"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="w-full px-4 py-3 bg-[#0D0D0D] border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#E10600] focus:ring-1 focus:ring-[#E10600] transition-all"
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
                  className="w-full px-4 py-3 bg-[#0D0D0D] border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#E10600] focus:ring-1 focus:ring-[#E10600] transition-all"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: loading || isPending ? 1 : 1.02 }}
                whileTap={{ scale: loading || isPending ? 1 : 0.98 }}
                type="submit"
                disabled={loading || isPending}
                className="w-full py-4 bg-gradient-to-r from-[#E10600] to-[#FF3131] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-target font-[family-name:var(--font-heading)] relative overflow-hidden"
              >
                {(loading || isPending) ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {isPending ? "Loading Dashboard..." : "Signing In..."}
                  </span>
                ) : "Sign In"}
              </motion.button>
            </form>

            <div className="mt-6 pt-6 border-t border-zinc-800">
              <p className="text-center text-sm text-zinc-400">
                Don't have an account?{" "}
                <button
                  onClick={() => router.push("/waitlist")}
                  className="text-[#E10600] hover:text-[#FF3131] font-semibold transition-colors"
                >
                  Join the waitlist
                </button>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
