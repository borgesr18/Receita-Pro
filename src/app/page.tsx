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
  Eye,
  ChefHat,
  Utensils,
  Thermometer,
  Calculator
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

  const handleCalcularReceita = () => {
    router.push('/calculo-receita')
  }

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
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}>
                  <Icon className="text-white" size={24} />
                </div>
                <div className={`flex items-center space-x-1 text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                } bg-white/80 px-3 py-1 rounded-full shadow-sm`}>
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
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Atividade Recente</h3>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity, index) => {
                const Icon = activity.icon
                return (
                  <div key={index} className="flex items-start space-x-4 p-4 rounded-xl bg-white/50 hover:bg-white/80 transition-colors border border-gray-100 shadow-sm hover:shadow-md">
                    <div className={`w-10 h-10 rounded-xl ${activity.color} flex items-center justify-center shadow-sm`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-900">{activity.title}</h4>
                        <span className="text-xs text-gray-500 bg-white/80 px-2 py-1 rounded-full">{activity.time}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="mt-6 text-center">
              <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 mx-auto">
                <span>Ver todas as atividades</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Top Recipes */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Receitas Mais Lucrativas</h3>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {topRecipes.map((recipe, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-white/50 hover:bg-white/80 transition-colors border border-gray-100 shadow-sm hover:shadow-md">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900">{recipe.name}</h4>
                    <div className="flex items-center mt-1">
                      <div className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                        Margem: {recipe.margin}
                      </div>
                    </div>
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
            
            <div className="mt-6 text-center">
              <button className="text-sm text-green-600 hover:text-green-800 font-medium flex items-center gap-1 mx-auto">
                <span>Ver relatório completo</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">Ações Rápidas</h3>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <button 
              onClick={handleNovaReceita}
              className="group flex flex-col items-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl border border-blue-200 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center mb-3 shadow-md group-hover:shadow-lg transition-all">
                <FileText size={20} />
              </div>
              <span className="text-sm font-medium text-gray-900">Nova Receita</span>
            </button>
            
            <button 
              onClick={handleRegistrarProducao}
              className="group flex flex-col items-center p-6 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl border border-green-200 hover:border-green-300 hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl flex items-center justify-center mb-3 shadow-md group-hover:shadow-lg transition-all">
                <Factory size={20} />
              </div>
              <span className="text-sm font-medium text-gray-900">Registrar Produção</span>
            </button>
            
            <button 
              onClick={handleCadastrarInsumo}
              className="group flex flex-col items-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl border border-purple-200 hover:border-purple-300 hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl flex items-center justify-center mb-3 shadow-md group-hover:shadow-lg transition-all">
                <Package size={20} />
              </div>
              <span className="text-sm font-medium text-gray-900">Cadastrar Insumo</span>
            </button>
            
            <button 
              onClick={handleRegistrarVenda}
              className="group flex flex-col items-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-xl border border-orange-200 hover:border-orange-300 hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl flex items-center justify-center mb-3 shadow-md group-hover:shadow-lg transition-all">
                <TrendingUp size={20} />
              </div>
              <span className="text-sm font-medium text-gray-900">Registrar Venda</span>
            </button>
            
            <button 
              onClick={handleCalcularReceita}
              className="group flex flex-col items-center p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 rounded-xl border border-indigo-200 hover:border-indigo-300 hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl flex items-center justify-center mb-3 shadow-md group-hover:shadow-lg transition-all">
                <Calculator size={20} />
              </div>
              <span className="text-sm font-medium text-gray-900">Calcular Receita</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}



