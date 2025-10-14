"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useEffect, useState } from "react"

interface PrivacySection {
  heading: string
  content?: string
  items?: string[]
  subsections?: {
    heading: string
    items?: string[]
    content?: string
  }[]
  note?: string
}

interface PrivacyPolicy {
  id: string
  content: {
    title: string
    sections: PrivacySection[]
  }
  last_updated: string
}

export default function PrivacyPage() {
  const [policy, setPolicy] = useState<PrivacyPolicy | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPolicy() {
      try {
        const response = await fetch('/api/privacy-policy')
        if (!response.ok) {
          throw new Error('Failed to fetch privacy policy')
        }
        const data = await response.json()
        setPolicy(data)
      } catch (err) {
        console.error('Error fetching privacy policy:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }
    fetchPolicy()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading privacy policy...</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (error || !policy) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 pb-16 px-4">
          <div className="text-center max-w-[820px] mx-auto">
            <h1 className="text-white font-[family-name:var(--font-rajdhani)] font-bold tracking-wide text-[clamp(28px,4.5vw,40px)] mb-4">
              Privacy Policy
            </h1>
            <p className="text-red-500 mb-8">Failed to load privacy policy. Please try again later.</p>
            <div className="bg-card rounded-xl border border-border p-8">
              <p className="text-muted-foreground">If this error persists, please contact support@speedx.app</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16 px-4">
        <div className="text-center mb-8">
          <h1 className="text-white font-[family-name:var(--font-rajdhani)] font-bold tracking-wide text-[clamp(28px,4.5vw,40px)] mb-2">
            {policy.content.title}
          </h1>
          <p className="text-muted-foreground text-sm mb-3">
            Last Updated: {formatDate(policy.last_updated)}
          </p>
          <div className="w-[72px] h-[2px] bg-primary opacity-80 mx-auto" />
        </div>

        <div className="relative max-w-[820px] mx-auto">
          {/* Subtle green glow behind the white panel */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(600px 200px at 50% 0%, rgba(0,255,136,0.10), transparent 70%)",
            }}
          />

          {/* White policy card */}
          <article className="relative bg-white text-[#222] rounded-[14px] p-[clamp(18px,3.2vw,40px)] shadow-[0_12px_40px_rgba(0,0,0,0.45)] leading-[1.65]">
            <div className="space-y-6">
              {policy.content.sections.map((section, index) => (
                <div key={index}>
                  {section.heading && (
                    <h2 className="text-[clamp(20px,3vw,24px)] font-semibold mt-6 mb-2">
                      {section.heading}
                    </h2>
                  )}
                  {section.content && (
                    <p className="my-2.5">{section.content}</p>
                  )}
                  {section.items && (
                    <ul className="my-2 ml-5 mb-4 list-disc">
                      {section.items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  )}
                  {section.subsections && section.subsections.map((subsection, subIndex) => (
                    <div key={subIndex}>
                      <h3 className="text-[clamp(16px,2.4vw,18px)] font-semibold mt-5 mb-1.5">
                        {subsection.heading}
                      </h3>
                      {subsection.content && (
                        <p className="my-2.5">{subsection.content}</p>
                      )}
                      {subsection.items && (
                        <ul className="my-2 ml-5 mb-4 list-disc">
                          {subsection.items.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                  {section.note && (
                    <p className="my-2.5">{section.note}</p>
                  )}
                </div>
              ))}
            </div>
          </article>

          <p className="text-center text-sm text-muted-foreground mt-6 px-4">
            By creating a SpeedX account, you agree to the SpeedX Privacy Policy and the{" "}
            <a
              href="https://supabase.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Supabase Privacy Policy
            </a>
            .
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
