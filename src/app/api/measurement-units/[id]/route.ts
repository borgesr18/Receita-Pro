import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await getUser(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const unit = await prisma.measurementUnit.findFirst({
      where: { id: params.id, userId: user.id }
    })

    if (!unit) {
      return NextResponse.json(
        { error: 'Unit not found or access denied' },
        { status: 404 }
      )
    }

    // Mapear para o formato esperado pelo frontend
    const response = {
      id: unit.id,
      name: unit.name,
      symbol: unit.abbreviation,
      abbreviation: unit.abbreviation,
      type: unit.type,
      baseUnit: unit.baseUnit,
      conversionFactor: unit.conversionFactor,
      createdAt: unit.createdAt,
      updatedAt: unit.updatedAt,
      userId: unit.userId
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching measurement unit:', error)
    return NextResponse.json(
      { error: 'Failed to fetch measurement unit' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await getUser(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('📥 Dados de edição recebidos:', body)
    
    // Aceitar tanto 'symbol' quanto 'abbreviation'
    const abbreviation = body.symbol || body.abbreviation
    
    const result = await prisma.measurementUnit.updateMany({
      where: { id: params.id, userId: user.id },
      data: {
        name: body.name,
        abbreviation: abbreviation,
        type: body.type || 'WEIGHT',
        baseUnit: body.baseUnit || null,
        conversionFactor: parseFloat(body.conversionFactor) || 1
      }
    })

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Unit not found or access denied' },
        { status: 404 }
      )
    }

    const unit = await prisma.measurementUnit.findUnique({
      where: { id: params.id }
    })

    if (!unit) {
      return NextResponse.json(
        { error: 'Unit not found after update' },
        { status: 404 }
      )
    }

    // Retornar no formato esperado pelo frontend
    const response = {
      id: unit.id,
      name: unit.name,
      symbol: unit.abbreviation,
      abbreviation: unit.abbreviation,
      type: unit.type,
      baseUnit: unit.baseUnit,
      conversionFactor: unit.conversionFactor,
      createdAt: unit.createdAt,
      updatedAt: unit.updatedAt,
      userId: unit.userId
    }

    console.log('✅ Unidade atualizada:', response)
    return NextResponse.json(response)
  } catch (error) {
    console.error('❌ Error updating measurement unit:', error)
    
    // Verificar se é erro de duplicata
 if ((error as any).code === 'P2002') {
      return NextResponse.json(
        { error: 'A unit with this name or abbreviation already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update measurement unit' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await getUser(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await prisma.measurementUnit.deleteMany({
      where: { id: params.id, userId: user.id }
    })

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Unit not found or access denied' },
        { status: 404 }
      )
    }

    console.log('✅ Unidade deletada:', params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Error deleting measurement unit:', error)
    return NextResponse.json(
      { error: 'Failed to delete measurement unit' },
      { status: 500 }
    )
  }
}
