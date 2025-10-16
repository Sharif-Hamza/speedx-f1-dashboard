"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { MonitorPanel } from "./monitor-panel"

interface PointEntry {
  id: string
  user_id: string
  username: string
  challenge_id: string | null
  points: number
  completion_time_seconds: number
  expected_time_seconds: number
  time_delta_seconds: number
  distance_meters: number
  created_at: string
}

export function UserPointsFeed() {
  const [entries, setEntries] = useState<PointEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPointsEntries()

    // Subscribe to real-time updates
    const channel = supabase
      .channel('points-feed')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blitz_points',
        },
        () => {
          fetchPointsEntries()
        }
      )
      .subscribe()

    // Refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      fetchPointsEntries()
    }, 30000)

    return () => {
      clearInterval(refreshInterval)
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchPointsEntries() {
    setLoading(true)
    const { data, error } = await supabase
      .from('blitz_points')
      .select(`
        id,
        user_id,
        challenge_id,
        points,
        completion_time_seconds,
        expected_time_seconds,
        time_delta_seconds,
        distance_meters,
        created_at,
        profiles:user_id (
          username
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    if (!error && data) {
      const mappedData = data.map((entry: any) => ({
        ...entry,
        username: entry.profiles?.username || 'Anonymous User'
      }))
      setEntries(mappedData)
    }
    setLoading(false)
  }

  if (loading && entries.length === 0) {
    return (
      <MonitorPanel title="LIVE POINTS FEED" indicator="green">
        <div className="bg-zinc-950 rounded border border-zinc-700 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00FF7F] mx-auto"></div>
          <p className="text-zinc-400 mt-4 text-sm">Loading points feed...</p>
        </div>
      </MonitorPanel>
    )
  }

  if (entries.length === 0) {
    return (
      <MonitorPanel title="LIVE POINTS FEED" indicator="gray">
        <div className="bg-zinc-950 rounded border border-zinc-700 p-8 text-center">
          <p className="text-zinc-400 text-sm">No points entries yet</p>
          <p className="text-zinc-500 text-xs mt-2">Complete Blitz challenges to earn points!</p>
        </div>
      </MonitorPanel>
    )
  }

  return (
    <MonitorPanel title="LIVE POINTS FEED 📊" indicator="green">
      <div className="bg-zinc-950 rounded border border-zinc-700 overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="bg-zinc-900 sticky top-0">
              <tr className="border-b border-zinc-700">
                <th className="text-left p-2 font-mono text-[#00FF7F]">USER</th>
                <th className="text-center p-2 font-mono text-[#00FF7F]">POINTS</th>
                <th className="text-center p-2 font-mono text-[#00FF7F]">DELTA</th>
                <th className="text-center p-2 font-mono text-[#00FF7F]">DISTANCE</th>
                <th className="text-right p-2 font-mono text-[#00FF7F]">TIME</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const timeSaved = -entry.time_delta_seconds
                const beatETA = timeSaved > 0
                const distanceKm = (entry.distance_meters / 1000).toFixed(2)
                const isIncomplete = entry.time_delta_seconds === 0 && entry.points === 0
                const isCompletion = entry.points === 1 && !beatETA
                
                return (
                  <tr 
                    key={entry.id} 
                    className="border-b border-zinc-800 hover:bg-zinc-900 transition-colors"
                  >
                    <td className="p-2">
                      <div className="font-mono text-zinc-200">{entry.username}</div>
                    </td>
                    <td className="p-2 text-center">
                      {isIncomplete ? (
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-mono text-xs text-red-400">❌</span>
                          <span className="font-mono text-xs text-zinc-500">INC</span>
                        </div>
                      ) : (
                        <span className={`font-mono font-bold ${
                          entry.points >= 5 ? 'text-yellow-400' :
                          entry.points >= 3 ? 'text-blue-400' :
                          entry.points >= 2 ? 'text-green-400' :
                          'text-zinc-400'
                        }`}>
                          {entry.points}
                        </span>
                      )}
                    </td>
                    <td className="p-2 text-center">
                      {isIncomplete ? (
                        <span className="font-mono text-xs text-zinc-600">-</span>
                      ) : (
                        <span className={`font-mono text-xs ${
                          beatETA ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {beatETA ? '+' : ''}{(timeSaved / 60).toFixed(1)}m
                        </span>
                      )}
                    </td>
                    <td className="p-2 text-center">
                      <span className="font-mono text-xs text-zinc-400">
                        {distanceKm}km
                      </span>
                    </td>
                    <td className="p-2 text-right">
                      <span className="font-mono text-xs text-zinc-500">
                        {new Date(entry.created_at).toLocaleTimeString()}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </MonitorPanel>
  )
}
