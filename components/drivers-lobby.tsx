"use client"

import { useEffect, useState } from "react"
import { MonitorPanel } from "./monitor-panel"

interface Driver {
  id: number
  name: string
  country: string
  status: "READY" | "IN RACE" | "AWAY"
}

const DRIVERS_DATA: Driver[] = [
  { id: 1, name: "Max Verstappen", country: "🇳🇱", status: "IN RACE" },
  { id: 2, name: "Lewis Hamilton", country: "🇬🇧", status: "READY" },
  { id: 3, name: "Charles Leclerc", country: "🇲🇨", status: "READY" },
  { id: 4, name: "Lando Norris", country: "🇬🇧", status: "IN RACE" },
  { id: 5, name: "Carlos Sainz", country: "🇪🇸", status: "READY" },
  { id: 6, name: "Sergio Perez", country: "🇲🇽", status: "AWAY" },
  { id: 7, name: "George Russell", country: "🇬🇧", status: "READY" },
  { id: 8, name: "Fernando Alonso", country: "🇪🇸", status: "IN RACE" },
  { id: 9, name: "Oscar Piastri", country: "🇦🇺", status: "READY" },
  { id: 10, name: "Pierre Gasly", country: "🇫🇷", status: "AWAY" },
  { id: 11, name: "Esteban Ocon", country: "🇫🇷", status: "READY" },
  { id: 12, name: "Lance Stroll", country: "🇨🇦", status: "AWAY" },
  { id: 13, name: "Yuki Tsunoda", country: "🇯🇵", status: "READY" },
  { id: 14, name: "Daniel Ricciardo", country: "🇦🇺", status: "IN RACE" },
  { id: 15, name: "Valtteri Bottas", country: "🇫🇮", status: "READY" },
  { id: 16, name: "Zhou Guanyu", country: "🇨🇳", status: "AWAY" },
  { id: 17, name: "Kevin Magnussen", country: "🇩🇰", status: "READY" },
  { id: 18, name: "Nico Hulkenberg", country: "🇩🇪", status: "READY" },
  { id: 19, name: "Alex Albon", country: "🇹🇭", status: "IN RACE" },
  { id: 20, name: "Logan Sargeant", country: "🇺🇸", status: "AWAY" },
  { id: 21, name: "Oliver Bearman", country: "🇬🇧", status: "READY" },
  { id: 22, name: "Liam Lawson", country: "🇳🇿", status: "READY" },
  { id: 23, name: "Franco Colapinto", country: "🇦🇷", status: "READY" },
  { id: 24, name: "Jack Doohan", country: "🇦🇺", status: "READY" },
]

export function DriversLobby() {
  const [onlineCount, setOnlineCount] = useState(0)
  const [filter, setFilter] = useState<"All" | "Ready" | "In Race">("All")
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    let current = 0
    const target = DRIVERS_DATA.length
    const interval = setInterval(() => {
      if (current < target) {
        current++
        setOnlineCount(current)
      } else {
        clearInterval(interval)
      }
    }, 30)

    return () => clearInterval(interval)
  }, [])

  const filteredDrivers = DRIVERS_DATA.filter((driver) => {
    if (filter === "Ready") return driver.status === "READY"
    if (filter === "In Race") return driver.status === "IN RACE"
    return true
  })

  const getStatusColor = (status: Driver["status"]) => {
    switch (status) {
      case "READY":
        return { bg: "bg-green-500/20", text: "text-green-500", led: "bg-green-500" }
      case "IN RACE":
        return { bg: "bg-orange-500/20", text: "text-orange-500", led: "bg-orange-500" }
      case "AWAY":
        return { bg: "bg-zinc-500/20", text: "text-zinc-500", led: "bg-zinc-500" }
    }
  }

  return (
    <MonitorPanel
      title={
        <div className="flex items-center gap-2">
          DRIVERS IN LOBBY
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
          <div className="text-clamp-primary font-bold text-[#00FF7F] font-[family-name:var(--font-mono)]">
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
              Search drivers…
            </button>
          </div>

          <input
            type="text"
            placeholder="Search drivers…"
            className="hidden md:block flex-1 bg-[#0D0D0D] border border-[#333] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#00FF7F] transition-colors"
            style={{ borderRadius: "8px" }}
          />

          <div className="flex gap-2">
            {(["All", "Ready", "In Race"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 md:flex-none md:px-3 py-2 text-xs font-bold rounded transition-all btn-pit-control touch-target ${
                  filter === f ? "bg-[#00FF7F] text-[#F5F5F5]" : "bg-[#1A1A1A] text-[#9E9E9E] hover:bg-[#222]"
                }`}
                style={{ borderRadius: "8px" }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 max-h-[260px] overflow-y-auto momentum-scroll">
          {filteredDrivers.length > 0 ? (
            filteredDrivers.map((driver) => {
              const colors = getStatusColor(driver.status)
              return (
                <div
                  key={driver.id}
                  className="flex items-center gap-2 md:gap-3 bg-[#0D0D0D] border border-[#1A1A1A] rounded p-2 md:p-3 hover:border-[#333] transition-colors"
                  style={{ borderRadius: "8px" }}
                >
                  <div className={`h-6 md:h-8 w-1 rounded-full ${colors.led} animate-pulse-led flex-shrink-0`} />

                  <div className="h-7 w-7 md:h-10 md:w-10 rounded-full bg-[#1A1A1A] border-2 border-[#333] flex items-center justify-center text-base md:text-xl flex-shrink-0">
                    🏎️
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs md:text-sm truncate text-[#F5F5F5]">{driver.name}</div>
                    <div className="text-[10px] md:text-xs text-[#9E9E9E]">{driver.country}</div>
                  </div>

                  <div
                    className={`px-2 py-1 rounded text-[10px] md:text-xs font-bold ${colors.bg} ${colors.text} flex-shrink-0`}
                    style={{ borderRadius: "8px" }}
                  >
                    {driver.status}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-8 md:py-12 text-[#9E9E9E]">
              <div className="text-3xl md:text-4xl mb-2">🏎️</div>
              <div className="text-xs md:text-sm text-center px-4">No drivers yet — waiting for green light.</div>
            </div>
          )}
        </div>

        <div className="border-t border-[#222] pt-2 text-[10px] md:text-xs text-[#9E9E9E] text-center">
          Tip: Connect SpeedX to join public lobbies.
        </div>
      </div>

      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-[#0D0D0D] p-4 md:hidden">
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => setSearchOpen(false)} className="text-[#00FF7F] touch-target">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <input
              type="text"
              placeholder="Search drivers…"
              autoFocus
              className="flex-1 bg-[#1A1A1A] border border-[#333] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#00FF7F] transition-colors"
              style={{ borderRadius: "8px" }}
            />
          </div>
        </div>
      )}
    </MonitorPanel>
  )
}
