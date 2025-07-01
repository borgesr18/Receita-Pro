'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  AlertTriangle,
  Activity,
  Calendar,
  ChefHat,
  Factory
} from 'lucide-react'

export default function Dashboard() {
  const router = useRouter()

  useEffect(() => {
    // Verificar autenticação ou carregar dados se necessário
  }, [])

  const handleNavigateToInsumos = () => {
    router.push('/insumos')
  }

  const handleNavigateToReceitas = () => {
    router.push('/fichas-tecnicas')
  }

  const handleNavigateToProducao = () => {
    router.push('/producao')
  }

  const handleNavigateToVendas = () => {
    router.push('/vendas')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Visão geral do seu negócio</p>
        </div>

        {/* Alertas */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 mb-2">Atenção Necessária</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-red-100">
                    <span className="text-sm text-gray-700">Insumos com estoque baixo</span>
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">3 itens</span>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-orange-100">
                    <span className="text-sm text-gray-700">Produtos próximos ao vencimento</span>
                    <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">0 itens</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex items-center text-green-600 text-sm font-medium">
                <TrendingUp className="w-4 h-4 mr-1" />
                +12%
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Vendas do Mês</p>
              <p className="text-3xl font-bold text-gray-900">R$ 0,00</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex items-center text-green-600 text-sm font-medium">
                <TrendingUp className="w-4 h-4 mr-1" />
                +8%
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Lucro do Mês</p>
              <p className="text-3xl font-bold text-gray-900">R$ 0,00</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex items-center text-red-600 text-sm font-medium">
                <TrendingDown className="w-4 h-4 mr-1" />
                -3%
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Produções</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex items-center text-green-600 text-sm font-medium">
                <TrendingUp className="w-4 h-4 mr-1" />
                +15%
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Ticket Médio</p>
              <p className="text-3xl font-bold text-gray-900">R$ 0,00</p>
            </div>
          </div>
        </div>

        {/* Atividade Recente e Ações Rápidas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Atividade Recente */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Atividade Recente</h2>
                <Activity className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <ShoppingCart className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Nova venda registrada</p>
                    <p className="text-xs text-gray-500 mt-1">Aguardando dados...</p>
                  </div>
                  <span className="text-xs text-gray-400">Agora</span>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Produção finalizada</p>
                    <p className="text-xs text-gray-500 mt-1">Aguardando dados...</p>
                  </div>
                  <span className="text-xs text-gray-400">1h atrás</span>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Estoque baixo detectado</p>
                    <p className="text-xs text-gray-500 mt-1">3 insumos precisam de reposição</p>
                  </div>
                  <span className="text-xs text-gray-400">2h atrás</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Ações Rápidas</h2>
              
              <div className="space-y-3">
                <button
                  onClick={handleNavigateToReceitas}
                  className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ChefHat className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Nova Receita</p>
                    <p className="text-xs text-gray-600">Criar ficha técnica</p>
                  </div>
                </button>

                <button
                  onClick={handleNavigateToProducao}
                  className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Factory className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Registrar Produção</p>
                    <p className="text-xs text-gray-600">Nova produção</p>
                  </div>
                </button>

                <button
                  onClick={handleNavigateToInsumos}
                  className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Cadastrar Insumo</p>
                    <p className="text-xs text-gray-600">Novo ingrediente</p>
                  </div>
                </button>

                <button
                  onClick={handleNavigateToVendas}
                  className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-xl transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Registrar Venda</p>
                    <p className="text-xs text-gray-600">Nova venda</p>
                  </div>
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Última atualização: agora</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

