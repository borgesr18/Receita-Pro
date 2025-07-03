import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { productionSchema } from '@/lib/validations'
import { z } from 'zod'
import { ProductionStatus } from '@prisma/client'

// Mapeia status vindo do frontend (em inglês) para o enum do Prisma (em português)
function mapProductionStatus(value: string): ProductionStatus {
  const statusMap: Record<string, ProductionStatus> = {
    PLANNED: 'Planejado',
    IN_PROGRESS: 'Em_Andamento',
    COMPLETED: 'Completo',
    CANCELLED: 'Cencelado'
  }

  if (value in statusMap) {
    return statusMap[value]
  }

  throw new Error(`Invalid production status: ${value}`)
}

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getUser(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const productions = await prisma.production.findMany({
      where: { userId: user.id },
      include: {
        recipe: true,
        product: true,
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(productions)
  } catch (error) {
    console.error('Error fetching productions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch productions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const production = await prisma.production.create({
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
        recipe: true,
        product: true,
        user: true
      }
    })

    return NextResponse.json(production, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.format() },
        { status: 400 }
      )
    }

    console.error('Error creating production:', error)
    return NextResponse.json(
      { error: 'Failed to create production' },
      { status: 500 }
    )
  }
}

