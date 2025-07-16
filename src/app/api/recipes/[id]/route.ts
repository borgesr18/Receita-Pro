import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { z } from 'zod'

// Schema de validação para atualização de ProductRecipe
const productRecipeUpdateSchema = z.object({
  quantity: z.coerce.number().min(0.01, 'Quantity must be greater than 0').optional(),
  order: z.coerce.number().min(0, 'Order must be greater than or equal to 0').optional()
})

// GET /api/products/[id]/recipes/[recipeId] - Obter receita específica do produto
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; recipeId: string } }
) {
  try {
    console.log('🔍 GET product recipe - Iniciando...')
    
    const { user, error } = await getUser(request)
    if (error || !user) {
      console.log('❌ GET product recipe - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ GET product recipe - Usuário autenticado:', user.id)
    console.log('📤 GET product recipe - Product ID:', params.id, 'Recipe ID:', params.recipeId)

    // Verificar se o produto pertence ao usuário
    const product = await prisma.product.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!product) {
      console.log('❌ GET product recipe - Produto não encontrado')
      return NextResponse.json(
        { error: 'Product not found or access denied' },
        { status: 404 }
      )
    }

    // Buscar receita específica do produto
    const productRecipe = await prisma.productRecipe.findUnique({
      where: {
        productId_recipeId: {
          productId: params.id,
          recipeId: params.recipeId
        }
      },
      include: {
        recipe: {
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
              orderBy: {
                order: 'asc'
              }
            }
          }
        }
      }
    })

    if (!productRecipe) {
      console.log('❌ GET product recipe - Receita não associada ao produto')
      return NextResponse.json(
        { error: 'Recipe not associated with this product' },
        { status: 404 }
      )
    }

    console.log('✅ GET product recipe - Receita encontrada')

    // Calcular custo da receita
    const totalCost = productRecipe.recipe.ingredients.reduce((sum, recipeIngredient) => {
      return sum + (recipeIngredient.quantity * recipeIngredient.ingredient.pricePerUnit)
    }, 0)

    const adjustedCost = totalCost * productRecipe.quantity

    return NextResponse.json({
      ...productRecipe,
      recipe: {
        ...productRecipe.recipe,
        totalCost,
        adjustedCost,
        totalIngredients: productRecipe.recipe.ingredients.length
      }
    })

  } catch (error) {
    console.error('❌ GET product recipe - Erro:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product recipe' },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id]/recipes/[recipeId] - Atualizar receita específica do produto
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; recipeId: string } }
) {
  try {
    console.log('🔍 PUT product recipe - Iniciando...')
    
    const { user, error } = await getUser(request)
    if (error || !user) {
      console.log('❌ PUT product recipe - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('📤 PUT product recipe - Dados recebidos:', body)

    // Validar dados
    const data = productRecipeUpdateSchema.parse(body)

    // Verificar se o produto pertence ao usuário
    const product = await prisma.product.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!product) {
      console.log('❌ PUT product recipe - Produto não encontrado')
      return NextResponse.json(
        { error: 'Product not found or access denied' },
        { status: 404 }
      )
    }

    // Verificar se a receita está associada ao produto
    const existingProductRecipe = await prisma.productRecipe.findUnique({
      where: {
        productId_recipeId: {
          productId: params.id,
          recipeId: params.recipeId
        }
      }
    })

    if (!existingProductRecipe) {
      console.log('❌ PUT product recipe - Receita não associada ao produto')
      return NextResponse.json(
        { error: 'Recipe not associated with this product' },
        { status: 404 }
      )
    }

    // Atualizar receita do produto
    const updatedProductRecipe = await prisma.productRecipe.update({
      where: {
        productId_recipeId: {
          productId: params.id,
          recipeId: params.recipeId
        }
      },
      data: {
        ...(data.quantity !== undefined && { quantity: data.quantity }),
        ...(data.order !== undefined && { order: data.order })
      },
      include: {
        recipe: {
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
              orderBy: {
                order: 'asc'
              }
            }
          }
        }
      }
    })

    console.log('✅ PUT product recipe - Receita atualizada')

    // Calcular custo da receita
    const totalCost = updatedProductRecipe.recipe.ingredients.reduce((sum, recipeIngredient) => {
      return sum + (recipeIngredient.quantity * recipeIngredient.ingredient.pricePerUnit)
    }, 0)

    const adjustedCost = totalCost * updatedProductRecipe.quantity

    return NextResponse.json({
      ...updatedProductRecipe,
      recipe: {
        ...updatedProductRecipe.recipe,
        totalCost,
        adjustedCost
      }
    })

  } catch (error) {
    console.error('❌ PUT product recipe - Erro:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.format() },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update product recipe' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id]/recipes/[recipeId] - Remover receita específica do produto
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; recipeId: string } }
) {
  try {
    console.log('🔍 DELETE product recipe - Iniciando...')
    
    const { user, error } = await getUser(request)
    if (error || !user) {
      console.log('❌ DELETE product recipe - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ DELETE product recipe - Usuário autenticado:', user.id)
    console.log('📤 DELETE product recipe - Product ID:', params.id, 'Recipe ID:', params.recipeId)

    // Verificar se o produto pertence ao usuário
    const product = await prisma.product.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!product) {
      console.log('❌ DELETE product recipe - Produto não encontrado')
      return NextResponse.json(
        { error: 'Product not found or access denied' },
        { status: 404 }
      )
    }

    // Verificar se a receita está associada ao produto
    const existingProductRecipe = await prisma.productRecipe.findUnique({
      where: {
        productId_recipeId: {
          productId: params.id,
          recipeId: params.recipeId
        }
      }
    })

    if (!existingProductRecipe) {
      console.log('❌ DELETE product recipe - Receita não associada ao produto')
      return NextResponse.json(
        { error: 'Recipe not associated with this product' },
        { status: 404 }
      )
    }

    // Remover receita do produto
    await prisma.productRecipe.delete({
      where: {
        productId_recipeId: {
          productId: params.id,
          recipeId: params.recipeId
        }
      }
    })

    console.log('✅ DELETE product recipe - Receita removida do produto')

    return NextResponse.json({
      message: 'Recipe removed from product successfully'
    })

  } catch (error) {
    console.error('❌ DELETE product recipe - Erro:', error)
    return NextResponse.json(
      { error: 'Failed to remove recipe from product' },
      { status: 500 }
    )
  }
}

