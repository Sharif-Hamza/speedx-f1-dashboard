"use client"

export function TickerTape() {
  const records = [
    "🏁 NEW RECORD: VER sets fastest lap at 1:42.351",
    "⚡ SPEED RECORD: HAM reaches 342 KM/H on main straight",
    "🏆 SECTOR 2 RECORD: NOR completes in 28.456s",
    "📊 TELEMETRY: Peak G-Force of 5.2G recorded at Turn 8",
    "🔥 ENGINE TEMP: All systems nominal at 95°C",
    "💨 DRS ACTIVATED: Overtaking zone active",
  ]

  return (
    <div className="fixed bottom-14 md:bottom-0 left-0 right-0 bg-gradient-to-r from-[#E10600] via-[#FF3131] to-[#E10600] text-[#F5F5F5] py-1.5 md:py-2 overflow-hidden border-t-2 border-[#F5F5F5] shadow-[0_-4px_20px_rgba(225,6,0,0.4)] z-30">
      <div className="flex animate-scroll whitespace-nowrap momentum-scroll">
        {[...records, ...records, ...records].map((record, i) => (
          <span
            key={i}
            className="inline-flex items-center mx-4 md:mx-8 text-[10px] md:text-sm font-bold font-[family-name:var(--font-mono)]"
          >
            {record}
          </span>
        ))}
      </div>
    </div>
  )
}
