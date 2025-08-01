import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { ingredientCategorySchema } from '@/lib/validations'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getUser(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const categories = await prisma.ingredientCategory.findMany({
      where: { userId: user.id },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching ingredient categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ingredient categories' },
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
    const data = ingredientCategorySchema.parse(body)
    
    const category = await prisma.ingredientCategory.create({
      data: {
        name: data.name,
        description: data.description || '',
        userId: user.id
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.format() },
        { status: 400 }
      )
    }
    console.error('Error creating ingredient category:', error)
    return NextResponse.json(
      { error: 'Failed to create ingredient category' },
      { status: 500 }
    )
  }
}
