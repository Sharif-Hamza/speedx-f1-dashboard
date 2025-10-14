"use client"

import { useEffect, useState } from "react"
import { MonitorPanel } from "./monitor-panel"

export function LapTimer() {
  const [time, setTime] = useState(0)
  const [lap, setLap] = useState(12)
  const [blink, setBlink] = useState(false)
  const [showStickyTimer, setShowStickyTimer] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => {
        const newTime = prev + 0.01
        if (newTime >= 90) {
          setLap((l) => l + 1)
          return 0
        }
        return newTime
      })
    }, 10)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink((prev) => !prev)
    }, 1000)

    return () => clearInterval(blinkInterval)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const lapTimerElement = document.getElementById("lap")
      if (lapTimerElement) {
        const rect = lapTimerElement.getBoundingClientRect()
        setShowStickyTimer(rect.bottom < 0)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  const milliseconds = Math.floor((time % 1) * 1000)

  return (
    <>
      <MonitorPanel title="LAP TIMER" indicator="cyan" variant="primary">
        <div
          className="bg-[#0C0C0C] rounded border border-[#222] p-3 flex flex-col h-full"
          style={{ borderRadius: "8px" }}
          id="lap"
        >
          <div className="flex flex-col items-center justify-center">
            <div className="text-xs md:text-sm text-[#9E9E9E] mb-1 md:mb-2 font-[family-name:var(--font-heading)] tracking-wide">
              LAP {lap} / 58
            </div>

            <div
              className="font-[family-name:var(--font-mono)] text-3xl md:text-5xl font-bold text-[#F5F5F5] leading-none animate-flicker"
              style={{ letterSpacing: "-0.02em" }}
            >
              {minutes}:{seconds.toString().padStart(2, "0")}
              <span className="text-lg md:text-2xl text-[#00FF7F]">.{milliseconds.toString().padStart(3, "0")}</span>
            </div>

            <div className="w-full mt-4 md:mt-6">
              <div className="flex justify-between text-[10px] md:text-xs text-[#9E9E9E] mb-1 font-[family-name:var(--font-heading)]">
                <span className="flex items-center gap-1">
                  LAP PROGRESS
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-opacity ${
                      blink ? "bg-[#00FF7F] opacity-100" : "bg-[#00FF7F] opacity-30"
                    }`}
                  />
                </span>
                <span className="font-[family-name:var(--font-mono)]">{Math.round((time / 90) * 100)}%</span>
              </div>
              <div className="h-3 md:h-2 bg-[#0D0D0D] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00FF7F] transition-all duration-100"
                  style={{ width: `${(time / 90) * 100}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4 w-full mt-3 md:mt-4 pt-3 md:pt-4 border-t border-[#222] text-xs md:text-sm">
              <div>
                <div className="text-[#9E9E9E] text-[10px] md:text-xs font-[family-name:var(--font-heading)] tracking-wide">
                  BEST LAP
                </div>
                <div className="font-bold text-[#00FF7F] font-[family-name:var(--font-mono)] text-sm md:text-base">
                  1:42.351
                </div>
              </div>
              <div>
                <div className="text-[#9E9E9E] text-[10px] md:text-xs font-[family-name:var(--font-heading)] tracking-wide">
                  LAST LAP
                </div>
                <div className="font-bold font-[family-name:var(--font-mono)] text-[#F5F5F5] text-sm md:text-base">
                  1:43.127
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-[#222] flex-1 flex flex-col">
            <div className="text-[10px] md:text-xs text-[#9E9E9E] mb-2 md:mb-3 font-semibold tracking-wide font-[family-name:var(--font-heading)]">
              LAP COMPARISON
            </div>

            <div className="space-y-2 md:space-y-3">
              <div>
                <div className="flex justify-between text-[9px] md:text-[10px] text-[#9E9E9E] mb-1 font-[family-name:var(--font-heading)]">
                  <span>CURRENT</span>
                  <span
                    className="px-2 py-0.5 bg-[#00FF7F]/20 text-[#00FF7F] rounded font-bold font-[family-name:var(--font-mono)]"
                    style={{ borderRadius: "8px" }}
                  >
                    +0.432s
                  </span>
                </div>
                <div className="h-3 md:h-4 bg-[#0D0D0D] rounded overflow-hidden" style={{ borderRadius: "8px" }}>
                  <div className="h-full bg-[#00FF7F] rounded" style={{ width: "98.5%", borderRadius: "8px" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[9px] md:text-[10px] text-[#9E9E9E] mb-1 font-[family-name:var(--font-heading)]">
                  <span>BEST</span>
                  <span className="text-[#00FF7F] font-[family-name:var(--font-mono)] font-bold">1:42.351</span>
                </div>
                <div className="h-3 md:h-4 bg-[#0D0D0D] rounded overflow-hidden" style={{ borderRadius: "8px" }}>
                  <div className="h-full bg-[#00FF7F] rounded" style={{ width: "100%", borderRadius: "8px" }} />
                </div>
              </div>
            </div>

            <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-[#222]">
              <div className="text-[10px] md:text-xs text-[#9E9E9E] mb-2 font-semibold tracking-wide font-[family-name:var(--font-heading)]">
                SECTOR SPLITS
              </div>
              <div className="flex justify-between items-center text-[10px] md:text-[11px] font-[family-name:var(--font-mono)]">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00FF7F] animate-pulse-led" />
                  <span className="text-[#9E9E9E]">S1:</span>
                  <span className="text-[#F5F5F5] font-bold">32.015</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00FF7F] animate-pulse-led" />
                  <span className="text-[#9E9E9E]">S2:</span>
                  <span className="text-[#F5F5F5] font-bold">27.912</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00FF7F] animate-pulse-led" />
                  <span className="text-[#9E9E9E]">S3:</span>
                  <span className="text-[#F5F5F5] font-bold">42.424</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MonitorPanel>

      {showStickyTimer && (
        <div className="fixed top-14 left-0 right-0 z-40 bg-[#0D0D0D] border-b-2 border-[#00FF7F] p-2 md:hidden shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#9E9E9E] font-[family-name:var(--font-heading)]">LAP {lap}</span>
              <span className="font-[family-name:var(--font-mono)] text-sm font-bold text-[#F5F5F5]">
                {minutes}:{seconds.toString().padStart(2, "0")}.{milliseconds.toString().padStart(3, "0")}
              </span>
            </div>
            <button
              onClick={() => {
                const element = document.getElementById("lap")
                element?.scrollIntoView({ behavior: "smooth" })
              }}
              className="text-xs text-[#00FF7F] font-bold"
            >
              VIEW
            </button>
          </div>
          <div className="h-1 bg-[#1A1A1A] rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-[#00FF7F] transition-all duration-100"
              style={{ width: `${(time / 90) * 100}%` }}
            />
          </div>
        </div>
      )}
    </>
  )
}
