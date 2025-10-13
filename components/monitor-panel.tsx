import type React from "react"
import { memo } from "react"

interface MonitorPanelProps {
  title: string | React.ReactNode
  indicator?: "red" | "green" | "yellow" | "cyan"
  children: React.ReactNode
  variant?: "primary" | "secondary"
}

function MonitorPanelComponent({ title, indicator = "green", children, variant = "secondary" }: MonitorPanelProps) {
  const indicatorColors = {
    red: "bg-[#E10600] shadow-[0_0_8px_rgba(225,6,0,0.6)]",
    green: "bg-[#00FF7F] shadow-[0_0_8px_rgba(0,255,127,0.6)]",
    yellow: "bg-[#FFB300] shadow-[0_0_8px_rgba(255,179,0,0.6)]",
    cyan: "bg-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.6)]",
  }

  const panelClass = variant === "primary" ? "panel-primary" : "panel-secondary"

  return (
    <div
      className={`${panelClass} border-4 border-[#222] rounded-lg overflow-hidden carbon-fiber scanline backdrop-blur-sm`}
      style={{ borderRadius: "8px" }}
    >
      <div className="bg-gradient-to-b from-[#1A1A1A] to-[#0D0D0D] border-b-2 border-[#222] p-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-2 w-2 rounded-full ${indicatorColors[indicator]} animate-pulse-led`} />
          <h3
            className="text-xs font-bold text-[#F5F5F5] tracking-wider font-[family-name:var(--font-heading)] uppercase"
            style={{ letterSpacing: "0.05em" }}
          >
            {title}
          </h3>
        </div>
        <div className="flex gap-1">
          <div className="h-2 w-2 rounded-full bg-[#333]" />
          <div className="h-2 w-2 rounded-full bg-[#333]" />
          <div className="h-2 w-2 rounded-full bg-[#333]" />
        </div>
      </div>

      {/* Content area */}
      <div className="p-2">{children}</div>

      <div className="h-2 bg-gradient-to-b from-[#0D0D0D] to-[#080808] border-t border-[#222]" />
    </div>
  )
}

export const MonitorPanel = memo(MonitorPanelComponent)
