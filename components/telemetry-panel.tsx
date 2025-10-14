"use client"

import { useEffect, useState } from "react"
import { MonitorPanel } from "./monitor-panel"

export function TelemetryPanel() {
  const [data, setData] = useState<number[]>(
    Array(50)
      .fill(0)
      .map(() => Math.random() * 100),
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => [...prev.slice(1), Math.random() * 100])
    }, 100)

    return () => clearInterval(interval)
  }, [])

  return (
    <MonitorPanel title="LIVE TELEMETRY - SPEED & G-FORCE" indicator="green">
      <div className="h-64 bg-zinc-950 rounded border border-zinc-700 p-4 relative overflow-hidden">
        {/* Grid lines */}
        <div className="absolute inset-0 grid grid-rows-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border-b border-zinc-800" />
          ))}
        </div>

        {/* Speed graph */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <polyline
            points={data.map((val, i) => `${(i / data.length) * 100},${100 - val}`).join(" ")}
            fill="none"
            stroke="rgb(220, 38, 38)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* G-Force graph */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <polyline
            points={data.map((val, i) => `${(i / data.length) * 100},${100 - (val * 0.7 + 15)}`).join(" ")}
            fill="none"
            stroke="rgb(34, 197, 94)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Legend */}
        <div className="absolute top-2 right-2 flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 bg-[#00FF7F] rounded-full" />
            <span>SPEED</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 bg-green-500 rounded-full" />
            <span>G-FORCE</span>
          </div>
        </div>

        {/* Values */}
        <div className="absolute bottom-2 left-2 text-xs text-zinc-400">
          <div>
            SPEED: <span className="text-[#00FF7F] font-bold">{Math.round(data[data.length - 1] * 3.5)} KM/H</span>
          </div>
          <div>
            G-FORCE: <span className="text-green-500 font-bold">{(data[data.length - 1] * 0.05).toFixed(2)}G</span>
          </div>
        </div>
      </div>
    </MonitorPanel>
  )
}
