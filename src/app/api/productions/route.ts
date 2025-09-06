import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { productionSchema } from '@/lib/validations'
import { z } from 'zod'

// Schema expandido para suportar receitas compostas
const productionSchemaExpanded = productionSchema.extend({
  useProductRecipes: z.boolean().optional().default(false) // Flag para usar receitas do produto
})

// Função para calcular ingredientes de uma receita simples
async function calculateIngredientsFromRecipe(recipeId: string, quantityPlanned: number, userId: string) {
  console.log('🧮 Calculando ingredientes da receita:', recipeId)
  
  const recipe = await prisma.recipe.findFirst({
    where: {
      id: recipeId,
      userId: userId
    },
    include: {
      ingredients: {
        include: {
          ingredient: true,
          unit: true
        }
      }
    }
  })

  if (!recipe) {
    throw new Error(`Recipe ${recipeId} not found or access denied`)
  }

  if (!recipe.ingredients || recipe.ingredients.length === 0) {
    console.log('⚠️ Receita sem ingredientes, produção será criada sem desconto de estoque')
    return []
  }

  const ingredientsNeeded: Array<{ ingredientId: string; ingredient: any; quantityNeeded: number; unit: any; source: string; }> = []
  for (const recipeIngredient of recipe.ingredients) {
    const quantityNeeded = recipeIngredient.quantity * quantityPlanned
    
    ingredientsNeeded.push({
      ingredientId: recipeIngredient.ingredient.id,
      ingredient: recipeIngredient.ingredient,
      quantityNeeded,
      unit: recipeIngredient.unit,
      source: `Recipe: ${recipe.name}`
    })
  }

  console.log('✅ Ingredientes calculados da receita:', ingredientsNeeded.length)
  return ingredientsNeeded
}

// Função para calcular ingredientes de receitas compostas do produto
async function calculateIngredientsFromProductRecipes(productId: string, quantityPlanned: number, userId: string) {
  console.log('🧮 Calculando ingredientes das receitas compostas do produto:', productId)
  
  const productRecipes = await prisma.productRecipe.findMany({
    where: {
      productId: productId
    },
    include: {
      recipe: {
        include: {
          ingredients: {
            include: {
              ingredient: true,
              unit: true
            }
          }
        }
      }
    },
    orderBy: {
      order: 'asc'
    }
  })

  if (!productRecipes || productRecipes.length === 0) {
    console.log('⚠️ Produto sem receitas compostas, tentando receita padrão...')
    
    // Tentar buscar receita padrão do produto
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        userId: userId
      }
    })

    if (product?.defaultRecipeId) {
      console.log('🔄 Usando receita padrão do produto:', product.defaultRecipeId)
      return await calculateIngredientsFromRecipe(product.defaultRecipeId, quantityPlanned, userId)
    }

    console.log('⚠️ Produto sem receitas, produção será criada sem desconto de estoque')
    return []
  }

  const allIngredientsNeeded: Array<{ ingredientId: string; ingredient: any; quantityNeeded: number; unit: any; source: string; }> = []
  
  for (const productRecipe of productRecipes) {
    const recipe = productRecipe.recipe
    
    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      console.log(`⚠️ Receita ${recipe.name} sem ingredientes, pulando...`)
      continue
    }

    // Calcular quantidade ajustada pela quantidade da receita no produto
    const recipeQuantity = productRecipe.quantity * quantityPlanned
    
    for (const recipeIngredient of recipe.ingredients) {
      const quantityNeeded = recipeIngredient.quantity * recipeQuantity
      
      // Verificar se já temos este ingrediente na lista
      const existingIngredient = allIngredientsNeeded.find(
        item => item.ingredientId === recipeIngredient.ingredient.id
      )
      
      if (existingIngredient) {
        // Somar quantidades se o ingrediente já existe
        existingIngredient.quantityNeeded += quantityNeeded
        existingIngredient.source += `, Recipe: ${recipe.name} (${productRecipe.quantity}x)`
      } else {
        // Adicionar novo ingrediente
        allIngredientsNeeded.push({
          ingredientId: recipeIngredient.ingredient.id,
          ingredient: recipeIngredient.ingredient,
          quantityNeeded,
          unit: recipeIngredient.unit,
          source: `Recipe: ${recipe.name} (${productRecipe.quantity}x)`
        })
      }
    }
  }

  console.log('✅ Ingredientes calculados das receitas compostas:', allIngredientsNeeded.length)
  return allIngredientsNeeded
}

