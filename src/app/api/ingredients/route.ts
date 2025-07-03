import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { ingredientSchema } from '@/lib/validations'
import { IngredientType, StorageCondition } from '@prisma/client'
import { z } from 'zod'

// Função para validar e converter string para enum IngredientType
function mapIngredientType(value: string): IngredientType {
  if (Object.values(IngredientType).includes(value as IngredientType)) {
    return value as IngredientType
  }
  throw new Error(`Invalid ingredient type: ${value}`)
}

// Função para validar e converter string para enum StorageCondition
function mapStorageCondition(value: string): StorageCondition {
  if (Object.values(StorageCondition).includes(value as StorageCondition)) {
    return value as StorageCondition
  }
  throw new Error(`Invalid storage condition: ${value}`)
}

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
    const parsedData = ingredientSchema.parse(body)

    // Converte os valores do frontend para os enums corretos do Prisma
    const ingredientType = mapIngredientType(parsedData.ingredientType)
    const storageCondition = mapStorageCondition(parsedData.storageCondition)

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
        name: parsedData.name,
        categoryId: parsedData.categoryId,
        unitId: parsedData.unitId,
        pricePerUnit: parsedData.pricePerUnit,
        supplierId: parsedData.supplierId || null,
        userId: user.id,
        purchaseDate: parseDate(parsedData.purchaseDate),
        ingredientType: ingredientType,
        expirationDate: parseDate(parsedData.expirationDate),
        storageCondition: storageCondition,
        currentStock: parsedData.currentStock,
        minimumStock: parsedData.minimumStock
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
