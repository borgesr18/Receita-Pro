'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Calculator, 
  Scale, 
  Percent, 
  FileText, 
  DollarSign,
  RotateCcw,
  Copy,
  Search,
  Filter
} from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'

interface Recipe {
  id: string
  name: string
  description?: string
  categoryId: string
  preparationTime: number
  ovenTemperature: number
  instructions?: string
  technicalNotes?: string
  category?: { name: string }
  ingredients?: RecipeIngredient[]
}

interface RecipeIngredient {
  id: string
  ingredientId: string
  quantity: number
  percentage: number
  unitId: string
  order?: number
  ingredient?: { 
    name: string
    pricePerUnit: number
    conversionFactor?: number
    baseUnit?: string
    ingredientType?: string
  }
  unit?: { name: string; symbol?: string }
}

interface CalculatedIngredient {
  id: string
  name: string
  originalQuantity: number
  originalUnit: string
  calculatedQuantity: number
  calculatedUnit: string
  percentage: number
  pricePerUnit: number
  totalCost: number
  conversionFactor?: number
}

interface Category {
  id: string
  name: string
}

export default function CalculoReceita() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [flourQuantity, setFlourQuantity] = useState(1000)
  const [calculatedIngredients, setCalculatedIngredients] = useState<CalculatedIngredient[]>([])
  const [totalWeight, setTotalWeight] = useState(0)
  const [totalCost, setTotalCost] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  
  const { showSuccess, showError } = useToast()

  // Função para converter quantidade para gramas
  const convertToGrams = (quantity: number, ingredient: any, unit: any) => {
    // Se já está em gramas, retorna direto
    if (unit.name.toLowerCase().includes('grama') || unit.symbol?.toLowerCase() === 'g') {
      return quantity
    }
    
    // Se é kg, converte para gramas
    if (unit.name.toLowerCase().includes('kg') || unit.symbol?.toLowerCase() === 'kg') {
      return quantity * 1000
    }
    
    // Se tem fator de conversão específico do ingrediente, usa ele
    if (ingredient.conversionFactor) {
      return quantity * ingredient.conversionFactor
    }
    
    // Fallback: assume que é gramas
    return quantity
  }

  // Função para formatar quantidade com unidade apropriada
  const formatQuantityWithUnit = (quantityInGrams: number, originalUnit: string, conversionFactor?: number) => {
    // Se a unidade original é kg e a quantidade é >= 1000g, mostra em kg
    if (originalUnit.toLowerCase().includes('kg') && quantityInGrams >= 1000) {
      return {
        quantity: quantityInGrams / 1000,
        unit: 'kg'
      }
    }
    
    // Se tem fator de conversão (como ovo), mostra na unidade original
    if (conversionFactor && conversionFactor > 1) {
      return {
        quantity: quantityInGrams / conversionFactor,
        unit: originalUnit
      }
    }
    
    // Senão, mostra em gramas
    return {
      quantity: quantityInGrams,
      unit: 'g'
    }
  }

  // Carregar dados
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [recipesRes, categoriesRes] = await Promise.all([
        api.get('/api/recipes'),
        api.get('/api/recipe-categories')
      ])

      setRecipes(Array.isArray(recipesRes.data) ? recipesRes.data : [])
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : [])
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error)
      showError('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [showError])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Calcular ingredientes baseado na quantidade de farinha
  const calculateIngredients = useCallback(() => {
    if (!selectedRecipe || !selectedRecipe.ingredients) {
      setCalculatedIngredients([])
      setTotalWeight(0)
      setTotalCost(0)
      return
    }

    // Encontrar ingrediente base (farinha)
    const flourIngredient = selectedRecipe.ingredients.find(ing => 
      ing.ingredient?.ingredientType === 'Farinha' || 
      ing.ingredient?.name.toLowerCase().includes('farinha')
    )

    if (!flourIngredient) {
      showError('Receita não possui farinha como ingrediente base')
      return
    }

    // Converter quantidade original da farinha para gramas
    const originalFlourInGrams = convertToGrams(
      flourIngredient.quantity, 
      flourIngredient.ingredient, 
      flourIngredient.unit
    )

    if (originalFlourInGrams === 0) {
      showError('Quantidade de farinha inválida')
      return
    }

    // Calcular fator de escala
    const scaleFactor = flourQuantity / originalFlourInGrams

    const calculated = selectedRecipe.ingredients.map(ing => {
      const originalQuantityInGrams = convertToGrams(
        ing.quantity, 
        ing.ingredient, 
        ing.unit
      )
      
      const scaledQuantityInGrams = originalQuantityInGrams * scaleFactor
      
      // Formatar quantidade para exibição
      const formatted = formatQuantityWithUnit(
        scaledQuantityInGrams, 
        ing.unit?.name || '', 
        ing.ingredient?.conversionFactor
      )

      const totalCost = (scaledQuantityInGrams / 1000) * (ing.ingredient?.pricePerUnit || 0)

      return {
        id: ing.id,
        name: ing.ingredient?.name || 'Ingrediente não encontrado',
        originalQuantity: ing.quantity,
        originalUnit: ing.unit?.name || '',
        calculatedQuantity: formatted.quantity,
        calculatedUnit: formatted.unit,
        percentage: ing.percentage,
        pricePerUnit: ing.ingredient?.pricePerUnit || 0,
        totalCost: totalCost,
        conversionFactor: ing.ingredient?.conversionFactor
      }
    })

    setCalculatedIngredients(calculated)
    
    // Calcular totais
    const weight = calculated.reduce((sum, ing) => {
      // Para o peso total, sempre usar gramas
      const originalInGrams = convertToGrams(
        selectedRecipe.ingredients?.find(i => i.id === ing.id)?.quantity || 0,
        selectedRecipe.ingredients?.find(i => i.id === ing.id)?.ingredient,
        selectedRecipe.ingredients?.find(i => i.id === ing.id)?.unit
      )
      return sum + (originalInGrams * scaleFactor)
    }, 0)
    
    const cost = calculated.reduce((sum, ing) => sum + ing.totalCost, 0)
    
    setTotalWeight(weight)
    setTotalCost(cost)
  }, [selectedRecipe, flourQuantity, showError])

  useEffect(() => {
    calculateIngredients()
  }, [calculateIngredients])

  const handleRecipeSelect = (recipe: Recipe) => {
    setSelectedRecipe(recipe)
    
    // Encontrar quantidade padrão de farinha
    const flourIngredient = recipe.ingredients?.find(ing => 
      ing.ingredient?.ingredientType === 'Farinha' || 
      ing.ingredient?.name.toLowerCase().includes('farinha')
    )
    
    if (flourIngredient) {
      const flourInGrams = convertToGrams(
        flourIngredient.quantity, 
        flourIngredient.ingredient, 
        flourIngredient.unit
      )
      setFlourQuantity(flourInGrams)
    }
  }

  const resetCalculation = () => {
    setSelectedRecipe(null)
    setFlourQuantity(1000)
    setCalculatedIngredients([])
    setTotalWeight(0)
    setTotalCost(0)
  }

  const copyToClipboard = () => {
    if (!selectedRecipe || calculatedIngredients.length === 0) return

    let text = `${selectedRecipe.name}\n\n`
    text += `Ingredientes (para ${flourQuantity}g de farinha):\n\n`
    
    calculatedIngredients.forEach(ing => {
      text += `${ing.name}: ${ing.calculatedQuantity.toFixed(2)} ${ing.calculatedUnit}\n`
    })
    
    text += `\nPeso Total: ${(totalWeight / 1000).toFixed(2)} kg\n`
    text += `Custo Total: R$ ${totalCost.toFixed(2)}\n`
    
    navigator.clipboard.writeText(text)
    showSuccess('Receita copiada para a área de transferência!')
  }

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !filterCategory || recipe.categoryId === filterCategory
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Cálculo de Receitas</h1>
        <p className="text-gray-600 mt-1">Calcule quantidades e custos baseados na farinha</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seleção de Receitas */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Receitas Disponíveis</h2>
            </div>
            
            {/* Filtros */}
            <div className="p-4 border-b space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar receitas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">Todas as categorias</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            {/* Lista de Receitas */}
            <div className="max-h-96 overflow-y-auto">
              {filteredRecipes.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  Nenhuma receita encontrada
                </div>
              ) : (
                <div className="space-y-2 p-4">
                  {filteredRecipes.map((recipe) => (
                    <div
                      key={recipe.id}
                      onClick={() => handleRecipeSelect(recipe)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedRecipe?.id === recipe.id
                          ? 'bg-blue-50 border-blue-200'
                          : 'hover:bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="font-medium text-sm">{recipe.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {recipe.category?.name} • {recipe.ingredients?.length || 0} ingredientes
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cálculo e Resultados */}
        <div className="lg:col-span-2">
          {selectedRecipe ? (
            <div className="space-y-6">
              {/* Controles de Cálculo */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">{selectedRecipe.name}</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={copyToClipboard}
                      className="text-blue-600 hover:text-blue-800 p-2 rounded"
                      title="Copiar receita"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={resetCalculation}
                      className="text-gray-600 hover:text-gray-800 p-2 rounded"
                      title="Resetar cálculo"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantidade de Farinha (g)
                    </label>
                    <input
                      type="number"
                      value={flourQuantity}
                      onChange={(e) => setFlourQuantity(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                      step="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Peso Total
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                      {(totalWeight / 1000).toFixed(2)} kg
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Custo Total
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                      R$ {totalCost.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabela de Ingredientes */}
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-semibold">Ingredientes Calculados</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ingrediente
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantidade Original
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantidade Calculada
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Porcentagem
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Preço/kg
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Custo Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {calculatedIngredients.map((ingredient) => (
                        <tr key={ingredient.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{ingredient.name}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                            {ingredient.originalQuantity} {ingredient.originalUnit}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                            <span className="font-medium">
                              {ingredient.calculatedQuantity.toFixed(2)} {ingredient.calculatedUnit}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                            {ingredient.percentage.toFixed(1)}%
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                            R$ {ingredient.pricePerUnit.toFixed(2)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                            <span className="font-medium">R$ {ingredient.totalCost.toFixed(2)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Resumo */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Scale className="w-8 h-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-900">Peso Total</p>
                      <p className="text-lg font-semibold text-blue-900">{(totalWeight / 1000).toFixed(2)} kg</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <DollarSign className="w-8 h-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-900">Custo Total</p>
                      <p className="text-lg font-semibold text-green-900">R$ {totalCost.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Calculator className="w-8 h-8 text-purple-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-purple-900">Custo por kg</p>
                      <p className="text-lg font-semibold text-purple-900">
                        R$ {totalWeight > 0 ? (totalCost / (totalWeight / 1000)).toFixed(2) : '0.00'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <Calculator className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione uma receita</h3>
              <p className="text-gray-600">
                Escolha uma receita da lista ao lado para começar o cálculo de quantidades e custos.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

