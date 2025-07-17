import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

// GET /api/recipes/[id] - Obter receita específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await getUser(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Buscar receita específica do usuário
    const recipe = await prisma.recipe.findFirst({
      where: {
        id: params.id,
        userId: user.id
      },
      include: {
        category: true,
        ingredients: {
          include: {
            ingredient: {
              include: {
                unit: true,
                category: true
              }
            },
            unit: true
          },
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found or access denied' },
        { status: 404 }
      )
    }

    // Calcular custo da receita
    const totalCost = recipe.ingredients?.reduce((sum, recipeIngredient) => {
      const cost = Number(recipeIngredient.quantity) * Number(recipeIngredient.ingredient?.pricePerUnit || 0)
      return sum + (isNaN(cost) ? 0 : cost)
    }, 0) || 0

    return NextResponse.json({
      ...recipe,
      totalCost
    })

  } catch (error) {
    console.error('Error fetching recipe:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recipe' },
      { status: 500 }
    )
  }
}

// PUT /api/recipes/[id] - Atualizar receita específica
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

    // Verificar se a receita pertence ao usuário
    const existingRecipe = await prisma.recipe.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!existingRecipe) {
      return NextResponse.json(
        { error: 'Recipe not found or access denied' },
        { status: 404 }
      )
    }

    // Preparar dados para atualização
    const updateData: any = {}
    
    if (body.name) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.instructions !== undefined) updateData.instructions = body.instructions
    if (body.technicalNotes !== undefined) updateData.technicalNotes = body.technicalNotes
    if (body.preparationTime !== undefined) updateData.preparationTime = Number(body.preparationTime) || null
    if (body.ovenTemperature !== undefined) updateData.ovenTemperature = Number(body.ovenTemperature) || null
    if (body.categoryId) updateData.categoryId = body.categoryId
    if (body.version !== undefined) updateData.version = Number(body.version) || 1
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive)

    // Sempre definir productId como null
    updateData.productId = null

    // Atualizar receita
    const updatedRecipe = await prisma.recipe.update({
      where: { id: params.id },
      data: updateData,
      include: {
        category: true,
        ingredients: {
          include: {
            ingredient: {
              include: {
                unit: true,
                category: true
              }
            },
            unit: true
          },
          orderBy: { order: 'asc' }
        }
      }
    })

    // Atualizar ingredientes se fornecidos
    if (body.ingredients && Array.isArray(body.ingredients)) {
      // Remover ingredientes existentes
      await prisma.recipeIngredient.deleteMany({
        where: { recipeId: params.id }
      })

      // Adicionar novos ingredientes
      const validIngredients = body.ingredients.filter((ing: any) => 
        ing && ing.ingredientId && ing.unitId && ing.quantity > 0
      )

      if (validIngredients.length > 0) {
        await prisma.recipeIngredient.createMany({
          data: validIngredients.map((ing: any, index: number) => ({
            recipeId: params.id,
            ingredientId: ing.ingredientId,
            quantity: Number(ing.quantity),
            percentage: Number(ing.percentage) || 0,
            unitId: ing.unitId,
            order: Number(ing.order) || index
          }))
        })
      }

      // Buscar receita atualizada com ingredientes
      const finalRecipe = await prisma.recipe.findUnique({
        where: { id: params.id },
        include: {
          category: true,
          ingredients: {
            include: {
              ingredient: {
                include: {
                  unit: true,
                  category: true
                }
              },
              unit: true
            },
            orderBy: { order: 'asc' }
          }
        }
      })

      return NextResponse.json(finalRecipe)
    }

    return NextResponse.json(updatedRecipe)

  } catch (error) {
    console.error('Error updating recipe:', error)
    return NextResponse.json(
      { error: 'Failed to update recipe' },
      { status: 500 }
    )
  }
}

// DELETE /api/recipes/[id] - Excluir receita específica
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await getUser(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se a receita pertence ao usuário
    const existingRecipe = await prisma.recipe.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!existingRecipe) {
      return NextResponse.json(
        { error: 'Recipe not found or access denied' },
        { status: 404 }
      )
    }

    // Excluir receita (ingredientes são excluídos automaticamente por cascade)
    await prisma.recipe.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Recipe deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting recipe:', error)
    return NextResponse.json(
      { error: 'Failed to delete recipe' },
      { status: 500 }
    )
  }
}
