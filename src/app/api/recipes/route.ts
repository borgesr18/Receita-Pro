import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { z } from 'zod'

// Schema de validação para ProductRecipe
const productRecipeSchema = z.object({
  recipeId: z.string().min(1, 'Recipe ID is required'),
  quantity: z.coerce.number().min(0.01, 'Quantity must be greater than 0').default(1.0),
  order: z.coerce.number().min(0, 'Order must be greater than or equal to 0').default(0)
})

const productRecipeUpdateSchema = z.object({
  quantity: z.coerce.number().min(0.01, 'Quantity must be greater than 0').optional(),
  order: z.coerce.number().min(0, 'Order must be greater than or equal to 0').optional()
})

// GET /api/products/[id]/recipes - Listar receitas do produto
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 GET product recipes - Iniciando...')
    
    const { user, error } = await getUser(request)
    if (error || !user) {
      console.log('❌ GET product recipes - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ GET product recipes - Usuário autenticado:', user.id)
    console.log('📤 GET product recipes - Product ID:', params.id)

    // Verificar se o produto pertence ao usuário
    const product = await prisma.product.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!product) {
      console.log('❌ GET product recipes - Produto não encontrado')
      return NextResponse.json(
        { error: 'Product not found or access denied' },
        { status: 404 }
      )
    }

    // Buscar receitas do produto
    const productRecipes = await prisma.productRecipe.findMany({
      where: {
        productId: params.id
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
      },
      orderBy: {
        order: 'asc'
      }
    })

    console.log('✅ GET product recipes - Receitas encontradas:', productRecipes.length)

    // Calcular custos e informações agregadas
    const recipesWithCalculations = productRecipes.map(productRecipe => {
      const recipe = productRecipe.recipe
      
      // Calcular custo total da receita
      const totalCost = recipe.ingredients.reduce((sum, recipeIngredient) => {
        return sum + (recipeIngredient.quantity * recipeIngredient.ingredient.pricePerUnit)
      }, 0)

      // Calcular custo ajustado pela quantidade no produto
      const adjustedCost = totalCost * productRecipe.quantity

      return {
        ...productRecipe,
        recipe: {
          ...recipe,
          totalCost,
          adjustedCost,
          totalIngredients: recipe.ingredients.length
        }
      }
    })

    // Calcular totais do produto
    const productTotalCost = recipesWithCalculations.reduce((sum, pr) => sum + pr.recipe.adjustedCost, 0)
    const productTotalIngredients = recipesWithCalculations.reduce((sum, pr) => {
      return sum + (pr.recipe.totalIngredients * pr.quantity)
    }, 0)

    return NextResponse.json({
      productId: params.id,
      productName: product.name,
      recipes: recipesWithCalculations,
      summary: {
        totalRecipes: recipesWithCalculations.length,
        totalCost: productTotalCost,
        totalIngredients: productTotalIngredients,
        averageCostPerRecipe: recipesWithCalculations.length > 0 ? productTotalCost / recipesWithCalculations.length : 0
      }
    })
  } catch (error) {
    console.error('❌ GET product recipes - Erro:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product recipes' },
      { status: 500 }
    )
  }
}

