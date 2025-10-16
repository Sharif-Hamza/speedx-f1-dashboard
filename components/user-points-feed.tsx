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
    console.log('Fetching points feed entries...')
    
    // Fetch points data without join
    const { data: pointsData, error: pointsError } = await supabase
      .from('blitz_points')
      .select('id, user_id, challenge_id, points, completion_time_seconds, expected_time_seconds, time_delta_seconds, distance_meters, created_at')
      .order('created_at', { ascending: false })
      .limit(50)

    console.log('Points feed result:', { 
      count: pointsData?.length || 0, 
      error: pointsError, 
      sampleUserId: pointsData?.[0]?.user_id,
      sampleEntry: pointsData?.[0] 
    })

    if (!pointsError && pointsData && pointsData.length > 0) {
      // Get unique user IDs
      const userIds = [...new Set(pointsData.map(p => p.user_id))]
      
      // Fetch usernames - get all columns to see what's available
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds)
      
      console.log('Profiles data:', { 
        count: profilesData?.length, 
        error: profilesError, 
        errorDetails: profilesError ? JSON.stringify(profilesError) : null,
        userIds: userIds.slice(0, 3),
        sample: profilesData?.[0] 
      })
      
      // Create username map - try multiple possible username fields
      const usernameMap = new Map<string, string>()
      
      if (profilesData && profilesData.length > 0) {
        profilesData.forEach((profile: any) => {
          const username = profile.username || profile.name || profile.display_name || profile.email || null
          if (username) {
            usernameMap.set(profile.id, username)
          }
        })
      } else if (profilesError) {
        console.warn('Profiles query failed, users will show as User <id>')
      }
      
      console.log('Username map:', Object.fromEntries(usernameMap))
      
      // Map data with usernames
      const mappedData = pointsData.map((entry: any) => ({
        ...entry,
        username: usernameMap.get(entry.user_id) || `User ${entry.user_id?.slice(0, 8) || 'Unknown'}`
      }))
      
      setEntries(mappedData)
      console.log('Mapped entries:', mappedData.length)
    } else if (pointsError) {
      console.error('Error fetching points:', pointsError)
      setEntries([])
    } else {
      setEntries([])
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
