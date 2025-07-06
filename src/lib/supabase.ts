import { createClient } from '@supabase/supabase-js'

// Verificar se as variáveis estão definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔧 Configuração Supabase:')
console.log('URL:', supabaseUrl ? '✅ Definida' : '❌ Não definida')
console.log('Key:', supabaseAnonKey ? '✅ Definida' : '❌ Não definida')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Presente' : 'Ausente')
}

// Criar cliente com configurações otimizadas
export const supabase = createClient(
  supabaseUrl || 'https://nuolpdhxcarpdmoavmrf.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51b2xwZGh4Y2FycGRtb2F2bXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzOTIwMTIsImV4cCI6MjA2Njk2ODAxMn0.4ozPrMw7G8FHEpYDBQYwT6ZmghhtKMxVhHSOzkD2pTE',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    global: {
      headers: {
        'X-Client-Info': 'receitas-pro-frontend'
      }
    }
  }
)

// Expor globalmente para debug
if (typeof window !== 'undefined') {
  (window as any).supabase = supabase
  console.log('🌐 Cliente Supabase exposto globalmente para debug')
}

// Verificar conexão inicial
supabase.auth.getSession().then(({ data: { session }, error }) => {
  if (error) {
    console.error('❌ Erro ao verificar sessão inicial:', error)
  } else {
    console.log('📊 Sessão inicial:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      hasToken: !!session?.access_token,
      userEmail: session?.user?.email
    })
  }
})

export default supabase
