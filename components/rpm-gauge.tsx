"use client"

import { useEffect, useState } from "react"
import { MonitorPanel } from "./monitor-panel"

export function RPMGauge() {
  const [rpm, setRpm] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      setRpm(Math.min(scrollPercent * 150, 15000))
    }

    window.addEventListener("scroll", handleScroll)

    // Animate on mount
    const interval = setInterval(() => {
      setRpm((prev) => {
        const target = 8000 + Math.sin(Date.now() / 1000) * 3000
        return prev + (target - prev) * 0.1
      })
    }, 50)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      clearInterval(interval)
    }
  }, [])

  const rotation = (rpm / 15000) * 270 - 135

  return (
    <MonitorPanel title="ENGINE RPM" indicator="red">
      <div className="bg-zinc-950 rounded border border-zinc-700 p-6 flex flex-col items-center justify-center">
        <div className="relative w-48 h-48">
          {/* Gauge background */}
          <svg className="w-full h-full" viewBox="0 0 200 200">
            {/* Gauge arc */}
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="rgb(39, 39, 42)"
              strokeWidth="12"
              strokeDasharray="377"
              strokeDashoffset="94"
              transform="rotate(-135 100 100)"
            />
            {/* Active arc */}
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="rgb(220, 38, 38)"
              strokeWidth="12"
              strokeDasharray="377"
              strokeDashoffset={377 - (rpm / 15000) * 283}
              transform="rotate(-135 100 100)"
              className="transition-all duration-100"
            />
            {/* Tick marks */}
            {Array.from({ length: 16 }).map((_, i) => {
              const angle = -135 + (i * 270) / 15
              const rad = (angle * Math.PI) / 180
              const x1 = 100 + Math.cos(rad) * 70
              const y1 = 100 + Math.sin(rad) * 70
              const x2 = 100 + Math.cos(rad) * (i % 5 === 0 ? 60 : 65)
              const y2 = 100 + Math.sin(rad) * (i % 5 === 0 ? 60 : 65)
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={rpm > (i / 15) * 15000 ? "rgb(220, 38, 38)" : "rgb(63, 63, 70)"}
                  strokeWidth={i % 5 === 0 ? "2" : "1"}
                />
              )
            })}
            {/* Needle */}
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="30"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              transform={`rotate(${rotation} 100 100)`}
              className="transition-transform duration-100"
            />
            {/* Center dot */}
            <circle cx="100" cy="100" r="8" fill="rgb(220, 38, 38)" />
          </svg>
        </div>
        <div className="text-center mt-4">
          <div className="text-4xl font-bold text-red-600">{Math.round(rpm)}</div>
          <div className="text-xs text-zinc-500">RPM</div>
        </div>
      </div>
    </MonitorPanel>
  )
}
