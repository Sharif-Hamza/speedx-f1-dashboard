"use client"

import { MonitorPanel } from "./monitor-panel"

export function PitControls() {
  return (
    <MonitorPanel title="PIT CONTROLS" indicator="red" variant="secondary">
      <div className="bg-[#0C0C0C] rounded border border-[#222] p-2 space-y-2" style={{ borderRadius: "8px" }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            className="bg-[#E10600] hover:bg-[#FF3131] text-[#F5F5F5] font-bold py-3 px-3 md:px-4 rounded border-2 border-[#8B0000] shadow-lg transition-all btn-pit-control uppercase text-xs md:text-sm flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 font-[family-name:var(--font-heading)]"
            style={{ borderRadius: "8px" }}
          >
            <svg className="h-4 w-4 md:h-5 md:w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-[10px] md:text-xs">Call Pit</span>
          </button>

          <button
            className="bg-[#1A1A1A] hover:bg-[#222] text-[#F5F5F5] font-bold py-3 px-3 md:px-4 rounded border-2 border-[#333] shadow-lg transition-all btn-pit-control uppercase text-xs md:text-sm flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 font-[family-name:var(--font-heading)]"
            style={{ borderRadius: "8px" }}
          >
            <svg className="h-4 w-4 md:h-5 md:w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            <span className="text-[10px] md:text-xs">Strategy</span>
          </button>

          <button
            className="bg-[#1A1A1A] hover:bg-[#222] text-[#F5F5F5] font-bold py-3 px-3 md:px-4 rounded border-2 border-[#333] shadow-lg transition-all btn-pit-control uppercase text-xs md:text-sm flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 font-[family-name:var(--font-heading)]"
            style={{ borderRadius: "8px" }}
          >
            <svg className="h-4 w-4 md:h-5 md:w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-[10px] md:text-xs">Telemetry</span>
          </button>

          <button
            className="bg-[#FFB300] hover:bg-[#FFC107] text-black font-bold py-3 px-3 md:px-4 rounded border-2 border-[#FF8F00] shadow-lg transition-all btn-pit-control uppercase text-xs md:text-sm flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 font-[family-name:var(--font-heading)]"
            style={{ borderRadius: "8px" }}
          >
            <svg className="h-4 w-4 md:h-5 md:w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-[10px] md:text-xs">Safety</span>
          </button>
        </div>

        <div className="pt-3 border-t border-[#222] space-y-2 text-[10px] md:text-xs font-[family-name:var(--font-mono)]">
          <div className="flex justify-between items-center">
            <span className="text-[#9E9E9E]">TIRE COMPOUND</span>
            <span className="font-bold text-[#E10600]">SOFT</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#9E9E9E]">FUEL LOAD</span>
            <span className="font-bold text-[#00FF7F]">78%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#9E9E9E]">DRS STATUS</span>
            <span className="font-bold text-[#00FF7F]">AVAILABLE</span>
          </div>
        </div>
      </div>
    </MonitorPanel>
  )
}
