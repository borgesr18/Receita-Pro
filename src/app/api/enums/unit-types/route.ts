import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getUser(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Valores fixos baseados no que você definiu no Supabase
    const unitTypes = [
      { value: 'Peso', label: 'Peso' },
      { value: 'Volume', label: 'Volume' },
      { value: 'Comprimento', label: 'Comprimento' },
      { value: 'Pacote', label: 'Pacote' }
    ]
    
    return NextResponse.json(unitTypes)
  } catch (error) {
    console.error('Error fetching unit types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch unit types' },
      { status: 500 }
    )
  }
}

