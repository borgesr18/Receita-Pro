import { NextRequest, NextResponse } from 'next/server'

// API de redirecionamento para manter compatibilidade
// /api/units -> /api/measurement-units

export async function GET(request: NextRequest) {
  try {
    // Redirecionar para a API correta
    const baseUrl = request.nextUrl.origin
    const response = await fetch(`${baseUrl}/api/measurement-units`, {
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erro ao buscar unidades de medida' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro na API units:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const baseUrl = request.nextUrl.origin
    
    const response = await fetch(`${baseUrl}/api/measurement-units`, {
      method: 'POST',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erro ao criar unidade de medida' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro na API units POST:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
