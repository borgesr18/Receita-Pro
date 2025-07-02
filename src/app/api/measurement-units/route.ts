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

    // Mapear para o formato esperado pelo frontend
    const mappedUnits = units.map(unit => ({
      id: unit.id,
      name: unit.name,
      symbol: unit.abbreviation, // Mapear abbreviation para symbol
      abbreviation: unit.abbreviation,
      type: unit.type,
      baseUnit: unit.baseUnit,
      conversionFactor: unit.conversionFactor,
      createdAt: unit.createdAt,
      updatedAt: unit.updatedAt,
      userId: unit.userId
    }))

    return NextResponse.json(mappedUnits)
  } catch (error) {
    console.error('Error fetching measurement units:', error)
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('📥 Dados recebidos:', body)
    
    // Aceitar tanto 'symbol' quanto 'abbreviation'
    const abbreviation = body.symbol || body.abbreviation
    if (!abbreviation) {
      return NextResponse.json(
        { error: 'Symbol/abbreviation is required' },
        { status: 400 }
      )
    }

    if (!body.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const unit = await prisma.measurementUnit.create({
      data: {
        name: body.name,
        abbreviation: abbreviation,
        type: body.type || 'WEIGHT', // Padrão se não fornecido
        baseUnit: body.baseUnit || null,
        conversionFactor: parseFloat(body.conversionFactor) || 1,
        userId: user.id
      }
    })

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

    console.log('✅ Unidade criada:', response)
    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('❌ Error creating measurement unit:', error)
    
    // Verificar se é erro de duplicata
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A unit with this name or abbreviation already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create measurement unit' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getUser(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    const unit = await prisma.measurementUnit.create({
      data: {
        name: body.name,
        abbreviation: body.abbreviation,
        type: body.type,
        baseUnit: body.baseUnit || null,
        conversionFactor: parseFloat(body.conversionFactor) || 1,
        userId: user.id
      }
    })

    return NextResponse.json(unit, { status: 201 })
  } catch (error) {
    console.error('Error creating measurement unit:', error)
    return NextResponse.json(
      { error: 'Failed to create measurement unit' },
      { status: 500 }
    )
  }
}
