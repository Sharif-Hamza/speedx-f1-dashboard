# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**SpeedX F1 Dashboard** - A Next.js 15 web dashboard for the SpeedX iOS/Android app. Displays real-time Formula 1-inspired telemetry, leaderboards, and statistics for users tracking their driving sessions. Features a waitlist system for new user onboarding, Supabase authentication, and live data synchronization from the mobile app.

## Commands

### Development
```bash
# Start development server (default: http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

### Database Setup
The application requires Supabase database setup. Run SQL schema files in the Supabase SQL Editor:

1. Primary schema: `WAITLIST_SCHEMA.sql` - Creates `waitlist_users`, `user_profiles` tables, RLS policies, and approval functions
2. Migration files are also available (e.g., `CORRECT_WAITLIST_FOR_SPEEDX.sql`)

**Database Tables Used:**
- `waitlist_users` - Manages user waitlist approval status
- `user_profiles` - User account information (synced with SpeedX mobile app)
- `trips` - Driving session data (created by iOS/Android app)

### Testing
No automated test suite is configured. TypeScript type checking is disabled in build (`ignoreBuildErrors: true`), and ESLint is skipped during builds.

## Architecture

### Tech Stack
- **Framework**: Next.js 15.2.4 (App Router, React 19)
- **Language**: TypeScript 5 (strict mode, but build errors ignored)
- **Styling**: Tailwind CSS 4.1.9 with custom F1-inspired theme
- **Authentication**: Supabase Auth with Row Level Security (RLS)
- **Database**: PostgreSQL via Supabase (hosted at bzfrmujzxmfufvumknkq.supabase.co)
- **UI Components**: Radix UI primitives + custom components
- **Charts**: Recharts 2.15.4
- **Animation**: Framer Motion 12.23.24
- **Real-time**: Supabase real-time subscriptions

### Authentication & User Flow

**Critical Concept**: The dashboard operates as a companion to the SpeedX mobile app. Users can be created in three ways:
1. **Mobile-first users** - Created in iOS/Android app, can login to dashboard immediately
2. **Waitlist users** - New users who signup via `/waitlist` route, require admin approval
3. **Legacy users** - Existing users created before waitlist system (auto-approved)

**User Access Logic** (see `app/page.tsx` lines 22-54):
- Users with `waitlistStatus === null` AND no profile = BLOCKED (bypassed signup)
- Users with `waitlistStatus === "pending"` = BLOCKED (awaiting approval)
- Users with `waitlistStatus === "approved"` = ALLOWED
- Users with `waitlistStatus === "rejected"` = BLOCKED
- Users with existing profile but no waitlist entry = ALLOWED (legacy/mobile users)

**Key Files:**
- `contexts/AuthContext.tsx` - Manages auth state, waitlist status checks, profile fetching
- `app/page.tsx` - Root redirect logic based on auth status
- `app/waitlist/page.tsx` - New user signup form
- `app/pending/page.tsx` - Waitlist pending/rejection status page
- `app/login/page.tsx` - Login form for approved users
- `app/dashboard/page.tsx` - Main dashboard (protected route)
- `app/profile/page.tsx` - User profile with logout functionality
- `lib/supabase.ts` - Supabase client configuration

### Dashboard Architecture

The dashboard uses a **grid-based layout** with real-time data panels. All panels refresh automatically when new trip data arrives from the mobile app via Supabase real-time subscriptions.

**Main Component**: `app/dashboard/page.tsx`

**Panel Components** (located in `/components`):
- `active-users-live.tsx` - Live user counter and activity feed
- `speed-stats.tsx` - Animated RPM-style gauge showing personal best max speed
- `stats-activity.tsx` - Recent trips and driving statistics
- `app-promo.tsx` - iOS badge download link with custom SVG badge
- `max-speed-leaderboard.tsx` - Top 10 fastest drivers with weekly position tracking
- `distance-leaderboard.tsx` - Top 10 by total distance with weekly position tracking
- `challenges-events.tsx` - Upcoming challenges and events
- `weather-panel.tsx` - Live weather data via Open-Meteo API with humorous track advisories
- `pit-controls.tsx` - Additional controls and settings

**Real-time Updates**: All leaderboards and stats subscribe to the `trips` table using Supabase's `postgres_changes` event system. When a user completes a trip in the mobile app, dashboard panels automatically refresh.

**Responsive Design**:
- Mobile: Single column layout with bottom navigation tabs
- Desktop: 12-column grid (lg:col-span-X classes)
- All components use hardware-accelerated CSS for smooth scrolling

### Component System

**UI Components** (`/components/ui`): 
Full Radix UI component library using shadcn/ui pattern. 57 components available including: accordion, alert-dialog, avatar, badge, button, card, carousel, chart, checkbox, dialog, dropdown-menu, form, input, label, popover, progress, radio-group, scroll-area, select, separator, slider, switch, tabs, toast, tooltip, and more.

**Custom Hooks** (`/hooks`):
- `use-toast.ts` - Toast notification system (via sonner)
- `use-mobile.ts` - Mobile viewport detection

**Utility Functions** (`/lib/utils.ts`):
- `cn()` - Tailwind class merging utility (clsx + tailwind-merge)

### Styling & Theme

**Design Language**: Formula 1-inspired with racing aesthetics, vignette effects, grain texture, and motion streaks.

**Color Palette**:
- Primary: `#E10600` (Ferrari red)
- Secondary: `#00FF7F` (Neon green)
- Accent: `#00D9FF` (Cyan)
- Background: `#0D0D0D` (Near black)
- Text: `#F5F5F5` (Off-white)
- Muted: `#9E9E9E` (Gray)

**Fonts**:
- Sans: Inter (--font-sans)
- Heading: Orbitron (--font-heading) - Used for "SPEEDX" branding
- Mono: Share Tech Mono (--font-mono) - Used for telemetry data

