import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

interface LowStockIngredient {
  id: string
  name: string
  current_stock: number
  minimum_stock: number
  user_id: string
}

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getUser(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    
    const [
      totalRecipes,
      totalIngredients,
      totalProducts,
      monthlySales,
      monthlyProductions,
      lowStockIngredientsRaw,
      recentSales,
      recentProductions
    ] = await Promise.all([
      prisma.recipe.count({ where: { userId: user.id } }),
      prisma.ingredient.count({ where: { userId: user.id } }),
      prisma.product.count({ where: { userId: user.id } }),
      prisma.sale.aggregate({
        where: {
          userId: user.id,
          saleDate: {
            gte: startOfMonth
          }
        },
        _sum: {
          totalPrice: true,
          quantity: true
        },
        _count: true
      }),
      prisma.production.aggregate({
        where: {
          userId: user.id,
          productionDate: {
            gte: startOfMonth
          }
        },
        _sum: {
          quantityProduced: true
        },
        _count: true
      }),
      prisma.$queryRaw<LowStockIngredient[]>`
        SELECT * FROM ingredients 
        WHERE user_id = ${user.id} 
        AND current_stock <= minimum_stock 
        LIMIT 5
      `,
      prisma.sale.findMany({
        where: { userId: user.id },
        orderBy: { saleDate: 'desc' },
        take: 5,
        include: {
          salesChannel: true
        }
      }),
      prisma.production.findMany({
        where: { userId: user.id },
        orderBy: { productionDate: 'desc' },
        take: 5,
        include: {
          recipe: true
        }
      })
    ])

    const lowStockIngredients = lowStockIngredientsRaw as LowStockIngredient[]

    const dashboardData = {
      stats: {
        totalRecipes,
        totalIngredients,
        totalProducts,
        monthlySales: monthlySales._sum.totalPrice || 0,
        monthlyProfit: (monthlySales._sum.totalPrice || 0) * 0.3,
        monthlyProductions: monthlyProductions._count,
        averageTicket: monthlySales._count > 0 ? (monthlySales._sum.totalPrice || 0) / monthlySales._count : 0
      },
      alerts: {
        lowStockIngredients: lowStockIngredients.length,
        expiringProducts: 0
      },
      recent: {
        sales: recentSales,
        productions: recentProductions
      },
      lowStockItems: lowStockIngredients
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
