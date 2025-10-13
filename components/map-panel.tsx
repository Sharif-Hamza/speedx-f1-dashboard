"use client"

import { useEffect, useState } from "react"
import { MonitorPanel } from "./monitor-panel"

interface CarPosition {
  id: number
  x: number
  y: number
  color: string
  driver: string
}

export function MapPanel() {
  const [cars, setCars] = useState<CarPosition[]>([
    { id: 1, x: 20, y: 30, color: "bg-red-600", driver: "VER" },
    { id: 2, x: 15, y: 45, color: "bg-blue-600", driver: "HAM" },
    { id: 3, x: 25, y: 60, color: "bg-orange-600", driver: "NOR" },
    { id: 4, x: 40, y: 25, color: "bg-green-600", driver: "LEC" },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setCars((prev) =>
        prev.map((car) => ({
          ...car,
          x: (car.x + Math.random() * 4 - 2 + 100) % 100,
          y: (car.y + Math.random() * 4 - 2 + 100) % 100,
        })),
      )
    }, 100)

    return () => clearInterval(interval)
  }, [])

  return (
    <MonitorPanel title="TRACK MAP - CIRCUIT DE MONACO" indicator="green">
      <div className="relative h-96 bg-zinc-950 rounded border border-zinc-700 overflow-hidden">
        {/* Track outline */}
        <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100">
          <path
            d="M 20 20 Q 40 10, 60 20 T 80 40 Q 85 60, 70 75 T 40 85 Q 20 80, 20 60 T 20 20"
            fill="none"
            stroke="white"
            strokeWidth="8"
            strokeLinecap="round"
          />
        </svg>

        {/* Checkered flag pattern overlay */}
        <div className="absolute top-2 right-2 w-12 h-12 opacity-20">
          <div className="grid grid-cols-4 grid-rows-4 h-full w-full">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className={`${i % 2 === Math.floor(i / 4) % 2 ? "bg-white" : "bg-black"}`} />
            ))}
          </div>
        </div>

        {/* Animated car dots */}
        {cars.map((car) => (
          <div
            key={car.id}
            className="absolute transition-all duration-100 ease-linear"
            style={{ left: `${car.x}%`, top: `${car.y}%` }}
          >
            <div className={`h-4 w-4 rounded-full ${car.color} animate-pulse shadow-lg shadow-current`} />
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold whitespace-nowrap bg-black px-1 rounded">
              {car.driver}
            </div>
          </div>
        ))}

        {/* Sector markers */}
        <div className="absolute top-4 left-4 text-xs text-zinc-500">SECTOR 1</div>
        <div className="absolute top-4 right-4 text-xs text-zinc-500">SECTOR 2</div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-zinc-500">SECTOR 3</div>
      </div>
    </MonitorPanel>
  )
}
