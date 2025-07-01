import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { ingredientSchema } from '@/lib/validations'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getUser(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ingredients = await prisma.ingredient.findMany({
      where: { userId: user.id },
      include: {
        category: true,
        unit: true,
        supplier: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(ingredients)
  } catch (error) {
    console.error('Error fetching ingredients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ingredients' },
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
    const data = ingredientSchema.parse(body)
    
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
    
    const ingredient = await prisma.ingredient.create({
      data: {
        name: data.name,
        categoryId: data.categoryId,
        unitId: data.unitId,
        pricePerUnit: data.pricePerUnit,
        supplierId: data.supplierId || null,
        userId: user.id,
        purchaseDate: parseDate(data.purchaseDate),
        ingredientType: data.ingredientType,
        expirationDate: parseDate(data.expirationDate),
        storageCondition: data.storageCondition,
        currentStock: data.currentStock,
        minimumStock: data.minimumStock
      },
      include: {
        category: true,
        unit: true,
        supplier: true
      }
    })

    return NextResponse.json(ingredient, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.format() },
        { status: 400 }
      )
    }
    console.error('Error creating ingredient:', error)
    return NextResponse.json(
      { error: 'Failed to create ingredient' },
      { status: 500 }
    )
  }
}
