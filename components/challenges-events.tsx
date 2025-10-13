"use client"

import { useEffect, useState } from "react"
import { MonitorPanel } from "./monitor-panel"

interface Event {
  id: number
  date: string
  badge: "Online" | "Regional" | "Pro"
  description: string
  countdown: number
}

const EVENTS: Event[] = [
  { id: 1, date: "Mar 15", badge: "Online", description: "Global Time Trial Championship", countdown: 3600 },
  { id: 2, date: "Mar 18", badge: "Regional", description: "European Circuit Challenge", countdown: 7200 },
  { id: 3, date: "Mar 22", badge: "Pro", description: "Pro Series Qualifier Round 1", countdown: 10800 },
  { id: 4, date: "Mar 25", badge: "Online", description: "Weekend Sprint Series", countdown: 14400 },
  { id: 5, date: "Mar 29", badge: "Regional", description: "Asia-Pacific Showdown", countdown: 18000 },
]

interface LeaderboardEntry {
  pos: number
  driver: string
  delta: number
  change: number
}

const LEADERBOARD: LeaderboardEntry[] = [
  { pos: 1, driver: "VER", delta: -2.3, change: 1 },
  { pos: 2, driver: "HAM", delta: -1.8, change: -1 },
  { pos: 3, driver: "LEC", delta: -0.9, change: 2 },
  { pos: 4, driver: "NOR", delta: 0.4, change: 0 },
  { pos: 5, driver: "SAI", delta: 1.2, change: -2 },
]

export function ChallengesEvents() {
  const [ledBlink, setLedBlink] = useState(true)
  const [countdowns, setCountdowns] = useState(EVENTS.map((e) => e.countdown))

  useEffect(() => {
    // Blink LED every 3 seconds
    const blinkInterval = setInterval(() => {
      setLedBlink((prev) => !prev)
    }, 3000)

    // Update countdowns
    const countdownInterval = setInterval(() => {
      setCountdowns((prev) => prev.map((c) => Math.max(0, c - 1)))
    }, 1000)

    return () => {
      clearInterval(blinkInterval)
      clearInterval(countdownInterval)
    }
  }, [])

  const formatCountdown = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h}h ${m}m ${s}s`
  }

  const getBadgeColor = (badge: Event["badge"]) => {
    switch (badge) {
      case "Online":
        return "bg-blue-500/20 text-blue-500"
      case "Regional":
        return "bg-purple-500/20 text-purple-500"
      case "Pro":
        return "bg-yellow-500/20 text-yellow-500"
    }
  }

  return (
    <MonitorPanel
      title={
        <div className="flex items-center gap-2">
          <span className="text-yellow-500">🏆</span>
          CHALLENGES & EVENTS
          <div
            className={`h-2 w-2 rounded-full bg-red-600 transition-opacity ${ledBlink ? "opacity-100" : "opacity-0"}`}
          />
        </div>
      }
      indicator="red"
    >
      <div className="bg-zinc-950 rounded border border-zinc-700 p-2">
        <div className="grid md:grid-cols-2 gap-2">
          {/* Left column - Active Challenge */}
          <div className="bg-zinc-900 border border-zinc-800 rounded p-2 space-y-2">
            <div className="text-xs font-bold text-yellow-500 tracking-wider">WEEKLY BLITZ — BEAT THE MAP</div>

            <div>
              <div className="text-3xl font-bold text-red-600 mb-1">2,500</div>
              <div className="text-xs text-zinc-500">Prize Points</div>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-xs text-zinc-400 mb-1">
                <span>Community Attempts</span>
                <span>68%</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-red-600 rounded-full" style={{ width: "68%" }} />
              </div>
            </div>

            {/* Bullet list */}
            <ul className="space-y-2 text-sm text-zinc-300">
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-1">•</span>
                <span>Select destination → Drive</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-1">•</span>
                <span>Compare Actual vs Expected</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-1">•</span>
                <span>Share your delta</span>
              </li>
            </ul>

            {/* CTA buttons */}
            <div className="flex gap-2 pt-2">
              <button className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded transition-colors">
                Join Challenge
              </button>
              <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold rounded transition-colors border border-zinc-700">
                View Rules
              </button>
            </div>
          </div>

          {/* Right column - Upcoming Events */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-zinc-500 tracking-wider mb-3">UPCOMING EVENTS</div>
            {EVENTS.map((event, index) => (
              <div
                key={event.id}
                className="bg-zinc-900 border border-zinc-800 rounded p-3 hover:border-zinc-700 transition-colors cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-zinc-400">{event.date}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${getBadgeColor(event.badge)}`}>
                        {event.badge}
                      </span>
                    </div>
                    <div className="text-sm text-white mb-1">{event.description}</div>
                    <div className="text-xs text-zinc-500 font-mono">{formatCountdown(countdowns[index])}</div>
                  </div>
                  <svg
                    className="h-5 w-5 text-zinc-600 group-hover:text-red-600 transition-colors flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer mini-leaderboard */}
        <div className="mt-4 pt-4 border-t border-zinc-800">
          <div className="text-xs font-bold text-zinc-500 tracking-wider mb-2">LEADERBOARD</div>
          <div className="bg-zinc-900 border border-zinc-800 rounded overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-zinc-800">
                <tr>
                  <th className="text-left p-2 font-bold text-zinc-400">Pos</th>
                  <th className="text-left p-2 font-bold text-zinc-400">Driver</th>
                  <th className="text-right p-2 font-bold text-zinc-400">Delta vs Map</th>
                </tr>
              </thead>
              <tbody>
                {LEADERBOARD.map((entry) => (
                  <tr key={entry.pos} className="border-t border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                    <td className="p-2 font-bold">{entry.pos}</td>
                    <td className="p-2 flex items-center gap-2">
                      {entry.driver}
                      {entry.change !== 0 && (
                        <span className={entry.change > 0 ? "text-green-500" : "text-red-500"}>
                          {entry.change > 0 ? "▲" : "▼"}
                        </span>
                      )}
                    </td>
                    <td className={`p-2 text-right font-bold ${entry.delta < 0 ? "text-green-500" : "text-red-500"}`}>
                      {entry.delta > 0 ? "+" : ""}
                      {entry.delta.toFixed(1)}s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MonitorPanel>
  )
}