**Custom CSS** (`app/globals.css`):
- Hardware acceleration enabled (`transform: translateZ(0)`)
- Smooth scrolling behavior
- Custom animations: `logo-pulse`, `pulse-led`, `motion-streak`, `grain`, `vignette`
- LED pulse effects for live indicators

### Data Flow

**Mobile App → Dashboard**:
1. User completes driving session in iOS/Android app
2. Trip data saved to `trips` table (Supabase)
3. Postgres INSERT event triggers real-time notification
4. Dashboard components subscribed to `trips` receive update
5. Components fetch new data and update UI automatically

**Key Data Conversions**:
- Speed: `mps * 2.23694` = MPH
- Distance: `meters * 0.000621371` = Miles
- Track temperature: `air_temp + 25°F` (simulated)

**Weather Data** (Open-Meteo API):
- Fetches from browser geolocation (falls back to NYC if denied)
- Updates every 5 minutes
- Shows: temperature, humidity, wind, rain chance, track status
- Generates contextual track advisories with personality

### Leaderboard System

**Weekly Reset Tracking**: Both leaderboards track position changes weekly using localStorage.

**Storage Keys**:
- `max_speed_leaderboard_last_week`
- `distance_leaderboard_last_week`

**Data Structure**:
```json
{
  "positions": { "user-id": position },
  "timestamp": "ISO-8601"
}
```

**Reset Logic**: Resets every Sunday (day 0) or after 7 days, whichever comes first.

**Position Indicators**:
- 🟢 ▲ = Moved up from last week
- 🔴 ▼ = Moved down from last week
- ⚪ — = No change

**Highlighting**:
- First place: Red background (max speed) or green background (distance)
- Current user: Gold background with 👤 icon

## Environment Variables

Required in `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://bzfrmujzxmfufvumknkq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-key]
```

## Important Development Notes

### Hydration & Performance Fixes
The dashboard previously had hydration errors and redirect loops. These have been resolved (see `ALL_FIXES_COMPLETE.md`):
- Added `mounted` state checks to prevent server/client mismatches
- Fixed waitlist approval logic to support legacy users
- Optimized with React.useCallback, React.useMemo
- Added CSS GPU acceleration
- Implemented useTransition for non-blocking navigation

### Path Aliases
Uses `@/*` alias mapping to project root (configured in `tsconfig.json`).

Example:
```typescript
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
```

### Admin Operations

**Approve User**:
```sql
SELECT approve_waitlist_user(
  'waitlist-user-id'::uuid,
  'admin@example.com'
);
```

**Reject User**:
```sql
SELECT reject_waitlist_user(
  'waitlist-user-id'::uuid,
  'admin@example.com',
  'Optional rejection reason'
);
```

**View Pending Users**:
```sql
SELECT * FROM waitlist_users 
WHERE status = 'pending' 
ORDER BY created_at DESC;
```

### Production Configuration

Next.js config (`next.config.mjs`):
- ESLint ignored during builds
- TypeScript errors ignored during builds
- Image optimization disabled (unoptimized: true)
- Console logs removed in production
- React strict mode enabled
- SWC minification enabled
- Optimized imports for lucide-react

**Deployment Checklist** (from `SETUP_INSTRUCTIONS.md`):
- Run SQL schema on production Supabase
- Update environment variables
- Configure email templates (optional)
- Set up admin approval workflow
- Enable RLS policies
- Configure rate limiting

## Known Issues & Limitations

1. **No Test Suite**: No Jest/Vitest configuration. Testing is manual.
2. **TypeScript Build Errors Ignored**: `ignoreBuildErrors: true` means type safety is not enforced at build time.
3. **ESLint Disabled in Builds**: `ignoreDuringBuilds: true` skips linting.
4. **No Email Notifications**: Waitlist approval/rejection doesn't send emails (requires configuration).
5. **Weather Location**: Uses browser geolocation or NYC fallback. TODO: Store user's last trip location in `user_profiles` table for more accurate weather.

## File Organization

```
app/
├── page.tsx                    # Root redirect logic
├── layout.tsx                  # Root layout with AuthProvider
├── globals.css                 # Custom CSS + Tailwind
├── dashboard/
│   ├── page.tsx               # Main dashboard grid layout
│   └── layout.tsx             # Protected route wrapper (removed)
├── waitlist/page.tsx          # New user signup
├── pending/page.tsx           # Waitlist pending status
├── login/page.tsx             # Login form
└── profile/page.tsx           # User profile + logout

components/
├── [feature].tsx              # 20+ dashboard panels
└── ui/                        # 57 Radix UI components

contexts/
└── AuthContext.tsx            # Auth state management

lib/
├── supabase.ts                # Supabase client + types
└── utils.ts                   # cn() utility

hooks/
├── use-toast.ts               # Toast system
└── use-mobile.ts              # Mobile detection

*.sql                          # Database schemas (7 files)
*.md                           # Feature documentation (10+ files)
```

## Documentation Files

Feature documentation is stored in root-level markdown files:
- `SETUP_INSTRUCTIONS.md` - Initial setup guide
- `ALL_FIXES_COMPLETE.md` - Bug fix summary (hydration, redirects, logout)
- `LEADERBOARDS_FEATURE.md` - Max speed & distance leaderboard details
- `SPEED_STATS_FEATURE.md` - Speed stats gauge component docs
- `TRACK_CONDITIONS.md` - Weather panel implementation
- `PRODUCTION_FIXES.md` - Production-specific fixes
- `HYDRATION_FIX.md` - Hydration error resolution
- `BADGE_FIX.md` - iOS badge SVG fix

These files contain implementation details, testing notes, and console log examples for debugging.
