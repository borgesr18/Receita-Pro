import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { z } from 'zod'

// Schema que mapeia EXATAMENTE os campos do banco de dados
const recipeSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional().default(''),
  instructions: z.string().optional().default(''), // ✅ Campo 'instructions' no banco
  preparationTime: z.coerce.number().min(0).optional(), // ✅ Campo 'preparationTime' no banco
  ovenTemperature: z.coerce.number().min(0).optional(), // ✅ Campo 'ovenTemperature' no banco
  technicalNotes: z.string().optional().default(''), // ✅ Campo 'technicalNotes' no banco
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  version: z.coerce.number().min(1).default(1),
  isActive: z.boolean().default(true),
  ingredients: z.array(z.any()).optional().default([])
})

// Função para limpar e validar ingredientes
function cleanIngredients(ingredients: any[]): any[] {
  if (!Array.isArray(ingredients)) return []
  
  return ingredients
    .filter(ing => {
      // Filtrar apenas ingredientes com dados válidos
      return ing && 
             typeof ing === 'object' &&
             ing.ingredientId && 
             ing.ingredientId.toString().trim() !== '' &&
             ing.unitId && 
             ing.unitId.toString().trim() !== '' &&
             ing.quantity && 
             Number(ing.quantity) > 0
    })
    .map((ing, index) => ({
      ingredientId: ing.ingredientId.toString().trim(),
      quantity: Number(ing.quantity) || 0.01,
      percentage: Number(ing.percentage) || 0,
      unitId: ing.unitId.toString().trim(),
      order: Number(ing.order) || index
    }))
}

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

    // Buscar receitas do usuário com timeout
    const recipes = await Promise.race([
      prisma.recipe.findMany({
        where: { userId: user.id },
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
          },
          _count: { select: { ingredients: true } }
        },
        orderBy: { name: 'asc' }
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 10000)
      )
    ]) as any[]

    console.log('✅ GET recipes - Receitas encontradas:', recipes.length)

    // Calcular informações com proteção contra erros
    const recipesWithCalculations = recipes.map(recipe => {
      try {
        const totalCost = recipe.ingredients?.reduce((sum: number, recipeIngredient: any) => {
          const cost = Number(recipeIngredient.quantity) * Number(recipeIngredient.ingredient?.pricePerUnit || 0)
          return sum + (isNaN(cost) ? 0 : cost)
        }, 0) || 0

        // Mapear campos para compatibilidade com a interface
        return {
          ...recipe,
          totalCost,
          ingredientsCount: recipe._count?.ingredients || 0,
          // Campos de compatibilidade para a interface (sem 'servings')
          prepTime: recipe.preparationTime || 0, // Mapear preparationTime para prepTime
          cookTime: 0, // Valor padrão já que não existe no banco
          difficulty: 'Fácil', // Valor padrão já que não existe no banco
          observations: recipe.technicalNotes || '' // Mapear technicalNotes para observations
        }
      } catch (err) {
        console.warn('Erro ao calcular receita:', recipe.id, err)
        return {
          ...recipe,
          totalCost: 0,
          ingredientsCount: 0,
          prepTime: 0,
          cookTime: 0,
          difficulty: 'Fácil',
          observations: ''
        }
      }
    })

    return NextResponse.json(recipesWithCalculations)
  } catch (error) {
    console.error('❌ GET recipes - Erro:', error)
    // Retornar array vazio em caso de erro
    return NextResponse.json([])
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

    // Mapear campos da interface para campos do banco - MAPEAMENTO CORRETO
    const mappedData = {
      name: body.name,
      description: body.description || '',
      // IMPORTANTE: Mapear corretamente os campos da interface para o banco
      instructions: body.instructions || '', // ✅ Modo de Preparo → instructions
      preparationTime: Number(body.preparationTime) || null, // ✅ Tempo de Preparo → preparationTime
      ovenTemperature: Number(body.ovenTemperature) || null, // ✅ Temperatura → ovenTemperature
      technicalNotes: body.technicalNotes || '', // ✅ Observações Técnicas → technicalNotes
      categoryId: body.categoryId,
      version: Number(body.version) || 1,
      isActive: Boolean(body.isActive !== false),
      ingredients: body.ingredients || []
    }

    console.log('🔄 POST recipe - Dados mapeados para o banco:', {
      name: mappedData.name,
      description: mappedData.description,
      instructions: mappedData.instructions,
      preparationTime: mappedData.preparationTime,
      ovenTemperature: mappedData.ovenTemperature,
      technicalNotes: mappedData.technicalNotes,
      categoryId: mappedData.categoryId
    })

    // Validar dados básicos
    const data = recipeSchema.parse(mappedData)
    
    // Limpar ingredientes automaticamente
    const cleanedIngredients = cleanIngredients(data.ingredients)
    console.log('🧹 POST recipe - Ingredientes limpos:', cleanedIngredients.length)

    // Verificar categoria (obrigatória)
    let category
    try {
      category = await prisma.recipeCategory.findFirst({
        where: {
          id: data.categoryId,
          userId: user.id
        }
      })
    } catch (err) {
      console.warn('Erro ao buscar categoria:', err)
    }

    if (!category) {
      console.log('❌ POST recipe - Categoria não encontrada')
      return NextResponse.json(
        { error: 'Category not found or access denied' },
        { status: 404 }
      )
    }

    // Verificar ingredientes e unidades (se houver)
    let validIngredients = cleanedIngredients
    if (cleanedIngredients.length > 0) {
      try {
        const ingredientIds = cleanedIngredients.map(ing => ing.ingredientId)
        const unitIds = cleanedIngredients.map(ing => ing.unitId)

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

        // Filtrar apenas ingredientes válidos
        validIngredients = cleanedIngredients.filter(ing => {
          const hasIngredient = ingredients.some(i => i.id === ing.ingredientId)
          const hasUnit = units.some(u => u.id === ing.unitId)
          return hasIngredient && hasUnit
        })

        console.log('✅ POST recipe - Ingredientes válidos:', validIngredients.length)
      } catch (err) {
        console.warn('Erro ao validar ingredientes:', err)
        validIngredients = [] // Em caso de erro, criar receita sem ingredientes
      }
    }

    // Criar receita com proteção total
    const recipe = await prisma.$transaction(async (tx) => {
      console.log('🔄 POST recipe - Criando receita no banco com dados:', {
        name: data.name,
        description: data.description,
        instructions: data.instructions, // ✅ Campo correto
        preparationTime: data.preparationTime, // ✅ Campo correto
        ovenTemperature: data.ovenTemperature, // ✅ Campo correto
        technicalNotes: data.technicalNotes, // ✅ Campo correto
        categoryId: data.categoryId,
        productId: null, // ✅ Sempre NULL como solicitado
        version: data.version,
        isActive: data.isActive,
        userId: user.id
      })

      // Criar receita - DADOS EXATOS DO BANCO
      const newRecipe = await tx.recipe.create({
        data: {
          name: data.name,
          description: data.description,
          instructions: data.instructions, // ✅ Modo de Preparo
          preparationTime: data.preparationTime, // ✅ Tempo de Preparo
          ovenTemperature: data.ovenTemperature, // ✅ Temperatura do Forno
          technicalNotes: data.technicalNotes, // ✅ Observações Técnicas
          categoryId: data.categoryId,
          productId: null, // ✅ Sempre NULL
          version: data.version,
          isActive: data.isActive,
          userId: user.id
        }
      })

      console.log('✅ POST recipe - Receita criada no banco:', {
        id: newRecipe.id,
        name: newRecipe.name,
        instructions: newRecipe.instructions,
        technicalNotes: newRecipe.technicalNotes,
        preparationTime: newRecipe.preparationTime,
        ovenTemperature: newRecipe.ovenTemperature
      })

      // Adicionar ingredientes válidos
      if (validIngredients.length > 0) {
        try {
          await tx.recipeIngredient.createMany({
            data: validIngredients.map(ing => ({
              recipeId: newRecipe.id,
              ingredientId: ing.ingredientId,
              quantity: ing.quantity,
              percentage: ing.percentage,
              unitId: ing.unitId,
              order: ing.order
            }))
          })
          console.log('✅ POST recipe - Ingredientes adicionados:', validIngredients.length)
        } catch (err) {
          console.warn('Erro ao criar ingredientes, continuando sem eles:', err)
        }
      }

      // Buscar receita completa
      try {
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
              orderBy: { order: 'asc' }
            }
          }
        })
      } catch (err) {
        console.warn('Erro ao buscar receita completa, retornando básica:', err)
        return newRecipe
      }
    })

    console.log('✅ POST recipe - Receita criada com sucesso:', recipe?.id)

    // Calcular custo com proteção
    let totalCost = 0
    try {
      if (recipe && 'ingredients' in recipe && Array.isArray(recipe.ingredients)) {
        totalCost = recipe.ingredients.reduce((sum: number, recipeIngredient: any) => {
          const cost = Number(recipeIngredient.quantity) * Number(recipeIngredient.ingredient?.pricePerUnit || 0)
          return sum + (isNaN(cost) ? 0 : cost)
        }, 0)
      }
    } catch (err) {
      console.warn('Erro ao calcular custo:', err)
    }

    return NextResponse.json({
      ...recipe,
      totalCost
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
