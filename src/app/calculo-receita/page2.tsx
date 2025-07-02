'use client'

import React, { useState } from 'react'
import { 
  Calculator, 
  Scale, 
  Percent, 
  FileText, 
  DollarSign,
  RotateCcw,
  Copy
} from 'lucide-react'
import { Recipe, Ingredient, CalculatedIngredient } from '@/lib/types'

export default function CalculoReceita() {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [flourQuantity, setFlourQuantity] = useState(1000)
  const [calculatedIngredients, setCalculatedIngredients] = useState<CalculatedIngredient[]>([])
  const [totalWeight, setTotalWeight] = useState(0)
  const [totalCost, setTotalCost] = useState(0)

  const availableRecipes = [
    {
      id: 1,
      name: 'Pão Francês Tradicional',
      category: 'Pães',
      baseFlourQuantity: 500,
      ingredients: [
        { id: 1, name: 'Farinha de Trigo Especial', quantity: 500, percentage: 100, pricePerGram: 0.0045 },
        { id: 5, name: 'Leite Integral', quantity: 300, percentage: 60, pricePerGram: 0.0042 },
        { id: 4, name: 'Fermento Biológico Seco', quantity: 10, percentage: 2, pricePerGram: 0.08 },
        { id: 7, name: 'Sal Refinado', quantity: 8, percentage: 1.6, pricePerGram: 0.002 }
      ]
    },
    {
      id: 2,
      name: 'Bolo de Chocolate Premium',
      category: 'Bolos',
      baseFlourQuantity: 300,
      ingredients: [
        { id: 1, name: 'Farinha de Trigo Especial', quantity: 300, percentage: 100, pricePerGram: 0.0045 },
        { id: 2, name: 'Açúcar Cristal', quantity: 250, percentage: 83.3, pricePerGram: 0.0032 },
        { id: 3, name: 'Manteiga sem Sal', quantity: 150, percentage: 50, pricePerGram: 0.0128 },
        { id: 6, name: 'Ovos', quantity: 200, percentage: 66.7, pricePerGram: 0.012 },
        { id: 5, name: 'Leite Integral', quantity: 200, percentage: 66.7, pricePerGram: 0.0042 }
      ]
    },
    {
      id: 3,
      name: 'Croissant Folhado',
      category: 'Doces',
      baseFlourQuantity: 500,
      ingredients: [
        { id: 1, name: 'Farinha de Trigo Especial', quantity: 500, percentage: 100, pricePerGram: 0.0045 },
        { id: 3, name: 'Manteiga sem Sal', quantity: 350, percentage: 70, pricePerGram: 0.0128 },
        { id: 5, name: 'Leite Integral', quantity: 250, percentage: 50, pricePerGram: 0.0042 },
        { id: 2, name: 'Açúcar Cristal', quantity: 50, percentage: 10, pricePerGram: 0.0032 },
        { id: 7, name: 'Sal Refinado', quantity: 10, percentage: 2, pricePerGram: 0.002 },
        { id: 4, name: 'Fermento Biológico Seco', quantity: 8, percentage: 1.6, pricePerGram: 0.08 }
      ]
    }
  ]

  const handleRecipeSelect = (recipeId: number) => {
    const recipe = availableRecipes.find(r => r.id === recipeId)
    if (recipe) {
      const recipeData: Recipe = {
        id: recipe.id.toString(),
        name: recipe.name,
        ingredients: recipe.ingredients.map((ing) => ({
          id: ing.id,
          name: ing.name,
          quantity: ing.quantity,
          unit: 'g',
          percentage: ing.percentage || 0,
          originalQuantity: ing.quantity,
          pricePerGram: ing.pricePerGram || 0
        }))
      }
      setSelectedRecipe(recipeData)
      calculateIngredients(recipeData, flourQuantity)
    }
  }

  const calculateIngredients = (recipe: Recipe, newFlourQuantity: number) => {
    if (!recipe) return

    const calculated = recipe.ingredients.map((ingredient: Ingredient) => {
      const newQuantity = ((ingredient.percentage || 0) / 100) * newFlourQuantity
      const newCost = newQuantity * (ingredient.pricePerGram || 0)
      
      return {
        ...ingredient,
        calculatedQuantity: newQuantity,
        calculatedCost: newCost
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
      text += `• ${ingredient.name}: ${formatWeight(ingredient.calculatedQuantity)} (${(ingredient.percentage || 0).toFixed(1)}%) - ${formatCurrency(ingredient.calculatedCost)}\n`
    })
    
    text += `\nPESO TOTAL: ${formatWeight(totalWeight)}\n`
    text += `CUSTO TOTAL: ${formatCurrency(totalCost)}\n`
    text += `CUSTO POR GRAMA: ${formatCurrency(totalCost / totalWeight)}\n`

    navigator.clipboard.writeText(text)
    alert('Receita copiada para a área de transferência!')
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
                selectedRecipe?.id === recipe.id.toString()
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <FileText size={20} className="text-gray-600" />
                <div>
                  <h3 className="font-medium text-gray-900">{recipe.name}</h3>
                  <p className="text-sm text-gray-500">{recipe.category}</p>
                  <p className="text-xs text-gray-400">Base: {recipe.baseFlourQuantity}g farinha</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Flour Quantity Input */}
      {selectedRecipe && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">2. Informe a Quantidade de Farinha</h2>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantidade de Farinha (gramas)
              </label>
              <input
                type="number"
                value={flourQuantity}
                onChange={(e) => handleFlourQuantityChange(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                placeholder="Ex: 1000"
                min="1"
              />
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Scale size={20} />
              <span className="text-sm">Base: 100%</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Todos os ingredientes serão recalculados proporcionalmente com base nesta quantidade
          </p>
        </div>
      )}

      {/* Calculated Results */}
      {calculatedIngredients.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">3. Ingredientes Calculados</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ingrediente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Porcentagem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantidade Original
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
                  <tr key={index} className={(ingredient.percentage || 0) === 100 ? 'bg-blue-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {(ingredient.percentage || 0) === 100 && (
                          <Percent size={16} className="text-blue-600 mr-2" />
                        )}
                        <span className="text-sm font-medium text-gray-900">
                          {ingredient.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        (ingredient.percentage || 0) === 100 ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {(ingredient.percentage || 0).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatWeight(ingredient.originalQuantity || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {formatWeight(ingredient.calculatedQuantity)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(ingredient.calculatedCost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 text-gray-600 mb-1">
                  <Scale size={20} />
                  <span className="text-sm font-medium">Peso Total</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {formatWeight(totalWeight)}
                </span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 text-gray-600 mb-1">
                  <DollarSign size={20} />
                  <span className="text-sm font-medium">Custo Total</span>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalCost)}
                </span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 text-gray-600 mb-1">
                  <Calculator size={20} />
                  <span className="text-sm font-medium">Custo por Grama</span>
                </div>
                <span className="text-2xl font-bold text-blue-600">
                  {formatCurrency(totalWeight > 0 ? totalCost / totalWeight : 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          {selectedRecipe && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Como usar estes cálculos:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use as quantidades calculadas para produzir a receita</li>
                <li>• A porcentagem do padeiro facilita o escalonamento da receita</li>
                <li>• O custo por grama ajuda no cálculo do preço de venda</li>
                <li>• Copie os dados para usar na produção ou salvar como nova ficha</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Help Section */}
      {!selectedRecipe && (
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <Calculator className="text-blue-600 mt-1" size={24} />
            <div>
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                Como funciona o Cálculo de Receita (% de Padeiro)
              </h3>
              <div className="text-blue-800 space-y-2">
                <p>
                  <strong>1. Selecione uma ficha técnica:</strong> Escolha a receita que deseja calcular
                </p>
                <p>
                  <strong>2. Informe a quantidade de farinha:</strong> Digite quantos gramas de farinha você quer usar
                </p>
                <p>
                  <strong>3. Veja os resultados:</strong> Todos os ingredientes serão recalculados automaticamente
                </p>
                <p className="text-sm mt-3 p-3 bg-blue-100 rounded">
                  <strong>Exemplo:</strong> Se a receita original usa 500g de farinha (100%) e 300g de leite (60%), 
                  ao informar 1000g de farinha, o sistema calculará automaticamente 600g de leite.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
