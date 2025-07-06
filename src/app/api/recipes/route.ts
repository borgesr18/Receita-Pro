import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { recipeSchema } from '@/lib/validations'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getUser(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const recipes = await prisma.recipe.findMany({
      where: { userId: user.id },
      include: {
        category: true,
        product: true,
        ingredients: {
          include: {
            ingredient: true,
            unit: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(recipes)
  } catch (error) {
    console.error('Error fetching recipes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
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
    const data = recipeSchema.parse(body)
    
    const recipe = await prisma.recipe.create({
      data: {
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        productId: data.productId || null,
        userId: user.id,
        preparationTime: data.preparationTime,
        ovenTemperature: data.ovenTemperature,
        instructions: data.instructions || '',
        technicalNotes: data.technicalNotes || '',
        ingredients: {
          create: data.ingredients?.map((ing, index) => ({
            ingredientId: ing.ingredientId,
            quantity: ing.quantity,
            percentage: ing.percentage,
            unitId: ing.unitId,
            order: index + 1
          })) || []
        }
      },
      include: {
        category: true,
        product: true,
        ingredients: {
          include: {
            ingredient: true,
            unit: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    return NextResponse.json(recipe, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.format() },
        { status: 400 }
      )
    }
    console.error('Error creating recipe:', error)
    return NextResponse.json(
      { error: 'Failed to create recipe' },
      { status: 500 }
    )
  }
}
