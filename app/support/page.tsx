"use client"

import type React from "react"
import { useState } from "react"
import { Search, ChevronDown, X, ExternalLink } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

const faqCategories = [
  {
    title: "Getting Started",
    questions: [
      {
        q: "What is SpeedX?",
        a: "SpeedX is a high-speed trip tracker for iOS with Simple Drive (record trips), Blitz (race your route vs. map ETA), global MPH/KMH units, and lifetime stats.",
      },
      {
        q: "Is SpeedX free?",
        a: "Core features are free during early access. We may introduce optional paid features later.",
      },
      {
        q: "Where does SpeedX work?",
        a: "Anywhere your iPhone has location access and GPS visibility.",
      },
      {
        q: "Does SpeedX work offline?",
        a: "Trips record offline; some features (like Blitz ETA fetch) need connectivity.",
      },
    ],
  },
  {
    title: "Account & Login (Supabase)",
    questions: [
      {
        q: "How do I create an account?",
        a: "Use your email to sign up. We securely authenticate and store your account with Supabase.",
      },
      {
        q: "I didn't get the login email.",
        a: "Check spam, wait 1–2 minutes, then request again. Add our address to your safe senders list.",
      },
      {
        q: "Can I change my email?",
        a: "Contact support and we'll assist after verifying ownership.",
      },
      {
        q: "Where can I read Supabase's privacy policy?",
        a: (
          <>
            <a
              href="https://supabase.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              https://supabase.com/privacy
              <ExternalLink className="w-3 h-3" />
            </a>
          </>
        ),
      },
    ],
  },
  {
    title: "Tracking & Blitz",
    questions: [
      {
        q: "How does Simple Drive work?",
        a: "Tap Start/Stop to record. We show live speed, elapsed time, and distance; speed segments are color-coded.",
      },
      {
        q: "What is Blitz?",
        a: "Enter a destination; we fetch expected distance/duration; when you stop, we compare Actual vs. Expected and show deltas.",
      },
      {
        q: "My speed looks off—why?",
        a: "Brief GPS drift can occur in tunnels/urban canyons. Keep the device with a clear sky view.",
      },
      {
        q: "Can I export a trip?",
        a: "Export will be added soon. For now, contact support and we can share JSON/CSV if available.",
      },
    ],
  },
  {
    title: "Units & Stats",
    questions: [
      {
        q: "How do units work?",
        a: "Toggle MPH/KMH globally. We store raw data in m/s for accuracy.",
      },
      {
        q: "Which stats are stored?",
        a: "Lifetime totals: distance, duration, top speed, weighted average speed.",
      },
      {
        q: "Why is top speed lower than my car's speedo?",
        a: "We use GPS-based speed; vehicle gauges can read higher. We favor accurate telemetry.",
      },
    ],
  },
  {
    title: "Data & Privacy",
    questions: [
      {
        q: "What do you store and where?",
        a: "Account + driver stats (distance, duration, top/avg speed) are securely stored in Supabase.",
      },
      {
        q: "Do you sell data?",
        a: "No. We do not sell or share personal data for advertising.",
      },
      {
        q: "How do I delete my account or export data?",
        a: "Use the Data Requests card below or email support. See our Privacy page for details.",
      },
      {
        q: "Responsible use",
        a: "SpeedX is for lawful, responsible driving and track/closed-course use. We do not condone reckless driving and accept no liability for misuse.",
      },
    ],
  },
  {
    title: "Troubleshooting",
    questions: [
      {
        q: "GPS not locking / gaps in route",
        a: "Ensure Location Services = Always/While Using, disable Low Power Mode, keep the phone with a sky view.",
      },
      {
        q: "Blitz can't fetch ETA",
        a: "Check connection; retry; some regions/routes may not return data.",
      },
      {
        q: "App feels slow",
        a: "Update to latest version; restart the app; ensure enough storage.",
      },
      {
        q: "Still stuck?",
        a: "Contact us via the form; include iOS version, app version, and steps to reproduce.",
      },
    ],
  },
]

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [openFaq, setOpenFaq] = useState<string | null>(null)
  const [showStatusBanner, setShowStatusBanner] = useState(true)
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    topic: "",
    message: "",
  })
  const [contactStatus, setContactStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [contactError, setContactError] = useState<string | null>(null)
  const [dataRequestForm, setDataRequestForm] = useState({
    name: "",
    email: "",
    requestType: "",
  })
  const [dataRequestStatus, setDataRequestStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [dataRequestError, setDataRequestError] = useState<string | null>(null)

  const getFilteredCategories = () => {
    if (!searchQuery) return faqCategories

    return faqCategories
      .map((category) => ({
        ...category,
        questions: category.questions.filter(
          (q) =>
            q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (typeof q.a === "string" && q.a.toLowerCase().includes(searchQuery.toLowerCase())),
        ),
      }))
      .filter((category) => category.questions.length > 0)
  }

  const filteredCategories = getFilteredCategories()

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Form submitted with data:', contactForm)
    
    // Validation
    if (!contactForm.name || !contactForm.email || !contactForm.topic || !contactForm.message) {
      setContactError("All fields are required")
      console.error('Validation failed: Missing fields')
      return
    }
    
    if (contactForm.message.length < 20) {
      setContactError("Message must be at least 20 characters")
      console.error('Validation failed: Message too short')
      return
    }
    
    setContactStatus("loading")
    setContactError(null)

    try {
      console.log('Sending request to /api/support-requests...')
      const response = await fetch('/api/support-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm),
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request')
      }

      setContactStatus("success")
      setTimeout(() => {
        setContactForm({ name: "", email: "", topic: "", message: "" })
        setContactStatus("idle")
      }, 5000)
    } catch (error) {
      console.error('Error submitting form:', error)
      setContactStatus("error")
      setContactError(error instanceof Error ? error.message : 'An error occurred')
      setTimeout(() => {
        setContactStatus("idle")
        setContactError(null)
      }, 5000)
    }
  }

  const handleDataRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setDataRequestStatus("loading")
    setDataRequestError(null)

    try {
      const response = await fetch('/api/data-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataRequestForm),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request')
      }

      setDataRequestStatus("success")
      setTimeout(() => {
        setDataRequestForm({ name: "", email: "", requestType: "" })
        setDataRequestStatus("idle")
      }, 5000)
    } catch (error) {
      setDataRequestStatus("error")
      setDataRequestError(error instanceof Error ? error.message : 'An error occurred')
      setTimeout(() => {
        setDataRequestStatus("idle")
        setDataRequestError(null)
      }, 5000)
    }
  }

  return (
    <>
      <Header />
      <main className="pt-20 pb-16">
        <section className="px-4 py-12 border-b border-border">
          <div className="container mx-auto max-w-[1120px]">
            <div className="text-center space-y-4 mb-8">
              <h1 className="text-4xl md:text-5xl font-semibold font-[family-name:var(--font-rajdhani)] text-foreground">
                Support
              </h1>
              <p className="text-muted-foreground text-base md:text-lg">We're here to help with SpeedX.</p>
            </div>

            {/* Search bar */}
            <div className="max-w-[700px] mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search help (e.g., Blitz mode, login, units)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>
          </div>
        </section>

        {showStatusBanner && (
          <div className="px-4 py-3 bg-primary/10 border-b border-primary/20">
            <div className="container mx-auto max-w-[1120px] flex items-center justify-between">
              <p className="text-sm text-primary font-medium">✓ All systems nominal.</p>
              <button
                onClick={() => setShowStatusBanner(false)}
                className="text-primary hover:text-primary/80 transition-colors"
                aria-label="Dismiss status banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <section className="px-4 py-16">
          <div className="container mx-auto max-w-[1120px]">
            {filteredCategories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map((category, catIndex) => (
                  <div
                    key={catIndex}
                    className="bg-card rounded-xl border border-border p-6 shadow-sm"
                    style={{
                      boxShadow: "inset 0 2px 0 rgba(0, 255, 136, 0.25)",
                    }}
                  >
                    <h2 className="text-xl font-semibold font-[family-name:var(--font-rajdhani)] text-foreground mb-4">
                      {category.title}
                    </h2>
                    <div className="space-y-3">
                      {category.questions.map((question, qIndex) => {
                        const faqId = `${catIndex}-${qIndex}`
                        const isOpen = openFaq === faqId

                        return (
                          <div key={qIndex}>
                            <button
                              onClick={() => setOpenFaq(isOpen ? null : faqId)}
                              className="w-full text-left text-sm text-primary hover:text-primary/80 transition-colors flex items-start justify-between gap-2 group"
                            >
                              <span className="group-hover:underline">{question.q}</span>
                              <ChevronDown
                                className={`w-4 h-4 flex-shrink-0 mt-0.5 transition-transform ${
                                  isOpen ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                            {isOpen && (
                              <div className="mt-2 text-sm text-muted-foreground leading-relaxed pl-1">{question.a}</div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No results found. Try a different search term.</p>
              </div>
            )}
          </div>
        </section>

        <section className="px-4 py-16 border-t border-border">
          <div className="container mx-auto max-w-[1120px]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact Support Card */}
              <div
                className="bg-card rounded-xl border border-border p-6 md:p-7"
                style={{
                  boxShadow: "inset 0 2px 0 rgba(0, 255, 136, 0.25)",
                }}
              >
                <h2 className="text-2xl font-semibold font-[family-name:var(--font-rajdhani)] text-foreground mb-4">
                  Contact Support
                </h2>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-sm font-medium mb-1.5 text-foreground">
                      Name
                    </label>
                    <input
                      type="text"
                      id="contact-name"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-sm font-medium mb-1.5 text-foreground">
                      Email
                    </label>
                    <input
                      type="email"
                      id="contact-email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-topic" className="block text-sm font-medium mb-1.5 text-foreground">
                      Topic
                    </label>
                    <select
                      id="contact-topic"
                      required
                      value={contactForm.topic}
                      onChange={(e) => setContactForm({ ...contactForm, topic: e.target.value })}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                      <option value="">Select a topic</option>
                      <option value="login">Login</option>
                      <option value="tracking">Tracking</option>
                      <option value="blitz">Blitz</option>
                      <option value="units-stats">Units/Stats</option>
                      <option value="data-privacy">Data & Privacy</option>
                      <option value="bug">Bug</option>
                      <option value="feature">Feature</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="contact-message" className="block text-sm font-medium mb-1.5 text-foreground">
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      required
                      rows={5}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <p className="text-xs mt-1 flex items-center justify-between">
                      <span className="text-muted-foreground">Minimum 20 characters</span>
                      <span className={contactForm.message.length < 20 ? "text-red-500 font-medium" : "text-primary"}>
                        {contactForm.message.length}/20
                      </span>
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={contactStatus === "loading"}
                    className="w-full px-6 py-3 bg-primary text-black font-medium rounded-lg transition-all hover:scale-[1.02] green-glow-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {contactStatus === "loading" ? "Sending..." : "Send to Support"}
                  </button>
                  {contactStatus === "success" && (
                    <p className="text-sm text-primary text-center">✓ Thanks! We'll reply within 1–2 business days.</p>
                  )}
                  {contactStatus === "error" && contactError && (
                    <p className="text-sm text-red-500 text-center">✗ {contactError}</p>
                  )}
                </form>
              </div>

              {/* Data Requests Card */}
              <div
                className="bg-card rounded-xl border border-border p-6 md:p-7"
                style={{
                  boxShadow: "inset 0 2px 0 rgba(0, 255, 136, 0.25)",
                }}
              >
                <h2 className="text-2xl font-semibold font-[family-name:var(--font-rajdhani)] text-foreground mb-4">
                  Data Requests
                </h2>
                <p className="text-sm text-muted-foreground mb-4">Manage your data.</p>
                <form onSubmit={handleDataRequestSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="data-name" className="block text-sm font-medium mb-1.5 text-foreground">
                      Name (Optional)
                    </label>
                    <input
                      type="text"
                      id="data-name"
                      value={dataRequestForm.name}
                      onChange={(e) => setDataRequestForm({ ...dataRequestForm, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="data-request-type" className="block text-sm font-medium mb-1.5 text-foreground">
                      Request Type
                    </label>
                    <select
                      id="data-request-type"
                      required
                      value={dataRequestForm.requestType}
                      onChange={(e) => setDataRequestForm({ ...dataRequestForm, requestType: e.target.value })}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                      <option value="">Select request type</option>
                      <option value="export">Export my data</option>
                      <option value="delete">Delete my account</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="data-email" className="block text-sm font-medium mb-1.5 text-foreground">
                      Email
                    </label>
                    <input
                      type="email"
                      id="data-email"
                      required
                      value={dataRequestForm.email}
                      onChange={(e) => setDataRequestForm({ ...dataRequestForm, email: e.target.value })}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    We verify ownership before processing. Expect 7–14 days.
                  </p>
                  <button
                    type="submit"
                    disabled={dataRequestStatus === "loading"}
                    className="w-full px-6 py-3 bg-primary text-black font-medium rounded-lg transition-all hover:scale-[1.02] green-glow-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {dataRequestStatus === "loading" ? "Submitting..." : "Submit Request"}
                  </button>
                  {dataRequestStatus === "success" && (
                    <p className="text-sm text-primary text-center">✓ Request submitted! We'll process it shortly.</p>
                  )}
                  {dataRequestStatus === "error" && dataRequestError && (
                    <p className="text-sm text-red-500 text-center">✗ {dataRequestError}</p>
                  )}
                </form>
                <div className="mt-6 pt-6 border-t border-border space-y-2">
                  <a href="/privacy" className="block text-sm text-primary hover:underline transition-colors">
                    Privacy Policy
                  </a>
                  <a
                    href="https://supabase.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-primary hover:underline transition-colors inline-flex items-center gap-1"
                  >
                    Supabase Privacy
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-12 border-t border-border">
          <div className="container mx-auto max-w-[1120px] text-center space-y-6">
            <p className="text-muted-foreground">Didn't find what you need?</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => {
                  setContactForm({ ...contactForm, topic: "bug" })
                  document.getElementById("contact-topic")?.scrollIntoView({ behavior: "smooth" })
                }}
                className="px-6 py-2.5 border border-border rounded-lg text-foreground hover:border-primary hover:text-primary transition-all"
              >
                Report a bug
              </button>
              <button
                onClick={() => {
                  setContactForm({ ...contactForm, topic: "feature" })
                  document.getElementById("contact-topic")?.scrollIntoView({ behavior: "smooth" })
                }}
                className="px-6 py-2.5 border border-border rounded-lg text-foreground hover:border-primary hover:text-primary transition-all"
              >
                Request a feature
              </button>
            </div>
            <p className="text-xs text-muted-foreground pt-4">
              SpeedX is provided as-is. Drive responsibly. We do not encourage or condone unsafe driving.
            </p>
            <p className="text-xs text-muted-foreground">
              Support: <span className="text-primary">support@speedx.app</span>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
