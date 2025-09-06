'use client'

import React from 'react'
import { 
  Package, 
  FileText, 
  Factory, 
  Warehouse, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Calculator,
  ChefHat,
  AlertTriangle
} from 'lucide-react'

export default function Dashboard() {
  const handleNovaReceita = () => {
    window.location.href = '/fichas-tecnicas'
  }

  const handleNovoInsumo = () => {
    window.location.href = '/insumos'
  }

  const handleCalcularPreco = () => {
    window.location.href = '/calculo-preco'
  }

  if (true) { // Simular loading
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 space-y-6">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Dashboard Receita Pro
              </h1>
              <p className="text-gray-600 mt-1">Visão geral do seu negócio</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleNovaReceita}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
              >
                <Plus size={18} />
                Nova Receita
              </button>
              <button
                onClick={handleNovoInsumo}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
              >
                <Package size={18} />
                Novo Insumo
              </button>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receitas Cadastradas</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="text-green-500" size={16} />
                  <span className="text-sm text-green-600 ml-1">+12% este mês</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center">
                <ChefHat size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Insumos Ativos</p>
                <p className="text-2xl font-bold text-gray-900">156</p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="text-green-500" size={16} />
                  <span className="text-sm text-green-600 ml-1">+8% este mês</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl flex items-center justify-center">
                <Package size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Produção Hoje</p>
                <p className="text-2xl font-bold text-gray-900">2.8kg</p>
                <div className="flex items-center mt-2">
                  <ArrowDownRight className="text-red-500" size={16} />
                  <span className="text-sm text-red-600 ml-1">-5% vs ontem</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl flex items-center justify-center">
                <Factory size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Custo Médio</p>
                <p className="text-2xl font-bold text-gray-900">R$ 4,25</p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="text-green-500" size={16} />
                  <span className="text-sm text-green-600 ml-1">Otimizado</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl flex items-center justify-center">
                <Calculator size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Ações Rápidas</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleNovaReceita}
                className="flex flex-col items-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all border border-blue-200"
              >
                <ChefHat className="text-blue-600 mb-2" size={24} />
                <span className="text-sm font-medium text-blue-900">Nova Receita</span>
              </button>

              <button
                onClick={handleNovoInsumo}
                className="flex flex-col items-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all border border-green-200"
              >
                <Package className="text-green-600 mb-2" size={24} />
                <span className="text-sm font-medium text-green-900">Novo Insumo</span>
              </button>

              <button
                onClick={handleCalcularPreco}
                className="flex flex-col items-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-all border border-purple-200"
              >
                <Calculator className="text-purple-600 mb-2" size={24} />
                <span className="text-sm font-medium text-purple-900">Calcular Preço</span>
              </button>

              <button className="flex flex-col items-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl hover:from-orange-100 hover:to-red-100 transition-all border border-orange-200">
                <FileText className="text-orange-600 mb-2" size={24} />
                <span className="text-sm font-medium text-orange-900">Relatórios</span>
              </button>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Alertas do Sistema</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                <AlertTriangle className="text-yellow-600" size={20} />
                <div>
                  <p className="text-sm font-medium text-yellow-900">Estoque Baixo</p>
                  <p className="text-xs text-yellow-700">3 insumos precisam de reposição</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                <Clock className="text-blue-600" size={20} />
                <div>
                  <p className="text-sm font-medium text-blue-900">Produção Agendada</p>
                  <p className="text-xs text-blue-700">5 receitas para produzir hoje</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
                <Warehouse className="text-green-600" size={20} />
                <div>
                  <p className="text-sm font-medium text-green-900">Sistema Online</p>
                  <p className="text-xs text-green-700">Todas as funcionalidades operacionais</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Receitas Recentes */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h3 className="text-xl font-bold text-white">Receitas Mais Utilizadas</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'Pão Francês Tradicional', uses: 45, cost: 'R$ 2,15' },
                { name: 'Bolo de Chocolate', uses: 23, cost: 'R$ 8,90' },
                { name: 'Croissant Artesanal', uses: 18, cost: 'R$ 3,45' }
              ].map((recipe, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-xl">
                  <h4 className="font-medium text-gray-900">{recipe.name}</h4>
                  <div className="flex justify-between mt-2 text-sm text-gray-600">
                    <span>{recipe.uses} usos</span>
                    <span className="font-medium text-green-600">{recipe.cost}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando dashboard...</p>
      </div>
    </div>
  )
}

