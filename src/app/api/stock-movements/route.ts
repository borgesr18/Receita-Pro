import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET stock-movements - Iniciando...')
    
    const { user, error } = await getUser(request)
    if (error || !user) {
      console.log('❌ GET stock-movements - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ GET stock-movements - Usuário autenticado:', user.id)

    const url = new URL(request.url)
    const ingredientId = url.searchParams.get('ingredientId')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    // Construir filtros
    const where: any = {
      ingredient: {
        userId: user.id
      }
    }

    if (ingredientId) {
      where.ingredientId = ingredientId
    }

    const movements = await prisma.stockMovement.findMany({
      where,
      include: {
        ingredient: {
          include: {
            category: true,
            unit: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      },
      take: limit,
      skip: offset
    })

    console.log('✅ GET stock-movements - Movimentações encontradas:', movements.length)
    return NextResponse.json(movements)
  } catch (error) {
    console.error('❌ GET stock-movements - Erro:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stock movements' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 POST stock-movements - Iniciando...')
    
    const { user, error } = await getUser(request)
    if (error || !user) {
      console.log('❌ POST stock-movements - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ POST stock-movements - Usuário autenticado:', user.id)

    const body = await request.json()
    console.log('📤 POST stock-movements - Dados recebidos:', body)
    
    // Validação básica
    if (!body.ingredientId || !body.type || !body.quantity || !body.reason) {
      console.log('❌ POST stock-movements - Dados obrigatórios faltando')
      return NextResponse.json(
        { error: 'ingredientId, type, quantity and reason are required' },
        { status: 400 }
      )
    }

    // Verificar se o ingrediente pertence ao usuário
    const ingredient = await prisma.ingredient.findFirst({
      where: {
        id: body.ingredientId,
        userId: user.id
      }
    })

    if (!ingredient) {
      console.log('❌ POST stock-movements - Ingrediente não encontrado ou não pertence ao usuário')
      return NextResponse.json(
        { error: 'Ingredient not found or access denied' },
        { status: 404 }
      )
    }

    // Validar tipo de movimentação
    if (!['Entrada', 'Saída'].includes(body.type)) {
      console.log('❌ POST stock-movements - Tipo de movimentação inválido')
      return NextResponse.json(
        { error: 'Movement type must be "Entrada" or "Saída"' },
        { status: 400 }
      )
    }

    // Validar quantidade
    const quantity = parseFloat(body.quantity)
    if (isNaN(quantity) || quantity <= 0) {
      console.log('❌ POST stock-movements - Quantidade inválida')
      return NextResponse.json(
        { error: 'Quantity must be a positive number' },
        { status: 400 }
      )
    }

    // Para saídas, verificar se há estoque suficiente
    if (body.type === 'Saída' && ingredient.currentStock < quantity) {
      console.log('❌ POST stock-movements - Estoque insuficiente')
      return NextResponse.json(
        { error: 'Insufficient stock for this movement' },
        { status: 400 }
      )
    }

    // Usar transação para garantir consistência
    const result = await prisma.$transaction(async (tx) => {
      // Criar movimentação
      const movement = await tx.stockMovement.create({
        data: {
          ingredientId: body.ingredientId,
          type: body.type,
          quantity: quantity,
          reason: body.reason.trim(),
          reference: body.reference?.trim() || null,
          date: new Date()
        },
        include: {
          ingredient: {
            include: {
              category: true,
              unit: true
            }
          }
        }
      })

      // Atualizar estoque do ingrediente
      const newStock = body.type === 'Entrada' 
        ? ingredient.currentStock + quantity
        : ingredient.currentStock - quantity

      await tx.ingredient.update({
        where: { id: body.ingredientId },
        data: { 
          currentStock: Math.max(0, newStock),
          updatedAt: new Date()
        }
      })

      return movement
    })

    console.log('✅ POST stock-movements - Movimentação criada com sucesso:', result)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('❌ POST stock-movements - Erro detalhado:', error)
    return NextResponse.json(
      { error: 'Failed to create stock movement' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🔍 DELETE stock-movements - Iniciando...')
    
    const { user, error } = await getUser(request)
    if (error || !user) {
      console.log('❌ DELETE stock-movements - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()
    
    console.log('📤 DELETE stock-movements - ID recebido:', id)

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    // Buscar movimentação e verificar se pertence ao usuário
    const movement = await prisma.stockMovement.findFirst({
      where: {
        id: id,
        ingredient: {
          userId: user.id
        }
      },
      include: {
        ingredient: true
      }
    })

    if (!movement) {
      console.log('❌ DELETE stock-movements - Movimentação não encontrada')
      return NextResponse.json(
        { error: 'Stock movement not found or access denied' },
        { status: 404 }
      )
    }

    // Usar transação para reverter a movimentação
    await prisma.$transaction(async (tx) => {
      // Reverter o estoque
      const reverseQuantity = movement.type === 'Entrada' 
        ? -movement.quantity  // Se foi entrada, subtraímos
        : movement.quantity   // Se foi saída, adicionamos

      const newStock = movement.ingredient.currentStock + reverseQuantity

      await tx.ingredient.update({
        where: { id: movement.ingredientId },
        data: { 
          currentStock: Math.max(0, newStock),
          updatedAt: new Date()
        }
      })

      // Excluir movimentação
      await tx.stockMovement.delete({
        where: { id: id }
      })
    })

    console.log('✅ DELETE stock-movements - Movimentação excluída e estoque revertido')
    return NextResponse.json({ message: 'Stock movement deleted successfully' })
  } catch (error) {
    console.error('❌ DELETE stock-movements - Erro:', error)
    return NextResponse.json(
      { error: 'Failed to delete stock movement' },
      { status: 500 }
    )
  }
}

