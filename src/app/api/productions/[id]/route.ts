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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await getUser(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const production = await prisma.production.findFirst({
      where: { 
        id: params.id,
        userId: user.id 
      },
      include: {
        recipe: true,
        product: true,
        user: true,
        ingredients: {
          include: {
            ingredient: true,
            unit: true
          }
        }
      }
    })

    if (!production) {
      return NextResponse.json({ error: 'Production not found' }, { status: 404 })
    }

    return NextResponse.json(production)
  } catch (error) {
    console.error('Error fetching production:', error)
    return NextResponse.json(
      { error: 'Failed to fetch production' },
      { status: 500 }
    )
  }
}

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
    const data = productionSchema.parse(body)

    // Converte status do frontend para enum correto do Prisma
    const productionStatus = mapProductionStatus(data.status)

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

    const production = await prisma.production.update({
      where: { 
        id: params.id,
        userId: user.id 
      },
      data: {
        recipeId: data.recipeId,
        productId: data.productId,
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
        recipe: true,
        product: true,
        user: true,
        ingredients: {
          include: {
            ingredient: true,
            unit: true
          }
        }
      }
    })

    return NextResponse.json(production)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.format() },
        { status: 400 }
      )
    }

    console.error('Error updating production:', error)
    return NextResponse.json(
      { error: 'Failed to update production' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await getUser(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.production.delete({
      where: { 
        id: params.id,
        userId: user.id 
      }
    })

    return NextResponse.json({ message: 'Production deleted successfully' })
  } catch (error) {
    console.error('Error deleting production:', error)
    return NextResponse.json(
      { error: 'Failed to delete production' },
      { status: 500 }
    )
  }
}

