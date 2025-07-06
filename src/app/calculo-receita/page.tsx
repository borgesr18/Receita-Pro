'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Calculator, 
  Scale, 
  RotateCcw,
  Copy,
  Search,
  ChefHat,
  Utensils,
  TrendingUp,
  Package,
  Filter,
  Grid3X3,
  List,
  Clock,
  Thermometer
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
  pricePerKg: number
  totalCost: number
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
  const [flourQuantity, setFlourQuantity] = useState<number>(1000) // Base em gramas
  const [calculatedIngredients, setCalculatedIngredients] = useState<CalculatedIngredient[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  const { showSuccess, showError } = useToast()

  // Função para converter qualquer unidade para gramas/ml
  const convertToGrams = (quantity: number, ingredient: any, unit: any): number => {
    console.log('🔄 Convertendo para gramas:', { 
      quantity, 
      ingredientName: ingredient?.name, 
      unitName: unit?.name,
      unitAbbreviation: unit?.abbreviation,
      conversionFactor: ingredient?.conversionFactor 
    })

    // Se já está em gramas ou ml, retorna direto
    if (unit?.name?.toLowerCase().includes('grama') || 
        unit?.abbreviation?.toLowerCase() === 'g' ||
        unit?.name?.toLowerCase().includes('ml') ||
        unit?.abbreviation?.toLowerCase() === 'ml') {
      console.log('✅ Já em gramas/ml:', quantity)
      return quantity
    }
    
    // Se é kg ou quilograma, converte para gramas
    if (unit?.name?.toLowerCase().includes('kg') || 
        unit?.name?.toLowerCase().includes('quilograma') ||
        unit?.abbreviation?.toLowerCase() === 'kg') {
      const result = quantity * 1000
      console.log('✅ Convertido de kg para gramas:', result)
      return result
    }

    // Se é litro, converte para ml
    if (unit?.name?.toLowerCase().includes('litro') || 
        unit?.abbreviation?.toLowerCase() === 'l') {
      const result = quantity * 1000
      console.log('✅ Convertido de litro para ml:', result)
      return result
    }
    
    // Para ovos e outros ingredientes com unidade "Unidade", usa fator de conversão
    if (unit?.name?.toLowerCase().includes('unidade') || 
        unit?.abbreviation?.toLowerCase() === 'un') {
      
      // Se tem fator de conversão específico do ingrediente, usa ele
      if (ingredient?.conversionFactor && ingredient.conversionFactor > 0) {
        const result = quantity * ingredient.conversionFactor
        console.log('✅ Convertido usando fator específico do ingrediente:', {
          quantidade: quantity,
          fator: ingredient.conversionFactor,
          resultado: result
        })
        return result
      }
      
      // Fallback para ovos: 1 ovo = 50g
      if (ingredient?.name?.toLowerCase().includes('ovo')) {
        const result = quantity * 50
        console.log('🥚 Convertido ovos para gramas (50g/ovo):', result)
        return result
      }
    }

    // Fallback: assume que é gramas
    console.log('⚠️ Fallback: assumindo gramas:', quantity)
    return quantity
  }

  // Função para formatar unidade de exibição
  const getDisplayUnit = (ingredient: any): string => {
    // Líquidos em ml
    if (ingredient?.name?.toLowerCase().includes('água') ||
        ingredient?.name?.toLowerCase().includes('leite') ||
        ingredient?.name?.toLowerCase().includes('óleo') ||
        ingredient?.name?.toLowerCase().includes('vinagre') ||
        ingredient?.ingredientType?.toLowerCase() === 'líquido') {
      return 'ml'
    }
    
    // Ovos em unidades
    if (ingredient?.name?.toLowerCase().includes('ovo')) {
      return 'unidades'
    }
    
    // Padrão: gramas
    return 'g'
  }

  // Função para formatar quantidade para exibição
  const formatQuantityForDisplay = (quantity: number, ingredient: any, unit: any): number => {
    // Se é ovo ou ingrediente com unidade "Unidade", converte de gramas para unidades
    if (unit?.name?.toLowerCase().includes('unidade') || 
        unit?.abbreviation?.toLowerCase() === 'un') {
      
      // Se tem fator de conversão específico do ingrediente, usa ele
      if (ingredient?.conversionFactor && ingredient.conversionFactor > 0) {
        const result = quantity / ingredient.conversionFactor
        console.log('📊 Convertido para unidades usando fator específico:', {
          quantidade: quantity,
          fator: ingredient.conversionFactor,
          resultado: result
        })
        return Math.round(result * 100) / 100 // Arredonda para 2 casas decimais
      }
      
      // Fallback para ovos: 50g = 1 ovo
      if (ingredient?.name?.toLowerCase().includes('ovo')) {
        const result = quantity / 50
        console.log('🥚 Convertido gramas para ovos (50g/ovo):', {
          gramas: quantity,
          ovos: result
        })
        return Math.round(result * 100) / 100 // Arredonda para 2 casas decimais
      }
    }
    
    return quantity
  }

  // Carregar dados
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      console.log('🔄 Carregando dados...')
      
      const [recipesRes, categoriesRes] = await Promise.all([
        api.get('/api/recipes'),
        api.get('/api/recipe-categories')
      ])

      const recipesData = Array.isArray(recipesRes.data) ? recipesRes.data : []
      const categoriesData = Array.isArray(categoriesRes.data) ? categoriesRes.data : []

      console.log('📊 Dados carregados:', {
        recipes: recipesData.length,
        categories: categoriesData.length
      })

      setRecipes(recipesData)
      setCategories(categoriesData)
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
      return
    }

    console.log('🧮 Calculando ingredientes para:', selectedRecipe.name)
    console.log('🌾 Quantidade de farinha base:', flourQuantity, 'g')

    const calculated = selectedRecipe.ingredients.map(ing => {
      const ingredient = ing.ingredient
      const unit = ing.unit
      
      if (!ingredient || !unit) {
        console.log('⚠️ Ingrediente ou unidade não encontrados')
        return null
      }

      // Converte quantidade original para gramas
      const originalInGrams = convertToGrams(ing.quantity, ingredient, unit)
      
      // Calcula quantidade proporcional baseada na farinha
      const proportionalQuantity = (originalInGrams * flourQuantity) / 1000 // Base de 1kg de farinha
      
      // Unidade de exibição
      const displayUnit = getDisplayUnit(ingredient)
      
      // Quantidade para exibição
      const displayQuantity = formatQuantityForDisplay(proportionalQuantity, ingredient, unit)

      console.log('📊 Calculado:', {
        ingredient: ingredient.name,
        original: ing.quantity,
        originalUnit: unit.name,
        originalInGrams,
        proportionalQuantity,
        displayQuantity,
        displayUnit,
        percentage: ing.percentage
      })

      return {
        id: ing.id,
        name: ingredient.name,
        originalQuantity: ing.quantity,
        originalUnit: unit.name,
        calculatedQuantity: Math.round(displayQuantity * 100) / 100,
        calculatedUnit: displayUnit,
        percentage: ing.percentage,
        pricePerKg: ingredient.pricePerUnit || 0,
        totalCost: (proportionalQuantity / 1000) * (ingredient.pricePerUnit || 0)
      }
    }).filter(Boolean) as CalculatedIngredient[]

    setCalculatedIngredients(calculated)
  }, [selectedRecipe, flourQuantity])

  useEffect(() => {
    calculateIngredients()
  }, [calculateIngredients])

  // Calcular totais
  const totalWeight = calculatedIngredients.reduce((sum, ing) => {
    // Converte tudo para gramas para somar
    if (ing.calculatedUnit === 'unidades') {
      if (ing.name.toLowerCase().includes('ovo')) {
        // 50g por ovo
        return sum + (ing.calculatedQuantity * 50)
      } else {
        // Busca o ingrediente original para obter o fator de conversão
        const originalIngredient = selectedRecipe?.ingredients?.find(i => 
          i.ingredient?.name === ing.name
        )?.ingredient
        
        if (originalIngredient?.conversionFactor && originalIngredient.conversionFactor > 0) {
          return sum + (ing.calculatedQuantity * originalIngredient.conversionFactor)
        }
      }
    }
    
    // Para gramas e ml, usa direto
    return sum + ing.calculatedQuantity
  }, 0)

  const totalCost = calculatedIngredients.reduce((sum, ing) => sum + ing.totalCost, 0)
  const costPerKg = totalWeight > 0 ? (totalCost / totalWeight) * 1000 : 0

  // Copiar para área de transferência
  const copyToClipboard = () => {
    const text = calculatedIngredients.map(ing => 
      `${ing.name}: ${ing.calculatedQuantity} ${ing.calculatedUnit} (${ing.percentage}%)`
    ).join('\n')
    
    navigator.clipboard.writeText(text)
    showSuccess('Lista copiada para área de transferência!')
  }

  // Resetar cálculo
  const resetCalculation = () => {
    setSelectedRecipe(null)
    setFlourQuantity(1000)
    setCalculatedIngredients([])
  }

  // Filtrar receitas
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !filterCategory || recipe.categoryId === filterCategory
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-green-200 rounded-full animate-spin border-t-green-600 mx-auto"></div>
            <Calculator className="w-8 h-8 text-green-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Carregando calculadora...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Moderno */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-lg">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Cálculo de Receita
                </h1>
                <p className="text-gray-600 mt-1 text-lg">Calcule ingredientes com precisão profissional</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={resetCalculation}
                className="group bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                <span className="font-semibold">Resetar</span>
              </button>
              
              {calculatedIngredients.length > 0 && (
                <button
                  onClick={copyToClipboard}
                  className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Copy className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-semibold">Copiar</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* LAYOUT REORGANIZADO: Selecionar Receita e Quantidade Base lado a lado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Seleção de Receita */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-600 rounded-xl">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Selecionar Receita</h2>
            </div>

            {/* Filtros */}
            <div className="space-y-4 mb-6">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar receitas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
                  >
                    <option value="">Todas as categorias</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex bg-white/80 rounded-xl border border-gray-200 p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      viewMode === 'grid' 
                        ? 'bg-green-600 text-white shadow-md' 
                        : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      viewMode === 'list' 
                        ? 'bg-green-600 text-white shadow-md' 
                        : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Lista de Receitas */}
            <div className="max-h-96 overflow-y-auto">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 gap-3">
                  {filteredRecipes.map((recipe) => (
                    <div
                      key={recipe.id}
                      onClick={() => setSelectedRecipe(recipe)}
                      className={`group p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                        selectedRecipe?.id === recipe.id
                          ? 'border-green-500 bg-green-50 shadow-lg'
                          : 'border-gray-200 bg-white/50 hover:border-green-300 hover:bg-green-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                            {recipe.name}
                          </h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{recipe.preparationTime}min</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Thermometer className="w-3 h-3" />
                              <span>{recipe.ovenTemperature}°C</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Utensils className="w-3 h-3" />
                              <span>{recipe.ingredients?.length || 0}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                            {recipe.category?.name}
                          </span>
                          {selectedRecipe?.id === recipe.id && (
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredRecipes.map((recipe) => (
                    <div
                      key={recipe.id}
                      onClick={() => setSelectedRecipe(recipe)}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-300 flex items-center justify-between ${
                        selectedRecipe?.id === recipe.id
                          ? 'bg-green-100 text-green-900'
                          : 'bg-white/50 hover:bg-green-50 text-gray-900'
                      }`}
                    >
                      <span className="font-medium">{recipe.name}</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {recipe.category?.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {filteredRecipes.length === 0 && (
              <div className="text-center py-8">
                <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Nenhuma receita encontrada</p>
              </div>
            )}
          </div>

          {/* Configuração da Farinha */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-600 rounded-xl">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Quantidade Base</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantidade de Farinha (gramas)
                </label>
                <input
                  type="number"
                  value={flourQuantity}
                  onChange={(e) => setFlourQuantity(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                  min="1"
                  step="1"
                />
              </div>
              
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-yellow-600" />
                  <span className="font-semibold text-yellow-800">Multiplicador</span>
                </div>
                <p className="text-sm text-yellow-700">
                  Base: 1000g → Atual: {flourQuantity}g 
                  <span className="font-semibold ml-2">
                    ({((flourQuantity / 1000) * 100).toFixed(1)}%)
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* LAYOUT REORGANIZADO: Receita Selecionada abaixo */}
        {selectedRecipe && (
          <div className="mb-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-600 rounded-xl">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Receita Selecionada</h3>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-xl font-bold text-gray-900">{selectedRecipe.name}</h4>
                {selectedRecipe.description && (
                  <p className="text-gray-600">{selectedRecipe.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                    {selectedRecipe.category?.name}
                  </span>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{selectedRecipe.preparationTime} min</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Thermometer className="w-4 h-4" />
                    <span>{selectedRecipe.ovenTemperature}°C</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LAYOUT REORGANIZADO: Ingredientes Calculados abaixo */}
        {selectedRecipe && calculatedIngredients.length > 0 && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Utensils className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Ingredientes Calculados</h3>
                </div>
                <div className="text-white/80 text-sm">
                  Base: {flourQuantity}g de farinha
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ingrediente</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Qtd. Original</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Qtd. Calculada</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Porcentagem</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Preço/Kg</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Custo Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {calculatedIngredients.map((ing) => (
                    <tr key={ing.id} className="hover:bg-green-50/50 transition-colors duration-300">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">{ing.name}</div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-600">
                        {ing.originalQuantity} {ing.originalUnit}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-gray-900">
                          {ing.calculatedQuantity} {ing.calculatedUnit}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          {ing.percentage.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-600">
                        R$ {ing.pricePerKg.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-gray-900">
                          R$ {ing.totalCost.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Resumo */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{(totalWeight / 1000).toFixed(2)} kg</div>
                  <div className="text-sm text-gray-600">Peso Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">R$ {totalCost.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Custo Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">R$ {costPerKg.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Custo por Kg</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mensagem quando nenhuma receita está selecionada */}
        {!selectedRecipe && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calculator className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Selecione uma receita</h3>
            <p className="text-gray-600 mb-6">Escolha uma receita para calcular os ingredientes</p>
          </div>
        )}
      </div>
    </div>
  )
}
