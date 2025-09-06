import { prisma } from './prisma'
import { getSupabaseAdmin } from './auth'

export async function syncUser(supabaseUserId: string, email: string) {
  try {
    // Verificar se o usuário já existe na tabela users
    let user = await prisma.user.findUnique({
      where: { id: supabaseUserId }
    })

    if (!user) {
      // Criar usuário na tabela users se não existir
      user = await prisma.user.create({
        data: {
          id: supabaseUserId,
          email: email,
          name: email.split('@')[0], // Usar parte do email como nome
          role: 'ADMIN' // Definir como admin por padrão
        }
      })
      console.log('Usuário sincronizado:', user)
    }

    return user
  } catch (error) {
    console.error('Erro ao sincronizar usuário:', error)
    throw error
  }
}

export async function ensureUserExists(supabaseUserId: string) {
  try {
    // Buscar dados do usuário no Supabase Auth
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      throw new Error('Supabase não configurado')
    }
    const { data: { user }, error } = await supabase.auth.admin.getUserById(supabaseUserId)
    
    if (error || !user) {
      throw new Error('Usuário não encontrado no Supabase Auth')
    }

    // Sincronizar com a tabela users
    return await syncUser(user.id, user.email!)
  } catch (error) {
    console.error('Erro ao garantir existência do usuário:', error)
    throw error
  }
}

