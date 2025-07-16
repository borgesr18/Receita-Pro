import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { z } from 'zod'

// Schema de validação para receita (campos corretos do banco)
const recipeSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  instructions: z.string().optional(),
  preparationTime: z.coerce.number().min(0, 'Tempo de preparo deve ser maior ou igual a 0').optional(),
  ovenTemperature: z.coerce.number().min(0, 'Temperatura do forno deve ser maior ou igual a 0').optional(),
  technicalNotes: z.string().optional(),
  servings: z.coerce.number().min(1, 'Porções deve ser maior que 0').optional(),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  productId: z.string().optional(),
  version: z.coerce.number().min(1, 'Versão deve ser maior que 0').default(1),
  isActive: z.boolean().default(true),
  ingredients: z.array(z.object({
    ingredientId: z.string().min(1, 'Ingrediente é obrigatório'),
    quantity: z.coerce.number().min(0.01, 'Quantidade deve ser maior que 0'),
    unitId: z.string().min(1, 'Unidade é obrigatória'),
    order: z.coerce.number().min(0, 'Ordem deve ser maior ou igual a 0').default(0)
  })).optional()
})

const recipeUpdateSchema = recipeSchema.partial()

// GET /api/recipes - Listar todas as receitas do usuário
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET recipes - Iniciando...')
    
    const { user, error } = await getUser(request)
    if (error || !user) {
      console.log('❌ GET recipes - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ GET recipes - Usuário autenticado:', user.id)

    // Buscar receitas do usuário
    const recipes = await prisma.recipe.findMany({
      where: {
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
          orderBy: {
            order: 'asc'
          }
        },
        _count: {
          select: {
            ingredients: true,
            productRecipes: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    console.log('✅ GET recipes - Receitas encontradas:', recipes.length)

    // Calcular informações adicionais para cada receita
    const recipesWithCalculations = recipes.map(recipe => {
      // Calcular custo total da receita
      const totalCost = recipe.ingredients.reduce((sum, recipeIngredient) => {
        return sum + (recipeIngredient.quantity * recipeIngredient.ingredient.pricePerUnit)
      }, 0)

      return {
        ...recipe,
        totalCost,
        costPerServing: recipe.servings ? totalCost / recipe.servings : totalCost,
        ingredientsCount: recipe._count.ingredients,
        productsCount: recipe._count.productRecipes
      }
    })

    return NextResponse.json({
      data: recipesWithCalculations,
      total: recipesWithCalculations.length,
      summary: {
        totalRecipes: recipesWithCalculations.length,
        totalCost: recipesWithCalculations.reduce((sum, r) => sum + r.totalCost, 0),
        averageCost: recipesWithCalculations.length > 0 
          ? recipesWithCalculations.reduce((sum, r) => sum + r.totalCost, 0) / recipesWithCalculations.length 
          : 0,
        totalIngredients: recipesWithCalculations.reduce((sum, r) => sum + r.ingredientsCount, 0)
      }
    })
  } catch (error) {
    console.error('❌ GET recipes - Erro:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    )
  }
}

// POST /api/recipes - Criar nova receita
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 POST recipe - Iniciando...')
    
    const { user, error } = await getUser(request)
    if (error || !user) {
      console.log('❌ POST recipe - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ POST recipe - Usuário autenticado:', user.id)

    const body = await request.json()
    console.log('📤 POST recipe - Dados recebidos:', body)

    // Validar dados
    const data = recipeSchema.parse(body)

    // Verificar se a categoria pertence ao usuário
    const category = await prisma.recipeCategory.findFirst({
      where: {
        id: data.categoryId,
        userId: user.id
      }
    })

    if (!category) {
      console.log('❌ POST recipe - Categoria não encontrada')
      return NextResponse.json(
        { error: 'Category not found or access denied' },
        { status: 404 }
      )
    }

    // Verificar se produto pertence ao usuário (se fornecido)
    if (data.productId) {
      const product = await prisma.product.findFirst({
        where: {
          id: data.productId,
          userId: user.id
        }
      })

      if (!product) {
        console.log('❌ POST recipe - Produto não encontrado')
        return NextResponse.json(
          { error: 'Product not found or access denied' },
          { status: 404 }
        )
      }
    }

    // Verificar se ingredientes pertencem ao usuário (se fornecidos)
    if (data.ingredients && data.ingredients.length > 0) {
      const ingredientIds = data.ingredients.map(ing => ing.ingredientId)
      const unitIds = data.ingredients.map(ing => ing.unitId)

      const [ingredients, units] = await Promise.all([
        prisma.ingredient.findMany({
          where: {
            id: { in: ingredientIds },
            userId: user.id
          }
        }),
        prisma.measurementUnit.findMany({
          where: {
            id: { in: unitIds },
            userId: user.id
          }
        })
      ])

      if (ingredients.length !== ingredientIds.length) {
        console.log('❌ POST recipe - Alguns ingredientes não encontrados')
        return NextResponse.json(
          { error: 'Some ingredients not found or access denied' },
          { status: 404 }
        )
      }

      if (units.length !== unitIds.length) {
        console.log('❌ POST recipe - Algumas unidades não encontradas')
        return NextResponse.json(
          { error: 'Some units not found or access denied' },
          { status: 404 }
        )
      }
    }

    // Criar receita com ingredientes em transação
    const recipe = await prisma.$transaction(async (tx) => {
      // Criar receita
      const newRecipe = await tx.recipe.create({
        data: {
          name: data.name,
          description: data.description,
          instructions: data.instructions,
          preparationTime: data.preparationTime,
          ovenTemperature: data.ovenTemperature,
          technicalNotes: data.technicalNotes,
          servings: data.servings,
          categoryId: data.categoryId,
          productId: data.productId,
          version: data.version,
          isActive: data.isActive,
          userId: user.id
        }
      })

      // Adicionar ingredientes se fornecidos
      if (data.ingredients && data.ingredients.length > 0) {
        await tx.recipeIngredient.createMany({
          data: data.ingredients.map(ing => ({
            recipeId: newRecipe.id,
            ingredientId: ing.ingredientId,
            quantity: ing.quantity,
            unitId: ing.unitId,
            order: ing.order
          }))
        })
      }

      // Buscar receita completa
      return await tx.recipe.findUnique({
        where: { id: newRecipe.id },
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
      })
    })

    console.log('✅ POST recipe - Receita criada:', recipe?.id)

    // Calcular custo total
    const totalCost = recipe?.ingredients.reduce((sum, recipeIngredient) => {
      return sum + (recipeIngredient.quantity * recipeIngredient.ingredient.pricePerUnit)
    }, 0) || 0

    return NextResponse.json({
      ...recipe,
      totalCost,
      costPerServing: recipe?.servings ? totalCost / recipe.servings : totalCost
    }, { status: 201 })

  } catch (error) {
    console.error('❌ POST recipe - Erro:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.format() },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create recipe' },
      { status: 500 }
    )
  }
}

