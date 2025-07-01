import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getUser(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const unit = await prisma.measurementUnit.findFirst({
      where: { id: params.id, userId: user.id }
    })

    if (!unit) {
      return NextResponse.json(
        { error: 'Unit not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json(unit)
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
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getUser(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const body = await request.json()
    
    const result = await prisma.measurementUnit.updateMany({
      where: { id: params.id, userId: user.id },
      data: {
        name: body.name,
        abbreviation: body.abbreviation,
        type: body.type,
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

    return NextResponse.json(unit)
  } catch (error) {
    console.error('Error updating measurement unit:', error)
    return NextResponse.json(
      { error: 'Failed to update measurement unit' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getUser(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const result = await prisma.measurementUnit.deleteMany({
      where: { id: params.id, userId: user.id }
    })

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Unit not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting measurement unit:', error)
    return NextResponse.json(
      { error: 'Failed to delete measurement unit' },
      { status: 500 }
    )
  }
}
