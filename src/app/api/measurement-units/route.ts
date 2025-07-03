import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET measurement-units - Iniciando...')
    
    const { user, error } = await getUser(request)
    if (error || !user) {
      console.log('❌ GET measurement-units - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ GET measurement-units - Usuário autenticado:', user.id)

    const units = await prisma.measurementUnit.findMany({
      where: { userId: user.id },
      orderBy: {
        name: 'asc'
      }
    })

    console.log('✅ GET measurement-units - Unidades encontradas:', units.length)
    return NextResponse.json(units)
  } catch (error) {
    console.error('❌ GET measurement-units - Erro:', error)
    return NextResponse.json(
      { error: 'Failed to fetch measurement units' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 POST measurement-units - Iniciando...')
    
    const { user, error } = await getUser(request)
    if (error || !user) {
      console.log('❌ POST measurement-units - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ POST measurement-units - Usuário autenticado:', user.id)

    const body = await request.json()
    console.log('📤 POST measurement-units - Dados recebidos:', body)
    
    // Teste simples primeiro - apenas campos obrigatórios
    const unit = await prisma.measurementUnit.create({
      data: {
        name: body.name || 'Teste',
        abbreviation: body.abbreviation || 'T',
        type: 'Peso', // Valor fixo para teste
        userId: user.id
      }
    })

    console.log('✅ POST measurement-units - Unidade criada:', unit)
    return NextResponse.json(unit, { status: 201 })
  } catch (error) {
    console.error('❌ POST measurement-units - Erro detalhado:', error)
    console.error('❌ POST measurement-units - Stack trace:', error.stack)
    return NextResponse.json(
      { error: 'Failed to create measurement unit' },
      { status: 500 }
    )
  }
}







