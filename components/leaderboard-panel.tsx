"use client"

import { useEffect, useState, memo } from "react"
import { MonitorPanel } from "./monitor-panel"

interface Driver {
  position: number
  driver: string
  team: string
  time: string
  change: number
}

export function LeaderboardPanel() {
  const [drivers, setDrivers] = useState<Driver[]>([
    { position: 1, driver: "M. VERSTAPPEN", team: "RED BULL", time: "1:42.351", change: 0 },
    { position: 2, driver: "L. HAMILTON", team: "MERCEDES", time: "+0.234", change: 1 },
    { position: 3, driver: "L. NORRIS", team: "MCLAREN", time: "+0.456", change: -1 },
    { position: 4, driver: "C. LECLERC", team: "FERRARI", time: "+0.789", change: 0 },
    { position: 5, driver: "C. SAINZ", team: "FERRARI", time: "+1.123", change: 2 },
    { position: 6, driver: "G. RUSSELL", team: "MERCEDES", time: "+1.456", change: -1 },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setDrivers((prev) => {
        const newDrivers = [...prev]
        if (Math.random() > 0.7) {
          const i = Math.floor(Math.random() * (newDrivers.length - 1))
          ;[newDrivers[i], newDrivers[i + 1]] = [newDrivers[i + 1], newDrivers[i]]
          newDrivers[i].position = i + 1
          newDrivers[i + 1].position = i + 2
          newDrivers[i].change = -1
          newDrivers[i + 1].change = 1
        }
        return newDrivers
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <MonitorPanel title="LIVE STANDINGS" indicator="yellow">
      <div className="bg-zinc-950 rounded border border-zinc-700 overflow-hidden">
        <table className="w-full text-xs md:text-sm">
          <thead className="bg-zinc-900 border-b border-zinc-700">
            <tr>
              <th className="text-left p-2 text-[10px] md:text-xs text-zinc-400">POS</th>
              <th className="text-left p-2 text-[10px] md:text-xs text-zinc-400">DRIVER</th>
              <th className="text-left p-2 text-[10px] md:text-xs text-zinc-400 hidden sm:table-cell">TIME</th>
              <th className="text-center p-2 text-[10px] md:text-xs text-zinc-400">CHG</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver, idx) => (
              <tr
                key={driver.driver}
                className={`border-b border-zinc-800 hover:bg-zinc-900 transition-colors ${idx === 0 ? "bg-red-950/20" : ""}`}
              >
                <td className="p-2">
                  <span className={`font-bold text-xs md:text-sm ${idx === 0 ? "text-[#00FF7F]" : "text-white"}`}>
                    {driver.position}
                  </span>
                </td>
                <td className="p-2">
                  <div className="font-bold text-xs md:text-sm">{driver.driver}</div>
                  <div className="text-[10px] md:text-xs text-zinc-500">{driver.team}</div>
                </td>
                <td className="p-2 font-mono text-[10px] md:text-xs hidden sm:table-cell">{driver.time}</td>
                <td className="p-2 text-center">
                  {driver.change > 0 && <span className="text-green-500 text-[10px] md:text-xs">▲{driver.change}</span>}
                  {driver.change < 0 && (
                    <span className="text-red-500 text-[10px] md:text-xs">▼{Math.abs(driver.change)}</span>
                  )}
                  {driver.change === 0 && <span className="text-zinc-600 text-[10px] md:text-xs">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MonitorPanel>
  )
}
