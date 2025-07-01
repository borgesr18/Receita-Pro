import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { precoCalculadoSchema } from '@/lib/validations'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getUser(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const historico = await prisma.precoCalculado.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    return NextResponse.json(historico)
  } catch (error) {
    console.error('Error fetching price history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch price history' },
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
    const data = precoCalculadoSchema.parse(body)

    const calculo = await prisma.precoCalculado.create({
      data: {
        userId: user.id,
        custo: data.custo,
        peso: data.peso,
        lucro: data.lucro,
        precoFinal: data.precoFinal
      }
    })

    return NextResponse.json(calculo, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.format() },
        { status: 400 }
      )
    }
    console.error('Error creating price calculation:', error)
    return NextResponse.json(
      { error: 'Failed to save calculation' },
      { status: 500 }
    )
  }
}
