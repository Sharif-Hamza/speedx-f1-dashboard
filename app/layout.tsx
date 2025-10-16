import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Orbitron } from "next/font/google"
import { Rajdhani } from "next/font/google"
import { Share_Tech_Mono } from "next/font/google"
import { Suspense } from "react"
import { AuthProvider } from "@/contexts/AuthContext"
import { BannerProvider } from "@/contexts/BannerContext"
import { ConditionalHeader } from "@/components/conditional-header"
import { BannerAnnouncement } from "@/components/banner-announcement"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
})

const rajdhani = Rajdhani({
  weight: ["600"],
  subsets: ["latin"],
  variable: "--font-rajdhani",
  display: "swap",
})

const shareTechMono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "SpeedX Mission Control",
  description: "Formula 1 Telemetry Command Center",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${orbitron.variable} ${rajdhani.variable} ${shareTechMono.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <BannerProvider>
            <BannerAnnouncement />
            <ConditionalHeader />
            <Suspense fallback={null}>{children}</Suspense>
          </BannerProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
