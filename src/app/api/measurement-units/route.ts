import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getUser(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const units = await prisma.measurementUnit.findMany({
      where: { userId: user.id },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(units)
  } catch (error) {
    console.error('❌ Error fetching measurement units:', error)
    return NextResponse.json(
      { error: 'Failed to fetch measurement units' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getUser(request)
    if (error || !user) {
      console.error('❌ Unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('📤 Dados recebidos para criar unidade:', body)
    
    // Validação dos dados obrigatórios
    if (!body.name || !body.abbreviation || !body.type) {
      console.error('❌ Dados obrigatórios faltando:', { name: body.name, abbreviation: body.abbreviation, type: body.type })
      return NextResponse.json(
        { error: 'Nome, símbolo e tipo são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar os tipos válidos dinamicamente do banco
    let validTypes: string[] = []
    try {
      const result = await prisma.$queryRaw`
        SELECT unnest(enum_range(NULL::public."UnitType")) as value
      ` as Array<{ value: string }>
      validTypes = result.map(item => item.value)
    } catch (enumError) {
      console.error('❌ Erro ao buscar tipos válidos, usando fallback:', enumError)
      // Fallback para os valores que você definiu no Supabase
      validTypes = ['Peso', 'Volume', 'Comprimento', 'Pacote']
    }

    console.log('✅ Tipos válidos encontrados:', validTypes)

    if (!validTypes.includes(body.type)) {
      console.error('❌ Tipo inválido:', body.type, 'Tipos válidos:', validTypes)
      return NextResponse.json(
        { error: `Tipo de unidade inválido. Tipos válidos: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }
    
    const unit = await prisma.measurementUnit.create({
      data: {
        name: body.name.trim(),
        abbreviation: body.abbreviation.trim(),
        type: body.type,
        baseUnit: body.baseUnit ? body.baseUnit.trim() : null,
        conversionFactor: parseFloat(body.conversionFactor) || 1.0,
        userId: user.id
      }
    })

    console.log('✅ Unidade criada com sucesso:', unit)
    return NextResponse.json(unit, { status: 201 })
  } catch (error) {
    console.error('❌ Error creating measurement unit:', error)
    
    // Verificar se é erro de duplicação - TypeScript safe
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Já existe uma unidade com este nome ou símbolo' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create measurement unit' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, error } = await getUser(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body
    
    console.log('📤 Dados recebidos para atualizar unidade:', { id, updateData })

    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório para atualização' },
        { status: 400 }
      )
    }

    // Validação dos dados obrigatórios
    if (!updateData.name || !updateData.abbreviation || !updateData.type) {
      return NextResponse.json(
        { error: 'Nome, símbolo e tipo são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar os tipos válidos dinamicamente do banco
    let validTypes: string[] = []
    try {
      const result = await prisma.$queryRaw`
        SELECT unnest(enum_range(NULL::public."UnitType")) as value
      ` as Array<{ value: string }>
      validTypes = result.map(item => item.value)
    } catch (enumError) {
      console.error('❌ Erro ao buscar tipos válidos, usando fallback:', enumError)
      validTypes = ['Peso', 'Volume', 'Comprimento', 'Pacote']
    }

    if (!validTypes.includes(updateData.type)) {
      return NextResponse.json(
        { error: `Tipo de unidade inválido. Tipos válidos: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    const unit = await prisma.measurementUnit.update({
      where: { 
        id: id,
        userId: user.id 
      },
      data: {
        name: updateData.name.trim(),
        abbreviation: updateData.abbreviation.trim(),
        type: updateData.type,
        baseUnit: updateData.baseUnit ? updateData.baseUnit.trim() : null,
        conversionFactor: parseFloat(updateData.conversionFactor) || 1.0
      }
    })

    console.log('✅ Unidade atualizada com sucesso:', unit)
    return NextResponse.json(unit)
  } catch (error) {
    console.error('❌ Error updating measurement unit:', error)
    
    // Verificar se é erro de duplicação - TypeScript safe
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Já existe uma unidade com este nome ou símbolo' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update measurement unit' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user, error } = await getUser(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()

    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      )
    }

    await prisma.measurementUnit.delete({
      where: { 
        id: id,
        userId: user.id 
      }
    })

    console.log('✅ Unidade excluída com sucesso:', id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Error deleting measurement unit:', error)
    return NextResponse.json(
      { error: 'Failed to delete measurement unit' },
      { status: 500 }
    )
  }
}


