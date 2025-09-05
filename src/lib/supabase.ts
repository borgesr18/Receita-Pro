import { createClient } from '@supabase/supabase-js'

// Verificar se as variáveis estão definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔧 Configuração Supabase:')
console.log('URL:', supabaseUrl ? '✅ Definida' : '❌ Não definida')
console.log('Key:', supabaseAnonKey ? '✅ Definida' : '❌ Não definida')



// Validar variáveis obrigatórias
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variáveis de ambiente do Supabase são obrigatórias: NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY'
  )
}

// Criar cliente com configurações otimizadas
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
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
