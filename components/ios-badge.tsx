"use client"

import { useState, useEffect } from "react"

interface BadgeProps {
  name: string
  description: string
  icon: string
  rarity: "common" | "rare" | "epic" | "legendary"
  isEarned: boolean
  earnedAt?: string
  progress?: number
  size?: number
}

const rarityConfig = {
  common: {
    color: "#9E9E9E", // gray
    glow: 0
  },
  rare: {
    color: "#2196F3", // blue
    glow: 2
  },
  epic: {
    color: "#9C27B0", // purple
    glow: 4
  },
  legendary: {
    color: "#FF9800", // orange
    glow: 8
  }
}

// Map common icon names to actual emojis/unicode
const iconMap: Record<string, string> = {
  "bolt.fill": "⚡",
  "bolt.badge.checkmark": "⚡️✓",
  "bolt.shield.fill": "⚡🛡",
  "gauge.high": "🏎️",
  "flame.fill": "🔥",
  "airplane.departure": "✈️",
  "road.lanes": "🛣️",
  "crown.fill": "👑",
  "globe.americas.fill": "🌍",
  "moon.stars.fill": "🌙✨",
  "checkmark.seal.fill": "✓🏆",
  "exclamationmark.triangle.fill": "⚠️",
  "star.fill": "⭐",
  "figure.run": "🏃",
  "trophy": "🏆",
  "star": "⭐",
  "medal": "🥇",
  "fire": "🔥",
  "lightning": "⚡",
  "target": "🎯"
}

export function IOSBadge({ name, description, icon, rarity, isEarned, earnedAt, progress, size = 80 }: BadgeProps) {
  const [pulse, setPulse] = useState(false)
  const config = rarityConfig[rarity]
  const iconDisplay = iconMap[icon] || icon || "🏆"

  useEffect(() => {
    if (isEarned) {
      setPulse(true)
    }
  }, [isEarned])

  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="flex flex-col items-center gap-2 w-[90px]">
      {/* Badge Circle */}
      <div className="relative" style={{ width: size, height: size }}>
        {/* Glow effect for earned badges */}
        {isEarned && config.glow > 0 && (
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: `${config.color}30`,
              filter: `blur(${config.glow}px)`,
              width: size * 1.3,
              height: size * 1.3,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              animation: pulse ? 'pulse 2s ease-in-out infinite' : 'none'
            }}
          />
        )}

        {/* Main badge circle */}
        <div 
          className="relative rounded-full flex items-center justify-center"
          style={{
            width: size,
            height: size,
            background: isEarned 
              ? `linear-gradient(135deg, ${config.color}, ${config.color}B3)`
              : 'linear-gradient(135deg, #4A4A4A30, #4A4A4A80)',
            boxShadow: isEarned 
              ? `0 0 ${config.glow * 2}px ${config.color}40, inset 0 1px 2px rgba(255,255,255,0.2)`
              : 'inset 0 1px 2px rgba(0,0,0,0.3)',
            border: `2px solid ${isEarned ? config.color + '80' : '#4A4A4A50'}`
          }}
        >
          {/* Icon */}
          <div 
            className="text-center font-bold"
            style={{
              fontSize: size * 0.4,
              color: isEarned ? '#FFFFFF' : '#9E9E9E80',
              filter: isEarned ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : 'none'
            }}
          >
            {iconDisplay}
          </div>

          {/* Progress ring for locked badges */}
          {!isEarned && progress !== undefined && progress > 0 && (
            <svg 
              className="absolute" 
              width={size + 4} 
              height={size + 4}
              style={{
                transform: 'rotate(-90deg)',
                left: -2,
                top: -2
              }}
            >
              <circle
                cx={(size + 4) / 2}
                cy={(size + 4) / 2}
                r={(size + 4) / 2 - 2}
                fill="none"
                stroke={config.color}
                strokeWidth="3"
                strokeDasharray={`${2 * Math.PI * ((size + 4) / 2 - 2)}`}
                strokeDashoffset={`${2 * Math.PI * ((size + 4) / 2 - 2) * (1 - Math.min(progress, 1))}`}
                style={{
                  transition: 'stroke-dashoffset 0.5s ease'
                }}
              />
            </svg>
          )}

          {/* Shimmer effect for legendary badges */}
          {isEarned && rarity === "legendary" && (
            <div 
              className="absolute inset-0 rounded-full overflow-hidden"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                animation: 'shimmer 2s linear infinite',
                opacity: 0.5
              }}
            />
          )}
        </div>
      </div>

      {/* Badge Name */}
      <div 
        className="text-xs font-semibold text-center leading-tight font-[family-name:var(--font-heading)]"
        style={{
          color: isEarned ? '#F5F5F5' : '#9E9E9E',
          minHeight: '32px',
          display: 'flex',
          alignItems: 'center',
          maxWidth: '90px'
        }}
      >
        {name}
      </div>

      {/* Progress percentage for locked badges */}
      {!isEarned && progress !== undefined && progress > 0 && (
        <div className="text-[10px] font-medium text-[#9E9E9E]">
          {Math.round(progress * 100)}%
        </div>
      )}

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.5; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}

// Badge Detail Card (for expanded view)
export function BadgeDetailCard({ name, description, icon, rarity, isEarned, earnedAt }: BadgeProps) {
  const config = rarityConfig[rarity]

  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div 
      className="bg-[#0D0D0D] rounded p-4 border hover:border-opacity-100 transition-all"
      style={{
        borderRadius: "8px",
        borderColor: isEarned ? `${config.color}40` : '#1A1A1A',
        borderWidth: '1px'
      }}
    >
      <div className="flex items-start gap-4">
        {/* Badge */}
        <div className="flex-shrink-0">
          <IOSBadge 
            name=""
            description={description}
            icon={icon}
            rarity={rarity}
            isEarned={isEarned}
            earnedAt={earnedAt}
            size={64}
          />
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="text-sm font-bold text-[#F5F5F5] font-[family-name:var(--font-heading)]">
              {name}
            </h4>
            {earnedAt && (
              <span className="text-[9px] text-[#9E9E9E] whitespace-nowrap">
                {formatDate(earnedAt)}
              </span>
            )}
          </div>

          <p className="text-[11px] text-[#9E9E9E] leading-relaxed mb-3">
            {description}
          </p>

          {/* Rarity Badge */}
          <div className="inline-flex items-center">
            <span 
              className="text-[9px] px-2 py-1 rounded font-bold uppercase"
              style={{
                backgroundColor: `${config.color}30`,
                color: config.color,
                borderRadius: '4px'
              }}
            >
              {rarity}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
