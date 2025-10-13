"use client"

import { MonitorPanel } from "./monitor-panel"

export function AppPromo() {
  return (
    <MonitorPanel
      title={
        <div className="flex items-center justify-between w-full">
          <span>SPEEDX APP</span>
          {/* Checkered flag accent */}
          <div className="w-6 h-6 md:w-8 md:h-8 opacity-30">
            <div className="grid grid-cols-4 grid-rows-4 h-full w-full">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className={`${i % 2 === Math.floor(i / 4) % 2 ? "bg-white" : "bg-black"}`} />
              ))}
            </div>
          </div>
        </div>
      }
      indicator="red"
    >
      <div className="relative bg-zinc-950 rounded border border-zinc-700 p-2 md:p-4 overflow-hidden">
        {/* Faint background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className={`${i % 2 === Math.floor(i / 8) % 2 ? "bg-white" : "bg-transparent"}`} />
            ))}
          </div>
        </div>

        <div className="relative flex flex-col md:grid md:grid-cols-2 gap-3 md:gap-4 items-center">
          <div className="md:hidden flex flex-col items-center text-center space-y-4">
            {/* App icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 shadow-lg flex items-center justify-center text-2xl font-bold text-white border-2 border-red-500">
              SX
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Track. Drive. Compete.</h2>
              <p className="text-zinc-400 text-sm">High-speed trip tracking with Simple Drive & Blitz.</p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col w-full gap-2">
              <button className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded transition-colors flex items-center justify-center gap-2 touch-target">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <span className="text-sm">Download App</span>
              </button>
              <button className="w-full px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded transition-colors border border-zinc-700 touch-target">
                <span className="text-sm">Watch Demo</span>
              </button>
            </div>

            {/* Mock phone - smaller on mobile */}
            <div className="relative w-48">
              <div className="w-full aspect-[9/19] bg-zinc-900 rounded-[2rem] border-4 border-zinc-800 shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-zinc-800 rounded-b-xl z-10" />
                <div className="w-full h-full bg-zinc-950 flex items-center justify-center relative">
                  <div className="absolute inset-0 opacity-10">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute h-px bg-red-600"
                        style={{
                          top: `${i * 5}%`,
                          left: 0,
                          right: 0,
                          transform: `rotate(${i * 9}deg)`,
                        }}
                      />
                    ))}
                  </div>
                  <div className="text-center z-10">
                    <div className="text-4xl mb-1">📱</div>
                    <div className="text-[10px] text-zinc-600">App Screenshot</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap justify-center gap-2">
              {["Simple Drive", "Blitz", "Stats", "Safety"].map((badge) => (
                <div
                  key={badge}
                  className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] text-zinc-400"
                >
                  {badge}
                </div>
              ))}
            </div>

            {/* Disclaimer */}
            <div className="text-[10px] text-zinc-600 border-t border-zinc-800 pt-3 w-full">
              Disclaimer: Intended for track/closed course use.
            </div>
          </div>

          <div className="hidden md:block md:col-span-2">
            <div className="grid md:grid-cols-2 gap-4 items-center">
              {/* Left side - Hero copy */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-4xl font-bold text-white mb-2">Track. Drive. Compete.</h2>
                  <p className="text-zinc-400 text-lg">High-speed trip tracking with Simple Drive & Blitz.</p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded transition-colors flex items-center gap-2">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                    </svg>
                    Download on App Store
                  </button>
                  <button className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded transition-colors border border-zinc-700">
                    Watch Demo
                  </button>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {["Simple Drive", "Blitz", "Stats", "Safety"].map((badge) => (
                    <div
                      key={badge}
                      className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs text-zinc-400"
                    >
                      {badge}
                    </div>
                  ))}
                </div>

                {/* Disclaimer */}
                <div className="text-xs text-zinc-600 border-t border-zinc-800 pt-4">
                  Disclaimer: Intended for track/closed course use.
                </div>
              </div>

              {/* Right side - Mock phone */}
              <div className="flex flex-col items-center gap-4">
                {/* App icon */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 shadow-lg flex items-center justify-center text-3xl font-bold text-white border-2 border-red-500">
                  SX
                </div>

                {/* Mock iPhone */}
                <div className="relative">
                  <div className="w-64 h-[500px] bg-zinc-900 rounded-[3rem] border-8 border-zinc-800 shadow-2xl overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-800 rounded-b-2xl z-10" />
                    <div className="w-full h-full bg-zinc-950 flex items-center justify-center relative">
                      <div className="absolute inset-0 opacity-10">
                        {Array.from({ length: 20 }).map((_, i) => (
                          <div
                            key={i}
                            className="absolute h-px bg-red-600"
                            style={{
                              top: `${i * 5}%`,
                              left: 0,
                              right: 0,
                              transform: `rotate(${i * 9}deg)`,
                            }}
                          />
                        ))}
                      </div>
                      <div className="text-center z-10">
                        <div className="text-6xl mb-2">📱</div>
                        <div className="text-xs text-zinc-600">App Screenshot</div>
                        <div className="text-xs text-zinc-600">Placeholder</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MonitorPanel>
  )
}
