'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

let browserSupabase: ReturnType<typeof createClient> | null = null
function getSupabase() {
  if (typeof window === 'undefined') return null
  if (browserSupabase) return browserSupabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nuolpdhxcarpdmoavmrf.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51b2xwZGh4Y2FycGRtb2F2bXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzOTIwMTIsImV4cCI6MjA2Njk2ODAxMn0.4ozPrMw7G8FHEpYDBQYwT6ZmghhtKMxVhHSOzkD2pTE'
  browserSupabase = createClient(supabaseUrl, supabaseAnonKey)
  return browserSupabase
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getInitialSession = async () => {
      const supabase = getSupabase()
      if (!supabase) return
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    const supabase = getSupabase()
    if (!supabase) return
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
        
        if (event === 'SIGNED_OUT' || !session) {
          router.push('/login')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router])

  const signOut = async () => {
    const supabase = getSupabase()
    if (!supabase) return
    await supabase.auth.signOut()
  }

  const value = {
    user,
    loading,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
