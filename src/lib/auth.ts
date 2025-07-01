import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import { syncUser } from './user-sync'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey)

export async function getUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No authorization token provided')
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Usar o token para obter o usuário
    const { data: { user }, error } = await supabaseServer.auth.getUser(token)
    
    if (error || !user) {
      throw new Error('Invalid or expired token')
    }

    // Sincronizar usuário automaticamente
    try {
      await syncUser(user.id, user.email!)
    } catch (syncError) {
      console.warn('Erro na sincronização do usuário:', syncError)
      // Não falhar a autenticação por erro de sincronização
    }

    return { user, error: null }
  } catch (error) {
    return { user: null, error: error instanceof Error ? error.message : 'Authentication failed' }
  }
}

export function parseDate(dateString: string | null | undefined): Date | null {
  if (!dateString || dateString === '' || dateString === 'undefined') return null
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return null
    
    const year = date.getFullYear()
    if (year < 1900 || year > 2100) return null
    
    return date
  } catch {
    return null
  }
}
