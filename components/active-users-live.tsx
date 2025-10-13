"use client"

import { useEffect, useState } from "react"
import { MonitorPanel } from "./monitor-panel"
import { supabase } from "@/lib/supabase"

interface ActiveUser {
  id: string
  user_id: string
  username: string
  mode: "simple" | "blitz"
  started_at: string
  last_heartbeat: string
}

export function ActiveUsersLive() {
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([])
  const [onlineCount, setOnlineCount] = useState(0)
  const [filter, setFilter] = useState<"All" | "Simple" | "Blitz">("All")
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    // Fetch initial active users
    fetchActiveUsers()

    // Subscribe to real-time updates
    const channel = supabase
      .channel('active-sessions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'active_sessions'
        },
        () => {
          console.log('🔄 Active sessions changed, refreshing...')
          fetchActiveUsers()
        }
      )
      .subscribe()

    // Auto-refresh every 30 seconds to clean up stale sessions
    const interval = setInterval(fetchActiveUsers, 30000)

    return () => {
      channel.unsubscribe()
      clearInterval(interval)
    }
  }, [])

  const fetchActiveUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('active_sessions')
        .select('*')
        .order('started_at', { ascending: false })

      if (error) throw error

      setActiveUsers(data || [])
      setOnlineCount(data?.length || 0)
    } catch (error) {
      console.error('Error fetching active users:', error)
    }
  }

  const filteredUsers = activeUsers.filter((user) => {
    const matchesFilter = 
      filter === "All" ||
      (filter === "Simple" && user.mode === "simple") ||
      (filter === "Blitz" && user.mode === "blitz")
    
    const matchesSearch = searchQuery === "" || 
      user.username.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesFilter && matchesSearch
  })

  const getStatusColor = (mode: "simple" | "blitz") => {
    switch (mode) {
      case "simple":
        return { bg: "bg-green-500/20", text: "text-green-500", led: "bg-green-500" }
      case "blitz":
        return { bg: "bg-orange-500/20", text: "text-orange-500", led: "bg-orange-500" }
    }
  }

  return (
    <MonitorPanel
      title={
        <div className="flex items-center gap-2">
          ACTIVE USERS LIVE
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-[#00FF7F] animate-pulse-led" />
            <span className="text-xs text-[#00FF7F] font-[family-name:var(--font-mono)]">LIVE</span>
          </div>
        </div>
      }
      indicator="green"
      variant="secondary"
    >
      <div
        className="bg-[#0C0C0C] rounded border border-[#222] p-2 flex flex-col gap-2"
        style={{ borderRadius: "8px" }}
      >
        <div className="text-center">
          <div className="text-clamp-primary font-bold text-[#E10600] font-[family-name:var(--font-mono)]">
            {onlineCount}
          </div>
          <div className="text-xs md:text-sm text-[#9E9E9E] font-[family-name:var(--font-heading)] tracking-wide">
            ONLINE
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2 md:hidden">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex-1 bg-[#0D0D0D] border border-[#333] rounded px-3 py-2 text-sm flex items-center gap-2 text-[#9E9E9E] touch-target"
              style={{ borderRadius: "8px" }}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Search users…
            </button>
          </div>

          <input
            type="text"
            placeholder="Search users…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="hidden md:block flex-1 bg-[#0D0D0D] border border-[#333] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#E10600] transition-colors"
            style={{ borderRadius: "8px" }}
          />

          <div className="flex gap-2">
            {(["All", "Simple", "Blitz"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 md:flex-none md:px-3 py-2 text-xs font-bold rounded transition-all btn-pit-control touch-target ${
                  filter === f ? "bg-[#E10600] text-[#F5F5F5]" : "bg-[#1A1A1A] text-[#9E9E9E] hover:bg-[#222]"
                }`}
                style={{ borderRadius: "8px" }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 max-h-[260px] overflow-y-auto momentum-scroll">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => {
              const colors = getStatusColor(user.mode)
              return (
                <div
                  key={user.id}
                  className="flex items-center gap-2 md:gap-3 bg-[#0D0D0D] border border-[#1A1A1A] rounded p-2 md:p-3 hover:border-[#333] transition-colors"
                  style={{ borderRadius: "8px" }}
                >
                  <div className={`h-6 md:h-8 w-1 rounded-full ${colors.led} animate-pulse-led flex-shrink-0`} />

                  <div className="h-7 w-7 md:h-10 md:w-10 rounded-full bg-[#1A1A1A] border-2 border-[#333] flex items-center justify-center text-base md:text-xl flex-shrink-0">
                    {user.mode === 'blitz' ? '⚡' : '🚗'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs md:text-sm truncate text-[#F5F5F5]">{user.username}</div>
                    <div className="text-[10px] md:text-xs text-[#9E9E9E]">
                      Started {new Date(user.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div
                    className={`px-2 py-1 rounded text-[10px] md:text-xs font-bold ${colors.bg} ${colors.text} flex-shrink-0 uppercase`}
                    style={{ borderRadius: "8px" }}
                  >
                    {user.mode}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-8 md:py-12 text-[#9E9E9E]">
              <div className="text-3xl md:text-4xl mb-2">🏎️</div>
              <div className="text-xs md:text-sm text-center px-4">No active users — waiting for drivers to start.</div>
            </div>
          )}
        </div>

        <div className="border-t border-[#222] pt-2 text-[10px] md:text-xs text-[#9E9E9E] text-center">
          Live updates from SpeedX app
        </div>
      </div>

      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-[#0D0D0D] p-4 md:hidden">
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => setSearchOpen(false)} className="text-[#E10600] touch-target">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <input
              type="text"
              placeholder="Search users…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="flex-1 bg-[#1A1A1A] border border-[#333] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#E10600] transition-colors"
              style={{ borderRadius: "8px" }}
            />
          </div>
        </div>
      )}
    </MonitorPanel>
  )
}
