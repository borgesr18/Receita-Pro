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
    
    const unit = await prisma.measurementUnit.create({
      data: {
        name: body.name,
        abbreviation: body.abbreviation,
        type: body.type,
        baseUnit: body.baseUnit || null,
        conversionFactor: parseFloat(body.conversionFactor) || 1.0,
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




