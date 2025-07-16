import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { productionSchema } from '@/lib/validations'
import { z } from 'zod'
import { ProductionStatus } from '@prisma/client'

// Mapeia status vindo do frontend (português) para o enum do Prisma
function mapProductionStatus(value: string): ProductionStatus {
  const statusMap: Record<string, ProductionStatus> = {
    // Aceita tanto português quanto inglês para compatibilidade
    'planejada': 'Planejado',
    'em_andamento': 'Em_Andamento', 
    'concluida': 'Completo',
    'cancelada': 'Cancelado',
    'PLANNED': 'Planejado',
    'IN_PROGRESS': 'Em_Andamento',
    'COMPLETED': 'Completo',
    'CANCELLED': 'Cancelado'
  }

  if (value in statusMap) {
    return statusMap[value]
  }

  throw new Error(`Invalid production status: ${value}`)
}

// Função para processar desconto automático de ingredientes
async function processStockMovements(
  recipeId: string, 
  quantityPlanned: number, 
  batchNumber: string,
  userId: string,
  tx: any // Prisma transaction
) {
  try {
    console.log('🔄 Processando desconto automático de ingredientes...')
    console.log('📋 Receita ID:', recipeId)
    console.log('📊 Quantidade planejada:', quantityPlanned)

    // Buscar ingredientes da receita
    const recipeIngredients = await tx.recipeIngredient.findMany({
      where: { recipeId },
      include: {
        ingredient: {
          include: {
            unit: true,
            category: true
          }
        },
        unit: true
      }
    })

    console.log('🥘 Ingredientes da receita encontrados:', recipeIngredients.length)

    if (recipeIngredients.length === 0) {
      console.log('⚠️ Nenhum ingrediente encontrado na receita - pulando desconto de estoque')
      return []
    }

    const stockMovements = []
    const insufficientStock = []

    // Calcular e validar estoque para cada ingrediente
    for (const recipeIngredient of recipeIngredients) {
      const ingredient = recipeIngredient.ingredient
      const quantityNeeded = recipeIngredient.quantity * quantityPlanned

      console.log(`📦 Ingrediente: ${ingredient.name}`)
      console.log(`📏 Quantidade necessária: ${quantityNeeded} ${ingredient.unit?.abbreviation}`)
      console.log(`📊 Estoque atual: ${ingredient.currentStock} ${ingredient.unit?.abbreviation}`)

      // Verificar se há estoque suficiente
      if (ingredient.currentStock < quantityNeeded) {
        insufficientStock.push({
          name: ingredient.name,
          needed: quantityNeeded,
          available: ingredient.currentStock,
          unit: ingredient.unit?.abbreviation || 'un'
        })
        continue
      }

      // Preparar movimentação de saída
      stockMovements.push({
        ingredientId: ingredient.id,
        type: 'Saída',
        quantity: quantityNeeded,
        reason: `Produção - ${batchNumber}`,
        reference: batchNumber,
        ingredient: ingredient
      })
    }

    // Se há estoque insuficiente, retornar erro
    if (insufficientStock.length > 0) {
      console.log('❌ Estoque insuficiente para ingredientes:', insufficientStock)
      throw new Error(`Estoque insuficiente: ${insufficientStock.map(item => 
        `${item.name} (necessário: ${item.needed} ${item.unit}, disponível: ${item.available} ${item.unit})`
      ).join(', ')}`)
    }

    // Processar movimentações de estoque
    const createdMovements = []
    for (const movement of stockMovements) {
      console.log(`📤 Criando movimentação de saída: ${movement.ingredient.name} - ${movement.quantity}`)

      // Criar movimentação
      const stockMovement = await tx.stockMovement.create({
        data: {
          ingredientId: movement.ingredientId,
          type: movement.type,
          quantity: movement.quantity,
          reason: movement.reason,
          reference: movement.reference,
          date: new Date()
        }
      })

      // Atualizar estoque do ingrediente
      await tx.ingredient.update({
        where: { id: movement.ingredientId },
        data: {
          currentStock: movement.ingredient.currentStock - movement.quantity,
          updatedAt: new Date()
        }
      })

      createdMovements.push(stockMovement)
      console.log(`✅ Estoque atualizado: ${movement.ingredient.name} - novo estoque: ${movement.ingredient.currentStock - movement.quantity}`)
    }

    console.log('✅ Desconto automático de ingredientes concluído!')
    return createdMovements
  } catch (error) {
    console.error('❌ Erro no processamento de estoque:', error)
    throw error
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET productions - Iniciando...')
    
    const { user, error } = await getUser(request)
    if (error || !user) {
      console.log('❌ GET productions - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ GET productions - Usuário autenticado:', user.id)

    const productions = await prisma.production.findMany({
      where: { userId: user.id },
      include: {
        recipe: {
          include: {
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
        product: true,
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('✅ GET productions - Produções encontradas:', productions.length)
    return NextResponse.json(productions)
  } catch (error) {
    console.error('❌ GET productions - Erro:', error)
    return NextResponse.json(
      { error: 'Failed to fetch productions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 POST productions - Iniciando com integração de estoque...')
    
    const { user, error } = await getUser(request)
    if (error || !user) {
      console.log('❌ POST productions - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ POST productions - Usuário autenticado:', user.id)

    const body = await request.json()
    console.log('📤 POST productions - Dados recebidos:', body)
    
    // Validação com Zod
    let data
    try {
      data = productionSchema.parse(body)
      console.log('✅ Validação Zod passou')
    } catch (zodError) {
      console.error('❌ Erro de validação Zod:', zodError)
      if (zodError instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation failed', details: zodError.format() },
          { status: 400 }
        )
      }
      throw zodError
    }

    // Converte status do frontend para enum correto do Prisma
    let productionStatus
    try {
      productionStatus = mapProductionStatus(data.status)
      console.log('✅ Status mapeado:', data.status, '->', productionStatus)
    } catch (statusError) {
      console.error('❌ Erro no mapeamento de status:', statusError)
      return NextResponse.json(
        { error: `Invalid status: ${data.status}` },
        { status: 400 }
      )
    }

    const parseDate = (dateString: string | null | undefined): Date | null => {
      if (!dateString || dateString === '' || dateString === 'undefined') return null
      
      try {
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return null
        
        const year = date.getFullYear()
        if (year < 1900 || year > 2100) return null
        
        return date
      } catch {
        return null
      }
    }

    // Usar transação para garantir consistência entre produção e estoque
    const result = await prisma.$transaction(async (tx) => {
      console.log('🔄 Iniciando transação para criação de produção...')

      // Criar produção
      const production = await tx.production.create({
        data: {
          recipeId: data.recipeId,
          productId: data.productId,
          userId: user.id,
          batchNumber: data.batchNumber,
          quantityPlanned: data.quantityPlanned,
          quantityProduced: data.quantityProduced || null,
          lossPercentage: data.lossPercentage,
          lossWeight: data.lossWeight,
          productionDate: parseDate(data.productionDate) || new Date(),
          expirationDate: parseDate(data.expirationDate),
          notes: data.notes || '',
          status: productionStatus
        },
        include: {
          recipe: {
            include: {
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
          product: true,
          user: true
        }
      })

      console.log('✅ Produção criada:', production.id)

      // Processar desconto automático de ingredientes apenas se a produção for criada com status "Em_Andamento" ou "Completo"
      let stockMovements = []
      if (productionStatus === 'Em_Andamento' || productionStatus === 'Completo') {
        console.log('🔄 Status permite desconto automático, processando...')
        
        try {
          stockMovements = await processStockMovements(
            data.recipeId,
            data.quantityPlanned,
            data.batchNumber,
            user.id,
            tx
          )
          console.log('✅ Movimentações de estoque criadas:', stockMovements.length)
        } catch (stockError) {
          console.error('❌ Erro no desconto de estoque:', stockError)
          throw stockError // Isso fará a transação ser revertida
        }
      } else {
        console.log('ℹ️ Status não requer desconto automático (Planejado/Cancelado)')
      }

      return {
        production,
        stockMovements
      }
    }, {
      timeout: 10000 // 10 segundos de timeout
    })

    console.log('✅ POST productions - Produção criada com sucesso!')
    console.log('📊 Movimentações de estoque:', result.stockMovements.length)

    // Retornar produção com informações sobre movimentações
    return NextResponse.json({
      ...result.production,
      stockMovements: result.stockMovements,
      message: result.stockMovements.length > 0 
        ? `Produção criada e ${result.stockMovements.length} ingredientes descontados do estoque automaticamente.`
        : 'Produção criada. Nenhum desconto de estoque necessário.'
    }, { status: 201 })

  } catch (error) {
    console.error('❌ POST productions - Erro detalhado:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.format() },
        { status: 400 }
      )
    }

    // Tratar erros específicos de estoque
    if (error instanceof Error && error.message.includes('Estoque insuficiente')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Tratar erros de timeout
    if (error instanceof Error && error.message.includes('timeout')) {
      return NextResponse.json(
        { error: 'Operation timeout - please try again' },
        { status: 408 }
      )
    }

    // Tratar erros de banco de dados
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('❌ Erro de banco de dados:', error)
      
      // Erro de chave estrangeira
      if (error.code === 'P2003') {
        return NextResponse.json(
          { error: 'Invalid recipe or product reference' },
          { status: 400 }
        )
      }
      
      // Erro de duplicação
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Batch number already exists' },
          { status: 409 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to create production' },
      { status: 500 }
    )
  }
}

