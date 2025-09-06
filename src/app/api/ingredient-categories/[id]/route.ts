import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { ingredientCategorySchema } from '@/lib/validations'
import { z } from 'zod'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await getUser(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const category = await prisma.ingredientCategory.findFirst({
      where: { id: params.id, userId: user.id }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error fetching ingredient category:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ingredient category' },
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
    const data = ingredientCategorySchema.parse(body)
    
    const result = await prisma.ingredientCategory.updateMany({
      where: { id: params.id, userId: user.id },
      data: {
        name: data.name,
        description: data.description || ''
      }
    })

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Category not found or access denied' },
        { status: 404 }
      )
    }

    const category = await prisma.ingredientCategory.findUnique({
      where: { id: params.id }
    })

    return NextResponse.json(category)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.format() },
        { status: 400 }
      )
    }
    console.error('Error updating ingredient category:', error)
    return NextResponse.json(
      { error: 'Failed to update ingredient category' },
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

    const result = await prisma.ingredientCategory.deleteMany({
      where: { id: params.id, userId: user.id }
    })

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Category not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting ingredient category:', error)
    return NextResponse.json(
      { error: 'Failed to delete ingredient category' },
      { status: 500 }
    )
  }
}
