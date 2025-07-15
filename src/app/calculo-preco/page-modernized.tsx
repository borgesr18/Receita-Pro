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
  Clock,
  Thermometer,
  DollarSign,
  Percent,
  Weight,
  ChevronDown,
  Sparkles,
  Target,
  Info
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
  const [flourQuantity, setFlourQuantity] = useState<number>(1000)
  const [calculatedIngredients, setCalculatedIngredients] = useState<CalculatedIngredient[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  
  const { showSuccess, showError } = useToast()

  // Função para converter qualquer unidade para gramas/ml
  const convertToGrams = (quantity: number, ingredient: any, unit: any): number => {
    if (unit?.name?.toLowerCase().includes('grama') || 
        unit?.symbol?.toLowerCase() === 'g' ||
        unit?.name?.toLowerCase().includes('ml') ||
        unit?.symbol?.toLowerCase() === 'ml') {
      return quantity
    }
    
    if (unit?.name?.toLowerCase().includes('kg') || 
        unit?.name?.toLowerCase().includes('quilograma') ||
        unit?.symbol?.toLowerCase() === 'kg') {
      return quantity * 1000
    }

    if (unit?.name?.toLowerCase().includes('litro') || 
        unit?.symbol?.toLowerCase() === 'l') {
      return quantity * 1000
    }
    
    if (unit?.name?.toLowerCase().includes('unidade') || 
        unit?.symbol?.toLowerCase() === 'un') {
      
      if (ingredient?.conversionFactor && ingredient.conversionFactor > 0) {
        return quantity * ingredient.conversionFactor
      }
      
      if (ingredient?.name?.toLowerCase().includes('ovo')) {
        return quantity * 50
      }
    }

    return quantity
  }

  // Função para formatar unidade de exibição
  const getDisplayUnit = (ingredient: any): string => {
    if (ingredient?.name?.toLowerCase().includes('água') ||
        ingredient?.name?.toLowerCase().includes('leite') ||
        ingredient?.name?.toLowerCase().includes('óleo') ||
        ingredient?.name?.toLowerCase().includes('vinagre') ||
        ingredient?.ingredientType?.toLowerCase() === 'líquido') {
      return 'ml'
    }
    
    if (ingredient?.name?.toLowerCase().includes('ovo')) {
      return 'unidades'
    }
    
    return 'g'
  }

  // Função para formatar quantidade para exibição
  const formatQuantityForDisplay = (quantity: number, ingredient: any, unit: any): number => {
    if (unit?.name?.toLowerCase().includes('unidade') || 
        unit?.symbol?.toLowerCase() === 'un') {
      
      if (ingredient?.conversionFactor && ingredient.conversionFactor > 0) {
        return quantity / ingredient.conversionFactor
      }
      
      if (ingredient?.name?.toLowerCase().includes('ovo')) {
        return quantity / 50
      }
    }
    
    return quantity
  }

  // Carregar dados
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      
      const [recipesRes, categoriesRes] = await Promise.all([
        api.get('/api/recipes'),
        api.get('/api/recipe-categories')
      ])

      const recipesData = Array.isArray(recipesRes.data) ? recipesRes.data : []
      const categoriesData = Array.isArray(categoriesRes.data) ? categoriesRes.data : []

      setRecipes(recipesData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
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

    const calculated = selectedRecipe.ingredients.map(ing => {
      const ingredient = ing.ingredient
      const unit = ing.unit
      
      if (!ingredient || !unit) {
        return null
      }

      const originalInGrams = convertToGrams(ing.quantity, ingredient, unit)
      const proportionalQuantity = (originalInGrams * flourQuantity) / 1000
      const displayUnit = getDisplayUnit(ingredient)
      const displayQuantity = formatQuantityForDisplay(proportionalQuantity, ingredient, unit)

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
    if (ing.calculatedUnit === 'unidades') {
      if (ing.name.toLowerCase().includes('ovo')) {
        return sum + (ing.calculatedQuantity * 50)
      } else {
        const originalIngredient = selectedRecipe?.ingredients?.find(i => 
          i.ingredient?.name === ing.name
        )?.ingredient
        
        if (originalIngredient?.conversionFactor && originalIngredient.conversionFactor > 0) {
          return sum + (ing.calculatedQuantity * originalIngredient.conversionFactor)
        }
      }
    }
    
    return sum + ing.calculatedQuantity
  }, 0)

  const totalCost = calculatedIngredients.reduce((sum, ing) => sum + ing.totalCost, 0)
  const costPerKg = totalWeight > 0 ? (totalCost / totalWeight) * 1000 : 0

  // Copiar para área de transferência
  const copyToClipboard = () => {
    const text = `RECEITA: ${selectedRecipe?.name || 'Sem nome'}
BASE: ${flourQuantity}g de farinha

INGREDIENTES:
${calculatedIngredients.map(ing => 
  `• ${ing.name}: ${ing.calculatedQuantity} ${ing.calculatedUnit} (${ing.percentage}%)`
).join('\n')}

RESUMO:
• Peso Total: ${(totalWeight / 1000).toFixed(2)} kg
• Custo Total: R$ ${totalCost.toFixed(2)}
• Custo por Kg: R$ ${costPerKg.toFixed(2)}

Calculado em: ${new Date().toLocaleString('pt-BR')}`
    
    navigator.clipboard.writeText(text)
    showSuccess('Receita copiada para área de transferência!')
  }

  // Resetar cálculo
  const resetCalculation = () => {
    setSelectedRecipe(null)
    setFlourQuantity(1000)
    setCalculatedIngredients([])
    setSearchTerm('')
    setFilterCategory('')
    setIsDropdownOpen(false)
    showSuccess('Cálculo resetado!')
  }

  // Filtrar receitas
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !filterCategory || recipe.categoryId === filterCategory
    return matchesSearch && matchesCategory
  })

  // Selecionar receita
  const selectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe)
    setIsDropdownOpen(false)
    showSuccess(`Receita "${recipe.name}" selecionada!`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-emerald-200 rounded-full animate-spin border-t-emerald-600 mx-auto"></div>
            <Calculator className="w-8 h-8 text-emerald-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Carregando calculadora de receitas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Glassmorphism */}
        <div className="mb-8">
          <div className="bg-white/20 backdrop-blur-lg rounded-3xl border border-white/30 p-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl blur-lg opacity-75"></div>
                  <div className="relative p-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-xl">
                    <Calculator className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                    Cálculo de Receitas
                  </h1>
                  <p className="text-gray-600 mt-2 text-xl">Precisão profissional em cada ingrediente</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-emerald-600 font-medium">Sistema Inteligente de Conversão</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={resetCalculation}
                  className="group relative overflow-hidden bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-2xl flex items-center gap-3 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
                  <span className="font-semibold">Resetar</span>
                </button>
                
                {calculatedIngredients.length > 0 && (
                  <button
                    onClick={copyToClipboard}
                    className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-2xl flex items-center gap-3 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <Copy className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-semibold">Copiar Receita</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Cards de Configuração */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Seleção de Receita com Dropdown */}
          <div className="bg-white/20 backdrop-blur-lg rounded-3xl border border-white/30 p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl blur opacity-75"></div>
                <div className="relative p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Selecionar Receita</h2>
                <p className="text-gray-600">Escolha da biblioteca de fichas técnicas</p>
              </div>
            </div>

            {/* Dropdown de Receitas */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl p-4 flex items-center justify-between hover:bg-white/90 transition-all duration-300 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <Utensils className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-900 font-medium">
                    {selectedRecipe ? selectedRecipe.name : 'Selecione uma receita...'}
                  </span>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-lg border border-white/50 rounded-2xl shadow-2xl z-50 max-h-96 overflow-hidden">
                  {/* Filtros */}
                  <div className="p-4 border-b border-gray-200/50">
                    <div className="space-y-3">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar receitas..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                        />
                      </div>
                      
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      >
                        <option value="">Todas as categorias</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Lista de Receitas */}
                  <div className="max-h-64 overflow-y-auto">
                    {filteredRecipes.length > 0 ? (
                      filteredRecipes.map((recipe) => (
                        <button
                          key={recipe.id}
                          onClick={() => selectRecipe(recipe)}
                          className="w-full p-4 text-left hover:bg-emerald-50/80 transition-all duration-300 border-b border-gray-100/50 last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">{recipe.name}</h4>
                              <div className="flex items-center gap-4 text-xs text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{recipe.preparationTime}min</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Thermometer className="w-3 h-3" />
                                  <span>{recipe.ovenTemperature}°C</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Package className="w-3 h-3" />
                                  <span>{recipe.ingredients?.length || 0} ingredientes</span>
                                </div>
                              </div>
                            </div>
                            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full font-medium ml-3">
                              {recipe.category?.name}
                            </span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">Nenhuma receita encontrada</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Receita Selecionada */}
            {selectedRecipe && (
              <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 rounded-2xl border border-emerald-200/50">
                <div className="flex items-center gap-3 mb-3">
                  <Target className="w-5 h-5 text-emerald-600" />
                  <span className="font-semibold text-emerald-800">Receita Selecionada</span>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">{selectedRecipe.name}</h4>
                {selectedRecipe.description && (
                  <p className="text-gray-700 text-sm mb-3">{selectedRecipe.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{selectedRecipe.preparationTime} min</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Thermometer className="w-4 h-4" />
                    <span>{selectedRecipe.ovenTemperature}°C</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Package className="w-4 h-4" />
                    <span>{selectedRecipe.ingredients?.length || 0} ingredientes</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Configuração da Quantidade Base */}
          <div className="bg-white/20 backdrop-blur-lg rounded-3xl border border-white/30 p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl blur opacity-75"></div>
                <div className="relative p-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl">
                  <Scale className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Quantidade Base</h2>
                <p className="text-gray-600">Defina a quantidade de farinha</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Quantidade de Farinha (gramas)
                </label>
                <div className="relative">
                  <Weight className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={flourQuantity}
                    onChange={(e) => setFlourQuantity(Number(e.target.value))}
                    className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 text-lg font-semibold"
                    min="1"
                    step="1"
                    placeholder="1000"
                  />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-50/80 to-orange-50/80 rounded-2xl p-6 border border-yellow-200/50">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-5 h-5 text-yellow-600" />
                  <span className="font-semibold text-yellow-800">Multiplicador de Receita</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-800">{((flourQuantity / 1000) * 100).toFixed(1)}%</div>
                    <div className="text-sm text-yellow-700">da receita original</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-800">{(flourQuantity / 1000).toFixed(2)}x</div>
                    <div className="text-sm text-yellow-700">multiplicador</div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-yellow-100/50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-yellow-700" />
                    <span className="text-sm text-yellow-800">
                      Base: 1000g → Atual: {flourQuantity}g
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ingredientes Calculados */}
        {selectedRecipe && calculatedIngredients.length > 0 && (
          <div className="bg-white/20 backdrop-blur-lg rounded-3xl border border-white/30 overflow-hidden shadow-2xl">
            {/* Header dos Ingredientes */}
            <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <Utensils className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-white">Ingredientes Calculados</h3>
                    <p className="text-white/80 text-lg">Base: {flourQuantity}g de farinha</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white/80 text-sm">Receita</div>
                  <div className="text-white font-semibold text-lg">{selectedRecipe.name}</div>
                </div>
              </div>
            </div>

            {/* Tabela de Ingredientes */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 backdrop-blur-sm">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                      Ingrediente
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">
                      Original
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">
                      Calculado
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">
                      Porcentagem
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">
                      Preço/Kg
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">
                      Custo
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50">
                  {calculatedIngredients.map((ing, index) => (
                    <tr 
                      key={ing.id} 
                      className={`hover:bg-emerald-50/50 transition-all duration-300 ${
                        index % 2 === 0 ? 'bg-white/40' : 'bg-white/20'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="font-semibold text-gray-900">{ing.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-600">
                        {ing.originalQuantity} {ing.originalUnit}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-gray-900 text-lg">
                          {ing.calculatedQuantity} {ing.calculatedUnit}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Percent className="w-4 h-4 text-emerald-600" />
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-emerald-100 text-emerald-800">
                            {ing.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <DollarSign className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700 font-medium">
                            {ing.pricePerKg.toFixed(2)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-emerald-600 text-lg">
                          R$ {ing.totalCost.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Resumo Final */}
            <div className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 backdrop-blur-sm p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-white/60 rounded-2xl border border-white/50">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Weight className="w-6 h-6 text-gray-600" />
                    <span className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Peso Total</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{(totalWeight / 1000).toFixed(2)} kg</div>
                  <div className="text-sm text-gray-600 mt-1">{totalWeight.toFixed(0)} gramas</div>
                </div>
                
                <div className="text-center p-6 bg-emerald-50/60 rounded-2xl border border-emerald-200/50">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <DollarSign className="w-6 h-6 text-emerald-600" />
                    <span className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">Custo Total</span>
                  </div>
                  <div className="text-3xl font-bold text-emerald-600">R$ {totalCost.toFixed(2)}</div>
                  <div className="text-sm text-emerald-700 mt-1">Todos os ingredientes</div>
                </div>
                
                <div className="text-center p-6 bg-blue-50/60 rounded-2xl border border-blue-200/50">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Calculator className="w-6 h-6 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Custo por Kg</span>
                  </div>
                  <div className="text-3xl font-bold text-blue-600">R$ {costPerKg.toFixed(2)}</div>
                  <div className="text-sm text-blue-700 mt-1">Preço unitário</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mensagem quando nenhuma receita está selecionada */}
        {!selectedRecipe && (
          <div className="bg-white/20 backdrop-blur-lg rounded-3xl border border-white/30 p-16 text-center shadow-2xl">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full blur-2xl opacity-30"></div>
              <div className="relative w-32 h-32 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto">
                <Calculator className="w-16 h-16 text-emerald-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Selecione uma Receita</h3>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              Escolha uma receita da sua biblioteca de fichas técnicas para calcular os ingredientes automaticamente
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Conversão automática</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span>Precisão profissional</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>Cálculo de custos</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

