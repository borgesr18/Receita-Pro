import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { z } from 'zod'

// Schema que mapeia EXATAMENTE os campos do banco de dados para atualização
const recipeUpdateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  description: z.string().optional(),
  instructions: z.string().optional(), // ✅ Campo 'instructions' no banco
  preparationTime: z.coerce.number().min(0).optional(), // ✅ Campo 'preparationTime' no banco
  ovenTemperature: z.coerce.number().min(0).optional(), // ✅ Campo 'ovenTemperature' no banco
  technicalNotes: z.string().optional(), // ✅ Campo 'technicalNotes' no banco
  categoryId: z.string().min(1, 'Categoria é obrigatória').optional(),
  version: z.coerce.number().min(1).optional(),
  isActive: z.boolean().optional(),
  ingredients: z.array(z.any()).optional()
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

// GET /api/recipes/[id] - Obter receita específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 GET recipe - Iniciando...')
    
    const { user, error } = await getUser(request)
    if (error || !user) {
      console.log('❌ GET recipe - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ GET recipe - Usuário autenticado:', user.id)
    console.log('📤 GET recipe - Recipe ID:', params.id)

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
        },
        _count: { select: { ingredients: true } }
      }
    })

    if (!recipe) {
      console.log('❌ GET recipe - Receita não encontrada')
      return NextResponse.json(
        { error: 'Recipe not found or access denied' },
        { status: 404 }
      )
    }

    console.log('✅ GET recipe - Receita encontrada')

    // Calcular custo da receita
    const totalCost = recipe.ingredients?.reduce((sum, recipeIngredient) => {
      const cost = Number(recipeIngredient.quantity) * Number(recipeIngredient.ingredient?.pricePerUnit || 0)
      return sum + (isNaN(cost) ? 0 : cost)
    }, 0) || 0

    // Mapear campos para compatibilidade com a interface
    const recipeWithCalculations = {
      ...recipe,
      totalCost,
      ingredientsCount: recipe._count?.ingredients || 0,
      // Campos de compatibilidade para a interface
      prepTime: recipe.preparationTime || 0,
      cookTime: 0,
      difficulty: 'Fácil',
      observations: recipe.technicalNotes || ''
    }

    return NextResponse.json(recipeWithCalculations)

  } catch (error) {
    console.error('❌ GET recipe - Erro:', error)
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
    console.log('🔍 PUT recipe - Iniciando...')
    
    const { user, error } = await getUser(request)
    if (error || !user) {
      console.log('❌ PUT recipe - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ PUT recipe - Usuário autenticado:', user.id)
    console.log('📤 PUT recipe - Recipe ID:', params.id)

    const body = await request.json()
    console.log('📤 PUT recipe - Dados recebidos:', body)

    // Mapear campos da interface para campos do banco - MAPEAMENTO CORRETO
    const mappedData = {
      ...(body.name && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      // IMPORTANTE: Mapear corretamente os campos da interface para o banco
      ...(body.instructions !== undefined && { instructions: body.instructions }), // ✅ Modo de Preparo → instructions
      ...(body.preparationTime !== undefined && { preparationTime: Number(body.preparationTime) || null }), // ✅ Tempo de Preparo → preparationTime
      ...(body.ovenTemperature !== undefined && { ovenTemperature: Number(body.ovenTemperature) || null }), // ✅ Temperatura → ovenTemperature
      ...(body.technicalNotes !== undefined && { technicalNotes: body.technicalNotes }), // ✅ Observações Técnicas → technicalNotes
      ...(body.categoryId && { categoryId: body.categoryId }),
      ...(body.version !== undefined && { version: Number(body.version) || 1 }),
      ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
      ...(body.ingredients && { ingredients: body.ingredients })
    }

    console.log('🔄 PUT recipe - Dados mapeados para o banco:', {
      name: mappedData.name,
      description: mappedData.description,
      instructions: mappedData.instructions,
      preparationTime: mappedData.preparationTime,
      ovenTemperature: mappedData.ovenTemperature,
      technicalNotes: mappedData.technicalNotes,
      categoryId: mappedData.categoryId
    })

    // Validar dados básicos
    const data = recipeUpdateSchema.parse(mappedData)

    // Verificar se a receita pertence ao usuário
    const existingRecipe = await prisma.recipe.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!existingRecipe) {
      console.log('❌ PUT recipe - Receita não encontrada')
      return NextResponse.json(
        { error: 'Recipe not found or access denied' },
        { status: 404 }
      )
    }

    // Verificar categoria (se fornecida)
    if (data.categoryId) {
      const category = await prisma.recipeCategory.findFirst({
        where: {
          id: data.categoryId,
          userId: user.id
        }
      })

      if (!category) {
        console.log('❌ PUT recipe - Categoria não encontrada')
        return NextResponse.json(
          { error: 'Category not found or access denied' },
          { status: 404 }
        )
      }
    }

    // Processar ingredientes se fornecidos
    let validIngredients: any[] = []
    if (data.ingredients) {
      const cleanedIngredients = cleanIngredients(data.ingredients)
      console.log('🧹 PUT recipe - Ingredientes limpos:', cleanedIngredients.length)

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

          console.log('✅ PUT recipe - Ingredientes válidos:', validIngredients.length)
        } catch (err) {
          console.warn('Erro ao validar ingredientes:', err)
          validIngredients = []
        }
      }
    }

    // Atualizar receita com transação
    const updatedRecipe = await prisma.$transaction(async (tx) => {
      console.log('🔄 PUT recipe - Atualizando receita no banco com dados:', {
        name: data.name,
        description: data.description,
        instructions: data.instructions, // ✅ Campo correto
        preparationTime: data.preparationTime, // ✅ Campo correto
        ovenTemperature: data.ovenTemperature, // ✅ Campo correto
        technicalNotes: data.technicalNotes, // ✅ Campo correto
        categoryId: data.categoryId,
        version: data.version,
        isActive: data.isActive
      })

      // Atualizar receita - DADOS EXATOS DO BANCO
      const recipe = await tx.recipe.update({
        where: { id: params.id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.instructions !== undefined && { instructions: data.instructions }), // ✅ Modo de Preparo
          ...(data.preparationTime !== undefined && { preparationTime: data.preparationTime }), // ✅ Tempo de Preparo
          ...(data.ovenTemperature !== undefined && { ovenTemperature: data.ovenTemperature }), // ✅ Temperatura do Forno
          ...(data.technicalNotes !== undefined && { technicalNotes: data.technicalNotes }), // ✅ Observações Técnicas
          ...(data.categoryId && { categoryId: data.categoryId }),
          ...(data.version !== undefined && { version: data.version }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
          productId: null // ✅ Sempre NULL
        }
      })

      console.log('✅ PUT recipe - Receita atualizada no banco:', {
        id: recipe.id,
        name: recipe.name,
        instructions: recipe.instructions,
        technicalNotes: recipe.technicalNotes,
        preparationTime: recipe.preparationTime,
        ovenTemperature: recipe.ovenTemperature
      })

      // Atualizar ingredientes se fornecidos
      if (data.ingredients) {
        // Remover ingredientes existentes
        await tx.recipeIngredient.deleteMany({
          where: { recipeId: params.id }
        })

        // Adicionar novos ingredientes válidos
        if (validIngredients.length > 0) {
          try {
            await tx.recipeIngredient.createMany({
              data: validIngredients.map(ing => ({
                recipeId: params.id,
                ingredientId: ing.ingredientId,
                quantity: ing.quantity,
                percentage: ing.percentage,
                unitId: ing.unitId,
                order: ing.order
              }))
            })
            console.log('✅ PUT recipe - Ingredientes atualizados:', validIngredients.length)
          } catch (err) {
            console.warn('Erro ao atualizar ingredientes:', err)
          }
        }
      }

      // Buscar receita completa
      return await tx.recipe.findUnique({
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
    })

    console.log('✅ PUT recipe - Receita atualizada com sucesso:', updatedRecipe?.id)

    // Calcular custo com proteção
    let totalCost = 0
    try {
      if (updatedRecipe && 'ingredients' in updatedRecipe && Array.isArray(updatedRecipe.ingredients)) {
        totalCost = updatedRecipe.ingredients.reduce((sum: number, recipeIngredient: any) => {
          const cost = Number(recipeIngredient.quantity) * Number(recipeIngredient.ingredient?.pricePerUnit || 0)
          return sum + (isNaN(cost) ? 0 : cost)
        }, 0)
      }
    } catch (err) {
      console.warn('Erro ao calcular custo:', err)
    }

    return NextResponse.json({
      ...updatedRecipe,
      totalCost
    })

  } catch (error) {
    console.error('❌ PUT recipe - Erro:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.format() },
        { status: 400 }
      )
    }

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
    console.log('🔍 DELETE recipe - Iniciando...')
    
    const { user, error } = await getUser(request)
    if (error || !user) {
      console.log('❌ DELETE recipe - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ DELETE recipe - Usuário autenticado:', user.id)
    console.log('📤 DELETE recipe - Recipe ID:', params.id)

    // Verificar se a receita pertence ao usuário
    const existingRecipe = await prisma.recipe.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!existingRecipe) {
      console.log('❌ DELETE recipe - Receita não encontrada')
      return NextResponse.json(
        { error: 'Recipe not found or access denied' },
        { status: 404 }
      )
    }

    // Excluir receita (ingredientes são excluídos automaticamente por cascade)
    await prisma.recipe.delete({
      where: { id: params.id }
    })

    console.log('✅ DELETE recipe - Receita excluída')

    return NextResponse.json({
      message: 'Recipe deleted successfully'
    })

  } catch (error) {
    console.error('❌ DELETE recipe - Erro:', error)
    return NextResponse.json(
      { error: 'Failed to delete recipe' },
      { status: 500 }
    )
  }
}
