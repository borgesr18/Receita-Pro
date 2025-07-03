import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getUser(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Consulta SQL para obter os valores possíveis do enum UnitType diretamente do Supabase
    const result = await prisma.$queryRaw`
      SELECT unnest(enum_range(NULL::public."UnitType")) as value
    ` as Array<{ value: string }>

    // Mapear os valores para o formato esperado pelo frontend
    const unitTypes = result.map(item => ({
      value: item.value,
      label: item.value  // Usar o mesmo valor como label já que está em português
    }))

    console.log('✅ Valores do enum UnitType carregados dinamicamente do Supabase:', unitTypes)
    
    return NextResponse.json(unitTypes)
  } catch (error) {
    console.error('❌ Erro ao buscar valores do enum UnitType dinamicamente:', error)
    
    // Fallback para valores padrão em caso de erro na consulta
    const fallbackTypes = [
      { value: 'Peso', label: 'Peso' },
      { value: 'Volume', label: 'Volume' },
      { value: 'Comprimento', label: 'Comprimento' },
      { value: 'Pacote', label: 'Pacote' }
    ]
    
    console.log('⚠️ Usando valores fallback:', fallbackTypes)
    return NextResponse.json(fallbackTypes)
  }
}

