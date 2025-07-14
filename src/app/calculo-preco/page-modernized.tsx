'use client'

import React, { useState, useEffect } from 'react'
import { 
  Calculator, 
  Scale, 
  Package, 
  RotateCcw,
  Info,
  History,
  Target
} from 'lucide-react'

export default function CalculoPreco() {
  const [formData, setFormData] = useState({
    productName: '',
    finalWeight: 0,
    recipeCost: 0,
    desiredProfit: 0,
    packagingCost: 0,
    extraCosts: 0,
    salesChannel: 'varejo'
  })

  const [results, setResults] = useState({
    costPerGram: 0,
    totalCost: 0,
    suggestedPrice: 0,
    markup: 0,
    pricePerPortion: 0,
    profitAmount: 0
  })

  const [calculationHistory, setCalculationHistory] = useState<Array<{
    id: string;
    custo: number;
    peso: number;
    lucro: number;
    precoFinal: number;
    createdAt: string;
  }>>([])

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchCalculationHistory()
  }, [])

  const fetchCalculationHistory = async () => {
    try {
      setIsLoading(true)
      // Simulação de dados do histórico
      const mockHistory = [
        {
          id: '1',
          custo: 2.50,
          peso: 50,
          lucro: 30,
          precoFinal: 3.25,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          custo: 5.80,
          peso: 100,
          lucro: 40,
          precoFinal: 8.12,
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ]
      setCalculationHistory(mockHistory)
    } catch (error) {
      console.error('Erro ao carregar histórico:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculatePrice = () => {
    const { finalWeight, recipeCost, desiredProfit, packagingCost, extraCosts } = formData
    
    if (!finalWeight || !recipeCost) return

    const costPerGram = recipeCost / finalWeight
    const totalCost = recipeCost + packagingCost + extraCosts
    const profitMultiplier = 1 + (desiredProfit / 100)
    const suggestedPrice = totalCost * profitMultiplier
    const markup = ((suggestedPrice - totalCost) / totalCost) * 100
    const profitAmount = suggestedPrice - totalCost

    setResults({
      costPerGram,
      totalCost,
      suggestedPrice,
      markup,
      pricePerPortion: suggestedPrice,
      profitAmount
    })
  }

  const resetForm = () => {
    setFormData({
      productName: '',
      finalWeight: 0,
      recipeCost: 0,
      desiredProfit: 0,
      packagingCost: 0,
      extraCosts: 0,
      salesChannel: 'varejo'
    })
    setResults({
      costPerGram: 0,
      totalCost: 0,
      suggestedPrice: 0,
      markup: 0,
      pricePerPortion: 0,
      profitAmount: 0
    })
  }

  const copyResults = () => {
    const text = `
Cálculo de Preço - ${formData.productName}
Peso Final: ${formData.finalWeight}g
Custo da Receita: R$ ${formData.recipeCost.toFixed(2)}
Margem de Lucro: ${formData.desiredProfit}%
Preço Sugerido: R$ ${results.suggestedPrice.toFixed(2)}
Lucro: R$ ${results.profitAmount.toFixed(2)}
    `.trim()
    
    navigator.clipboard.writeText(text)
  }

  useEffect(() => {
    calculatePrice()
  }, [formData])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 space-y-6">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Cálculo de Preço
            </h1>
            <p className="text-gray-600 mt-1">Calcule o preço ideal para seus produtos</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={resetForm}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
            >
              <RotateCcw size={18} />
              Limpar
            </button>
            <button
              onClick={copyResults}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
            >
              <Copy size={18} />
              Copiar
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário de Entrada */}
        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center">
                <Package size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Informações do Produto</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome do Produto
                </label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Ex: Pão Francês"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Peso Final (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.finalWeight}
                    onChange={(e) => setFormData(prev => ({ ...prev, finalWeight: Number(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Canal de Venda
                  </label>
                  <select
                    value={formData.salesChannel}
                    onChange={(e) => setFormData(prev => ({ ...prev, salesChannel: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="varejo">Varejo</option>
                    <option value="atacado">Atacado</option>
                    <option value="delivery">Delivery</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Custos */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl flex items-center justify-center">
                <DollarSign size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Custos</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Custo da Receita (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.recipeCost}
                  onChange={(e) => setFormData(prev => ({ ...prev, recipeCost: Number(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="0.00"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Custo Embalagem (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.packagingCost}
                    onChange={(e) => setFormData(prev => ({ ...prev, packagingCost: Number(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Custos Extras (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.extraCosts}
                    onChange={(e) => setFormData(prev => ({ ...prev, extraCosts: Number(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Margem de Lucro Desejada (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.desiredProfit}
                  onChange={(e) => setFormData(prev => ({ ...prev, desiredProfit: Number(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="space-y-6">
          {/* Resultados do Cálculo */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl flex items-center justify-center">
                <Calculator size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Resultados</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Scale size={16} className="text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">Custo por Grama</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">
                    R$ {results.costPerGram.toFixed(4)}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign size={16} className="text-orange-600" />
                    <span className="text-sm font-medium text-orange-700">Custo Total</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-900">
                    R$ {results.totalCost.toFixed(2)}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target size={16} className="text-green-600" />
                    <span className="text-sm font-medium text-green-700">Preço Sugerido</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900">
                    R$ {results.suggestedPrice.toFixed(2)}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Percent size={16} className="text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">Markup</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-900">
                    {results.markup.toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={16} className="text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-700">Lucro Estimado</span>
                </div>
                <p className="text-3xl font-bold text-emerald-900">
                  R$ {results.profitAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Histórico */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl flex items-center justify-center">
                <History size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Histórico de Cálculos</h2>
            </div>

            <div className="space-y-3">
              {calculationHistory.length > 0 ? (
                calculationHistory.map((calc) => (
                  <div key={calc.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">
                          Custo: R$ {calc.custo.toFixed(2)} | Peso: {calc.peso}g
                        </p>
                        <p className="text-sm text-gray-600">
                          Lucro: {calc.lucro}% | Preço: R$ {calc.precoFinal.toFixed(2)}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(calc.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Info size={48} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum cálculo realizado ainda</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

