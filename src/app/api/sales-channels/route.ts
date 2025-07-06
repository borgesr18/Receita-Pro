import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getUser(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const channels = await prisma.salesChannel.findMany({
      where: { userId: user.id },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(channels)
  } catch (error) {
    console.error('Error fetching sales channels:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sales channels' },
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
    
    const channel = await prisma.salesChannel.create({
      data: {
        name: body.name,
        description: body.description || '',
        userId: user.id
      }
    })

    return NextResponse.json(channel, { status: 201 })
  } catch (error) {
    console.error('Error creating sales channel:', error)
    return NextResponse.json(
      { error: 'Failed to create sales channel' },
      { status: 500 }
    )
  }
}
