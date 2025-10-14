/**
 * EST TIMEZONE UTILITIES
 * =====================
 * These functions ensure that weekly leaderboard resets happen consistently
 * at Sunday midnight EST (Eastern Standard Time = UTC-5), regardless of the
 * user's local timezone.
 * 
 * IMPORTANT: This uses EST year-round (not EDT). If you want automatic DST
 * handling, replace EST_OFFSET_HOURS with a library like date-fns-tz.
 */

// EST is UTC-5 (we use EST year-round for simplicity)
// If you want EDT (UTC-4) during daylight saving, use a date library
const EST_OFFSET_HOURS = -5

/**
 * Get the current time in EST
 */
export function nowInEST(): Date {
  const now = new Date()
  return convertToEST(now)
}

/**
 * Convert any Date to EST
 */
export function convertToEST(date: Date): Date {
  // Get UTC time
  const utcTime = date.getTime()
  
  // Apply EST offset (EST = UTC - 5 hours)
  const estTime = utcTime + (EST_OFFSET_HOURS * 60 * 60 * 1000)
  
  return new Date(estTime)
}

/**
 * Get the start of the current week in EST (Sunday at midnight EST)
 * Returns a UTC Date object representing that moment
 */
export function getStartOfWeekEST(referenceDate?: Date): Date {
  const estNow = referenceDate ? convertToEST(referenceDate) : nowInEST()
  
  // Get day of week in EST (0 = Sunday, 6 = Saturday)
  const estDayOfWeek = estNow.getUTCDay()
  
  // Calculate how many days to go back to reach Sunday
  const daysToSubtract = estDayOfWeek
  
  // Create Sunday midnight EST
  const sundayEST = new Date(estNow)
  sundayEST.setUTCDate(estNow.getUTCDate() - daysToSubtract)
  sundayEST.setUTCHours(0, 0, 0, 0)
  
  // Convert back to actual UTC for database queries
  // If it's midnight EST, that's 5:00 AM UTC
  const sundayUTC = new Date(sundayEST.getTime() - (EST_OFFSET_HOURS * 60 * 60 * 1000))
  
  return sundayUTC
}

/**
 * Get the end of the current week in EST (Saturday at 11:59:59.999 PM EST)
 * Returns a UTC Date object representing that moment
 */
export function getEndOfWeekEST(referenceDate?: Date): Date {
  const startOfWeek = getStartOfWeekEST(referenceDate)
  
  // Add 7 days minus 1 millisecond
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 7)
  endOfWeek.setUTCMilliseconds(-1) // Last moment of Saturday
  
  return endOfWeek
}

/**
 * Get the start of last week in EST (previous Sunday at midnight EST)
 */
export function getStartOfLastWeekEST(referenceDate?: Date): Date {
  const thisWeekStart = getStartOfWeekEST(referenceDate)
  const lastWeekStart = new Date(thisWeekStart)
  lastWeekStart.setUTCDate(thisWeekStart.getUTCDate() - 7)
  return lastWeekStart
}

/**
 * Get the end of last week in EST (previous Saturday at 11:59:59.999 PM EST)
 */
export function getEndOfLastWeekEST(referenceDate?: Date): Date {
  const lastWeekStart = getStartOfLastWeekEST(referenceDate)
  const lastWeekEnd = new Date(lastWeekStart)
  lastWeekEnd.setUTCDate(lastWeekStart.getUTCDate() + 7)
  lastWeekEnd.setUTCMilliseconds(-1)
  return lastWeekEnd
}

/**
 * Format a Date as YYYY-MM-DD (for Supabase DATE columns)
 */
export function formatDateForDB(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Get week boundaries for database queries (current week)
 */
export interface WeekBoundaries {
  startUTC: Date
  endUTC: Date
  startDateStr: string // YYYY-MM-DD format for DB queries
  endDateStr: string
}

export function getCurrentWeekBoundaries(): WeekBoundaries {
  const startUTC = getStartOfWeekEST()
  const endUTC = getEndOfWeekEST()
  
  return {
    startUTC,
    endUTC,
    startDateStr: formatDateForDB(startUTC),
    endDateStr: formatDateForDB(endUTC)
  }
}

/**
 * Get week boundaries for last week
 */
export function getLastWeekBoundaries(): WeekBoundaries {
  const startUTC = getStartOfLastWeekEST()
  const endUTC = getEndOfLastWeekEST()
  
  return {
    startUTC,
    endUTC,
    startDateStr: formatDateForDB(startUTC),
    endDateStr: formatDateForDB(endUTC)
  }
}

/**
 * Debug helper: Show when the next reset will happen in user's local time
 */
export function getNextResetInfo(): {
  nextResetEST: Date
  nextResetLocal: Date
  hoursUntilReset: number
} {
  const now = new Date()
  const currentWeekStart = getStartOfWeekEST(now)
  
  // Next reset is 7 days after current week start
  const nextResetUTC = new Date(currentWeekStart)
  nextResetUTC.setUTCDate(currentWeekStart.getUTCDate() + 7)
  
  // Convert to user's local time for display
  const nextResetLocal = new Date(nextResetUTC)
  
  // Calculate hours until reset
  const hoursUntilReset = (nextResetUTC.getTime() - now.getTime()) / (1000 * 60 * 60)
  
  return {
    nextResetEST: nextResetUTC,
    nextResetLocal,
    hoursUntilReset
  }
}
