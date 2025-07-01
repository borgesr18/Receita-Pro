import { createClient } from '@supabase/supabase-js'

export interface ApiResponse<T> {
  data?: T
  error?: string
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    }
    
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }

    const response = await fetch(url, {
      headers,
      ...options,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return { error: errorData.error || `HTTP ${response.status}` }
    }

    const data = await response.json()
    return { data }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Network error' }
  }
}

export const api = {
  get: <T>(url: string) => apiRequest<T>(url),
  post: <T>(url: string, data: Record<string, unknown>) => 
    apiRequest<T>(url, { method: 'POST', body: JSON.stringify(data) }),
  put: <T>(url: string, data: Record<string, unknown>) => 
    apiRequest<T>(url, { method: 'PUT', body: JSON.stringify(data) }),
  delete: <T>(url: string) => 
    apiRequest<T>(url, { method: 'DELETE' }),
}
