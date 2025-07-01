import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { recipeSchema } from '@/lib/validations'
import { z } from 'zod'

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
    const recipe = await prisma.recipe.findFirst({
      where: { id: params.id, userId: user.id },
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

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json(recipe)
  } catch (error) {
    console.error('Error fetching recipe:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recipe' },
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
    const data = recipeSchema.parse(body)
    
    const existingRecipe = await prisma.recipe.findFirst({
      where: { id: params.id, userId: user.id }
    })

    if (!existingRecipe) {
      return NextResponse.json(
        { error: 'Recipe not found or access denied' },
        { status: 404 }
      )
    }

    await prisma.recipeIngredient.deleteMany({
      where: { recipeId: params.id }
    })

    const recipe = await prisma.recipe.update({
      where: { id: params.id },
      data: {
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        productId: data.productId || null,
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

    return NextResponse.json(recipe)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.format() },
        { status: 400 }
      )
    }
    console.error('Error updating recipe:', error)
    return NextResponse.json(
      { error: 'Failed to update recipe' },
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
    const result = await prisma.recipe.deleteMany({
      where: { id: params.id, userId: user.id }
    })

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Recipe not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting recipe:', error)
    return NextResponse.json(
      { error: 'Failed to delete recipe' },
      { status: 500 }
    )
  }
}
