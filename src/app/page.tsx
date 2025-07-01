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
  Users,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Plus,
  Eye
} from 'lucide-react'

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
          <div className="text-sm text-gray-600">Carregando dashboard...</div>
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
      change: '+12%',
      trend: 'up',
      icon: FileText,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Insumos Cadastrados',
      value: '156',
      change: '+8%',
      trend: 'up',
      icon: Package,
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      title: 'Produtos em Estoque',
      value: '89',
      change: '-3%',
      trend: 'down',
      icon: Warehouse,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Vendas do Mês',
      value: 'R$ 12.450',
      change: '+24%',
      trend: 'up',
      icon: DollarSign,
      color: 'from-orange-500 to-orange-600'
    }
  ]

  const recentActivity = [
    {
      type: 'production',
      title: 'Produção Concluída',
      description: 'Pão Francês - Lote #001234',
      time: '2 horas atrás',
      status: 'completed',
      icon: Factory,
      color: 'text-green-600 bg-green-50'
    },
    {
      type: 'sale',
      title: 'Nova Venda',
      description: '50 Pães de Açúcar - Canal Varejo',
      time: '4 horas atrás',
      status: 'completed',
      icon: TrendingUp,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      type: 'warning',
      title: 'Estoque Baixo',
      description: 'Farinha de Trigo (2kg restantes)',
      time: '6 horas atrás',
      status: 'warning',
      icon: AlertTriangle,
      color: 'text-amber-600 bg-amber-50'
    },
    {
      type: 'recipe',
      title: 'Receita Atualizada',
      description: 'Nova versão do Bolo de Chocolate',
      time: '1 dia atrás',
      status: 'info',
      icon: FileText,
      color: 'text-purple-600 bg-purple-50'
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
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Visão geral do seu sistema de panificação</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar size={16} />
            <span>terça-feira, 1 de julho de 2025</span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="text-amber-600 mt-0.5" size={20} />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 mb-2">Alertas do Sistema</h3>
              <div className="space-y-2">
                {alerts.map((alert, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-amber-800">{alert.message}</span>
                    <button className="text-xs font-medium text-amber-700 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded-full transition-colors">
                      {alert.action}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <Icon className="text-white" size={24} />
                </div>
                <div className={`flex items-center space-x-1 text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend === 'up' ? (
                    <ArrowUpRight size={16} />
                  ) : (
                    <ArrowDownRight size={16} />
                  )}
                  <span>{stat.change}</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Atividade Recente</h3>
            <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1">
              <span>Ver todas</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
          
          <div className="space-y-4">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon
              return (
                <div key={index} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`w-10 h-10 rounded-lg ${activity.color} flex items-center justify-center`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top Recipes */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Receitas Mais Lucrativas</h3>
            <button className="p-1 hover:bg-gray-100 rounded">
              <MoreHorizontal size={16} className="text-gray-400" />
            </button>
          </div>
          
          <div className="space-y-4">
            {topRecipes.map((recipe, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{recipe.name}</h4>
                  <p className="text-xs text-gray-500">Margem: {recipe.margin}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600">{recipe.revenue}</p>
                  <div className={`flex items-center justify-end space-x-1 ${
                    recipe.trend === 'up' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {recipe.trend === 'up' ? (
                      <ArrowUpRight size={12} />
                    ) : (
                      <ArrowDownRight size={12} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Ações Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={handleNovaReceita}
            className="group flex flex-col items-center p-6 border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
              <FileText size={20} />
            </div>
            <span className="text-sm font-medium text-gray-900">Nova Receita</span>
          </button>
          
          <button 
            onClick={handleRegistrarProducao}
            className="group flex flex-col items-center p-6 border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mb-3 group-hover:bg-green-100 transition-colors">
              <Factory size={20} />
            </div>
            <span className="text-sm font-medium text-gray-900">Registrar Produção</span>
          </button>
          
          <button 
            onClick={handleCadastrarInsumo}
            className="group flex flex-col items-center p-6 border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-3 group-hover:bg-purple-100 transition-colors">
              <Package size={20} />
            </div>
            <span className="text-sm font-medium text-gray-900">Cadastrar Insumo</span>
          </button>
          
          <button 
            onClick={handleRegistrarVenda}
            className="group flex flex-col items-center p-6 border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center mb-3 group-hover:bg-orange-100 transition-colors">
              <TrendingUp size={20} />
            </div>
            <span className="text-sm font-medium text-gray-900">Registrar Venda</span>
          </button>
        </div>
      </div>
    </div>
  )
}

