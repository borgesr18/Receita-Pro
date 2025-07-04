import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET ingredients - Iniciando...')
    
    const { user, error } = await getUser(request)
    if (error || !user) {
      console.log('❌ GET ingredients - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ GET ingredients - Usuário autenticado:', user.id)

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

    console.log('✅ GET ingredients - Ingredientes encontrados:', ingredients.length)
    return NextResponse.json(ingredients)
  } catch (error) {
    console.error('❌ GET ingredients - Erro:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ingredients' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 POST ingredients - Iniciando...')
    
    const { user, error } = await getUser(request)
    if (error || !user) {
      console.log('❌ POST ingredients - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ POST ingredients - Usuário autenticado:', user.id)

    const body = await request.json()
    console.log('📤 POST ingredients - Dados recebidos:', body)
    
    // Validação básica
    if (!body.name || !body.categoryId || !body.unitId) {
      console.log('❌ POST ingredients - Dados obrigatórios faltando')
      return NextResponse.json(
        { error: 'Name, categoryId and unitId are required' },
        { status: 400 }
      )
    }

    // Função para converter datas de forma segura
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

    // Preparar dados para criação - seguindo padrão das configurações
    const ingredientData = {
      name: body.name.trim(),
      categoryId: body.categoryId,
      unitId: body.unitId,
      pricePerUnit: body.pricePerUnit ? parseFloat(body.pricePerUnit.toString()) : 0,
      supplierId: body.supplierId || null,
      userId: user.id,
      purchaseDate: parseDate(body.purchaseDate),
      ingredientType: body.ingredientType || 'PRINCIPAL',
      expirationDate: parseDate(body.expirationDate),
      storageCondition: body.storageCondition || 'AMBIENTE_SECO',
      currentStock: body.currentStock ? parseFloat(body.currentStock.toString()) : 0,
      minimumStock: body.minimumStock ? parseFloat(body.minimumStock.toString()) : 0
    }

    console.log('📤 POST ingredients - Dados preparados para criação:', ingredientData)
    
    const ingredient = await prisma.ingredient.create({
      data: ingredientData,
      include: {
        category: true,
        unit: true,
        supplier: true
      }
    })

    console.log('✅ POST ingredients - Ingrediente criado com sucesso:', ingredient)
    return NextResponse.json(ingredient, { status: 201 })
  } catch (error) {
    console.error('❌ POST ingredients - Erro detalhado:', error)
    
    // Tratamento específico para erro de duplicação
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'An ingredient with this name already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create ingredient' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('🔍 PUT ingredients - Iniciando...')
    
    const { user, error } = await getUser(request)
    if (error || !user) {
      console.log('❌ PUT ingredients - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body
    
    console.log('📤 PUT ingredients - Dados recebidos:', { id, updateData })

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    // Função para converter datas de forma segura
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

    // Preparar dados para atualização
    const ingredientData = {
      name: updateData.name?.trim(),
      categoryId: updateData.categoryId,
      unitId: updateData.unitId,
      pricePerUnit: updateData.pricePerUnit ? parseFloat(updateData.pricePerUnit.toString()) : 0,
      supplierId: updateData.supplierId || null,
      purchaseDate: parseDate(updateData.purchaseDate),
      ingredientType: updateData.ingredientType || 'PRINCIPAL',
      expirationDate: parseDate(updateData.expirationDate),
      storageCondition: updateData.storageCondition || 'AMBIENTE_SECO',
      currentStock: updateData.currentStock ? parseFloat(updateData.currentStock.toString()) : 0,
      minimumStock: updateData.minimumStock ? parseFloat(updateData.minimumStock.toString()) : 0,
      updatedAt: new Date()
    }

    console.log('📤 PUT ingredients - Dados preparados para atualização:', ingredientData)

    const ingredient = await prisma.ingredient.update({
      where: { 
        id: id,
        userId: user.id 
      },
      data: ingredientData,
      include: {
        category: true,
        unit: true,
        supplier: true
      }
    })

    console.log('✅ PUT ingredients - Ingrediente atualizado:', ingredient)
    return NextResponse.json(ingredient)
  } catch (error) {
    console.error('❌ PUT ingredients - Erro:', error)
    return NextResponse.json(
      { error: 'Failed to update ingredient' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🔍 DELETE ingredients - Iniciando...')
    
    const { user, error } = await getUser(request)
    if (error || !user) {
      console.log('❌ DELETE ingredients - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()
    
    console.log('📤 DELETE ingredients - ID recebido:', id)

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await prisma.ingredient.delete({
      where: { 
        id: id,
        userId: user.id 
      }
    })

    console.log('✅ DELETE ingredients - Ingrediente excluído')
    return NextResponse.json({ message: 'Ingredient deleted successfully' })
  } catch (error) {
    console.error('❌ DELETE ingredients - Erro:', error)
    return NextResponse.json(
      { error: 'Failed to delete ingredient' },
      { status: 500 }
    )
  }
}


