'use client'

import React, { useState, useEffect } from 'react'
import { 
  Calculator, 
  Scale, 
  Package, 
  TrendingUp,
  RotateCcw,
  Copy,
  Info,
  History
} from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'

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
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const { showSuccess, showError } = useToast()

  useEffect(() => {
    fetchCalculationHistory()
  }, [])

  const fetchCalculationHistory = async () => {
    try {
      const response = await api.get('/api/calculo-preco/historico')
      if (response.data) {
        setCalculationHistory(response.data)
      }
    } catch (error) {
      console.error('Error fetching calculation history:', error)
      showError('Erro ao carregar histórico de cálculos')
    }
  }

  const saveCalculation = async (calculationData: {
    custo: number;
    peso: number;
    lucro: number;
    precoFinal: number;
  }) => {
    try {
      setIsLoading(true)
      const response = await api.post('/api/calculo-preco/historico', calculationData)
      if (response.data) {
        await fetchCalculationHistory()
        showSuccess('Cálculo salvo com sucesso!')
      }
    } catch (error) {
      console.error('Error saving calculation:', error)
      showError('Erro ao salvar cálculo')
    } finally {
      setIsLoading(false)
    }
  }

  const quickRecipes = [
    { name: 'Pão Francês Tradicional', weight: 50, cost: 0.17 },
    { name: 'Bolo de Chocolate Premium', weight: 1200, cost: 8.75 },
    { name: 'Croissant Folhado', weight: 80, cost: 1.25 },
    { name: 'Torta de Frango', weight: 1500, cost: 12.50 }
  ]

  const salesChannels = [
    { value: 'varejo', label: 'Varejo', description: 'Venda direta ao consumidor' },
    { value: 'atacado', label: 'Atacado', description: 'Venda para revendedores' },
    { value: 'delivery', label: 'Delivery', description: 'Entrega em domicílio' },
    { value: 'eventos', label: 'Eventos', description: 'Vendas para eventos' }
  ]

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (formData.finalWeight <= 0) {
      newErrors.finalWeight = 'Peso deve ser maior que zero'
    }

    if (formData.recipeCost < 0) {
      newErrors.recipeCost = 'Custo da receita não pode ser negativo'
    }

    if (formData.recipeCost <= 0) {
      newErrors.recipeCost = 'Custo da receita deve ser maior que zero'
    }

    if (formData.desiredProfit < 0) {
      newErrors.desiredProfit = 'Lucro não pode ser negativo'
    }

    if (formData.desiredProfit > 1000) {
      newErrors.desiredProfit = 'Lucro muito alto (máximo 1000%)'
    }

    if (formData.packagingCost < 0) {
      newErrors.packagingCost = 'Custo de embalagem não pode ser negativo'
    }

    if (formData.extraCosts < 0) {
      newErrors.extraCosts = 'Custos extras não podem ser negativos'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const calculatePrice = async () => {
    if (!validateForm()) {
      showError('Por favor, corrija os erros no formulário')
      return
    }

    try {
      const costPerGram = formData.recipeCost / formData.finalWeight
      const totalCost = formData.recipeCost + formData.packagingCost + formData.extraCosts
      const profitAmount = (totalCost * formData.desiredProfit) / 100
      const suggestedPrice = totalCost + profitAmount
      const markup = totalCost > 0 ? ((suggestedPrice - totalCost) / totalCost) * 100 : 0
      const pricePerPortion = formData.finalWeight > 0 ? suggestedPrice / formData.finalWeight : 0

      const newResults = {
        costPerGram,
        totalCost,
        suggestedPrice,
        markup,
        pricePerPortion,
        profitAmount
      }

      setResults(newResults)

      // Salvar cálculo no histórico
      await saveCalculation({
        custo: totalCost,
        peso: formData.finalWeight,
        lucro: formData.desiredProfit,
        precoFinal: suggestedPrice
      })

      showSuccess('Preço calculado com sucesso!')
    } catch (error) {
      console.error('Error calculating price:', error)
      showError('Erro ao calcular preço')
    }
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
    setErrors({})
    showSuccess('Formulário limpo!')
  }

  const loadQuickRecipe = (recipe: {name: string; weight: number; cost: number}) => {
    setFormData({
      ...formData,
      productName: recipe.name,
      finalWeight: recipe.weight,
      recipeCost: recipe.cost
    })
    setErrors({})
    showSuccess(`Receita "${recipe.name}" carregada!`)
  }

  const copyResults = () => {
    const text = `CÁLCULO DE PREÇO - ${formData.productName || 'Produto'}
    
Dados de Entrada:
• Peso Final: ${formData.finalWeight}g
• Custo da Receita: ${formatCurrency(formData.recipeCost)}
• Lucro Desejado: ${formData.desiredProfit}%
• Custo de Embalagem: ${formatCurrency(formData.packagingCost)}
• Custos Extras: ${formatCurrency(formData.extraCosts)}
• Canal de Venda: ${salesChannels.find(c => c.value === formData.salesChannel)?.label}

Resultados:
• Custo por Grama: ${formatCurrency(results.costPerGram)}
• Custo Total: ${formatCurrency(results.totalCost)}
• Valor do Lucro: ${formatCurrency(results.profitAmount)}
• Preço Sugerido: ${formatCurrency(results.suggestedPrice)}
• Markup: ${results.markup.toFixed(1)}%
• Preço por Grama: ${formatCurrency(results.pricePerPortion)}

Calculado em: ${new Date().toLocaleString('pt-BR')}`

    navigator.clipboard.writeText(text)
    showSuccess('Cálculo copiado para a área de transferência!')
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

  const getProfitColor = (profit: number) => {
    if (profit < 20) return 'text-red-600'
    if (profit < 40) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getInputClassName = (fieldName: string) => {
    const baseClass = "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors"
    if (errors[fieldName]) {
      return `${baseClass} border-red-300 focus:ring-red-500 focus:border-red-500`
    }
    return `${baseClass} border-gray-300 focus:ring-blue-500 focus:border-blue-500`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cálculo de Preço de Venda</h1>
          <p className="text-gray-600 mt-1">Calcule preços baseados em custos, lucro e embalagem</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={resetForm}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw size={16} />
            <span>Limpar</span>
          </button>
          {results.suggestedPrice > 0 && (
            <button
              onClick={copyResults}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              disabled={isLoading}
            >
              <Copy size={16} />
              <span>{isLoading ? 'Salvando...' : 'Copiar'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Recipe Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Receitas Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {quickRecipes.map((recipe, index) => (
                <button
                  key={index}
                  onClick={() => loadQuickRecipe(recipe)}
                  className="p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">{recipe.name}</div>
                  <div className="text-sm text-gray-500">
                    {formatWeight(recipe.weight)} • {formatCurrency(recipe.cost)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Dados do Produto</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Produto</label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  className={getInputClassName('productName')}
                  placeholder="Ex: Bolo de Chocolate Premium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Scale className="inline w-4 h-4 mr-1" />
                  Peso Final (g) *
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={formData.finalWeight || ''}
                  onChange={(e) => setFormData({ ...formData, finalWeight: parseFloat(e.target.value) || 0 })}
                  className={getInputClassName('finalWeight')}
                  placeholder="Ex: 1200"
                />
                {errors.finalWeight && (
                  <p className="mt-1 text-sm text-red-600">{errors.finalWeight}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calculator className="inline w-4 h-4 mr-1" />
                  Custo da Receita (R$) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.recipeCost || ''}
                  onChange={(e) => setFormData({ ...formData, recipeCost: parseFloat(e.target.value) || 0 })}
                  className={getInputClassName('recipeCost')}
                  placeholder="Ex: 8.75"
                />
                {errors.recipeCost && (
                  <p className="mt-1 text-sm text-red-600">{errors.recipeCost}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <TrendingUp className="inline w-4 h-4 mr-1" />
                  Lucro Desejado (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  step="0.1"
                  value={formData.desiredProfit || ''}
                  onChange={(e) => setFormData({ ...formData, desiredProfit: parseFloat(e.target.value) || 0 })}
                  className={getInputClassName('desiredProfit')}
                  placeholder="Ex: 60"
                />
                {errors.desiredProfit && (
                  <p className="mt-1 text-sm text-red-600">{errors.desiredProfit}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Package className="inline w-4 h-4 mr-1" />
                  Custo de Embalagem (R$)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.packagingCost || ''}
                  onChange={(e) => setFormData({ ...formData, packagingCost: parseFloat(e.target.value) || 0 })}
                  className={getInputClassName('packagingCost')}
                  placeholder="Ex: 0.50"
                />
                {errors.packagingCost && (
                  <p className="mt-1 text-sm text-red-600">{errors.packagingCost}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Custos Extras (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.extraCosts || ''}
                  onChange={(e) => setFormData({ ...formData, extraCosts: parseFloat(e.target.value) || 0 })}
                  className={getInputClassName('extraCosts')}
                  placeholder="Ex: 1.00"
                />
                {errors.extraCosts && (
                  <p className="mt-1 text-sm text-red-600">{errors.extraCosts}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Canal de Venda</label>
                <select
                  value={formData.salesChannel}
                  onChange={(e) => setFormData({ ...formData, salesChannel: e.target.value })}
                  className={getInputClassName('salesChannel')}
                >
                  {salesChannels.map(channel => (
                    <option key={channel.value} value={channel.value}>
                      {channel.label} - {channel.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={calculatePrice}
              disabled={isLoading}
              className="w-full mt-6 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Calculator size={20} />
              <span>{isLoading ? 'Calculando...' : 'Calcular Preço'}</span>
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          {/* Results */}
          {results.suggestedPrice > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Resultados</h2>
              
              <div className="space-y-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Preço Sugerido</div>
                  <div className="text-3xl font-bold text-green-600">
                    {formatCurrency(results.suggestedPrice)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="text-gray-600">Custo por Grama</div>
                    <div className="font-semibold">{formatCurrency(results.costPerGram)}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="text-gray-600">Custo Total</div>
                    <div className="font-semibold">{formatCurrency(results.totalCost)}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="text-gray-600">Valor do Lucro</div>
                    <div className="font-semibold text-green-600">{formatCurrency(results.profitAmount)}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="text-gray-600">Markup</div>
                    <div className={`font-semibold ${getProfitColor(results.markup)}`}>
                      {results.markup.toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 rounded">
                  <div className="text-blue-800 text-sm">Preço por Grama</div>
                  <div className="font-semibold text-blue-900">{formatCurrency(results.pricePerPortion)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Profit Analysis */}
          {results.markup > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Análise de Lucro</h3>
              <div className="space-y-2 text-sm">
                {results.markup < 20 && (
                  <div className="p-3 bg-red-50 text-red-800 rounded">
                    <Info className="inline w-4 h-4 mr-1" />
                    Margem baixa. Considere aumentar o preço ou reduzir custos.
                  </div>
                )}
                {results.markup >= 20 && results.markup < 40 && (
                  <div className="p-3 bg-yellow-50 text-yellow-800 rounded">
                    <Info className="inline w-4 h-4 mr-1" />
                    Margem moderada. Boa para produtos competitivos.
                  </div>
                )}
                {results.markup >= 40 && (
                  <div className="p-3 bg-green-50 text-green-800 rounded">
                    <Info className="inline w-4 h-4 mr-1" />
                    Excelente margem de lucro!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Tips */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Dicas de Precificação</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Varejo: margem de 50-80%</li>
              <li>• Atacado: margem de 20-40%</li>
              <li>• Delivery: adicione taxa de entrega</li>
              <li>• Eventos: margem de 60-100%</li>
              <li>• Considere a concorrência local</li>
              <li>• Teste diferentes preços no mercado</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Calculation History */}
      {calculationHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <History size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Histórico de Cálculos</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Peso</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Custo</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Lucro %</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Preço</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {calculationHistory.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900">{formatWeight(entry.peso)}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(entry.custo)}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{entry.lucro}%</td>
                    <td className="px-4 py-2 text-sm font-medium text-green-600">{formatCurrency(entry.precoFinal)}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{new Date(entry.createdAt).toLocaleString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
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
      const response = await fetch('/api/calculo-preco/historico')
      if (response.ok) {
        const data = await response.json()
        setCalculationHistory(data)
      }
    } catch (error) {
      console.error('Error fetching calculation history:', error)
    }
  }

  const saveCalculation = async (calculationData: {
    custo: number;
    peso: number;
    lucro: number;
    precoFinal: number;
  }) => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/calculo-preco/historico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(calculationData)
      })
      if (response.ok) {
        await fetchCalculationHistory()
      }
    } catch (error) {
      console.error('Error saving calculation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const quickRecipes = [
    { name: 'Pão Francês Tradicional', weight: 50, cost: 0.17 },
    { name: 'Bolo de Chocolate Premium', weight: 1200, cost: 8.75 },
    { name: 'Croissant Folhado', weight: 80, cost: 1.25 },
    { name: 'Torta de Frango', weight: 1500, cost: 12.50 }
  ]

  const salesChannels = [
    { value: 'varejo', label: 'Varejo', description: 'Venda direta ao consumidor' },
    { value: 'atacado', label: 'Atacado', description: 'Venda para revendedores' },
    { value: 'delivery', label: 'Delivery', description: 'Entrega em domicílio' },
    { value: 'eventos', label: 'Eventos', description: 'Vendas para eventos' }
  ]

  const calculatePrice = async () => {
    if (formData.finalWeight <= 0 || formData.recipeCost <= 0) {
      alert('Por favor, preencha o peso final e o custo da receita')
      return
    }

    const costPerGram = formData.recipeCost / formData.finalWeight
    const totalCost = formData.recipeCost + formData.packagingCost + formData.extraCosts
    const profitAmount = (totalCost * formData.desiredProfit) / 100
    const suggestedPrice = totalCost + profitAmount
    const markup = ((suggestedPrice - totalCost) / totalCost) * 100
    const pricePerPortion = formData.finalWeight > 0 ? suggestedPrice / formData.finalWeight : 0

    const newResults = {
      costPerGram,
      totalCost,
      suggestedPrice,
      markup,
      pricePerPortion,
      profitAmount
    }

    setResults(newResults)

    await saveCalculation({
      custo: totalCost,
      peso: formData.finalWeight,
      lucro: formData.desiredProfit,
      precoFinal: suggestedPrice
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

  const loadQuickRecipe = (recipe: {name: string; weight: number; cost: number}) => {
    setFormData({
      ...formData,
      productName: recipe.name,
      finalWeight: recipe.weight,
      recipeCost: recipe.cost
    })
  }

  const copyResults = () => {
    const text = `CÁLCULO DE PREÇO - ${formData.productName || 'Produto'}
    
Dados de Entrada:
• Peso Final: ${formData.finalWeight}g
• Custo da Receita: ${formatCurrency(formData.recipeCost)}
• Lucro Desejado: ${formData.desiredProfit}%
• Custo de Embalagem: ${formatCurrency(formData.packagingCost)}
• Custos Extras: ${formatCurrency(formData.extraCosts)}
• Canal de Venda: ${salesChannels.find(c => c.value === formData.salesChannel)?.label}

Resultados:
• Custo por Grama: ${formatCurrency(results.costPerGram)}
• Custo Total: ${formatCurrency(results.totalCost)}
• Valor do Lucro: ${formatCurrency(results.profitAmount)}
• Preço Sugerido: ${formatCurrency(results.suggestedPrice)}
• Markup: ${results.markup.toFixed(1)}%
• Preço por Grama: ${formatCurrency(results.pricePerPortion)}

Calculado em: ${new Date().toLocaleString('pt-BR')}`

    navigator.clipboard.writeText(text)
    alert('Cálculo copiado para a área de transferência!')
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

  const getProfitColor = (profit: number) => {
    if (profit < 20) return 'text-red-600'
    if (profit < 40) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cálculo de Preço de Venda</h1>
          <p className="text-gray-600 mt-1">Calcule preços baseados em custos, lucro e embalagem</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={resetForm}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw size={16} />
            <span>Limpar</span>
          </button>
          {results.suggestedPrice > 0 && (
            <button
              onClick={copyResults}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              disabled={isLoading}
            >
              <Copy size={16} />
              <span>{isLoading ? 'Salvando...' : 'Copiar'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Recipe Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Receitas Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {quickRecipes.map((recipe, index) => (
                <button
                  key={index}
                  onClick={() => loadQuickRecipe(recipe)}
                  className="p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">{recipe.name}</div>
                  <div className="text-sm text-gray-500">
                    {formatWeight(recipe.weight)} • {formatCurrency(recipe.cost)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Dados do Produto</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Produto</label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Bolo de Chocolate Premium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Scale className="inline w-4 h-4 mr-1" />
                  Peso Final (g)
                </label>
                <input
                  type="number"
                  value={formData.finalWeight}
                  onChange={(e) => setFormData({ ...formData, finalWeight: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 1200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calculator className="inline w-4 h-4 mr-1" />
                  Custo da Receita (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.recipeCost}
                  onChange={(e) => setFormData({ ...formData, recipeCost: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 8.75"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <TrendingUp className="inline w-4 h-4 mr-1" />
                  Lucro Desejado (%)
                </label>
                <input
                  type="number"
                  value={formData.desiredProfit}
                  onChange={(e) => setFormData({ ...formData, desiredProfit: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Package className="inline w-4 h-4 mr-1" />
                  Custo de Embalagem (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.packagingCost}
                  onChange={(e) => setFormData({ ...formData, packagingCost: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 0.50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Custos Extras (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.extraCosts}
                  onChange={(e) => setFormData({ ...formData, extraCosts: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 1.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Canal de Venda</label>
                <select
                  value={formData.salesChannel}
                  onChange={(e) => setFormData({ ...formData, salesChannel: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {salesChannels.map(channel => (
                    <option key={channel.value} value={channel.value}>
                      {channel.label} - {channel.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={calculatePrice}
              className="w-full mt-6 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Calculator size={20} />
              <span>Calcular Preço</span>
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          {/* Results */}
          {results.suggestedPrice > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Resultados</h2>
              
              <div className="space-y-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Preço Sugerido</div>
                  <div className="text-3xl font-bold text-green-600">
                    {formatCurrency(results.suggestedPrice)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="text-gray-600">Custo por Grama</div>
                    <div className="font-semibold">{formatCurrency(results.costPerGram)}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="text-gray-600">Custo Total</div>
                    <div className="font-semibold">{formatCurrency(results.totalCost)}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="text-gray-600">Valor do Lucro</div>
                    <div className="font-semibold text-green-600">{formatCurrency(results.profitAmount)}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="text-gray-600">Markup</div>
                    <div className={`font-semibold ${getProfitColor(results.markup)}`}>
                      {results.markup.toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 rounded">
                  <div className="text-blue-800 text-sm">Preço por Grama</div>
                  <div className="font-semibold text-blue-900">{formatCurrency(results.pricePerPortion)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Profit Analysis */}
          {results.markup > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Análise de Lucro</h3>
              <div className="space-y-2 text-sm">
                {results.markup < 20 && (
                  <div className="p-3 bg-red-50 text-red-800 rounded">
                    <Info className="inline w-4 h-4 mr-1" />
                    Margem baixa. Considere aumentar o preço ou reduzir custos.
                  </div>
                )}
                {results.markup >= 20 && results.markup < 40 && (
                  <div className="p-3 bg-yellow-50 text-yellow-800 rounded">
                    <Info className="inline w-4 h-4 mr-1" />
                    Margem moderada. Boa para produtos competitivos.
                  </div>
                )}
                {results.markup >= 40 && (
                  <div className="p-3 bg-green-50 text-green-800 rounded">
                    <Info className="inline w-4 h-4 mr-1" />
                    Excelente margem de lucro!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Tips */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Dicas de Precificação</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Varejo: margem de 50-80%</li>
              <li>• Atacado: margem de 20-40%</li>
              <li>• Delivery: adicione taxa de entrega</li>
              <li>• Eventos: margem de 60-100%</li>
              <li>• Considere a concorrência local</li>
              <li>• Teste diferentes preços no mercado</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Calculation History */}
      {calculationHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <History size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Histórico de Cálculos</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Peso</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Custo</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Lucro %</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Preço</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {calculationHistory.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900">{formatWeight(entry.peso)}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(entry.custo)}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{entry.lucro}%</td>
                    <td className="px-4 py-2 text-sm font-medium text-green-600">{formatCurrency(entry.precoFinal)}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{new Date(entry.createdAt).toLocaleString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