// GET /api/productions - Listar produções
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET productions - Iniciando...')
    
    const { user, error } = await getUser(request)
    if (error || !user) {
      console.log('❌ GET productions - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ GET productions - Usuário autenticado:', user.id)

    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const status = url.searchParams.get('status')
    const productId = url.searchParams.get('productId')
    const recipeId = url.searchParams.get('recipeId')

    // Construir filtros
    const where: any = {
      userId: user.id
    }

    if (status) {
      const statusMap: Record<string, string> = {
        planejada: 'Planejado',
        em_andamento: 'Em_Andamento',
        concluida: 'Completo',
        cancelada: 'Cancelado',
        PLANNED: 'Planejado',
        IN_PROGRESS: 'Em_Andamento',
        COMPLETED: 'Completo',
        CANCELLED: 'Cancelado'
      }
      where.status = (statusMap[status] || status) as any
    }

    if (productId) {
      where.productId = productId
    }

    if (recipeId) {
      where.recipeId = recipeId
    }

    const productions = await prisma.production.findMany({
      where,
      include: {
        product: {
          include: {
            category: true,
            productRecipes: {
              include: {
                recipe: {
                  include: {
                    category: true
                  }
                }
              },
              orderBy: {
                order: 'asc'
              }
            }
          }
        },
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
        },
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
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    })

    console.log('✅ GET productions - Produções encontradas:', productions.length)

    // Enriquecer dados com informações de receitas compostas
    const enrichedProductions = productions.map(production => {
      const hasCompositeRecipes = (production.product?.productRecipes?.length || 0) > 0
      
      return {
        ...production,
        hasCompositeRecipes,
        compositeRecipesCount: production.product?.productRecipes?.length || 0,
        recipeType: hasCompositeRecipes ? 'composite' : 'simple'
      }
    })

    return NextResponse.json({
      productions: enrichedProductions,
      pagination: {
        limit,
        offset,
        total: productions.length
      }
    })
  } catch (error) {
    console.error('❌ GET productions - Erro:', error)
    return NextResponse.json(
      { error: 'Failed to fetch productions' },
      { status: 500 }
    )
  }
}

