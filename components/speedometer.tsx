"use client"

import { useEffect, useState } from "react"
import { MonitorPanel } from "./monitor-panel"

export function Speedometer() {
  const [speed, setSpeed] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setSpeed((prev) => {
        const target = 280 + Math.sin(Date.now() / 1500) * 50
        return prev + (target - prev) * 0.1
      })
    }, 50)

    return () => clearInterval(interval)
  }, [])

  const speedDistribution = [
    { segment: 1, speed: 245 },
    { segment: 2, speed: 298 },
    { segment: 3, speed: 312 },
    { segment: 4, speed: 285 },
    { segment: 5, speed: 267 },
    { segment: 6, speed: 295 },
    { segment: 7, speed: 318 },
    { segment: 8, speed: 302 },
    { segment: 9, speed: 276 },
    { segment: 10, speed: 289 },
  ]

  return (
    <MonitorPanel title="AVERAGE SPEED" indicator="green" variant="primary">
        <div
          className="bg-[#0C0C0C] rounded border border-[#222] p-3 flex flex-col h-full"
          style={{ borderRadius: "8px" }}
        >
        <div className="flex flex-col items-center justify-center">
          <div className="relative">
            <div className="text-clamp-primary font-bold text-[#F5F5F5] leading-none font-[family-name:var(--font-mono)] animate-flicker">
              {Math.round(speed)}
            </div>
            <div className="absolute -bottom-1 md:-bottom-2 right-0 text-base md:text-xl text-[#9E9E9E] font-[family-name:var(--font-mono)]">
              KM/H
            </div>
          </div>

          <div className="w-full mt-4 md:mt-6 h-4 md:h-3 bg-[#0D0D0D] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00FF7F] via-[#FFB300] to-[#E10600] transition-all duration-100"
              style={{ width: `${(speed / 350) * 100}%` }}
            />
          </div>

          <div className="flex justify-between w-full mt-2 text-[10px] md:text-xs text-[#9E9E9E] font-[family-name:var(--font-mono)]">
            <span>0</span>
            <span>350</span>
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4 w-full mt-3 md:mt-4 pt-3 md:pt-4 border-t border-[#222] text-xs md:text-sm">
            <div>
              <div className="text-[#9E9E9E] text-[10px] md:text-xs font-[family-name:var(--font-heading)] tracking-wide">
                TOP SPEED
              </div>
              <div className="font-bold text-[#E10600] font-[family-name:var(--font-mono)] text-sm md:text-base">
                342 KM/H
              </div>
            </div>
            <div>
              <div className="text-[#9E9E9E] text-[10px] md:text-xs font-[family-name:var(--font-heading)] tracking-wide">
                MIN SPEED
              </div>
              <div className="font-bold text-[#F5F5F5] font-[family-name:var(--font-mono)] text-sm md:text-base">
                87 KM/H
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-[#222] flex-1 flex flex-col">
          <div className="text-[10px] md:text-xs text-[#9E9E9E] mb-2 md:mb-3 font-semibold tracking-wide font-[family-name:var(--font-heading)]">
            SPEED DISTRIBUTION
          </div>

          <div className="md:hidden h-12 relative">
            <div className="absolute inset-0 flex items-end justify-between gap-0.5">
              {speedDistribution.map((data, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-[#E10600] to-[#FF3131] rounded-t"
                  style={{ height: `${(data.speed / 350) * 100}%`, borderRadius: "4px 4px 0 0" }}
                />
              ))}
            </div>
          </div>

          <div className="hidden md:block flex-1 relative">
            <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-[10px] text-[#9E9E9E] font-[family-name:var(--font-mono)]">
              <span>350</span>
              <span>300</span>
              <span>250</span>
              <span>200</span>
              <span>150</span>
            </div>

            <div className="absolute left-10 right-0 top-0 bottom-0 flex flex-col justify-between">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-px bg-[#222]" />
              ))}
            </div>

            <div className="absolute left-10 right-0 top-0 bottom-0 flex items-end justify-between gap-1 pb-1">
              {speedDistribution.map((data, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-[#E10600] to-[#FF3131] rounded-t transition-all hover:opacity-80 cursor-pointer relative group"
                  style={{ height: `${(data.speed / 350) * 100}%`, borderRadius: "8px 8px 0 0" }}
                >
                  <div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0D0D0D] border border-[#333] px-2 py-1 rounded text-[10px] whitespace-nowrap pointer-events-none"
                    style={{ borderRadius: "8px" }}
                  >
                    <div className="text-[#F5F5F5] font-bold font-[family-name:var(--font-mono)]">
                      {data.speed} KM/H
                    </div>
                    <div className="text-[#9E9E9E]">Segment {data.segment}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 md:mt-4 pt-2 md:pt-3 border-t border-[#222] text-[9px] md:text-[10px] font-[family-name:var(--font-mono)]">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-0 md:flex md:justify-center md:gap-2">
              <div className="text-center">
                <div className="text-[#9E9E9E] mb-0.5">Peak Accel</div>
                <div className="text-[#E10600] font-bold">2.7 G</div>
              </div>
              <div className="text-center">
                <div className="text-[#9E9E9E] mb-0.5">Avg Segment</div>
                <div className="text-[#F5F5F5] font-bold">295 KM/H</div>
              </div>
              <div className="text-center col-span-2 md:col-span-1">
                <div className="text-[#9E9E9E] mb-0.5">Fastest Section</div>
                <div className="text-[#F5F5F5] font-bold">Sector 2</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MonitorPanel>
  )
}
