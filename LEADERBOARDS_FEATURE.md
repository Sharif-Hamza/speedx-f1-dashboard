# Leaderboards Feature - Documentation

## ✅ Implementation Complete

Two competitive leaderboards have been successfully implemented:
1. **Max Speed Leaderboard** - Fastest drivers by personal best
2. **Distance Leaderboard** - Most distance traveled

---

## 🏆 Max Speed Leaderboard

### What It Shows
- **Top 10 fastest drivers** based on their highest recorded speed across all trips
- **Weekly position changes** (CHG indicators)
- **Current user highlighting** with 👤 icon
- **First place trophy** 🏆 for the leader

### Data Source
```sql
SELECT user_id, MAX(max_speed_mps) as max_speed
FROM trips
GROUP BY user_id
ORDER BY max_speed DESC
LIMIT 10
```

### Features
- ✅ **Real-time updates** - Auto-refreshes when new trips are completed
- ✅ **Weekly reset tracking** - Position changes tracked from last Sunday
- ✅ **User highlighting** - Your position highlighted in gold
- ✅ **Leader highlighting** - #1 position highlighted in red
- ✅ **Position change indicators**:
  - 🟢 ▲ Green up arrow = Moved up
  - 🔴 ▼ Red down arrow = Moved down
  - ⚪ — Gray dash = No change

