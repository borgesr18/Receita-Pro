import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

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
    const { name, contact, phone, email, address } = body

    console.log('📤 Atualizando fornecedor:', { id: params.id, name, contact, phone, email, address })

    const supplier = await prisma.supplier.update({
      where: { 
        id: params.id,
        userId: user.id // Garantir que o usuário só pode editar seus próprios fornecedores
      },
      data: {
        name,
        contact: contact || '',
        phone: phone || '',
        email: email || '',
        address: address || '',
        updatedAt: new Date()
      }
    })

    console.log('✅ Fornecedor atualizado:', supplier)
    return NextResponse.json(supplier)
  } catch (error) {
    console.error('❌ Erro ao atualizar fornecedor:', error)
    return NextResponse.json(
      { error: 'Failed to update supplier' },
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

    console.log('🗑️ Excluindo fornecedor:', params.id)

    await prisma.supplier.delete({
      where: { 
        id: params.id,
        userId: user.id // Garantir que o usuário só pode excluir seus próprios fornecedores
      }
    })

    console.log('✅ Fornecedor excluído com sucesso')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Erro ao excluir fornecedor:', error)
    return NextResponse.json(
      { error: 'Failed to delete supplier' },
      { status: 500 }
    )
  }
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

    const supplier = await prisma.supplier.findUnique({
      where: { 
        id: params.id,
        userId: user.id
      }
    })

    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
    }

    return NextResponse.json(supplier)
  } catch (error) {
    console.error('❌ Erro ao buscar fornecedor:', error)
    return NextResponse.json(
      { error: 'Failed to fetch supplier' },
      { status: 500 }
    )
  }
}

