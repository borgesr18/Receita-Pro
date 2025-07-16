import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 GET stock-movement by ID - Iniciando...')
    
    const { user, error } = await getUser(request)
    if (error || !user) {
      console.log('❌ GET stock-movement by ID - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ GET stock-movement by ID - Usuário autenticado:', user.id)
    console.log('📤 GET stock-movement by ID - ID recebido:', params.id)

    const movement = await prisma.stockMovement.findFirst({
      where: {
        id: params.id,
        ingredient: {
          userId: user.id
        }
      },
      include: {
        ingredient: {
          include: {
            category: true,
            unit: true,
            supplier: true
          }
        }
      }
    })

    if (!movement) {
      console.log('❌ GET stock-movement by ID - Movimentação não encontrada')
      return NextResponse.json(
        { error: 'Stock movement not found or access denied' },
        { status: 404 }
      )
    }

    console.log('✅ GET stock-movement by ID - Movimentação encontrada')
    return NextResponse.json(movement)
  } catch (error) {
    console.error('❌ GET stock-movement by ID - Erro:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stock movement' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 PUT stock-movement - Iniciando...')
    
    const { user, error } = await getUser(request)
    if (error || !user) {
      console.log('❌ PUT stock-movement - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('📤 PUT stock-movement - Dados recebidos:', body)

    // Buscar movimentação atual
    const currentMovement = await prisma.stockMovement.findFirst({
      where: {
        id: params.id,
        ingredient: {
          userId: user.id
        }
      },
      include: {
        ingredient: true
      }
    })

    if (!currentMovement) {
      console.log('❌ PUT stock-movement - Movimentação não encontrada')
      return NextResponse.json(
        { error: 'Stock movement not found or access denied' },
        { status: 404 }
      )
    }

    // Validações
    if (body.type && !['Entrada', 'Saída'].includes(body.type)) {
      return NextResponse.json(
        { error: 'Movement type must be "Entrada" or "Saída"' },
        { status: 400 }
      )
    }

    const newQuantity = body.quantity ? parseFloat(body.quantity) : currentMovement.quantity
    if (body.quantity && (isNaN(newQuantity) || newQuantity <= 0)) {
      return NextResponse.json(
        { error: 'Quantity must be a positive number' },
        { status: 400 }
      )
    }

    // Usar transação para atualizar
    const result = await prisma.$transaction(async (tx) => {
      // Reverter movimentação anterior
      const reverseQuantity = currentMovement.type === 'Entrada' 
        ? -currentMovement.quantity
        : currentMovement.quantity

      let currentStock = currentMovement.ingredient.currentStock + reverseQuantity

      // Aplicar nova movimentação
      const finalType = body.type || currentMovement.type
      const stockChange = finalType === 'Entrada' ? newQuantity : -newQuantity
      currentStock += stockChange

      // Verificar se há estoque suficiente
      if (currentStock < 0) {
        throw new Error('Insufficient stock for this movement')
      }

      // Atualizar movimentação
      const updatedMovement = await tx.stockMovement.update({
        where: { id: params.id },
        data: {
          type: finalType,
          quantity: newQuantity,
          reason: body.reason?.trim() || currentMovement.reason,
          reference: body.reference?.trim() || currentMovement.reference,
          date: body.date ? new Date(body.date) : currentMovement.date
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
      await tx.ingredient.update({
        where: { id: currentMovement.ingredientId },
        data: { 
          currentStock: Math.max(0, currentStock),
          updatedAt: new Date()
        }
      })

      return updatedMovement
    })

    console.log('✅ PUT stock-movement - Movimentação atualizada:', result)
    return NextResponse.json(result)
  } catch (error) {
    console.error('❌ PUT stock-movement - Erro:', error)
    
    if (error instanceof Error && error.message === 'Insufficient stock for this movement') {
      return NextResponse.json(
        { error: 'Insufficient stock for this movement' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update stock movement' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 DELETE stock-movement by ID - Iniciando...')
    
    const { user, error } = await getUser(request)
    if (error || !user) {
      console.log('❌ DELETE stock-movement by ID - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('📤 DELETE stock-movement by ID - ID recebido:', params.id)

    // Buscar movimentação e verificar se pertence ao usuário
    const movement = await prisma.stockMovement.findFirst({
      where: {
        id: params.id,
        ingredient: {
          userId: user.id
        }
      },
      include: {
        ingredient: true
      }
    })

    if (!movement) {
      console.log('❌ DELETE stock-movement by ID - Movimentação não encontrada')
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
        where: { id: params.id }
      })
    })

    console.log('✅ DELETE stock-movement by ID - Movimentação excluída e estoque revertido')
    return NextResponse.json({ message: 'Stock movement deleted successfully' })
  } catch (error) {
    console.error('❌ DELETE stock-movement by ID - Erro:', error)
    return NextResponse.json(
      { error: 'Failed to delete stock movement' },
      { status: 500 }
    )
  }
}

