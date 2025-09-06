'use client'

import React, { useState } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Download,
  Printer,
  Target,
  CheckCircle,
  Clock,
  PieChart,
  Filter,
  AlertCircle,
  DollarSign,
  Package
} from 'lucide-react'

export default function Relatorios() {
  const [activeTab, setActiveTab] = useState('vendas')
  const [dateRange, setDateRange] = useState({
    startDate: '2025-01-01',
    endDate: '2025-01-31'
  })

  // Dados simulados para relatórios
  const salesReport = {
    totalSales: 2847.50,
    totalOrders: 156,
    averageTicket: 18.25,
    topProducts: [
      { name: 'Pão Francês Tradicional', quantity: 2400, revenue: 840.00, profit: 408.00 },
      { name: 'Bolo de Chocolate Premium', quantity: 45, revenue: 1125.00, profit: 731.25 },
      { name: 'Croissant Folhado', quantity: 180, revenue: 576.00, profit: 351.00 },
      { name: 'Torta de Frango', quantity: 12, revenue: 540.00, profit: 390.00 }
    ],
    salesByChannel: [
      { channel: 'Varejo', percentage: 64.9, value: 1847.50 },
      { channel: 'Atacado', percentage: 25.3, value: 720.00 },
      { channel: 'Delivery', percentage: 9.8, value: 280.00 }
    ]
  }

  const financialReport = {
    totalRevenue: 2847.50,
    totalCosts: 1323.75,
    grossProfit: 1523.75,
    profitMargin: 53.5,
    monthlyGrowth: 12.3
  }

  const productionReport = {
    totalProduced: 4850,
    totalRecipes: 24,
    avgProductionTime: 145,
    efficiency: 87.5,
    topRecipes: [
      { name: 'Pão Francês', produced: 2400, efficiency: 92 },
      { name: 'Bolo de Chocolate', produced: 45, efficiency: 88 },
      { name: 'Croissant', produced: 180, efficiency: 85 }
    ]
  }

  const inventoryReport = {
    totalItems: 156,
    lowStockItems: 12,
    totalValue: 8450.00,
    turnoverRate: 2.3,
    criticalItems: [
      { name: 'Farinha de Trigo Especial', current: 25, minimum: 50, status: 'critical' },
      { name: 'Fermento Biológico', current: 8, minimum: 15, status: 'low' },
      { name: 'Manteiga Francesa', current: 12, minimum: 20, status: 'low' }
    ]
  }

  const handleExport = (type: string) => {
    console.log(`Exportando relatório: ${type}`)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 space-y-6">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Relatórios Gerenciais
            </h1>
            <p className="text-gray-600 mt-1">Análises detalhadas e insights do negócio</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all"
            >
              <Printer size={18} />
              Imprimir
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
            >
              <Download size={18} />
              Exportar PDF
            </button>
          </div>
        </div>
      </div>

      {/* Filtros de Período */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Período de Análise</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data Inicial</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data Final</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex items-end">
            <button className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all">
              <Filter size={18} />
              Aplicar Filtro
            </button>
          </div>
          <div className="flex items-end">
            <button className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all">
              Limpar
            </button>
          </div>
        </div>
      </div>

      {/* Tabs de Relatórios */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'vendas', label: 'Vendas', icon: BarChart3 },
              { id: 'estoque', label: 'Estoque', icon: AlertCircle }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Relatório de Vendas */}
          {activeTab === 'vendas' && (
            <div className="space-y-6">
              {/* KPIs de Vendas */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Faturamento Total</p>
                      <p className="text-2xl font-bold text-gray-900">R$ {salesReport.totalSales.toFixed(2)}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl flex items-center justify-center">
                      <DollarSign size={20} />
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
                      <p className="text-2xl font-bold text-gray-900">{salesReport.totalOrders}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center">
                      <Package size={20} />
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                      <p className="text-2xl font-bold text-gray-900">R$ {salesReport.averageTicket.toFixed(2)}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl flex items-center justify-center">
                      <Target size={20} />
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Margem de Lucro</p>
                      <p className="text-2xl font-bold text-gray-900">{financialReport.profitMargin}%</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl flex items-center justify-center">
                      <TrendingUp size={20} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Produtos Mais Vendidos */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                  <h3 className="text-xl font-bold text-white">Produtos Mais Vendidos</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faturamento</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lucro</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {salesReport.topProducts.map((product, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{product.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900">{product.quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900">R$ {product.revenue.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-green-600 font-medium">R$ {product.profit.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Vendas por Canal */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Vendas por Canal</h3>
                <div className="space-y-4">
                  {salesReport.salesByChannel.map((channel, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                        <span className="font-medium text-gray-900">{channel.channel}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${channel.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-600 w-12">{channel.percentage}%</span>
                        <span className="text-sm font-medium text-green-600 w-20">R$ {channel.value.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Relatório Financeiro */}
          {activeTab === 'financeiro' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Receita Total</p>
                      <p className="text-2xl font-bold text-gray-900">R$ {financialReport.totalRevenue.toFixed(2)}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl flex items-center justify-center">
                      <TrendingUp size={20} />
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Custos Totais</p>
                      <p className="text-2xl font-bold text-gray-900">R$ {financialReport.totalCosts.toFixed(2)}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl flex items-center justify-center">
                      <TrendingDown size={20} />
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Lucro Bruto</p>
                      <p className="text-2xl font-bold text-gray-900">R$ {financialReport.grossProfit.toFixed(2)}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center">
                      <TrendingUp size={20} />
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Crescimento Mensal</p>
                      <p className="text-2xl font-bold text-gray-900">+{financialReport.monthlyGrowth}%</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl flex items-center justify-center">
                      <BarChart3 size={20} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Relatório de Produção */}
          {activeTab === 'producao' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Produzido</p>
                      <p className="text-2xl font-bold text-gray-900">{productionReport.totalProduced}g</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center">
                      <Package size={20} />
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Receitas Ativas</p>
                      <p className="text-2xl font-bold text-gray-900">{productionReport.totalRecipes}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl flex items-center justify-center">
                      <CheckCircle size={20} />
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
                      <p className="text-2xl font-bold text-gray-900">{productionReport.avgProductionTime}min</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl flex items-center justify-center">
                      <Clock size={20} />
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Eficiência</p>
                      <p className="text-2xl font-bold text-gray-900">{productionReport.efficiency}%</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl flex items-center justify-center">
                      <Target size={20} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Relatório de Estoque */}
          {activeTab === 'estoque' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total de Itens</p>
                      <p className="text-2xl font-bold text-gray-900">{inventoryReport.totalItems}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center">
                      <Package size={20} />
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Estoque Baixo</p>
                      <p className="text-2xl font-bold text-gray-900">{inventoryReport.lowStockItems}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl flex items-center justify-center">
                      <AlertCircle size={20} />
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Valor Total</p>
                      <p className="text-2xl font-bold text-gray-900">R$ {inventoryReport.totalValue.toFixed(2)}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl flex items-center justify-center">
                      <DollarSign size={20} />
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Giro de Estoque</p>
                      <p className="text-2xl font-bold text-gray-900">{inventoryReport.turnoverRate}x</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl flex items-center justify-center">
                      <PieChart size={20} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Itens Críticos */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                <div className="bg-gradient-to-r from-red-600 to-pink-600 px-6 py-4">
                  <h3 className="text-xl font-bold text-white">Itens com Estoque Crítico</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {inventoryReport.criticalItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200">
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">Estoque atual: {item.current} | Mínimo: {item.minimum}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.status === 'critical' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status === 'critical' ? 'Crítico' : 'Baixo'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

