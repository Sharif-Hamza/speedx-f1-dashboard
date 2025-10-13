"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, UserProfile, WaitlistUser } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  waitlistStatus: WaitlistUser | null
  loading: boolean
  signUp: (email: string, password: string, username: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  checkWaitlistStatus: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [waitlistStatus, setWaitlistStatus] = useState<WaitlistUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const checkWaitlistStatus = async () => {
    // Get current user from auth session directly
    const { data: { session } } = await supabase.auth.getSession()
    const currentUser = session?.user
    
    if (!currentUser) {
      setWaitlistStatus(null)
      return
    }

    try {
      console.log('🔍 Checking waitlist status for user:', currentUser.id)
      const { data, error } = await supabase
        .from('waitlist_users')
        .select('*')
        .eq('auth_user_id', currentUser.id)
        .maybeSingle()

      if (error) {
        console.error('❌ Error checking waitlist status:', error)
        // If no waitlist entry, user is approved by default (existing user)
        setWaitlistStatus(null)
        return
      }

      // If no waitlist entry exists, user is an existing user (approved)
      if (!data) {
        console.log('✅ No waitlist entry - user is approved (existing user)')
        setWaitlistStatus(null)
      } else {
        console.log('📋 Waitlist status:', data.status)
        setWaitlistStatus(data)
      }
    } catch (error) {
      console.error('❌ Error checking waitlist status:', error)
      setWaitlistStatus(null)
    }
  }

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)  // SpeedX uses 'id' not 'user_id'
        .maybeSingle()

      if (error) {
        console.error('Error fetching profile:', error)
        setProfile(null)
        return
      }

      if (data) {
        // If profile exists but waitlist_approved is null/undefined, treat as approved (existing user)
        if (data.waitlist_approved === null || data.waitlist_approved === undefined) {
          data.waitlist_approved = true
        }
        setProfile(data)
      } else {
        // User might not have a profile yet, that's okay
        setProfile(null)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setProfile(null)
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('🔐 Initial session check:', session?.user?.id || 'No user')
      setUser(session?.user ?? null)
      if (session?.user) {
        await Promise.all([
          fetchProfile(session.user.id),
          checkWaitlistStatus()
        ])
      }
      setLoading(false)
      console.log('✅ Auth loading complete')
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('🔄 Auth state changed:', _event, session?.user?.id || 'No user')
      setUser(session?.user ?? null)
      if (session?.user) {
        await Promise.all([
          fetchProfile(session.user.id),
          checkWaitlistStatus()
        ])
      } else {
        setProfile(null)
        setWaitlistStatus(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, username: string) => {
    try {
      // First check if username is already taken
      const { data: existingUsername } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle()
      
      if (existingUsername) {
        return { error: { message: 'Username is already taken' } }
      }
      
      // Create auth user with email confirmation
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          },
          emailRedirectTo: `${window.location.origin}/pending`,
        },
      })

      if (authError) return { error: authError }

      // Wait a moment for auth to propagate
      await new Promise(resolve => setTimeout(resolve, 500))

      // Create waitlist entry using service role (bypass RLS)
      if (authData.user) {
        console.log('🔍 Attempting to create waitlist entry for:', authData.user.id)
        console.log('🔍 User session exists:', !!authData.session)
        
        // Use the public insert with the user's session
        const { data: insertData, error: waitlistError } = await supabase
          .from('waitlist_users')
          .insert({
            auth_user_id: authData.user.id,
            email,
            full_name: username,  // Store username in full_name field for now
            status: 'pending',
          })
          .select()

        if (waitlistError) {
          console.error('❌ WAITLIST ERROR:', waitlistError)
          console.error('Error code:', waitlistError.code)
          console.error('Error message:', waitlistError.message)
          console.error('Error details:', waitlistError.details)
          console.error('Full error object:', JSON.stringify(waitlistError, null, 2))
          // Don't fail the signup if waitlist insert fails
          // We can add them to waitlist later
        } else {
          console.log('✅ Waitlist entry created successfully!', insertData)
          console.log('ℹ️ Profile will be created when admin approves the user')
        }
      } else {
        console.error('❌ No user returned from signup')
      }

      return { error: null, needsEmailVerification: !authData.session }
    } catch (error: any) {
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) return { error }

      return { error: null }
    } catch (error: any) {
      return { error }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setWaitlistStatus(null)
    router.push('/waitlist')
  }

  const value = {
    user,
    profile,
    waitlistStatus,
    loading,
    signUp,
    signIn,
    signOut,
    checkWaitlistStatus,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