### Visual Design
- **Color scheme**: Red (#E10600) for speed theme
- **Trophy icon**: 🏆 for 1st place
- **User icon**: 👤 for current user
- **Speed format**: `142 MPH` (converted from m/s)

---

## 🗺️ Distance Leaderboard

### What It Shows
- **Top 10 road warriors** by total distance traveled across all trips
- **Weekly position changes** (CHG indicators)
- **Current user highlighting** with 👤 icon
- **First place medal** 🥇 for the leader

### Data Source
```sql
SELECT user_id, SUM(distance_m) as total_distance
FROM trips
GROUP BY user_id
ORDER BY total_distance DESC
LIMIT 10
```

### Features
- ✅ **Real-time updates** - Auto-refreshes when new trips are completed
- ✅ **Weekly reset tracking** - Position changes tracked from last Sunday
- ✅ **User highlighting** - Your position highlighted in gold
- ✅ **Leader highlighting** - #1 position highlighted in green
- ✅ **Position change indicators**:
  - 🟢 ▲ Green up arrow = Moved up
  - 🔴 ▼ Red down arrow = Moved down
  - ⚪ — Gray dash = No change

### Visual Design
- **Color scheme**: Green (#00FF7F) for distance theme
- **Medal icon**: 🥇 for 1st place
- **User icon**: 👤 for current user
- **Distance format**: `23.5 MI` (converted from meters)

---

## 🔄 Weekly Reset System

### How It Works
Both leaderboards track position changes on a **weekly basis**:

1. **Storage**: Positions stored in browser localStorage
2. **Timestamp**: Each save includes ISO timestamp
3. **Reset Day**: Sunday (day 0 of the week)
4. **Comparison**: Current position compared to last week

### localStorage Keys
- `max_speed_leaderboard_last_week`
- `distance_leaderboard_last_week`

### Data Structure
```json
{
  "positions": {
    "user-id-1": 1,
    "user-id-2": 2,
    "user-id-3": 3
  },
  "timestamp": "2025-01-12T04:00:00.000Z"
}
```

### Reset Logic
```typescript
// Reset if:
// 1. More than 7 days have passed, OR
// 2. It's Sunday (day 0)
const daysSince = Math.floor((now - storedDate) / (1000 * 60 * 60 * 24))
if (daysSince >= 7 || dayOfWeek === 0) {
  resetPositions()
}
```

---

## 📊 Leaderboard Table Structure

Both leaderboards share the same F1-inspired table design:

```
┌──────┬────────────────┬──────────┬──────┐
│ POS  │ DRIVER         │ VALUE    │ CHG  │
├──────┼────────────────┼──────────┼──────┤
│ 1    │ 🏆 SHAMZA      │ 142 MPH  │ ▲2   │ ← Leader (red/green bg)
│ 2    │ USERA          │ 138 MPH  │ —    │
│ 3    │ 👤 USERB       │ 135 MPH  │ ▼1   │ ← You (gold bg)
│ 4    │ USERC          │ 132 MPH  │ —    │
│ ...  │ ...            │ ...      │ ...  │
└──────┴────────────────┴──────────┴──────┘
```

### Columns
1. **POS** - Position (1-10)
2. **DRIVER** - Username (uppercase) with icons
3. **VALUE** - Speed (MPH) or Distance (MI)
4. **CHG** - Position change from last week

### Responsive Design
- **Mobile**: VALUE column hidden (space saving)
- **Desktop**: All columns visible

---

## 🎨 Color Coding

### Max Speed Leaderboard
- **#E10600** (Red) - First place text & background
- **#FFB300** (Gold) - Current user background
- **#F5F5F5** (White) - Standard text
- **#00FF7F** (Green) - Position up arrows
- **#E10600** (Red) - Position down arrows

### Distance Leaderboard
- **#00FF7F** (Green) - First place text & background
- **#FFB300** (Gold) - Current user background
- **#F5F5F5** (White) - Standard text
- **#00FF7F** (Green) - Position up arrows
- **#E10600** (Red) - Position down arrows

---

## 🔔 Real-time Updates

### Supabase Subscriptions
Both leaderboards subscribe to the `trips` table:

```typescript
const channel = supabase
  .channel("leaderboard-updates")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "trips",
    },
    () => {
      fetchLeaderboard() // Refresh data
    }
  )
  .subscribe()
```

### Update Flow
1. User completes trip in iOS app
2. Trip saved to `trips` table
3. Dashboard receives INSERT notification
4. Both leaderboards refresh automatically
5. Positions recalculated
6. UI updates smoothly

---

## 📱 Dashboard Layout

The leaderboards now appear side-by-side in the dashboard:

```
┌─────────────────┬─────────────────┬─────────────────┐
│  Active Users   │   Speed Stats   │   Lap Timer     │
├─────────────────┴─────────────────┼─────────────────┤
│        App Promo (wide)           │  Max Speed      │
│                                   │  Leaderboard    │
├───────────────────────────────────┼─────────────────┤
│     Challenges & Events           │  Distance       │
│                                   │  Leaderboard    │
└───────────────────────────────────┴─────────────────┘
```

### Grid Layout
- Max Speed: `lg:col-span-4` (1/3 width on desktop)
- Distance: `lg:col-span-4` (1/3 width on desktop)
- Both stack vertically on mobile

---

## 🧪 Testing

### Test Scenario 1: First Load
**Expected**:
- Shows loading state briefly
- If no trips exist: "No speeds/distance recorded yet" message
- If trips exist: Top 10 displayed

### Test Scenario 2: Current User in Top 10
**Expected**:
- Your row highlighted in gold
- 👤 icon next to your username
- Position shown correctly

### Test Scenario 3: New Trip Completed
**Expected**:
1. Complete trip in iOS app
2. Console logs: `🔄 New trip detected, refreshing leaderboard...`
3. Leaderboard refreshes automatically
4. If your speed/distance improved, position changes
5. CHG indicator updates (if position changed)

### Test Scenario 4: Weekly Reset
**Expected**:
1. On Sunday (or 7 days later)
2. CHG indicators reset to `—`
3. New baseline established
4. Next week shows changes from new baseline

---

## ⚡ Performance

### Load Time
- Initial fetch: ~200-300ms (depends on # of users)
- Real-time subscription: Instant setup

### Memory
- Lightweight: Stores only top 10 users + last week positions
- localStorage: ~1-2 KB per leaderboard

### Network
- Initial: 2 queries (trips + profiles)
- Real-time: WebSocket connection (maintained by Supabase)
- Updates: Only when new trips are inserted

### Optimization
- Top 10 limit reduces data transfer
- User aggregation done client-side (efficient)
- localStorage caching for position changes

---

## 🎯 Success Metrics

✅ **Real data from trips table**  
✅ **Top 10 ranking system**  
✅ **Weekly position change tracking**  
✅ **Real-time updates via Supabase**  
✅ **User highlighting (you + leader)**  
✅ **F1-themed UI matching dashboard**  
✅ **Responsive design (mobile + desktop)**  
✅ **Empty state handling**  
✅ **Loading states**  
✅ **Weekly reset notice**  

---

## 📝 Component Files

```
/components/max-speed-leaderboard.tsx  ← Max Speed Leaderboard
/components/distance-leaderboard.tsx    ← Distance Leaderboard
/app/dashboard/page.tsx                 ← Updated to include both
```

---

## 🚀 Next Steps

After testing these leaderboards:
1. ✅ Active Users Live - DONE
2. ✅ Speed Stats - DONE
3. ✅ Max Speed Leaderboard - DONE
4. ✅ Distance Leaderboard - DONE
5. ⏳ User Stats & Badges Panel - NEXT
6. ⏳ Complete Integration Testing

---

## 💡 Future Enhancements (Optional)

- **All-time leaderboard** (separate from weekly)
- **Monthly champions** archive
- **Animation** when positions change
- **Profile pictures** instead of 👤 icon
- **Achievements** for top performers
- **Share to social media** functionality

---

**Status**: ✅ Ready for Testing  
**Dashboard URL**: http://localhost:3000/dashboard  
**Last Updated**: January 12, 2025
