'use client'

import React, { useState } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Download,
  DollarSign,
  Printer,
  Package,
  AlertCircle,
  Target,
  CheckCircle,
  Clock
} from 'lucide-react'

export default function Relatorios() {
  const [activeTab, setActiveTab] = useState('vendas')
  const [dateRange, setDateRange] = useState({
    startDate: '2025-06-01',
    endDate: '2025-06-29'
  })
  const [selectedPeriod, setSelectedPeriod] = useState('mes')

  const salesReport = {
    totalSales: 2847.50,
    totalProfit: 1523.75,
    totalOrders: 156,
    averageTicket: 18.25,
    profitMargin: 53.5,
    topProducts: [
      { name: 'Pão Francês Tradicional', quantity: 2400, revenue: 840.00, profit: 408.00 },
      { name: 'Bolo de Chocolate Premium', quantity: 45, revenue: 1125.00, profit: 731.25 },
      { name: 'Croissant Folhado', quantity: 180, revenue: 576.00, profit: 351.00 },
      { name: 'Torta de Frango', quantity: 12, revenue: 540.00, profit: 390.00 }
    ],
    salesByChannel: [
      { channel: 'Varejo', sales: 1847.50, percentage: 64.9 },
      { channel: 'Atacado', sales: 720.00, percentage: 25.3 },
      { channel: 'Delivery', sales: 280.00, percentage: 9.8 }
    ],
    dailySales: [
      { date: '2025-06-25', sales: 245.50, orders: 12 },
      { date: '2025-06-26', sales: 189.75, orders: 8 },
      { date: '2025-06-27', sales: 312.25, orders: 15 },
      { date: '2025-06-28', sales: 278.00, orders: 11 },
      { date: '2025-06-29', sales: 196.50, orders: 9 }
    ]
  }

  const productionReport = {
    totalProduced: 15750, // grams
    totalBatches: 28,
    averageEfficiency: 94.2,
    totalLoss: 315, // grams
    lossPercentage: 2.0,
    productionByProduct: [
      { name: 'Pão Francês Tradicional', quantity: 8500, batches: 12, efficiency: 96.5 },
      { name: 'Bolo de Chocolate Premium', quantity: 3600, batches: 6, efficiency: 92.8 },
      { name: 'Croissant Folhado', quantity: 2400, batches: 8, efficiency: 91.2 },
      { name: 'Torta de Frango', quantity: 1250, batches: 2, efficiency: 98.0 }
    ],
    productionByDay: [
      { date: '2025-06-25', quantity: 3200, batches: 6, efficiency: 95.2 },
      { date: '2025-06-26', quantity: 2800, batches: 5, efficiency: 93.8 },
      { date: '2025-06-27', quantity: 3500, batches: 7, efficiency: 94.5 },
      { date: '2025-06-28', quantity: 3150, batches: 6, efficiency: 92.1 },
      { date: '2025-06-29', quantity: 3100, batches: 4, efficiency: 96.8 }
    ]
  }

  const ingredientReport = {
    totalConsumption: 12450, // grams
    totalCost: 156.75,
    averageCostPerGram: 0.0126,
    topIngredients: [
      { name: 'Farinha de Trigo Especial', consumption: 5200, cost: 23.40, percentage: 41.8 },
      { name: 'Açúcar Cristal', consumption: 2100, cost: 6.72, percentage: 16.9 },
      { name: 'Manteiga sem Sal', consumption: 1800, cost: 23.04, percentage: 14.5 },
      { name: 'Ovos', consumption: 1200, cost: 18.00, percentage: 9.6 }
    ],
    lowStockAlerts: [
      { name: 'Fermento Biológico Seco', currentStock: 500, minStock: 200, daysRemaining: 12 },
      { name: 'Essência de Baunilha', currentStock: 150, minStock: 100, daysRemaining: 8 }
    ],
    expiringItems: [
      { name: 'Manteiga sem Sal', expirationDate: '2025-07-10', daysRemaining: 11 },
      { name: 'Leite Integral', expirationDate: '2025-07-05', daysRemaining: 6 }
    ]
  }

  const financialReport = {
    totalRevenue: 2847.50,
    totalCosts: 1323.75,
    grossProfit: 1523.75,
    profitMargin: 53.5,
    costBreakdown: [
      { category: 'Ingredientes', amount: 856.25, percentage: 64.7 },
      { category: 'Embalagens', amount: 234.50, percentage: 17.7 },
      { category: 'Energia', amount: 123.00, percentage: 9.3 },
      { category: 'Outros', amount: 110.00, percentage: 8.3 }
    ],
    monthlyComparison: [
      { month: 'Abril', revenue: 2456.75, profit: 1234.50 },
      { month: 'Maio', revenue: 2678.25, profit: 1398.75 },
      { month: 'Junho', revenue: 2847.50, profit: 1523.75 }
    ]
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatWeight = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(2)} kg`
    }
    return `${value.toFixed(0)} g`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const exportReport = (reportType: string) => {
    alert(`Exportando relatório de ${reportType}...`)
  }

  const printReport = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600 mt-1">Análises e indicadores do negócio</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => exportReport(activeTab)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={16} />
            <span>Exportar</span>
          </button>
          <button
            onClick={() => printReport()}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Printer size={16} />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Período:</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="hoje">Hoje</option>
              <option value="semana">Esta Semana</option>
              <option value="mes">Este Mês</option>
              <option value="trimestre">Este Trimestre</option>
              <option value="ano">Este Ano</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </div>
          
          {selectedPeriod === 'personalizado' && (
            <div className="flex items-center space-x-4">
              <div>
                <label className="text-sm text-gray-600">De:</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  className="ml-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Até:</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  className="ml-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('vendas')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'vendas'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="inline w-4 h-4 mr-2" />
              Vendas
            </button>
            <button
              onClick={() => setActiveTab('producao')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'producao'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Package className="inline w-4 h-4 mr-2" />
              Produção
            </button>
            <button
              onClick={() => setActiveTab('insumos')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'insumos'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <AlertCircle className="inline w-4 h-4 mr-2" />
              Insumos
            </button>
            <button
              onClick={() => setActiveTab('financeiro')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'financeiro'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <DollarSign className="inline w-4 h-4 mr-2" />
              Financeiro
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Sales Report */}
          {activeTab === 'vendas' && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Faturamento Total</p>
                      <p className="text-2xl font-bold">{formatCurrency(salesReport.totalSales)}</p>
                    </div>
                    <DollarSign size={32} className="text-green-200" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Lucro Total</p>
                      <p className="text-2xl font-bold">{formatCurrency(salesReport.totalProfit)}</p>
                    </div>
                    <TrendingUp size={32} className="text-blue-200" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">Ticket Médio</p>
                      <p className="text-2xl font-bold">{formatCurrency(salesReport.averageTicket)}</p>
                    </div>
                    <Target size={32} className="text-purple-200" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100">Margem de Lucro</p>
                      <p className="text-2xl font-bold">{formatPercentage(salesReport.profitMargin)}</p>
                    </div>
                    <BarChart3 size={32} className="text-orange-200" />
                  </div>
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Produtos Mais Vendidos</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-left text-sm">
                        <th className="pb-3">Produto</th>
                        <th className="pb-3">Quantidade</th>
                        <th className="pb-3">Faturamento</th>
                        <th className="pb-3">Lucro</th>
                      </tr>
                    </thead>
                    <tbody className="space-y-2">
                      {salesReport.topProducts.map((product, index) => (
                        <tr key={index} className="text-sm">
                          <td className="py-2 font-medium text-gray-900">{product.name}</td>
                          <td className="py-2 text-gray-600">{product.quantity} un</td>
                          <td className="py-2 text-gray-900">{formatCurrency(product.revenue)}</td>
                          <td className="py-2 text-green-600 font-medium">{formatCurrency(product.profit)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sales by Channel */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendas por Canal</h3>
                <div className="space-y-4">
                  {salesReport.salesByChannel.map((channel, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${
                          index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-green-500' : 'bg-purple-500'
                        }`}></div>
                        <span className="font-medium text-gray-900">{channel.channel}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{formatCurrency(channel.sales)}</div>
                        <div className="text-sm text-gray-600">{formatPercentage(channel.percentage)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Production Report */}
          {activeTab === 'producao' && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-indigo-100">Total Produzido</p>
                      <p className="text-2xl font-bold">{formatWeight(productionReport.totalProduced)}</p>
                    </div>
                    <Package size={32} className="text-indigo-200" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-teal-100">Lotes Produzidos</p>
                      <p className="text-2xl font-bold">{productionReport.totalBatches}</p>
                    </div>
                    <CheckCircle size={32} className="text-teal-200" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-lg p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-cyan-100">Eficiência Média</p>
                      <p className="text-2xl font-bold">{formatPercentage(productionReport.averageEfficiency)}</p>
                    </div>
                    <Target size={32} className="text-cyan-200" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100">Perda Total</p>
                      <p className="text-2xl font-bold">{formatWeight(productionReport.totalLoss)}</p>
                    </div>
                    <AlertCircle size={32} className="text-red-200" />
                  </div>
                </div>
              </div>

              {/* Production by Product */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Produção por Produto</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-left text-sm">
                        <th className="pb-3">Produto</th>
                        <th className="pb-3">Quantidade</th>
                        <th className="pb-3">Lotes</th>
                        <th className="pb-3">Eficiência</th>
                      </tr>
                    </thead>
                    <tbody className="space-y-2">
                      {productionReport.productionByProduct.map((product, index) => (
                        <tr key={index} className="text-sm">
                          <td className="py-2 font-medium text-gray-900">{product.name}</td>
                          <td className="py-2 text-gray-600">{formatWeight(product.quantity)}</td>
                          <td className="py-2 text-gray-600">{product.batches}</td>
                          <td className="py-2">
                            <span className={`font-medium ${
                              product.efficiency >= 95 ? 'text-green-600' : 
                              product.efficiency >= 90 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {formatPercentage(product.efficiency)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Ingredients Report */}
          {activeTab === 'insumos' && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-amber-100">Consumo Total</p>
                      <p className="text-2xl font-bold">{formatWeight(ingredientReport.totalConsumption)}</p>
                    </div>
                    <Package size={32} className="text-amber-200" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-100">Custo Total</p>
                      <p className="text-2xl font-bold">{formatCurrency(ingredientReport.totalCost)}</p>
                    </div>
                    <DollarSign size={32} className="text-emerald-200" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100">Estoque Baixo</p>
                      <p className="text-2xl font-bold">{ingredientReport.lowStockAlerts.length}</p>
                    </div>
                    <AlertCircle size={32} className="text-yellow-200" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100">Vencendo</p>
                      <p className="text-2xl font-bold">{ingredientReport.expiringItems.length}</p>
                    </div>
                    <Clock size={32} className="text-red-200" />
                  </div>
                </div>
              </div>

              {/* Top Ingredients */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Insumos Mais Consumidos</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-left text-sm">
                        <th className="pb-3">Insumo</th>
                        <th className="pb-3">Consumo</th>
                        <th className="pb-3">Custo</th>
                        <th className="pb-3">% do Total</th>
                      </tr>
                    </thead>
                    <tbody className="space-y-2">
                      {ingredientReport.topIngredients.map((ingredient, index) => (
                        <tr key={index} className="text-sm">
                          <td className="py-2 font-medium text-gray-900">{ingredient.name}</td>
                          <td className="py-2 text-gray-600">{formatWeight(ingredient.consumption)}</td>
                          <td className="py-2 text-gray-900">{formatCurrency(ingredient.cost)}</td>
                          <td className="py-2 text-blue-600 font-medium">{formatPercentage(ingredient.percentage)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Alerts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
                    <AlertCircle className="mr-2" size={20} />
                    Estoque Baixo
                  </h3>
                  <div className="space-y-3">
                    {ingredientReport.lowStockAlerts.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-yellow-900">{item.name}</div>
                          <div className="text-sm text-yellow-700">
                            {formatWeight(item.currentStock)} / {formatWeight(item.minStock)} mín
                          </div>
                        </div>
                        <div className="text-sm text-yellow-800 font-medium">
                          {item.daysRemaining} dias
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                    <Clock className="mr-2" size={20} />
                    Vencendo
                  </h3>
                  <div className="space-y-3">
                    {ingredientReport.expiringItems.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-red-900">{item.name}</div>
                          <div className="text-sm text-red-700">
                            Vence em {formatDate(item.expirationDate)}
                          </div>
                        </div>
                        <div className="text-sm text-red-800 font-medium">
                          {item.daysRemaining} dias
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Financial Report */}
          {activeTab === 'financeiro' && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Receita Total</p>
                      <p className="text-2xl font-bold">{formatCurrency(financialReport.totalRevenue)}</p>
                    </div>
                    <DollarSign size={32} className="text-green-200" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100">Custos Totais</p>
                      <p className="text-2xl font-bold">{formatCurrency(financialReport.totalCosts)}</p>
                    </div>
                    <TrendingUp size={32} className="text-red-200" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Lucro Bruto</p>
                      <p className="text-2xl font-bold">{formatCurrency(financialReport.grossProfit)}</p>
                    </div>
                    <Target size={32} className="text-blue-200" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">Margem</p>
                      <p className="text-2xl font-bold">{formatPercentage(financialReport.profitMargin)}</p>
                    </div>
                    <BarChart3 size={32} className="text-purple-200" />
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Composição dos Custos</h3>
                <div className="space-y-4">
                  {financialReport.costBreakdown.map((cost, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${
                          index === 0 ? 'bg-blue-500' : 
                          index === 1 ? 'bg-green-500' : 
                          index === 2 ? 'bg-yellow-500' : 'bg-purple-500'
                        }`}></div>
                        <span className="font-medium text-gray-900">{cost.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{formatCurrency(cost.amount)}</div>
                        <div className="text-sm text-gray-600">{formatPercentage(cost.percentage)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Comparison */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparativo Mensal</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-left text-sm">
                        <th className="pb-3">Mês</th>
                        <th className="pb-3">Receita</th>
                        <th className="pb-3">Lucro</th>
                        <th className="pb-3">Crescimento</th>
                      </tr>
                    </thead>
                    <tbody className="space-y-2">
                      {financialReport.monthlyComparison.map((month, index) => {
                        const previousMonth = index > 0 ? financialReport.monthlyComparison[index - 1] : null
                        const growth = previousMonth 
                          ? ((month.revenue - previousMonth.revenue) / previousMonth.revenue) * 100 
                          : 0
                        
                        return (
                          <tr key={index} className="text-sm">
                            <td className="py-2 font-medium text-gray-900">{month.month}</td>
                            <td className="py-2 text-gray-900">{formatCurrency(month.revenue)}</td>
                            <td className="py-2 text-green-600 font-medium">{formatCurrency(month.profit)}</td>
                            <td className="py-2">
                              {index > 0 && (
                                <span className={`font-medium ${
                                  growth >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {growth >= 0 ? '+' : ''}{formatPercentage(growth)}
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
