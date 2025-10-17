"use client"

import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Book, Rocket, Database, Shield, Download, Smartphone, Settings, Activity, Map, Gauge, Trophy, Mail, Check, AlertCircle, Apple, Lock, HardDrive, Cloud, Eye, CheckCircle2, ExternalLink } from "lucide-react"
import { motion } from "framer-motion"

const TESTFLIGHT_URL = "https://testflight.apple.com/join/Yk7rZDaS"
const SUPPORT_EMAIL = "support@speed-x.us"

export default function DocsPage() {
  const sections = [
    {
      id: "quickstart",
      icon: Rocket,
      title: "Quickstart",
      description: "Install the app with TestFlight and take your first drive in minutes.",
    },
    {
      id: "testflight",
      icon: Apple,
      title: "TestFlight Guide",
      description: "Complete guide to installing and using TestFlight beta.",
    },
    {
      id: "email-verification",
      icon: Mail,
      title: "Email Setup",
      description: "How to verify your email and avoid spam filters.",
    },
    {
      id: "features",
      icon: Gauge,
      title: "Core Features",
      description: "Real‑time speed, lap timer, leaderboards, and safety prompts.",
    },
    {
      id: "privacy",
      icon: Lock,
      title: "Privacy & Data",
      description: "How we protect your data with local storage and zero tracking.",
    },
    {
      id: "database",
      icon: Database,
      title: "Database",
      description: "Powered by Supabase for auth, storage, and real‑time telemetry.",
    },
  ]

  const toc = [
    { href: "#quickstart", label: "Quickstart" },
    { href: "#testflight", label: "TestFlight Installation" },
    { href: "#email-verification", label: "Email Verification" },
    { href: "#features", label: "How SpeedX Works" },
    { href: "#privacy", label: "Privacy & Data Storage" },
    { href: "#database", label: "Database Info" },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }

  return (
    <>
      <Header />
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="px-4">
          <div className="container mx-auto max-w-[1100px]">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border text-xs text-muted-foreground mb-3">
                <Book className="w-3.5 h-3.5" />
                Documentation
              </div>
              <h1 className="font-[family-name:var(--font-rajdhani)] text-4xl sm:text-5xl font-bold mb-3">
                SpeedX Documentation
              </h1>
              <p className="text-muted-foreground max-w-[70ch] mx-auto">
                Your complete guide to installing, using, and understanding SpeedX.
              </p>
            </motion.div>

            {/* Feature tiles */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {sections.map((s, index) => (
                <motion.a 
                  key={s.id} 
                  variants={itemVariants}
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  href={`#${s.id}`} 
                  className="group block p-5 rounded-lg border border-border bg-card/60 hover:bg-card hover:border-primary/40 transition-colors"
                >
                  <div className="w-10 h-10 rounded-md border border-border bg-secondary/30 group-hover:border-primary/60 flex items-center justify-center mb-3 transition-colors">
                    <s.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="font-[family-name:var(--font-rajdhani)] text-lg mb-1">{s.title}</div>
                  <div className="text-sm text-muted-foreground">{s.description}</div>
                </motion.a>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Body */}
        <section className="px-4 mt-12">
          <div className="container mx-auto max-w-[1100px] grid lg:grid-cols-[240px_1fr] gap-8">
            {/* TOC */}
            <aside className="hidden lg:block sticky top-24 self-start">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="p-4 rounded-lg border border-border bg-card/50"
              >
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">On this page</div>
                <ul className="space-y-2">
                  {toc.map((t) => (
                    <li key={t.href}>
                      <a href={t.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        {t.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </aside>

            {/* Content */}
            <motion.article 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="prose prose-invert max-w-none"
            >
              <section id="quickstart" className="scroll-mt-28">
                <h2 className="font-[family-name:var(--font-rajdhani)] text-3xl mb-4">Quickstart</h2>
                <div className="p-4 rounded-lg border border-primary/30 bg-card/50 mb-6">
                  <div className="flex items-start gap-3">
                    <Rocket className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground mb-0">
                        Get SpeedX installed in under 5 minutes and start tracking your drives.
                      </p>
                    </div>
                  </div>
                </div>
                <ol className="list-decimal pl-5 space-y-3 text-sm text-muted-foreground">
                  <li className="pl-2">
                    <strong className="text-foreground">Install TestFlight:</strong> Download the official TestFlight app from the{" "}
                    <a className="text-primary hover:underline" href="https://apps.apple.com/app/testflight/id899247664" target="_blank" rel="noreferrer">App Store</a>.
                  </li>
                  <li className="pl-2">
                    <strong className="text-foreground">Join Beta:</strong> Open the public invite link: {" "}
                    <a className="text-primary hover:underline inline-flex items-center gap-1" href={TESTFLIGHT_URL} target="_blank" rel="noreferrer">
                      Join SpeedX on TestFlight <ExternalLink className="w-3 h-3" />
                    </a>.
                  </li>
                  <li className="pl-2">
                    <strong className="text-foreground">Accept & Install:</strong> Tap "Accept" in TestFlight, then tap "Install" to download SpeedX.
                  </li>
                  <li className="pl-2">
                    <strong className="text-foreground">Sign Up:</strong> Open SpeedX and create your account with email verification.
                  </li>
                  <li className="pl-2">
                    <strong className="text-foreground">Start Driving:</strong> Choose Simple Drive for casual tracking or Blitz for competitive sessions.
                  </li>
                </ol>
              </section>

              <section id="testflight" className="mt-12 scroll-mt-28">
                <h2 className="font-[family-name:var(--font-rajdhani)] text-3xl mb-4">TestFlight Installation Guide</h2>
                
                <div className="p-4 rounded-lg border border-blue-500/30 bg-blue-500/5 mb-6">
                  <div className="flex items-start gap-3">
                    <Apple className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-1">Why TestFlight?</h3>
                      <p className="text-xs text-muted-foreground">
                        SpeedX is currently in public beta. TestFlight allows us to gather feedback, rapidly iterate on features, and ensure stability before our official App Store launch. Beta testers get early access to new features and help shape the product.
                      </p>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-[family-name:var(--font-rajdhani)] mb-3">Step-by-Step Installation</h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border border-border bg-card/50">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 text-sm font-bold">1</div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-foreground mb-1">Download TestFlight</h4>
                        <p className="text-xs text-muted-foreground mb-2">
                          Open the App Store on your iPhone and search for "TestFlight" or tap the direct link:
                        </p>
                        <a href="https://apps.apple.com/app/testflight/id899247664" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                          Download TestFlight <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-border bg-card/50">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 text-sm font-bold">2</div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-foreground mb-1">Join the SpeedX Beta</h4>
                        <p className="text-xs text-muted-foreground mb-2">
                          Open this link on your iPhone to join the public beta:
                        </p>
                        <a href={TESTFLIGHT_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mb-2">
                          {TESTFLIGHT_URL} <ExternalLink className="w-3 h-3" />
                        </a>
                        <p className="text-xs text-muted-foreground">
                          The link will automatically open in TestFlight. Tap <strong className="text-foreground">"Accept"</strong> to join.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-border bg-card/50">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 text-sm font-bold">3</div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-foreground mb-1">Install SpeedX</h4>
                        <p className="text-xs text-muted-foreground">
                          After accepting, tap the <strong className="text-foreground">"Install"</strong> button. The app will download and install on your home screen just like any App Store app.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section id="email-verification" className="mt-12 scroll-mt-28">
                <h2 className="font-[family-name:var(--font-rajdhani)] text-3xl mb-4">Email Verification</h2>
                
                <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-1">Important: Check Your Inbox</h3>
                      <p className="text-xs text-muted-foreground">
                        You must verify your email to access SpeedX. Look for an email from <strong className="text-foreground">{SUPPORT_EMAIL}</strong>.
                      </p>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-[family-name:var(--font-rajdhani)] mb-3">What to Expect</h3>
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-1">Sender Email Address</h4>
                      <p className="text-xs text-muted-foreground">
                        All official emails come from: <span className="text-primary font-mono">{SUPPORT_EMAIL}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-1">Email Subject Line</h4>
                      <p className="text-xs text-muted-foreground">
                        Look for: <span className="text-foreground">"Confirm your email address for SpeedX"</span>
                      </p>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-[family-name:var(--font-rajdhani)] mb-3">Didn't Receive the Email?</h3>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-card/30 border border-border">
                    <h4 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      1. Check Your Spam/Junk Folder
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Sometimes verification emails get filtered. Check your spam, junk, or promotions folder. If you find it there, mark it as "Not Spam" to ensure future emails arrive in your inbox.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-card/30 border border-border">
                    <h4 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      2. Wait a Few Minutes
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Email delivery can take 1-5 minutes. If it's been longer than 10 minutes, request a new verification email from the app.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-card/30 border border-border">
                    <h4 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      3. Add to Safe Senders
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Add <span className="text-primary font-mono">{SUPPORT_EMAIL}</span> to your email contacts or safe senders list to ensure delivery.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-card/30 border border-border">
                    <h4 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      4. Still Having Issues?
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Contact us at <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">{SUPPORT_EMAIL}</a> and we'll manually verify your account.
                    </p>
                  </div>
                </div>
              </section>

              <section id="features" className="mt-12 scroll-mt-28">
                <h2 className="font-[family-name:var(--font-rajdhani)] text-3xl mb-4">How SpeedX Works</h2>
                <ul className="grid sm:grid-cols-2 gap-4 not-prose">
                  {[{
                    icon: Activity,
                    title: "Real‑time Speed",
                    desc: "Live speed, max/avg metrics, and smooth graphs while you drive.",
                  }, {
                    icon: Map,
                    title: "Trip Tracking",
                    desc: "Distance, duration, route context, and history in your dashboard.",
                  }, {
                    icon: Settings,
                    title: "Modes",
                    desc: "Simple Drive for relaxed drives, Blitz for competitive sessions.",
                  }, {
                    icon: Trophy,
                    title: "Leaderboards",
                    desc: "Weekly Blitz challenges to compete and climb the ranks.",
                  }].map((f, i) => (
                    <li key={i} className="p-4 rounded-lg border border-border bg-card/50 hover:border-primary/40 transition-colors">
                      <div className="flex items-start gap-3">
                        <f.icon className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <div className="font-[family-name:var(--font-rajdhani)] text-base">{f.title}</div>
                          <div className="text-sm text-muted-foreground">{f.desc}</div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              <section id="privacy" className="mt-12 scroll-mt-28">
                <h2 className="font-[family-name:var(--font-rajdhani)] text-3xl mb-4">Privacy & Data Storage</h2>
                
                <div className="p-4 rounded-lg border border-green-500/30 bg-green-500/5 mb-6">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-1">Your Privacy Matters</h3>
                      <p className="text-xs text-muted-foreground">
                        SpeedX is built with privacy-first principles. We don't sell your data, track you across apps, or use invasive analytics.
                      </p>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-[family-name:var(--font-rajdhani)] mb-3">How Data is Stored</h3>
                <div className="space-y-4 mb-6">
                  <div className="p-4 rounded-lg border border-border bg-card/50">
                    <div className="flex items-start gap-3">
                      <HardDrive className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-foreground mb-1">Local Storage First</h4>
                        <p className="text-xs text-muted-foreground">
                          All trip data, speed metrics, and session history are stored locally on your iPhone using encrypted local storage. This means your driving data stays on your device and is never automatically uploaded.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-border bg-card/50">
                    <div className="flex items-start gap-3">
                      <Cloud className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-foreground mb-1">Optional Cloud Sync</h4>
                        <p className="text-xs text-muted-foreground">
                          When you opt-in to leaderboards or device sync, only necessary data (like your best times and distances) is synced to our secure Supabase backend. You control what gets shared.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-border bg-card/50">
                    <div className="flex items-start gap-3">
                      <Eye className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-foreground mb-1">Zero Tracking</h4>
                        <p className="text-xs text-muted-foreground">
                          SpeedX does not use third-party analytics, advertising SDKs, or tracking pixels. We don't monitor your location outside of active driving sessions, and GPS data is only used for trip metrics—never shared with advertisers.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-[family-name:var(--font-rajdhani)] mb-3">What We Collect</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong className="text-foreground">Account data:</strong> Email address and profile info for authentication.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong className="text-foreground">Trip metrics:</strong> Speed, distance, duration (stored locally unless you opt-in to sync).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong className="text-foreground">Leaderboard data:</strong> Only when you participate in Blitz challenges.</span>
                  </li>
                </ul>

                <p className="text-xs text-muted-foreground mt-4">
                  For full details, read our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                </p>
              </section>

              <section id="database" className="mt-12 scroll-mt-28">
                <h2 className="font-[family-name:var(--font-rajdhani)] text-3xl mb-4">Database & Infrastructure</h2>
                <div className="p-4 rounded-lg border border-border bg-card/50 mb-4">
                  <div className="flex items-start gap-3">
                    <Database className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-1">Powered by Supabase</h4>
                      <p className="text-xs text-muted-foreground">
                        SpeedX uses Supabase for authentication, Postgres storage, and row‑level security. Trip records, session metrics, and leaderboards are stored in structured tables with RLS policies. Media and screenshots are stored in Supabase Storage. All access is authenticated via Supabase Auth with JWT sessions.
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Learn more about Supabase's security and privacy: {" "}
                  <a href="https://supabase.com/security" target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    Supabase Security <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </section>

              <section className="mt-12 not-prose">
                <div className="p-6 rounded-lg border border-primary/30 bg-primary/5">
                  <h3 className="text-lg font-[family-name:var(--font-rajdhani)] mb-2">Ready to Get Started?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Install the latest public beta via Apple TestFlight. Open on your iPhone for the smoothest experience.
                  </p>
                  <Link href={TESTFLIGHT_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity">
                    <Download className="w-4 h-4" />
                    Get on TestFlight
                  </Link>
                </div>
              </section>
            </motion.article>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
