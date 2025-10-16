"use client"

import { useEffect, useState } from "react"
import { MonitorPanel } from "./monitor-panel"
import { supabase } from "@/lib/supabase"

interface Challenge {
  id: string
  title: string
  description: string
  challenge_type: string
  start_date: string
  end_date: string
  target_goal: number
  prize_points: number
  active: boolean
}

interface ChallengeProgress {
  challenge_id: string
  title: string
  target_goal: number
  current_points: number
  participant_count: number
  total_completions: number
  progress_percentage: number
}

interface LeaderboardEntry {
  rank: number
  user_id: string
  username: string
  total_points: number
  completion_count: number
  avg_delta: number
}

export function ChallengesEvents() {
  const [ledBlink, setLedBlink] = useState(true)
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null)
  const [challengeProgress, setChallengeProgress] = useState<ChallengeProgress | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [countdown, setCountdown] = useState<string>("")

  useEffect(() => {
    fetchActiveChallenge()

    // Blink LED every 3 seconds
    const blinkInterval = setInterval(() => {
      setLedBlink((prev) => !prev)
    }, 3000)

    // Refresh data every 30 seconds
    const refreshInterval = setInterval(() => {
      fetchChallengeProgress()
      fetchLeaderboard()
    }, 30000)

    // Subscribe to real-time updates
    const channel = supabase
      .channel('challenges-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blitz_points',
        },
        () => {
          fetchChallengeProgress()
          fetchLeaderboard()
        }
      )
      .subscribe()

    return () => {
      clearInterval(blinkInterval)
      clearInterval(refreshInterval)
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    if (activeChallenge) {
      fetchChallengeProgress()
      fetchLeaderboard()
      
      // Start countdown timer
      const countdownInterval = setInterval(() => {
        if (activeChallenge) {
          const now = new Date().getTime()
          const end = new Date(activeChallenge.end_date).getTime()
          const distance = end - now

          if (distance < 0) {
            setCountdown('ENDED')
          } else {
            const days = Math.floor(distance / (1000 * 60 * 60 * 24))
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((distance % (1000 * 60)) / 1000)

            if (days > 0) {
              setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`)
            } else if (hours > 0) {
              setCountdown(`${hours}h ${minutes}m ${seconds}s`)
            } else {
              setCountdown(`${minutes}m ${seconds}s`)
            }
          }
        }
      }, 1000)

      return () => clearInterval(countdownInterval)
    }
  }, [activeChallenge])

  async function fetchActiveChallenge() {
    setLoading(true)
    const now = new Date().toISOString()
    
    console.log('Fetching challenges for:', now)
    
    const { data, error } = await supabase
      .from('blitz_challenges')
      .select('*')
      .eq('active', true)
      .lte('start_date', now)
      .gte('end_date', now)

    console.log('Challenge query result:', { data, error })
    
    if (!error && data && data.length > 0) {
      // Sort by start_date descending and take first
      const sorted = data.sort((a, b) => 
        new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
      )
      setActiveChallenge(sorted[0])
    }
    setLoading(false)
  }

  async function fetchChallengeProgress() {
    if (!activeChallenge) return

    const { data, error } = await supabase
      .from('challenge_progress')
      .select('*')
      .eq('challenge_id', activeChallenge.id)
      .single()

    if (!error && data) {
      setChallengeProgress(data)
    }
  }

  async function fetchLeaderboard() {
    if (!activeChallenge) return

    console.log('Fetching leaderboard for challenge:', activeChallenge.id)

    // Query blitz_points directly and aggregate
    const { data, error } = await supabase
      .from('blitz_points')
      .select(`
        user_id,
        points,
        profiles!blitz_points_user_id_fkey (
          username
        )
      `)
      .eq('challenge_id', activeChallenge.id)
      .order('points', { ascending: false })
      .limit(20)

    console.log('Leaderboard data:', { data, error })

    if (!error && data) {
      // Aggregate by user
      const userTotals = new Map<string, { username: string, total_points: number, count: number }>()
      
      data.forEach((entry: any) => {
        const userId = entry.user_id
        const username = entry.profiles?.username || 'Anonymous'
        const points = entry.points
        
        if (userTotals.has(userId)) {
          const existing = userTotals.get(userId)!
          existing.total_points += points
          existing.count += 1
        } else {
          userTotals.set(userId, { username, total_points: points, count: 1 })
        }
      })
      
      // Convert to leaderboard format
      const leaderboardData = Array.from(userTotals.entries())
        .map(([user_id, stats], index) => ({
          rank: index + 1,
          user_id,
          username: stats.username,
          total_points: stats.total_points,
          completion_count: stats.count,
          avg_delta: 0
        }))
        .sort((a, b) => b.total_points - a.total_points)
        .slice(0, 5)
      
      setLeaderboard(leaderboardData)
    }
  }

  if (loading) {
    return (
      <MonitorPanel
        title={
          <div className="flex items-center gap-2">
            <span className="text-yellow-500">🏆</span>
            CHALLENGES & EVENTS
          </div>
        }
        indicator="green"
      >
        <div className="bg-zinc-950 rounded border border-zinc-700 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00FF7F] mx-auto"></div>
          <p className="text-zinc-400 mt-4 text-sm">Loading challenges...</p>
        </div>
      </MonitorPanel>
    )
  }

  if (!activeChallenge) {
    return (
      <MonitorPanel
        title={
          <div className="flex items-center gap-2">
            <span className="text-yellow-500">🏆</span>
            CHALLENGES & EVENTS
          </div>
        }
        indicator="gray"
      >
        <div className="bg-zinc-950 rounded border border-zinc-700 p-8 text-center">
          <p className="text-zinc-400 text-sm">No active challenges at the moment</p>
          <p className="text-zinc-500 text-xs mt-2">Check back soon for new challenges!</p>
        </div>
      </MonitorPanel>
    )
  }

  return (
    <MonitorPanel
      title={
        <div className="flex items-center gap-2">
          <span className="text-yellow-500">🏆</span>
          CHALLENGES & EVENTS
          <div
            className={`h-2 w-2 rounded-full bg-[#00FF7F] transition-opacity ${ledBlink ? "opacity-100" : "opacity-0"}`}
          />
        </div>
      }
      indicator="green"
    >
      <div className="bg-zinc-950 rounded border border-zinc-700 p-2">
        <div className="grid md:grid-cols-2 gap-2">
          {/* Left column - Active Challenge */}
          <div className="bg-zinc-900 border border-zinc-800 rounded p-2 space-y-2">
            <div className="text-xs font-bold text-yellow-500 tracking-wider">
              {activeChallenge.challenge_type.toUpperCase()} BLITZ — {activeChallenge.title.toUpperCase()}
            </div>

            <div>
              <div className="text-3xl font-bold text-[#00FF7F] mb-1">
                {activeChallenge.prize_points.toLocaleString()}
              </div>
              <div className="text-xs text-zinc-500">Prize Points</div>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-xs text-zinc-400 mb-1">
                <span>Community Progress</span>
                <span>{challengeProgress ? `${Math.round(challengeProgress.progress_percentage)}%` : '0%'}</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#00FF7F] to-[#00D9FF] rounded-full transition-all duration-500" 
                  style={{ width: `${challengeProgress ? Math.min(challengeProgress.progress_percentage, 100) : 0}%` }} 
                />
              </div>
              {challengeProgress && (
                <div className="text-xs text-zinc-500 mt-1">
                  {challengeProgress.current_points.toLocaleString()} / {activeChallenge.target_goal.toLocaleString()} points
                </div>
              )}
            </div>

            {/* Description */}
            <div className="text-sm text-zinc-300">
              {activeChallenge.description}
            </div>

            {/* Stats */}
            {challengeProgress && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-zinc-800 rounded p-2">
                  <div className="text-zinc-400">Participants</div>
                  <div className="text-[#00FF7F] font-bold text-lg">
                    {challengeProgress.participant_count}
                  </div>
                </div>
                <div className="bg-zinc-800 rounded p-2">
                  <div className="text-zinc-400">Completions</div>
                  <div className="text-[#00D9FF] font-bold text-lg">
                    {challengeProgress.total_completions}
                  </div>
                </div>
              </div>
            )}

            {/* CTA buttons */}
            <div className="flex gap-2 pt-2">
              <button className="flex-1 px-4 py-2 bg-[#00FF7F] hover:bg-[#10B981] text-white text-sm font-bold rounded transition-colors">
                Join Challenge
              </button>
              <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold rounded transition-colors border border-zinc-700">
                View Rules
              </button>
            </div>
          </div>

          {/* Right column - Challenge Info */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-zinc-500 tracking-wider mb-3">CHALLENGE DETAILS</div>
            
            <div className="bg-zinc-900 border border-zinc-800 rounded p-3">
              <div className="text-xs text-zinc-400 mb-1">Challenge Period</div>
              <div className="text-sm text-white">
                {new Date(activeChallenge.start_date).toLocaleDateString()} - {new Date(activeChallenge.end_date).toLocaleDateString()}
              </div>
            </div>

            {countdown && (
              <div className="bg-zinc-900 border border-zinc-800 rounded p-3">
                <div className="text-xs text-zinc-400 mb-1">Time Remaining</div>
                <div className={`text-lg font-bold font-mono ${
                  countdown === 'ENDED' 
                    ? 'text-red-500' 
                    : countdown.includes('d') 
                      ? 'text-[#00FF7F]' 
                      : 'text-yellow-500'
                }`}>
                  {countdown}
                </div>
              </div>
            )}

            <div className="bg-zinc-900 border border-zinc-800 rounded p-3">
              <div className="text-xs text-zinc-400 mb-1">Target Goal</div>
              <div className="text-sm text-white font-mono">
                {activeChallenge.target_goal.toLocaleString()} pts
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded p-3">
              <div className="text-xs text-zinc-400 mb-2">How to Participate</div>
              <ul className="space-y-1.5 text-xs text-zinc-300">
                <li className="flex items-start gap-2">
                  <span className="text-[#00FF7F]">•</span>
                  <span>Open SpeedX app & enable Blitz mode</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00FF7F]">•</span>
                  <span>Set destination and start driving</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00FF7F]">•</span>
                  <span>Beat expected time to earn points</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00FF7F]">•</span>
                  <span>Points auto-contributed to challenge</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer mini-leaderboard */}
        <div className="mt-4 pt-4 border-t border-zinc-800">
          <div className="text-xs font-bold text-zinc-500 tracking-wider mb-2">LEADERBOARD</div>
          <div className="bg-zinc-900 border border-zinc-800 rounded overflow-hidden">
            {leaderboard.length === 0 ? (
              <div className="p-4 text-center text-zinc-500 text-xs">
                No entries yet. Be the first to compete!
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-zinc-800">
                  <tr>
                    <th className="text-left p-2 font-bold text-zinc-400">Rank</th>
                    <th className="text-left p-2 font-bold text-zinc-400">Driver</th>
                    <th className="text-right p-2 font-bold text-zinc-400">Points</th>
                    <th className="text-right p-2 font-bold text-zinc-400">Runs</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry) => (
                    <tr key={entry.user_id} className="border-t border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                      <td className="p-2 font-bold">
                        <span className={entry.rank <= 3 ? "text-[#00FF7F]" : "text-zinc-300"}>
                          {entry.rank}
                        </span>
                      </td>
                      <td className="p-2 text-zinc-300">
                        {entry.username || `Driver ${entry.user_id.slice(0, 6)}`}
                      </td>
                      <td className="p-2 text-right font-bold text-[#00FF7F]">
                        {entry.total_points}
                      </td>
                      <td className="p-2 text-right text-zinc-400">
                        {entry.completion_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </MonitorPanel>
  )
}
