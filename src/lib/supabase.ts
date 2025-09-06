import { createClient } from '@supabase/supabase-js'

// Evitar efeitos colaterais em tempo de build/prerender.
// Criamos o cliente apenas no navegador e sob demanda.
let browserSupabase: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (typeof window === 'undefined') {
    return null
  }
  if (browserSupabase) return browserSupabase

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nuolpdhxcarpdmoavmrf.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51b2xwZGh4Y2FycGRtb2F2bXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzOTIwMTIsImV4cCI6MjA2Njk2ODAxMn0.4ozPrMw7G8FHEpYDBQYwT6ZmghhtKMxVhHSOzkD2pTE'

  browserSupabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
    global: {
      headers: {
        'X-Client-Info': 'receitas-pro-frontend',
      },
    },
  })

  return browserSupabase
}

export default getSupabaseClient
