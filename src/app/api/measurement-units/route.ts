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
    
    // Validação básica
    if (!body.name || !body.abbreviation || !body.type) {
      console.log('❌ POST measurement-units - Dados obrigatórios faltando')
      return NextResponse.json(
        { error: 'Name, abbreviation and type are required' },
        { status: 400 }
      )
    }

    // Preparar dados para criação - INCLUINDO TODOS OS CAMPOS
    const unitData = {
      name: body.name.trim(),
      abbreviation: body.abbreviation.trim(),
      type: body.type,
      baseUnit: body.baseUnit || null,
      conversionFactor: body.conversionFactor ? parseFloat(body.conversionFactor.toString()) : 1.0,
      userId: user.id
    }

    console.log('📤 POST measurement-units - Dados preparados para criação:', unitData)
    
    const unit = await prisma.measurementUnit.create({
      data: unitData
    })

    console.log('✅ POST measurement-units - Unidade criada com sucesso:', unit)
    return NextResponse.json(unit, { status: 201 })
  } catch (error) {
    console.error('❌ POST measurement-units - Erro detalhado:', error)
    console.error('❌ POST measurement-units - Stack trace:', error.stack)
    
    // Tratamento específico para erro de duplicação
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A measurement unit with this name or abbreviation already exists' },
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
    console.log('🔍 PUT measurement-units - Iniciando...')
    
    const { user, error } = await getUser(request)
    if (error || !user) {
      console.log('❌ PUT measurement-units - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body
    
    console.log('📤 PUT measurement-units - Dados recebidos:', { id, updateData })

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    // Preparar dados para atualização - INCLUINDO TODOS OS CAMPOS
    const unitData = {
      name: updateData.name?.trim(),
      abbreviation: updateData.abbreviation?.trim(),
      type: updateData.type,
      baseUnit: updateData.baseUnit || null,
      conversionFactor: updateData.conversionFactor ? parseFloat(updateData.conversionFactor.toString()) : 1.0,
      updatedAt: new Date()
    }

    console.log('📤 PUT measurement-units - Dados preparados para atualização:', unitData)

    const unit = await prisma.measurementUnit.update({
      where: { 
        id: id,
        userId: user.id 
      },
      data: unitData
    })

    console.log('✅ PUT measurement-units - Unidade atualizada:', unit)
    return NextResponse.json(unit)
  } catch (error) {
    console.error('❌ PUT measurement-units - Erro:', error)
    return NextResponse.json(
      { error: 'Failed to update measurement unit' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🔍 DELETE measurement-units - Iniciando...')
    
    const { user, error } = await getUser(request)
    if (error || !user) {
      console.log('❌ DELETE measurement-units - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()
    
    console.log('📤 DELETE measurement-units - ID recebido:', id)

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await prisma.measurementUnit.delete({
      where: { 
        id: id,
        userId: user.id 
      }
    })

    console.log('✅ DELETE measurement-units - Unidade excluída')
    return NextResponse.json({ message: 'Measurement unit deleted successfully' })
  } catch (error) {
    console.error('❌ DELETE measurement-units - Erro:', error)
    return NextResponse.json(
      { error: 'Failed to delete measurement unit' },
      { status: 500 }
    )
  }
}








