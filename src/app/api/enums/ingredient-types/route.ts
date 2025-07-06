import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getUser(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Consulta SQL para obter os valores possíveis do enum IngredientType diretamente do Supabase
    const result = await prisma.$queryRaw`
      SELECT unnest(enum_range(NULL::public."IngredientType")) as value
    ` as Array<{ value: string }>

    // Mapear os valores para o formato esperado pelo frontend
    const ingredientTypes = result.map(item => ({
      value: item.value,
      label: item.value  // Usar o mesmo valor como label já que está em português
    }))

    console.log('✅ Valores do enum IngredientType carregados dinamicamente do Supabase:', ingredientTypes)
    
    return NextResponse.json(ingredientTypes)
  } catch (error) {
    console.error('❌ Erro ao buscar valores do enum IngredientType dinamicamente:', error)
    
    // Fallback para valores padrão em caso de erro na consulta
    const fallbackTypes = [
      { value: 'Açúcares', label: 'Açúcares' },
      { value: 'Aditivos_Industriais', label: 'Aditivos Industriais' },
      { value: 'Adoçantes', label: 'Adoçantes' },
      { value: 'Agentes_de_Crescimento', label: 'Agentes de Crescimento' },
      { value: 'Coberturas', label: 'Coberturas' },
      { value: 'Derivados', label: 'Derivados' },
      { value: 'Enriquecedores', label: 'Enriquecedores' },
      { value: 'Farinha', label: 'Farinha' },
      { value: 'Fermentos', label: 'Fermentos' },
      { value: 'Finalizações', label: 'Finalizações' },
      { value: 'Gorduras', label: 'Gorduras' },
      { value: 'Ingredientes_Adicionais', label: 'Ingredientes Adicionais' },
      { value: 'Ingredientes_Secundários', label: 'Ingredientes Secundários' },
      { value: 'Líquidos', label: 'Líquidos' },
      { value: 'Recheios', label: 'Recheios' },
      { value: 'Sal', label: 'Sal' },
      { value: 'Temperos', label: 'Temperos' }
    ]
    
    console.log('⚠️ Usando valores fallback:', fallbackTypes)
    return NextResponse.json(fallbackTypes)
  }
}