// POST /api/products/[id]/recipes - Adicionar receita ao produto
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 POST product recipe - Iniciando...')
    
    const { user, error } = await getUser(request)
    if (error || !user) {
      console.log('❌ POST product recipe - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ POST product recipe - Usuário autenticado:', user.id)

    const body = await request.json()
    console.log('📤 POST product recipe - Dados recebidos:', body)

    // Validar dados
    const data = productRecipeSchema.parse(body)

    // Verificar se o produto pertence ao usuário
    const product = await prisma.product.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!product) {
      console.log('❌ POST product recipe - Produto não encontrado')
      return NextResponse.json(
        { error: 'Product not found or access denied' },
        { status: 404 }
      )
    }

    // Verificar se a receita pertence ao usuário
    const recipe = await prisma.recipe.findFirst({
      where: {
        id: data.recipeId,
        userId: user.id
      }
    })

    if (!recipe) {
      console.log('❌ POST product recipe - Receita não encontrada')
      return NextResponse.json(
        { error: 'Recipe not found or access denied' },
        { status: 404 }
      )
    }

    // Verificar se a receita já está associada ao produto
    const existingProductRecipe = await prisma.productRecipe.findUnique({
      where: {
        productId_recipeId: {
          productId: params.id,
          recipeId: data.recipeId
        }
      }
    })

    if (existingProductRecipe) {
      console.log('❌ POST product recipe - Receita já associada ao produto')
      return NextResponse.json(
        { error: 'Recipe is already associated with this product' },
        { status: 409 }
      )
    }

    // Criar associação produto-receita
    const productRecipe = await prisma.productRecipe.create({
      data: {
        productId: params.id,
        recipeId: data.recipeId,
        quantity: data.quantity,
        order: data.order
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

    console.log('✅ POST product recipe - Receita associada ao produto:', productRecipe.id)

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
        adjustedCost
      }
    }, { status: 201 })

  } catch (error) {
    console.error('❌ POST product recipe - Erro:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.format() },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to add recipe to product' },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id]/recipes - Atualizar múltiplas receitas do produto
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 PUT product recipes - Iniciando...')
    
    const { user, error } = await getUser(request)
    if (error || !user) {
      console.log('❌ PUT product recipes - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('📤 PUT product recipes - Dados recebidos:', body)

    // Validar estrutura: array de receitas
    const recipesSchema = z.array(z.object({
      id: z.string().optional(), // ID do ProductRecipe (para update)
      recipeId: z.string().min(1, 'Recipe ID is required'),
      quantity: z.coerce.number().min(0.01, 'Quantity must be greater than 0').default(1.0),
      order: z.coerce.number().min(0, 'Order must be greater than or equal to 0').default(0)
    }))

    const recipes = recipesSchema.parse(body.recipes || body)

    // Verificar se o produto pertence ao usuário
    const product = await prisma.product.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!product) {
      console.log('❌ PUT product recipes - Produto não encontrado')
      return NextResponse.json(
        { error: 'Product not found or access denied' },
        { status: 404 }
      )
    }

    // Usar transação para atualizar todas as receitas
    const result = await prisma.$transaction(async (tx) => {
      // Remover receitas existentes que não estão na nova lista
      const existingRecipes = await tx.productRecipe.findMany({
        where: { productId: params.id }
      })

      const newRecipeIds = recipes.map(r => r.recipeId)
      const recipesToDelete = existingRecipes.filter(er => !newRecipeIds.includes(er.recipeId))

      if (recipesToDelete.length > 0) {
        await tx.productRecipe.deleteMany({
          where: {
            id: {
              in: recipesToDelete.map(r => r.id)
            }
          }
        })
        console.log('🗑️ Receitas removidas:', recipesToDelete.length)
      }

      // Processar cada receita
      const updatedRecipes = []
      for (const recipeData of recipes) {
        // Verificar se a receita existe e pertence ao usuário
        const recipe = await tx.recipe.findFirst({
          where: {
            id: recipeData.recipeId,
            userId: user.id
          }
        })

        if (!recipe) {
          throw new Error(`Recipe ${recipeData.recipeId} not found or access denied`)
        }

        // Upsert (create or update)
        const productRecipe = await tx.productRecipe.upsert({
          where: {
            productId_recipeId: {
              productId: params.id,
              recipeId: recipeData.recipeId
            }
          },
          update: {
            quantity: recipeData.quantity,
            order: recipeData.order
          },
          create: {
            productId: params.id,
            recipeId: recipeData.recipeId,
            quantity: recipeData.quantity,
            order: recipeData.order
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
                  }
                }
              }
            }
          }
        })

        updatedRecipes.push(productRecipe)
      }

      return updatedRecipes
    })

    console.log('✅ PUT product recipes - Receitas atualizadas:', result.length)

    // Calcular custos
    const recipesWithCalculations = result.map(productRecipe => {
      const totalCost = productRecipe.recipe.ingredients.reduce((sum, recipeIngredient) => {
        return sum + (recipeIngredient.quantity * recipeIngredient.ingredient.pricePerUnit)
      }, 0)

      const adjustedCost = totalCost * productRecipe.quantity

      return {
        ...productRecipe,
        recipe: {
          ...productRecipe.recipe,
          totalCost,
          adjustedCost
        }
      }
    })

    return NextResponse.json({
      productId: params.id,
      recipes: recipesWithCalculations,
      message: `${result.length} recipes updated for product`
    })

  } catch (error) {
    console.error('❌ PUT product recipes - Erro:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.format() },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message.includes('not found or access denied')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update product recipes' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id]/recipes - Remover todas as receitas do produto
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 DELETE product recipes - Iniciando...')
    
    const { user, error } = await getUser(request)
    if (error || !user) {
      console.log('❌ DELETE product recipes - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se o produto pertence ao usuário
    const product = await prisma.product.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!product) {
      console.log('❌ DELETE product recipes - Produto não encontrado')
      return NextResponse.json(
        { error: 'Product not found or access denied' },
        { status: 404 }
      )
    }

    // Remover todas as receitas do produto
    const deletedCount = await prisma.productRecipe.deleteMany({
      where: {
        productId: params.id
      }
    })

    console.log('✅ DELETE product recipes - Receitas removidas:', deletedCount.count)

    return NextResponse.json({
      message: `${deletedCount.count} recipes removed from product`,
      deletedCount: deletedCount.count
    })

  } catch (error) {
    console.error('❌ DELETE product recipes - Erro:', error)
    return NextResponse.json(
      { error: 'Failed to delete product recipes' },
      { status: 500 }
    )
  }
}

