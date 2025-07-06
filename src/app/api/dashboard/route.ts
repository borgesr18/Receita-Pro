import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

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
      lowStockIngredients,
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
      // Tipagem correta para o resultado do queryRaw
      prisma.$queryRaw<Array<{
        id: string;
        name: string;
        current_stock: number;
        minimum_stock: number;
      }>>`
        SELECT id, name, current_stock, minimum_stock 
        FROM ingredients 
        WHERE user_id = ${user.id} 
        AND current_stock <= minimum_stock 
        LIMIT 5
      `,
      prisma.sale.findMany({
        where: { userId: user.id },
        include: {
          product: true,
          channel: true  // ✅ CORRETO: usar 'channel', não 'salesChannel'
        },
        orderBy: {
          saleDate: 'desc'
        },
        take: 5
      }),
      prisma.production.findMany({
        where: { userId: user.id },
        include: {
          recipe: true,
          product: true
        },
        orderBy: {
          productionDate: 'desc'
        },
        take: 5
      })
    ])

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
      lowStockIngredients
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
