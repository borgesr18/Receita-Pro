import { supabase } from './supabase'

export interface ApiResponse<T> {
  data?: T
  error?: string
}

export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    console.log('🔄 Iniciando requisição para:', url)
    
    // Verificar se o cliente Supabase está funcionando
    if (!supabase) {
      console.error('❌ Cliente Supabase não inicializado')
      return { error: 'Cliente Supabase não inicializado' }
    }
    
    // Obter sessão com retry
    let session = null
    let attempts = 0
    const maxAttempts = 3

    while (!session && attempts < maxAttempts) {
      console.log(`🔍 Tentativa ${attempts + 1} de obter sessão...`)
      
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Erro ao obter sessão:', error)
        } else {
          session = currentSession
          console.log('📊 Sessão obtida:', {
            hasSession: !!session,
            hasUser: !!session?.user,
            hasToken: !!session?.access_token,
            userEmail: session?.user?.email
          })
        }
      } catch (sessionError) {
        console.error('❌ Erro na tentativa de obter sessão:', sessionError)
      }
      
      if (!session && attempts < maxAttempts - 1) {
        console.log('⏳ Aguardando antes de tentar novamente...')
        await new Promise(resolve => setTimeout(resolve, 300))
      }
      attempts++
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    }
    
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
      console.log('✅ Token adicionado ao header')
      console.log('🔑 Token (primeiros 20 chars):', session.access_token.substring(0, 20) + '...')
    } else {
      console.warn('⚠️ Nenhum token de acesso disponível')
      console.log('📊 Estado da autenticação:', {
        hasSupabase: !!supabase,
        hasSession: !!session,
        hasUser: !!session?.user,
        attempts: attempts
      })
      return { error: 'Usuário não autenticado - faça login novamente' }
    }

    console.log('📡 Fazendo requisição HTTP...')
    console.log('🔧 Headers enviados:', Object.keys(headers))
    
    const response = await fetch(url, {
      headers,
      ...options,
    })

    console.log('📊 Status da resposta:', response.status)
    console.log('📊 Headers da resposta:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro da API:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      })
      
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: errorText || `HTTP ${response.status}: ${response.statusText}` }
      }
      
      return { error: errorData.error || `HTTP ${response.status}: ${response.statusText}` }
    }

    const responseText = await response.text()
    console.log('📄 Resposta recebida (primeiros 200 chars):', responseText.substring(0, 200) + '...')
    
    let data
    try {
      data = JSON.parse(responseText)
      console.log('✅ Dados parseados com sucesso')
    } catch (parseError) {
      console.warn('⚠️ Erro ao parsear JSON, retornando texto:', parseError)
      data = responseText
    }
    
    return { data }
  } catch (error) {
    console.error('❌ Erro geral na requisição:', error)
    return { 
      error: error instanceof Error ? error.message : 'Erro de rede desconhecido' 
    }
  }
}

export const api = {
  get: <T>(url: string) => {
    console.log('🔍 API GET:', url)
    return apiRequest<T>(url)
  },
  post: <T>(url: string, data: Record<string, unknown>) => {
    console.log('📝 API POST:', url, data)
    return apiRequest<T>(url, { method: 'POST', body: JSON.stringify(data) })
  },
  put: <T>(url: string, data: Record<string, unknown>) => {
    console.log('✏️ API PUT:', url, data)
    return apiRequest<T>(url, { method: 'PUT', body: JSON.stringify(data) })
  },
  delete: <T>(url: string) => {
    console.log('🗑️ API DELETE:', url)
    return apiRequest<T>(url, { method: 'DELETE' })
  },
}

// Expor API globalmente para debug
if (typeof window !== 'undefined') {
  (window as any).api = api
  console.log('🌐 API exposta globalmente para debug')
}

export { supabase }
