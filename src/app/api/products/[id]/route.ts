import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { productSchema } from '@/lib/validations'
import { z } from 'zod'

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
    const product = await prisma.product.findFirst({
      where: { id: params.id, userId: user.id },
      include: {
        category: true,
        prices: {
          include: {
            channel: true
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
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
    const data = productSchema.parse(body)
    
    const result = await prisma.product.updateMany({
      where: { id: params.id, userId: user.id },
      data: {
        name: data.name,
        description: data.description || '',
        categoryId: data.categoryId,
        averageWeight: data.averageWeight
      }
    })

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Product not found or access denied' },
        { status: 404 }
      )
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        prices: {
          include: {
            channel: true
          }
        }
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.format() },
        { status: 400 }
      )
    }
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
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
    const result = await prisma.product.deleteMany({
      where: { id: params.id, userId: user.id }
    })

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Product not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
