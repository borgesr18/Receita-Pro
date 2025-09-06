'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { 
  Package, 
  FileText, 
  Factory, 
  Warehouse, 
  TrendingUp, 
  AlertTriangle,
  Calendar,
  DollarSign,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ChefHat,
  Calculator
} from 'lucide-react'
import {
  ActivityFeed,
  QuickActions,
  PerformanceMetrics,
  RevenueChart,
  StatCard
} from '@/components/dashboard'

export default function Dashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const handleNovaReceita = () => {
    router.push('/fichas-tecnicas')
  }

  const handleRegistrarProducao = () => {
    router.push('/producao')
  }

  const handleCadastrarInsumo = () => {
    router.push('/insumos')
  }

  const handleRegistrarVenda = () => {
    router.push('/vendas')
  }

  const handleCalcularReceita = () => {
    router.push('/calculo-receita')
  }

  // Dados para métricas de performance
  const performanceMetrics = [
    {
      label: 'Margem Média',
      value: 58,
      target: 60,
      unit: '%',
      color: 'blue'
    },
    {
      label: 'Produtividade',
      value: 85,
      target: 80,
      unit: '%',
      color: 'green'
    },
    {
      label: 'Satisfação Cliente',
      value: 92,
      target: 90,
      unit: '%',
      color: 'purple'
    }
  ]

  // Dados para gráfico de receita
  const revenueData = [
    { month: 'Jan', revenue: 8500, target: 8000 },
    { month: 'Fev', revenue: 9200, target: 8500 },
    { month: 'Mar', revenue: 8800, target: 9000 },
    { month: 'Abr', revenue: 10500, target: 9500 },
    { month: 'Mai', revenue: 11200, target: 10000 },
    { month: 'Jun', revenue: 12450, target: 11000 }
  ]

  // Dados para ações rápidas
  const quickActionsData = [
    {
      title: 'Nova Receita',
      description: 'Criar nova ficha técnica',
      icon: FileText,
      color: 'blue',
      onClick: handleNovaReceita
    },
    {
      title: 'Registrar Produção',
      description: 'Lançar nova produção',
      icon: Factory,
      color: 'green',
      onClick: handleRegistrarProducao
    },
    {
      title: 'Cadastrar Insumo',
      description: 'Adicionar novo insumo',
      icon: Package,
      color: 'purple',
      onClick: handleCadastrarInsumo
    },
    {
      title: 'Registrar Venda',
      description: 'Lançar nova venda',
      icon: TrendingUp,
      color: 'orange',
      onClick: handleRegistrarVenda
    },
    {
      title: 'Calcular Receita',
      description: 'Calcular custos e preços',
      icon: Calculator,
      color: 'indigo',
      onClick: handleCalcularReceita
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600 mx-auto"></div>
            <ChefHat className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const stats = [
    {
      title: 'Receitas Ativas',
      value: '24',
      change: {
        value: 12,
        type: 'increase' as const,
        period: 'vs mês anterior'
      },
      icon: <FileText className="w-6 h-6" />,
      color: 'blue' as const
    },
    {
      title: 'Insumos Cadastrados',
      value: '156',
      change: {
        value: 8,
        type: 'increase' as const,
        period: 'vs mês anterior'
      },
      icon: <Package className="w-6 h-6" />,
      color: 'green' as const
    },
    {
      title: 'Produtos em Estoque',
      value: '89',
      change: {
        value: 3,
        type: 'decrease' as const,
        period: 'vs mês anterior'
      },
      icon: <Warehouse className="w-6 h-6" />,
      color: 'purple' as const
    },
    {
      title: 'Vendas do Mês',
      value: 'R$ 12.450',
      change: {
        value: 24,
        type: 'increase' as const,
        period: 'vs mês anterior'
      },
      icon: <DollarSign className="w-6 h-6" />,
      color: 'red' as const
    }
  ]

  const recentActivity = [
    {
      id: '1',
      type: 'production' as const,
      title: 'Produção Concluída',
      description: 'Pão Francês - Lote #001234',
      time: '2 horas atrás',
      user: 'Sistema'
    },
    {
      id: '2',
      type: 'sale' as const,
      title: 'Nova Venda',
      description: '50 Pães de Açúcar - Canal Varejo',
      time: '4 horas atrás',
      user: 'João Silva'
    },
    {
      id: '3',
      type: 'warning' as const,
      title: 'Estoque Baixo',
      description: 'Farinha de Trigo (2kg restantes)',
      time: '6 horas atrás',
      user: 'Sistema'
    },
    {
      id: '4',
      type: 'recipe' as const,
      title: 'Receita Atualizada',
      description: 'Nova versão do Bolo de Chocolate',
      time: '1 dia atrás',
      user: 'Maria Santos'
    }
  ]

  const topRecipes = [
    {
      name: 'Pão Francês',
      margin: '65%',
      revenue: 'R$ 2.450',
      trend: 'up'
    },
    {
      name: 'Bolo de Chocolate',
      margin: '58%',
      revenue: 'R$ 1.890',
      trend: 'up'
    },
    {
      name: 'Croissant',
      margin: '72%',
      revenue: 'R$ 1.234',
      trend: 'up'
    },
    {
      name: 'Pão de Açúcar',
      margin: '45%',
      revenue: 'R$ 987',
      trend: 'down'
    }
  ]

  const alerts = [
    {
      type: 'warning',
      message: '3 insumos com estoque baixo',
      action: 'Ver detalhes'
    },
    {
      type: 'info',
      message: '2 produtos próximos ao vencimento',
      action: 'Verificar estoque'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 space-y-6">
      {/* Header Moderno */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
            <ChefHat className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-600 mt-1 text-lg">Visão geral do seu sistema de panificação</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20 shadow-sm">
            <Calendar size={16} />
            <span>terça-feira, 1 de julho de 2025</span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Alertas do Sistema</h3>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-amber-50/80 rounded-xl border border-amber-200">
                  <span className="text-amber-800 font-medium">{alert.message}</span>
                  <button className="text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 px-4 py-2 rounded-xl transition-colors shadow-sm hover:shadow-md">
                    {alert.action}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
           <StatCard
             key={index}
             title={stat.title}
             value={stat.value}
             change={stat.change}
             icon={stat.icon}
             color={stat.color}
           />
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <ActivityFeed
            activities={recentActivity}
            title="Atividade Recente"
            onShowAll={() => console.log('Ver todas as atividades')}
          />
        </div>

        {/* Performance Metrics */}
        <div>
          <PerformanceMetrics
            metrics={performanceMetrics}
            title="Métricas de Performance"
            period="Últimos 30 dias"
          />
        </div>
      </div>

      {/* Revenue Chart */}
      <RevenueChart
        data={revenueData}
        title="Receita Mensal"
        period="Últimos 6 meses"
      />

      {/* Quick Actions */}
      <QuickActions
        actions={quickActionsData}
        title="Ações Rápidas"
      />
    </div>
  )
}