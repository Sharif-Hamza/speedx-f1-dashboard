import { createClient } from '@supabase/supabase-js'

// For server-side API routes, use regular env vars (without NEXT_PUBLIC_)
// For client-side, use NEXT_PUBLIC_ vars
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Set to false for server-side
    autoRefreshToken: false,
  }
})

// Types for waitlist users
export interface WaitlistUser {
  id: string
  email: string
  full_name: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
  reviewed_by?: string
  reviewed_at?: string
  rejection_reason?: string
}

// Types for user profiles (matching SpeedX schema)
export interface UserProfile {
  id: string  // This is the auth user ID in SpeedX
  username: string
  email: string
  display_name?: string
  avatar_url?: string
  total_distance_m?: number
  total_trips?: number
  waitlist_approved?: boolean
  created_at: string
  updated_at: string
}
