import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { ingredientSchema } from '@/lib/validations'
import { z } from 'zod'
import { IngredientType, StorageCondition } from '@prisma/client'

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

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getUser(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const ingredient = await prisma.ingredient.findFirst({
      where: { id: params.id, userId: user.id },
      include: {
        category: true,
        unit: true,
        supplier: true
      }
    })

    if (!ingredient) {
      return NextResponse.json(
        { error: 'Ingredient not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json(ingredient)
  } catch (error) {
    console.error('Error fetching ingredient:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ingredient' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getUser(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
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

    const result = await prisma.ingredient.updateMany({
      where: { id: params.id, userId: user.id },
      data: {
        name: data.name,
        categoryId: data.categoryId,
        unitId: data.unitId,
        pricePerUnit: data.pricePerUnit,
        supplierId: data.supplierId || null,
        purchaseDate: parseDate(data.purchaseDate),
        ingredientType: mapIngredientType(data.ingredientType),
        expirationDate: parseDate(data.expirationDate),
        storageCondition: mapStorageCondition(data.storageCondition),
        currentStock: data.currentStock,
        minimumStock: data.minimumStock
      }
    })

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Ingredient not found or access denied' },
        { status: 404 }
      )
    }

    const ingredient = await prisma.ingredient.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        unit: true,
        supplier: true
      }
    })

    return NextResponse.json(ingredient)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.format() },
        { status: 400 }
      )
    }
    console.error('Error updating ingredient:', error)
    return NextResponse.json(
      { error: 'Failed to update ingredient' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getUser(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const result = await prisma.ingredient.deleteMany({
      where: { id: params.id, userId: user.id }
    })

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Ingredient not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting ingredient:', error)
    return NextResponse.json(
      { error: 'Failed to delete ingredient' },
      { status: 500 }
    )
  }
}
