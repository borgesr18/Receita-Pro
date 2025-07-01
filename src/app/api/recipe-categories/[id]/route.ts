import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

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
    
    const result = await prisma.recipeCategory.updateMany({
      where: { id: params.id, userId: user.id },
      data: {
        name: body.name,
        description: body.description || ''
      }
    })

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Recipe category not found or access denied' },
        { status: 404 }
      )
    }

    const category = await prisma.recipeCategory.findUnique({
      where: { id: params.id }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating recipe category:', error)
    return NextResponse.json(
      { error: 'Failed to update recipe category' },
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
    const result = await prisma.recipeCategory.deleteMany({
      where: { id: params.id, userId: user.id }
    })

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Recipe category not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting recipe category:', error)
    return NextResponse.json(
      { error: 'Failed to delete recipe category' },
      { status: 500 }
    )
  }
}
