import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getUser(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Consulta SQL para obter os valores possíveis do enum UnitType
    const result = await prisma.$queryRaw`
      SELECT unnest(enum_range(NULL::public."UnitType")) as value
    ` as Array<{ value: string }>

    // Mapear os valores para incluir labels em português
    const unitTypes = result.map(item => {
      let label = item.value
      
      // Traduzir para português
      switch (item.value) {
        case 'WEIGHT':
          label = 'Peso'
          break
        case 'VOLUME':
          label = 'Volume'
          break
        case 'LENGTH':
          label = 'Comprimento'
          break
        case 'AREA':
          label = 'Área'
          break
        case 'COUNT':
          label = 'Contagem'
          break
        case 'TIME':
          label = 'Tempo'
          break
        case 'TEMPERATURE':
          label = 'Temperatura'
          break
        case 'UNIT':
          label = 'Unidade'
          break
        default:
          label = item.value
      }

      return {
        value: item.value,
        label: label
      }
    })

    console.log('✅ Valores do enum UnitType carregados:', unitTypes)
    
    return NextResponse.json(unitTypes)
  } catch (error) {
    console.error('❌ Erro ao buscar valores do enum UnitType:', error)
    return NextResponse.json(
      { error: 'Failed to fetch unit types' },
      { status: 500 }
    )
  }
}

