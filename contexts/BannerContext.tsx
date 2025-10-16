"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface BannerContextType {
  hasBanner: boolean
  setHasBanner: (value: boolean) => void
}

const BannerContext = createContext<BannerContextType | undefined>(undefined)

export function BannerProvider({ children }: { children: ReactNode }) {
  const [hasBanner, setHasBanner] = useState(false)

  return (
    <BannerContext.Provider value={{ hasBanner, setHasBanner }}>
      {children}
    </BannerContext.Provider>
  )
}

export function useBanner() {
  const context = useContext(BannerContext)
  if (context === undefined) {
    throw new Error("useBanner must be used within a BannerProvider")
  }
  return context
}
