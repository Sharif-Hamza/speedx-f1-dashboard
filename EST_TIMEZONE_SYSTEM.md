# EST Timezone Weekly Reset System

## Overview

The SpeedX F1 Dashboard weekly leaderboards reset **every Sunday at 12:00 AM EST (Eastern Standard Time)**, regardless of where users are located in the world.

## How It Works

### 1. **Consistent Timezone Reference**
- All weekly resets are based on **EST (UTC-5)**
- Uses EST year-round (not EDT) for consistency
- The system automatically calculates when Sunday midnight EST occurs in:
  - The user's local browser timezone (for display)
  - UTC (for database queries)
  - EST (for determining week boundaries)

### 2. **Timezone Conversion Examples**

When it's **Sunday 12:00 AM EST**, it's:
- **5:00 AM UTC** (Sunday)
- **10:00 PM PST** (Saturday night)
- **2:00 AM CST** (Sunday)
- **6:00 AM BST** (Sunday - London)
- **3:00 PM JST** (Sunday - Tokyo)

This means:
- A user in California (PST) will see the leaderboard reset at 9:00 PM Saturday night
- A user in London (GMT) will see it reset at 5:00 AM Sunday morning
- A user in Tokyo (JST) will see it reset at 2:00 PM Sunday afternoon
- A user in New York (EST) will see it reset at midnight Sunday

### 3. **Architecture Components**

#### A. Frontend (React Components)
**Files:**
- `lib/timezone-utils.ts` - EST timezone calculation utilities
- `components/max-speed-leaderboard.tsx` - Max Speed leaderboard
- `components/distance-leaderboard.tsx` - Distance leaderboard

**How it works:**
```typescript
// Get current week boundaries in EST
const currentWeek = getCurrentWeekBoundaries()
// Returns: { startUTC: Date, endUTC: Date, startDateStr: 'YYYY-MM-DD', endDateStr: 'YYYY-MM-DD' }

// Get last week boundaries in EST
const lastWeek = getLastWeekBoundaries()
```

The utilities handle:
- Converting browser time → EST → UTC
- Calculating Sunday midnight EST in any timezone
- Formatting dates for database queries (YYYY-MM-DD format)

#### B. Backend (Supabase/PostgreSQL)
**File:** `automatic_chg_snapshots.sql`

The SQL function `auto_create_weekly_snapshots()`:
1. Checks if current time is Sunday in EST
2. Calculates last week's date range (Sunday-Saturday in EST)
3. Saves snapshots for both max_speed and distance leaderboards
4. Scheduled to run via pg_cron every Sunday at 05:05 AM UTC (12:05 AM EST)

### 4. **CHG (Position Change) Calculation**

CHG shows how many positions a user moved up or down:
- **▲3** (green) = Moved up 3 positions from last week
- **▼2** (red) = Moved down 2 positions from last week
- **—** (gray) = No change or new entry this week

**Two-tier fallback system:**
1. **Primary**: Load from `weekly_leaderboard_snapshots` table (fast)
2. **Fallback**: If no snapshot exists, calculate live from trip data (reliable)

This ensures CHG always works even if snapshots fail or are delayed.

## User Experience in Different Timezones

### Example: User in California (PST/PDT)

**When the user visits the dashboard on Saturday at 11:00 PM PST:**
- The leaderboard shows "this week's" data
- Week started: Last Sunday 12:00 AM EST = Saturday 9:00 PM PST
- Week ends: This Saturday 11:59:59 PM EST = Saturday 8:59:59 PM PST

**At Saturday 9:00 PM PST (Sunday 12:00 AM EST):**
- Leaderboard automatically resets
- "This week" now refers to the new week
- CHG indicators update to compare against previous week
- UI shows: "🔄 Resets every Sunday at 12:00 AM EST • Top 10 this week"

### Example: User in Tokyo (JST)

**When the user visits the dashboard on Sunday at 1:00 PM JST:**
- The leaderboard shows "this week's" data
- Week started: Sunday 12:00 AM EST = Sunday 2:00 PM JST
- Week ends: Saturday 11:59:59 PM EST = Sunday 1:59:59 PM JST (next week)

**At Sunday 2:00 PM JST (Sunday 12:00 AM EST):**
- Leaderboard automatically resets
- Previous week's data becomes the baseline for CHG calculation

## Testing & Verification

### 1. **Check Current Week Boundaries**

Open browser console on the dashboard:
```javascript
// In browser console
const { getCurrentWeekBoundaries, getLastWeekBoundaries, getNextResetInfo } = await import('./lib/timezone-utils.ts')

// See when current week started (in EST)
console.log('Current Week:', getCurrentWeekBoundaries())

// See when last week started (in EST)
console.log('Last Week:', getLastWeekBoundaries())

// See when next reset happens (in YOUR local time)
console.log('Next Reset:', getNextResetInfo())
```

### 2. **Verify Database Snapshots**

Run this SQL query in Supabase SQL Editor:
```sql
-- Check recent snapshots
SELECT 
    week_start,
    leaderboard_type,
    COUNT(*) as users,
    MIN(value) as min_value,
    MAX(value) as max_value,
    created_at AT TIME ZONE 'America/New_York' as created_at_est
FROM weekly_leaderboard_snapshots
WHERE week_start >= (CURRENT_DATE - INTERVAL '21 days')::DATE
GROUP BY week_start, leaderboard_type, created_at
ORDER BY week_start DESC, leaderboard_type;
```

### 3. **Test Automatic Snapshot Creation**

