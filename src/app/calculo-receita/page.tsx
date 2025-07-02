'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Calculator, 
  Scale, 
  Percent, 
  FileText, 
  DollarSign,
  RotateCcw,
  Copy
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
  }
  unit?: { 
    name: string
    symbol?: string
  }
}

interface CalculatedIngredient {
  id: string
  name: string
  originalQuantity: number
  percentage: number
  calculatedQuantity: number
  calculatedCost: number
  pricePerGram: number
  unit: string
}

export default function CalculoReceita() {
  const { showError } = useToast()
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [flourQuantity, setFlourQuantity] = useState(1000)
  const [calculatedIngredients, setCalculatedIngredients] = useState<CalculatedIngredient[]>([])
  const [totalWeight, setTotalWeight] = useState(0)
  const [totalCost, setTotalCost] = useState(0)
  const [loading, setLoading] = useState(true)

  // Estados para dados do banco
  const [availableRecipes, setAvailableRecipes] = useState<Recipe[]>([])

  // Carregar receitas do banco de dados
  const loadRecipes = useCallback(async () => {
    try {
      setLoading(true)
      console.log('🔄 Carregando receitas do banco de dados...')
      
      const recipesRes = await api.get('/api/recipes')
      const recipesData = Array.isArray(recipesRes.data) ? recipesRes.data : []

      setAvailableRecipes(recipesData)

      console.log('✅ Receitas carregadas:', {
        recipes: recipesData.length
      })
    } catch (error) {
      console.error('❌ Erro ao carregar receitas:', error)
      showError('Erro ao carregar receitas')
    } finally {
      setLoading(false)
    }
  }, [showError])

  useEffect(() => {
    loadRecipes()
  }, [loadRecipes])

  const handleRecipeSelect = (recipeId: string) => {
    const recipe = availableRecipes.find(r => r.id === recipeId)
    if (recipe) {
      setSelectedRecipe(recipe)
      calculateIngredients(recipe, flourQuantity)
    }
  }

  const calculateIngredients = (recipe: Recipe, newFlourQuantity: number) => {
    if (!recipe || !recipe.ingredients) return

    // Encontrar o ingrediente base (farinha) para calcular proporções
    const flourIngredient = recipe.ingredients.find(ing => 
      ing.ingredient?.name.toLowerCase().includes('farinha') || 
      ing.percentage === 100
    )

    if (!flourIngredient) {
      showError('Receita deve ter um ingrediente base (farinha) com 100%')
      return
    }

    const calculated = recipe.ingredients.map((ingredient: RecipeIngredient) => {
      const newQuantity = (ingredient.percentage / 100) * newFlourQuantity
      const pricePerGram = ingredient.ingredient?.pricePerUnit || 0
      const newCost = newQuantity * pricePerGram
      
      return {
        id: ingredient.id,
        name: ingredient.ingredient?.name || 'Ingrediente',
        originalQuantity: ingredient.quantity,
        percentage: ingredient.percentage,
        calculatedQuantity: newQuantity,
        calculatedCost: newCost,
        pricePerGram: pricePerGram,
        unit: ingredient.unit?.symbol || ingredient.unit?.name || 'g'
      }
    })

    setCalculatedIngredients(calculated)
    
    const newTotalWeight = calculated.reduce((sum: number, ing: CalculatedIngredient) => sum + ing.calculatedQuantity, 0)
    const newTotalCost = calculated.reduce((sum: number, ing: CalculatedIngredient) => sum + ing.calculatedCost, 0)
    
    setTotalWeight(newTotalWeight)
    setTotalCost(newTotalCost)
  }

  const handleFlourQuantityChange = (newQuantity: number) => {
    setFlourQuantity(newQuantity)
    if (selectedRecipe) {
      calculateIngredients(selectedRecipe, newQuantity)
    }
  }

  const resetCalculation = () => {
    setSelectedRecipe(null)
    setFlourQuantity(1000)
    setCalculatedIngredients([])
    setTotalWeight(0)
    setTotalCost(0)
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

  const copyToClipboard = () => {
    if (!selectedRecipe || calculatedIngredients.length === 0) return

    let text = `RECEITA CALCULADA - ${selectedRecipe.name}\n`
    text += `Quantidade de Farinha: ${formatWeight(flourQuantity)}\n\n`
    text += `INGREDIENTES:\n`
    
    calculatedIngredients.forEach(ingredient => {
      text += `• ${ingredient.name}: ${formatWeight(ingredient.calculatedQuantity)} (${ingredient.percentage.toFixed(1)}%) - ${formatCurrency(ingredient.calculatedCost)}\n`
    })
    
    text += `\nPESO TOTAL: ${formatWeight(totalWeight)}\n`
    text += `CUSTO TOTAL: ${formatCurrency(totalCost)}\n`
    text += `CUSTO POR GRAMA: ${formatCurrency(totalCost / totalWeight)}\n`

    navigator.clipboard.writeText(text)
    alert('Receita copiada para a área de transferência!')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cálculo de Receita</h1>
          <p className="text-gray-600 mt-1">Sistema de cálculo baseado na porcentagem do padeiro</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={resetCalculation}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw size={16} />
            <span>Limpar</span>
          </button>
          {selectedRecipe && (
            <button
              onClick={copyToClipboard}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Copy size={16} />
              <span>Copiar</span>
            </button>
          )}
        </div>
      </div>

      {/* Recipe Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">1. Selecione a Ficha Técnica</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {availableRecipes.map(recipe => (
            <div
              key={recipe.id}
              onClick={() => handleRecipeSelect(recipe.id)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                selectedRecipe?.id === recipe.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <FileText size={20} className="text-gray-600" />
                <div>
                  <h3 className="font-medium text-gray-900">{recipe.name}</h3>
                  <p className="text-sm text-gray-500">{recipe.category?.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {availableRecipes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Nenhuma ficha técnica encontrada</p>
            <p className="text-sm">Cadastre receitas em &ldquo;Fichas Técnicas&rdquo; primeiro</p>
          </div>
        )}
      </div>

      {/* Flour Quantity Input */}
      {selectedRecipe && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">2. Defina a Quantidade de Farinha</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Scale size={20} className="text-gray-600" />
              <label className="text-sm font-medium text-gray-700">Quantidade de Farinha (g):</label>
            </div>
            <input
              type="number"
              value={flourQuantity}
              onChange={(e) => handleFlourQuantityChange(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
              min="1"
              step="1"
            />
            <span className="text-sm text-gray-500">gramas</span>
          </div>
        </div>
      )}

      {/* Calculation Results */}
      {selectedRecipe && calculatedIngredients.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">3. Resultado do Cálculo</h2>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Scale size={20} className="text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Peso Total</p>
                  <p className="text-lg font-bold text-blue-600">{formatWeight(totalWeight)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <DollarSign size={20} className="text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">Custo Total</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(totalCost)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Calculator size={20} className="text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-purple-900">Custo por Grama</p>
                  <p className="text-lg font-bold text-purple-600">
                    {totalWeight > 0 ? formatCurrency(totalCost / totalWeight) : 'R$ 0,00'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Ingredients Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ingrediente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantidade Original
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Porcentagem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantidade Calculada
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Custo
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {calculatedIngredients.map((ingredient, index) => (
                  <tr key={ingredient.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {ingredient.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatWeight(ingredient.originalQuantity)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Percent size={14} />
                        <span>{ingredient.percentage.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatWeight(ingredient.calculatedQuantity)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(ingredient.calculatedCost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Instructions */}
      {selectedRecipe && selectedRecipe.instructions && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Instruções de Preparo</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
              {selectedRecipe.instructions}
            </pre>
          </div>
        </div>
      )}

      {/* Technical Notes */}
      {selectedRecipe && selectedRecipe.technicalNotes && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Observações Técnicas</h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <pre className="whitespace-pre-wrap text-sm text-yellow-800 font-sans">
              {selectedRecipe.technicalNotes}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