// POST /api/productions - Criar produção com lógica inteligente
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 POST production - Iniciando...')
    
    const { user, error } = await getUser(request)
    if (error || !user) {
      console.log('❌ POST production - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ POST production - Usuário autenticado:', user.id)

    const body = await request.json()
    console.log('📤 POST production - Dados recebidos:', body)

    // Validar dados
    const data = productionSchemaExpanded.parse(body)

    // Verificar se produto existe e pertence ao usuário
    const product = await prisma.product.findFirst({
      where: {
        id: data.productId,
        userId: user.id
      }
    })

    if (!product) {
      console.log('❌ POST production - Produto não encontrado')
      return NextResponse.json(
        { error: 'Product not found or access denied' },
        { status: 404 }
      )
    }

    // Verificar se receita existe e pertence ao usuário (se fornecida)
    let recipe = null
    if (data.recipeId) {
      recipe = await prisma.recipe.findFirst({
        where: {
          id: data.recipeId,
          userId: user.id
        }
      })

      if (!recipe) {
        console.log('❌ POST production - Receita não encontrada')
        return NextResponse.json(
          { error: 'Recipe not found or access denied' },
          { status: 404 }
        )
      }
    }

    // LÓGICA INTELIGENTE: Determinar como calcular ingredientes
    let ingredientsNeeded: Array<{ ingredientId: string; ingredient: any; quantityNeeded: number; unit: any; source: string; }> = []
    let calculationMethod = 'none'

    const normalizeStatus = (s: string) => ({
      planejada: 'Planejado',
      em_andamento: 'Em_Andamento',
      concluida: 'Completo',
      cancelada: 'Cancelado',
      PLANNED: 'Planejado',
      IN_PROGRESS: 'Em_Andamento',
      COMPLETED: 'Completo',
      CANCELLED: 'Cancelado'
    } as Record<string, string>)[s] || s

    const normalizedStatus = normalizeStatus(data.status)

    if (normalizedStatus === 'Em_Andamento' || normalizedStatus === 'Completo') {
      console.log('🧠 Aplicando lógica inteligente para cálculo de ingredientes...')
      
      // Prioridade 1: Se useProductRecipes=true ou produto tem receitas compostas
      const productRecipes = await prisma.productRecipe.findMany({
        where: { productId: data.productId }
      })

      if (data.useProductRecipes || productRecipes.length > 0) {
        console.log('🎯 Usando receitas compostas do produto')
        ingredientsNeeded = await calculateIngredientsFromProductRecipes(
          data.productId, 
          data.quantityPlanned, 
          user.id
        )
        calculationMethod = 'composite'
      }
      // Prioridade 2: Se recipeId fornecido
      else if (data.recipeId) {
        console.log('🎯 Usando receita fornecida')
        ingredientsNeeded = await calculateIngredientsFromRecipe(
          data.recipeId, 
          data.quantityPlanned, 
          user.id
        )
        calculationMethod = 'simple'
      }
      // Prioridade 3: Receita padrão do produto
      else if (product.defaultRecipeId) {
        console.log('🎯 Usando receita padrão do produto')
        ingredientsNeeded = await calculateIngredientsFromRecipe(
          product.defaultRecipeId, 
          data.quantityPlanned, 
          user.id
        )
        calculationMethod = 'default'
      }
      else {
        console.log('⚠️ Nenhuma receita disponível, produção sem desconto de estoque')
        calculationMethod = 'none'
      }
    } else {
      console.log('📋 Status "Planejado" - não desconta estoque')
      calculationMethod = 'planned'
    }

    // Validar estoque se há ingredientes
    const stockMovements: Array<{ ingredientId: string; type: 'Entrada' | 'Saída'; quantity: number; reason: string; reference?: string; ingredient: any; unit?: any; }> = []
    const insufficientStock = []

    if (ingredientsNeeded.length > 0) {
      console.log('🔍 Validando estoque para', ingredientsNeeded.length, 'ingredientes...')
      
      for (const item of ingredientsNeeded) {
        const ingredient = item.ingredient
        
        if (ingredient.currentStock < item.quantityNeeded) {
          insufficientStock.push({
            name: ingredient.name,
            needed: item.quantityNeeded,
            available: ingredient.currentStock,
            unit: item.unit.name
          })
          continue
        }

        // Preparar movimentação de saída
        stockMovements.push({
          ingredientId: ingredient.id,
          type: 'Saída',
          quantity: item.quantityNeeded,
          reason: `Produção - ${data.batchNumber}`,
          reference: data.batchNumber,
          ingredient: ingredient
        })
      }

      // Se há estoque insuficiente, retornar erro
      if (insufficientStock.length > 0) {
        console.log('❌ POST production - Estoque insuficiente:', insufficientStock)
        return NextResponse.json({
          error: 'Insufficient stock for production',
          details: insufficientStock,
          message: `Estoque insuficiente para ${insufficientStock.length} ingrediente(s)`
        }, { status: 400 })
      }
    }

    // Usar transação para criar produção e movimentações
    const result = await prisma.$transaction(async (tx) => {
      // Criar produção
      const production = await tx.production.create({
        data: {
          recipeId: data.recipeId,
          productId: data.productId,
          userId: user.id,
          batchNumber: data.batchNumber,
          quantityPlanned: data.quantityPlanned,
          quantityProduced: data.quantityProduced,
          lossPercentage: data.lossPercentage || 0,
          lossWeight: data.lossWeight || 0,
          productionDate: data.productionDate ? new Date(data.productionDate) : new Date(),
          expirationDate: data.expirationDate ? new Date(data.expirationDate) : null,
          notes: data.notes,
          status: normalizeStatus(data.status) as any
        }
      })

      console.log('✅ Produção criada:', production.id)

      // Processar movimentações de estoque
      if (stockMovements.length > 0) {
        console.log('📦 Processando', stockMovements.length, 'movimentações de estoque...')
        
        for (const movement of stockMovements) {
          // Criar movimentação
          await tx.stockMovement.create({
            data: {
              ingredientId: movement.ingredientId,
              type: movement.type,
              quantity: movement.quantity,
              reason: movement.reason,
              reference: movement.reference
            }
          })

          // Atualizar estoque do ingrediente
          await tx.ingredient.update({
            where: { id: movement.ingredientId },
            data: {
              currentStock: {
                decrement: movement.quantity
              }
            }
          })

          console.log(`✅ Estoque atualizado: ${movement.ingredient.name} (-${movement.quantity})`)
        }
      }

      return production
    }, {
      timeout: 30000 // 30 segundos de timeout
    })

    console.log('🎉 POST production - Produção criada com sucesso!')

    // Buscar produção completa para retorno
    const completeProduction = await prisma.production.findUnique({
      where: { id: result.id },
      include: {
        product: {
          include: {
            category: true,
            productRecipes: {
              include: {
                recipe: {
                  include: {
                    category: true
                  }
                }
              }
            }
          }
        },
        recipe: {
          include: {
            category: true
          }
        },
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
    })

    return NextResponse.json({
      ...completeProduction,
      calculationMethod,
      ingredientsProcessed: ingredientsNeeded.length,
      stockMovements: stockMovements.length,
      hasCompositeRecipes: (completeProduction?.product?.productRecipes?.length || 0) > 0
    }, { status: 201 })

  } catch (error) {
    console.error('❌ POST production - Erro:', error)
    
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
      { error: 'Failed to create production' },
      { status: 500 }
    )
  }
}

