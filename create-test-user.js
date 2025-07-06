const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://nuolpdhxcarpdmoavmrf.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51b2xwZGh4Y2FycGRtb2F2bXJmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTM5MjAxMiwiZXhwIjoyMDY2OTY4MDEyfQ.-_QnIC1L4-axK1p-ixeJYI7Gpy45V3JejRyoR5-I2v4'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTestUser() {
  try {
    console.log('Confirmando email do usuário existente...')
    
    // Primeiro, vamos buscar o usuário
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('Erro ao listar usuários:', listError)
      return
    }
    
    const user = users.users.find(u => u.email === 'teste@receitas.com')
    
    if (user) {
      console.log('Usuário encontrado:', user.id)
      
      // Confirmar o email do usuário
      const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
        email_confirm: true
      })
      
      if (error) {
        console.error('Erro ao confirmar email:', error)
      } else {
        console.log('Email confirmado com sucesso!')
      }
    } else {
      console.log('Usuário não encontrado')
    }
  } catch (err) {
    console.error('Erro:', err)
  }
}

createTestUser()