```sql
-- Manually trigger snapshot creation (for testing)
SELECT auto_create_weekly_snapshots();

-- Check if pg_cron job is scheduled
SELECT * FROM cron.job WHERE jobname = 'weekly-leaderboard-snapshot';
```

### 4. **Verify in React Dev Console**

When viewing leaderboards, look for these log messages:
```
🏁 [MaxSpeedLeaderboard] Fetching leaderboard data for mode: weekly
📅 [MaxSpeedLeaderboard] Week starts (EST-based): 2025-10-13T05:00:00.000Z
📅 [MaxSpeedLeaderboard] Week date range: 2025-10-13 to 2025-10-20
📊 [MaxSpeedLeaderboard] Calculating CHG from last week (EST): 2025-10-06 to 2025-10-13
✅ [MaxSpeedLeaderboard] Found 15 snapshot entries from last week
```

The UTC timestamps in logs are correct - they're 5 hours ahead of EST.

## Troubleshooting

### CHG Shows "—" for Everyone

**Possible causes:**
1. **No snapshot for last week** - System will auto-create one next Sunday
2. **New week just started** - Snapshot creation might be processing
3. **No trips from last week** - Users need to drive to get on the leaderboard

**Solution:**
- Check database for snapshots: `SELECT * FROM weekly_leaderboard_snapshots ORDER BY created_at DESC;`
- If empty, manually trigger: `SELECT auto_create_weekly_snapshots();`
- The fallback system should still calculate CHG from trip data automatically

### Week Boundaries Don't Match EST

**Symptom:** Leaderboard resets at wrong time for your timezone

**Solution:**
1. Check browser console for timezone calculation logs
2. Verify `lib/timezone-utils.ts` is using correct EST offset (-5 hours)
3. Clear browser cache and hard refresh (Cmd+Shift+R / Ctrl+Shift+F5)

### Snapshots Not Creating Automatically

**Check pg_cron status:**
```sql
-- View scheduled jobs
SELECT * FROM cron.job;

-- View recent job runs
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'weekly-leaderboard-snapshot')
ORDER BY start_time DESC 
LIMIT 10;
```

**If pg_cron is not available:**
- Use Supabase Edge Functions with external cron (GitHub Actions, Vercel Cron)
- Schedule to trigger every Sunday at 05:05 UTC (12:05 AM EST)

## Technical Implementation Details

### Week Boundary Calculation

```typescript
// EST offset from UTC (negative because EST is behind UTC)
const EST_OFFSET_HOURS = -5

// Convert current time to EST
function nowInEST(): Date {
  const now = new Date()
  const utcTime = now.getTime()
  const estTime = utcTime + (EST_OFFSET_HOURS * 60 * 60 * 1000)
  return new Date(estTime)
}

// Get Sunday midnight EST as UTC Date
function getStartOfWeekEST(): Date {
  const estNow = nowInEST()
  const estDayOfWeek = estNow.getUTCDay() // 0=Sunday, 6=Saturday
  
  // Go back to Sunday
  const sundayEST = new Date(estNow)
  sundayEST.setUTCDate(estNow.getUTCDate() - estDayOfWeek)
  sundayEST.setUTCHours(0, 0, 0, 0)
  
  // Convert back to UTC for database
  const sundayUTC = new Date(sundayEST.getTime() - (EST_OFFSET_HOURS * 60 * 60 * 1000))
  return sundayUTC
}
```

### Database Query Format

All Supabase queries use UTC ISO timestamps:
```typescript
// Query trips from this week
const { data } = await supabase
  .from('trips')
  .select('*')
  .gte('started_at', currentWeek.startUTC.toISOString()) // "2025-10-13T05:00:00.000Z"
  .lte('started_at', currentWeek.endUTC.toISOString())    // "2025-10-20T04:59:59.999Z"

// Query snapshots using DATE string
const { data } = await supabase
  .from('weekly_leaderboard_snapshots')
  .eq('week_start', lastWeek.startDateStr) // "2025-10-06"
  .eq('leaderboard_type', 'max_speed')
```

### Snapshot Table Schema

```sql
CREATE TABLE weekly_leaderboard_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    week_start DATE NOT NULL,              -- Sunday in YYYY-MM-DD format (EST-based)
    leaderboard_type TEXT NOT NULL,        -- 'max_speed' or 'distance'
    user_id UUID NOT NULL,
    position INTEGER NOT NULL,             -- 1-based ranking
    value NUMERIC NOT NULL,                -- Speed in MPS or distance in meters
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Benefits of EST-Based System

1. **Consistency**: Everyone resets at the same moment worldwide
2. **Predictability**: Users know exactly when reset happens in their timezone
3. **Fairness**: No timezone gets more or less time in a week
4. **Simplicity**: Single source of truth for week boundaries
5. **Reliability**: Fallback calculation ensures CHG always works

## Future Enhancements (Optional)

- [ ] Add DST support (auto-switch between EST/EDT)
- [ ] Show countdown timer to next reset in user's local time
- [ ] Weekly recap email sent at reset time
- [ ] Archive old week data for historical viewing
- [ ] "Last Week's Champion" banner in UI

---

## Summary

✅ Leaderboards reset every **Sunday at 12:00 AM EST**  
✅ Works correctly for users in **any timezone worldwide**  
✅ CHG indicators **always work** (snapshot or fallback)  
✅ Fully **automated** with pg_cron or edge functions  
✅ **Zero manual intervention** required  

The system automatically handles all timezone conversions and provides a consistent, fair experience for all users regardless of their location.
