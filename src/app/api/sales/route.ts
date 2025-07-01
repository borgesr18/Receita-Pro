import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { saleSchema } from '@/lib/validations'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getUser(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sales = await prisma.sale.findMany({
      where: { userId: user.id },
      include: {
        product: true,
        channel: true,
        user: true
      },
      orderBy: {
        saleDate: 'desc'
      }
    })

    return NextResponse.json(sales)
  } catch (error) {
    console.error('Error fetching sales:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sales' },
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
    const data = saleSchema.parse(body)
    
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
    
    const sale = await prisma.sale.create({
      data: {
        productId: data.productId,
        channelId: data.channelId,
        userId: user.id,
        quantity: data.quantity,
        weight: data.weight,
        unitPrice: data.unitPrice,
        totalPrice: data.totalPrice,
        profitMargin: data.profitMargin,
        saleDate: parseDate(data.saleDate) || new Date(),
        notes: data.notes || ''
      },
      include: {
        product: true,
        channel: true,
        user: true
      }
    })

    return NextResponse.json(sale, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.format() },
        { status: 400 }
      )
    }
    console.error('Error creating sale:', error)
    return NextResponse.json(
      { error: 'Failed to create sale' },
      { status: 500 }
    )
  }
}
