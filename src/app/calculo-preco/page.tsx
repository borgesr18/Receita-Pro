'use client'

import { DropdownPortal } from '@/components/ui/DropdownPortal'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { 
  Calculator, 
  Scale, 
  Package, 
  TrendingUp,
  RotateCcw,
  Copy,
  Info,
  History,
  Search,
  ChefHat,
  Utensils,
  Clock,
  Thermometer,
  DollarSign,
  Percent,
  Weight,
  ChevronDown,
  Sparkles,
  Target,
  ShoppingCart,
  Truck,
  Calendar,
  PieChart,
  AlertCircle,
  CheckCircle,
  TrendingDown
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

interface Category {
  id: string
  name: string
}

interface CalculationHistory {
  id: string
  custo: number
  peso: number
  lucro: number
  precoFinal: number
  createdAt: string
}

export default function CalculoPreco() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  
  // REF PARA O BOTÃO DO DROPDOWN
  const dropdownButtonRef = useRef<HTMLButtonElement>(null)
  
  // DADOS DA RECEITA ORIGINAL (para cálculo proporcional)
  const [originalRecipeData, setOriginalRecipeData] = useState<{
    totalCost: number
    totalWeight: number
  } | null>(null)
  
  // CAMPOS COMO STRING PARA MELHOR UX (SEM MOSTRAR 0)
  const [formData, setFormData] = useState({
    productName: '',
    finalWeight: '',
    recipeCost: '',
    desiredProfit: '50',
    packagingCost: '',
    extraCosts: '',
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

  const [calculationHistory, setCalculationHistory] = useState<CalculationHistory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const { showSuccess, showError } = useToast()

  // Função para converter qualquer unidade para gramas/ml
  const convertToGrams = useCallback((quantity: number, ingredient: any, unit: any): number => {
    if (!quantity || quantity <= 0) return 0
    if (!ingredient || !unit) return quantity

    const unitName = unit?.name?.toLowerCase() || ''
    const unitSymbol = unit?.symbol?.toLowerCase() || ''
    
    // Gramas e mililitros (base)
    if (unitName.includes('grama') || unitSymbol === 'g' ||
        unitName.includes('ml') || unitSymbol === 'ml') {
      return quantity
    }
    
    // Quilogramas
    if (unitName.includes('kg') || unitName.includes('quilograma') || unitSymbol === 'kg') {
      return quantity * 1000
    }

    // Litros
    if (unitName.includes('litro') || unitSymbol === 'l') {
      return quantity * 1000
    }
    
    // Unidades com fator de conversão
    if (unitName.includes('unidade') || unitSymbol === 'un') {
      if (ingredient?.conversionFactor && ingredient.conversionFactor > 0) {
        return quantity * ingredient.conversionFactor
      }
      
      const ingredientName = ingredient?.name?.toLowerCase() || ''
      if (ingredientName.includes('ovo')) {
        return quantity * 50 // 1 ovo = 50g
      }
      
      return quantity * 100 // Padrão para unidades
    }

    return quantity
  }, [])

  // Calcular custo total da receita
  const calculateRecipeCost = useCallback((recipe: Recipe): { totalCost: number, totalWeight: number } => {
    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      return { totalCost: 0, totalWeight: 0 }
    }

    let totalCost = 0
    let totalWeight = 0

    recipe.ingredients.forEach(ing => {
      const ingredient = ing.ingredient
      const unit = ing.unit
      
      if (!ingredient || !unit || !ing.quantity) return

      try {
        const quantityInGrams = convertToGrams(ing.quantity, ingredient, unit)
        const pricePerGram = (ingredient.pricePerUnit || 0) / 1000
        const ingredientCost = quantityInGrams * pricePerGram

        if (!isNaN(ingredientCost) && isFinite(ingredientCost)) {
          totalCost += ingredientCost
        }
        
        if (!isNaN(quantityInGrams) && isFinite(quantityInGrams)) {
          totalWeight += quantityInGrams
        }
      } catch (error) {
        console.error('Erro ao calcular ingrediente:', ing, error)
      }
    })

    return { 
      totalCost: Math.round(totalCost * 100) / 100,
      totalWeight: Math.round(totalWeight)
    }
  }, [convertToGrams])

  // CÁLCULO PROPORCIONAL DO CUSTO DA RECEITA
  const calculateProportionalCost = useCallback((desiredWeight: number): number => {
    if (!originalRecipeData || !desiredWeight || desiredWeight <= 0) {
      return 0
    }

    const { totalCost, totalWeight } = originalRecipeData
    
    if (totalWeight <= 0) return 0

    // Calcular proporção: peso desejado / peso original
    const proportion = desiredWeight / totalWeight
    const proportionalCost = totalCost * proportion

    console.log('🧮 Cálculo proporcional:', {
      pesoOriginal: totalWeight,
      custoOriginal: totalCost,
      pesoDesejado: desiredWeight,
      proporcao: proportion,
      custoCalculado: proportionalCost
    })

    return Math.round(proportionalCost * 100) / 100
  }, [originalRecipeData])

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
      
      await fetchCalculationHistory()
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

  // Atualizar dados quando receita é selecionada
  useEffect(() => {
    if (selectedRecipe) {
      const recipeData = calculateRecipeCost(selectedRecipe)
      
      // Salvar dados originais da receita
      setOriginalRecipeData(recipeData)
      
      setFormData(prev => ({
        ...prev,
        productName: selectedRecipe.name,
        finalWeight: recipeData.totalWeight.toString(),
        recipeCost: recipeData.totalCost.toFixed(2)
      }))

      console.log('📋 Receita selecionada:', {
        nome: selectedRecipe.name,
        pesoOriginal: recipeData.totalWeight,
        custoOriginal: recipeData.totalCost
      })
    }
  }, [selectedRecipe, calculateRecipeCost])

  // CÁLCULO PROPORCIONAL QUANDO PESO É ALTERADO
  useEffect(() => {
    if (originalRecipeData && formData.finalWeight && selectedRecipe) {
      const desiredWeight = parseFloat(formData.finalWeight) || 0
      
      if (desiredWeight > 0) {
        const proportionalCost = calculateProportionalCost(desiredWeight)
        
        // Atualizar apenas o custo da receita se for diferente
        if (proportionalCost !== parseFloat(formData.recipeCost)) {
          setFormData(prev => ({
            ...prev,
            recipeCost: proportionalCost.toFixed(2)
          }))

          console.log('🔄 Custo atualizado proporcionalmente:', {
            pesoNovo: desiredWeight,
            custoNovo: proportionalCost
          })
        }
      }
    }
  }, [formData.finalWeight, originalRecipeData, selectedRecipe, calculateProportionalCost])

  // CÁLCULO AUTOMÁTICO EM TEMPO REAL
  useEffect(() => {
    const finalWeight = parseFloat(formData.finalWeight) || 0
    const recipeCost = parseFloat(formData.recipeCost) || 0
    const packagingCost = parseFloat(formData.packagingCost) || 0
    const extraCosts = parseFloat(formData.extraCosts) || 0
    const desiredProfit = parseFloat(formData.desiredProfit) || 0

    console.log('🔄 Recalculando resultados:', { finalWeight, recipeCost, packagingCost, extraCosts, desiredProfit })

    // Só calcular se tiver dados mínimos
    if (finalWeight > 0 && recipeCost >= 0) {
      const totalCost = recipeCost + packagingCost + extraCosts
      const costPerGram = finalWeight > 0 ? totalCost / finalWeight : 0
      const profitAmount = totalCost * (desiredProfit / 100)
      const suggestedPrice = totalCost + profitAmount
      const markup = totalCost > 0 ? ((suggestedPrice - totalCost) / totalCost) * 100 : 0
      const pricePerPortion = finalWeight > 0 ? suggestedPrice / finalWeight : 0

      const newResults = {
        costPerGram: costPerGram * 1000, // Converter para custo por kg
        totalCost,
        suggestedPrice,
        markup,
        pricePerPortion: pricePerPortion * 1000, // Converter para preço por kg
        profitAmount
      }

      console.log('✅ Resultados calculados:', newResults)
      setResults(newResults)
    } else {
      console.log('❌ Dados insuficientes para cálculo')
      setResults({
        costPerGram: 0,
        totalCost: 0,
        suggestedPrice: 0,
        markup: 0,
        pricePerPortion: 0,
        profitAmount: 0
      })
    }
  }, [formData.finalWeight, formData.recipeCost, formData.packagingCost, formData.extraCosts, formData.desiredProfit])

  const fetchCalculationHistory = async () => {
    try {
      const response = await api.get('/api/calculo-preco/historico')
      if (response.data) {
        setCalculationHistory(response.data)
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

  const salesChannels = [
    { value: 'varejo', label: 'Varejo', description: 'Venda direta ao consumidor', margin: '50-80%', icon: ShoppingCart },
    { value: 'atacado', label: 'Atacado', description: 'Venda para revendedores', margin: '20-40%', icon: Package },
    { value: 'delivery', label: 'Delivery', description: 'Entrega em domicílio', margin: '60-90%', icon: Truck },
    { value: 'eventos', label: 'Eventos', description: 'Vendas para eventos', margin: '60-100%', icon: Calendar }
  ]

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.productName.trim()) {
      newErrors.productName = 'Nome do produto é obrigatório'
    }

    const finalWeight = parseFloat(formData.finalWeight) || 0
    if (finalWeight <= 0) {
      newErrors.finalWeight = 'Peso deve ser maior que zero'
    }

    const recipeCost = parseFloat(formData.recipeCost) || 0
    if (recipeCost < 0) {
      newErrors.recipeCost = 'Custo não pode ser negativo'
    }

    const desiredProfit = parseFloat(formData.desiredProfit) || 0
    if (desiredProfit < 0 || desiredProfit > 1000) {
      newErrors.desiredProfit = 'Lucro deve estar entre 0% e 1000%'
    }

    const packagingCost = parseFloat(formData.packagingCost) || 0
    if (packagingCost < 0) {
      newErrors.packagingCost = 'Custo de embalagem não pode ser negativo'
    }

    const extraCosts = parseFloat(formData.extraCosts) || 0
    if (extraCosts < 0) {
      newErrors.extraCosts = 'Custos extras não podem ser negativos'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const saveToHistory = () => {
    if (!validateForm()) {
      showError('Por favor, corrija os erros no formulário')
      return
    }

    if (results.suggestedPrice > 0) {
      saveCalculation({
        custo: results.totalCost,
        peso: parseFloat(formData.finalWeight) || 0,
        lucro: parseFloat(formData.desiredProfit) || 0,
        precoFinal: results.suggestedPrice
      })
    }
  }

  const resetForm = () => {
    setFormData({
      productName: '',
      finalWeight: '',
      recipeCost: '',
      desiredProfit: '50',
      packagingCost: '',
      extraCosts: '',
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
    setSelectedRecipe(null)
    setOriginalRecipeData(null)
    setSearchTerm('')
    setFilterCategory('')
    setIsDropdownOpen(false)
    setErrors({})
    showSuccess('Formulário resetado!')
  }

  const copyResults = () => {
    const text = `CÁLCULO DE PREÇO - ${formData.productName}

DADOS:
• Peso Final: ${formData.finalWeight}g
• Custo da Receita: R$ ${formData.recipeCost}
• Custo Embalagem: R$ ${formData.packagingCost || '0.00'}
• Custos Extras: R$ ${formData.extraCosts || '0.00'}
• Margem de Lucro: ${formData.desiredProfit}%
• Canal de Venda: ${salesChannels.find(c => c.value === formData.salesChannel)?.label}

RESULTADOS:
• Custo Total: R$ ${results.totalCost.toFixed(2)}
• Valor do Lucro: R$ ${results.profitAmount.toFixed(2)}
• Preço Sugerido: R$ ${results.suggestedPrice.toFixed(2)}
• Markup: ${results.markup.toFixed(1)}%
• Custo por Grama: R$ ${results.costPerGram.toFixed(4)}
• Preço por Grama: R$ ${results.pricePerPortion.toFixed(4)}

Calculado em: ${new Date().toLocaleString('pt-BR')}`
    
    navigator.clipboard.writeText(text)
    showSuccess('Cálculo copiado para área de transferência!')
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

  // Análise de margem
  const getMarginAnalysis = () => {
    if (results.markup === 0) return { color: 'gray', text: 'Não calculado', icon: Calculator }
    if (results.markup < 20) return { color: 'red', text: 'Margem baixa', icon: TrendingDown }
    if (results.markup < 40) return { color: 'yellow', text: 'Margem moderada', icon: AlertCircle }
    return { color: 'green', text: 'Margem excelente', icon: CheckCircle }
  }

  const marginAnalysis = getMarginAnalysis()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600 mx-auto"></div>
            <Calculator className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Carregando calculadora de preços...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Glassmorphism */}
        <div className="mb-8">
          <div className="bg-white/20 backdrop-blur-lg rounded-3xl border border-white/30 p-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur-lg opacity-75"></div>
                  <div className="relative p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-xl">
                    <Calculator className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                    Cálculo de Preço
                  </h1>
                  <p className="text-gray-600 mt-2 text-xl">Precificação inteligente e rentável</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-blue-600 font-medium">Cálculo Proporcional Automático</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={resetForm}
                  className="group relative overflow-hidden bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-2xl flex items-center gap-3 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
                  <span className="font-semibold">Resetar</span>
                </button>
                
                {results.suggestedPrice > 0 && (
                  <>
                    <button
                      onClick={saveToHistory}
                      className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-2xl flex items-center gap-3 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                      <History className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                      <span className="font-semibold">Salvar</span>
                    </button>
                    
                    <button
                      onClick={copyResults}
                      className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-2xl flex items-center gap-3 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                      <Copy className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                      <span className="font-semibold">Copiar</span>
                    </button>
                  </>
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
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl blur opacity-75"></div>
                <div className="relative p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Selecionar Receita</h2>
                <p className="text-gray-600">Escolha da biblioteca de fichas técnicas</p>
              </div>
            </div>

            {/* Dropdown de Receitas com Z-INDEX ALTO */}
            <div className="relative z-50">
              <button
                ref={dropdownButtonRef}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full p-4 bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl hover:bg-white/90 transition-all duration-300 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <Utensils className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-900 font-medium">
                    {selectedRecipe ? selectedRecipe.name : 'Selecione uma receita...'}
                  </span>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* DROPDOWN PORTAL */}
              <DropdownPortal
                isOpen={isDropdownOpen}
                anchorRef={dropdownButtonRef}
                searchTerm={searchTerm}
                filterCategory={filterCategory}
                onSearch={setSearchTerm}
                onCategoryChange={setFilterCategory}
                recipes={filteredRecipes}
                categories={categories}
                onSelect={selectRecipe}
                onClose={() => setIsDropdownOpen(false)}
                calculateRecipeData={calculateRecipeCost}
                loading={loading}
              />
            </div>

            {/* Receita Selecionada */}
            {selectedRecipe && originalRecipeData && (
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
                <div className="mt-3 p-3 bg-emerald-100/50 rounded-xl">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-emerald-700">Peso original:</span>
                      <div className="font-bold text-emerald-800">{originalRecipeData.totalWeight}g</div>
                    </div>
                    <div>
                      <span className="text-emerald-700">Custo original:</span>
                      <div className="font-bold text-emerald-800">R$ {originalRecipeData.totalCost.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-emerald-200">
                    <div className="flex items-center gap-2 text-xs text-emerald-700">
                      <Sparkles className="w-3 h-3" />
                      <span>Custo será calculado proporcionalmente ao peso</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dados do Produto */}
          <div className="bg-white/20 backdrop-blur-lg rounded-3xl border border-white/30 p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl blur opacity-75"></div>
                <div className="relative p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl">
                  <Package className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Dados do Produto</h2>
                <p className="text-gray-600">Informações básicas para cálculo</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Nome do Produto
                </label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                  className={`w-full px-4 py-4 bg-white/80 backdrop-blur-sm border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-lg ${
                    errors.productName ? 'border-red-500' : 'border-white/50'
                  }`}
                  placeholder="Ex: Bolo de Chocolate Premium"
                />
                {errors.productName && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.productName}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Peso Final (gramas)
                  </label>
                  <div className="relative">
                    <Weight className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      value={formData.finalWeight}
                      onChange={(e) => setFormData(prev => ({ ...prev, finalWeight: e.target.value }))}
                      className={`w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-lg ${
                        errors.finalWeight ? 'border-red-500' : 'border-white/50'
                      }`}
                      min="0"
                      step="1"
                      placeholder="1000"
                    />
                  </div>
                  {errors.finalWeight && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.finalWeight}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Custo da Receita (R$)
                    {selectedRecipe && (
                      <span className="ml-2 text-xs text-blue-600 font-normal">
                      
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <DollarSign className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      value={formData.recipeCost}
                      onChange={(e) => setFormData(prev => ({ ...prev, recipeCost: e.target.value }))}
                      className={`w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-lg ${
                        errors.recipeCost ? 'border-red-500' : 'border-white/50'
                      } ${selectedRecipe ? 'bg-blue-50/50' : ''}`}
                      min="0"
                      step="0.01"
                      placeholder="8.75"
                      readOnly={!!selectedRecipe}
                    />
                  </div>
                  {errors.recipeCost && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.recipeCost}
                    </p>
                  )}
                  {selectedRecipe && (
                    <p className="mt-2 text-sm text-blue-600 flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      Campo calculado automaticamente baseado no peso.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custos Adicionais e Margem */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Custos Adicionais */}
          <div className="bg-white/20 backdrop-blur-lg rounded-3xl border border-white/30 p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl blur opacity-75"></div>
                <div className="relative p-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl">
                  <Scale className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Custos Adicionais</h2>
                <p className="text-gray-600">Embalagem e outros custos</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Custo de Embalagem (R$)
                </label>
                <div className="relative">
                  <Package className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={formData.packagingCost}
                    onChange={(e) => setFormData(prev => ({ ...prev, packagingCost: e.target.value }))}
                    className={`w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-lg ${
                      errors.packagingCost ? 'border-red-500' : 'border-white/50'
                    }`}
                    min="0"
                    step="0.01"
                    placeholder="0.50"
                  />
                </div>
                {errors.packagingCost && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.packagingCost}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Custos Extras (R$)
                </label>
                <div className="relative">
                  <TrendingUp className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={formData.extraCosts}
                    onChange={(e) => setFormData(prev => ({ ...prev, extraCosts: e.target.value }))}
                    className={`w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-lg ${
                      errors.extraCosts ? 'border-red-500' : 'border-white/50'
                    }`}
                    min="0"
                    step="0.01"
                    placeholder="1.00"
                  />
                </div>
                {errors.extraCosts && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.extraCosts}
                  </p>
                )}
              </div>

              <div className="bg-gradient-to-r from-yellow-50/80 to-orange-50/80 rounded-2xl p-6 border border-yellow-200/50">
                <div className="flex items-center gap-3 mb-4">
                  <Info className="w-5 h-5 text-yellow-600" />
                  <span className="font-semibold text-yellow-800">Custo Total</span>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-800">
                    R$ {results.totalCost.toFixed(2)}
                  </div>
                  <div className="text-sm text-yellow-700 mt-1">Receita + Embalagem + Extras</div>
                </div>
              </div>
            </div>
          </div>

          {/* Margem e Canal de Venda */}
          <div className="bg-white/20 backdrop-blur-lg rounded-3xl border border-white/30 p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl blur opacity-75"></div>
                <div className="relative p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Margem e Canal</h2>
                <p className="text-gray-600">Lucro desejado e canal de venda</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Margem de Lucro (%)
                </label>
                <div className="relative">
                  <Percent className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={formData.desiredProfit}
                    onChange={(e) => setFormData(prev => ({ ...prev, desiredProfit: e.target.value }))}
                    className={`w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-lg ${
                      errors.desiredProfit ? 'border-red-500' : 'border-white/50'
                    }`}
                    min="0"
                    max="1000"
                    step="1"
                    placeholder="50"
                  />
                </div>
                {errors.desiredProfit && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.desiredProfit}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Canal de Venda
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {salesChannels.map((channel) => {
                    const IconComponent = channel.icon
                    return (
                      <button
                        key={channel.value}
                        onClick={() => setFormData(prev => ({ ...prev, salesChannel: channel.value }))}
                        className={`p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                          formData.salesChannel === channel.value
                            ? 'border-blue-500 bg-blue-50/80 shadow-lg'
                            : 'border-gray-200 bg-white/50 hover:border-blue-300 hover:bg-blue-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <IconComponent className={`w-5 h-5 ${
                            formData.salesChannel === channel.value ? 'text-blue-600' : 'text-gray-500'
                          }`} />
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">{channel.label}</div>
                            <div className="text-sm text-gray-600">{channel.description}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-gray-900">{channel.margin}</div>
                            <div className="text-xs text-gray-600">margem típica</div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resultados */}
        {results.suggestedPrice > 0 && (
          <div className="bg-white/20 backdrop-blur-lg rounded-3xl border border-white/30 overflow-hidden shadow-2xl mb-8">
            {/* Header dos Resultados */}
            <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <PieChart className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-white">Resultados do Cálculo</h3>
                    <p className="text-white/80 text-lg">{formData.productName}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Sparkles className="w-4 h-4 text-white/80" />
                      <span className="text-white/80 text-sm">Calculado automaticamente em tempo real</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white/80 text-sm">Canal</div>
                  <div className="text-white font-semibold text-lg">
                    {salesChannels.find(c => c.value === formData.salesChannel)?.label}
                  </div>
                </div>
              </div>
            </div>

            {/* Cards de Resultados */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-gradient-to-br from-green-50/60 to-emerald-50/60 rounded-2xl border border-green-200/50">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <DollarSign className="w-6 h-6 text-green-600" />
                    <span className="text-sm font-semibold text-green-600 uppercase tracking-wider">Custo Total</span>
                  </div>
                  <div className="text-3xl font-bold text-green-600">R$ {results.totalCost.toFixed(2)}</div>
                  <div className="text-sm text-green-700 mt-1">Receita + Embalagem + Extras</div>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-blue-50/60 to-indigo-50/60 rounded-2xl border border-blue-200/50">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Valor do Lucro</span>
                  </div>
                  <div className="text-3xl font-bold text-blue-600">R$ {results.profitAmount.toFixed(2)}</div>
                  <div className="text-sm text-blue-700 mt-1">{formData.desiredProfit}% de margem</div>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-purple-50/60 to-pink-50/60 rounded-2xl border border-purple-200/50">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Target className="w-6 h-6 text-purple-600" />
                    <span className="text-sm font-semibold text-purple-600 uppercase tracking-wider">Preço Sugerido</span>
                  </div>
                  <div className="text-4xl font-bold text-purple-600">R$ {results.suggestedPrice.toFixed(2)}</div>
                  <div className="text-sm text-purple-700 mt-1">Preço final de venda</div>
                </div>
              </div>

              {/* Análise Detalhada */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-br from-gray-50/60 to-gray-100/60 rounded-2xl border border-gray-200/50">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Scale className="w-5 h-5" />
                    Análise por Peso
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Custo por grama:</span>
                      <span className="font-semibold">R$ {results.costPerGram.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Preço por grama:</span>
                      <span className="font-semibold">R$ {results.pricePerPortion.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Peso total:</span>
                      <span className="font-semibold">{formData.finalWeight}g</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-yellow-50/60 to-orange-50/60 rounded-2xl border border-yellow-200/50">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Análise de Margem
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Markup:</span>
                      <div className="flex items-center gap-2">
                        <marginAnalysis.icon className={`w-4 h-4 text-${marginAnalysis.color}-600`} />
                        <span className="font-semibold">{results.markup.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-semibold text-${marginAnalysis.color}-600`}>
                        {marginAnalysis.text}
                      </span>
                    </div>
                    <div className="mt-4 p-3 bg-yellow-100/50 rounded-xl">
                      <div className="text-xs text-yellow-800">
                        <strong>Dica:</strong> Para {formData.salesChannel}, margem típica é{' '}
                        {salesChannels.find(c => c.value === formData.salesChannel)?.margin}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Histórico */}
        {calculationHistory.length > 0 && (
          <div className="bg-white/20 backdrop-blur-lg rounded-3xl border border-white/30 overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-gray-600 to-gray-700 p-6">
              <div className="flex items-center gap-3">
                <History className="w-6 h-6 text-white" />
                <h3 className="text-xl font-bold text-white">Histórico de Cálculos</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {calculationHistory.slice(0, 6).map((calc) => (
                  <div key={calc.id} className="p-4 bg-white/50 rounded-xl border border-gray-200/50">
                    <div className="text-sm text-gray-600 mb-2">
                      {new Date(calc.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Custo:</span>
                        <span className="font-semibold">R$ {calc.custo.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Peso:</span>
                        <span className="font-semibold">{calc.peso}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Lucro:</span>
                        <span className="font-semibold">{calc.lucro}%</span>
                      </div>
                      <div className="flex justify-between border-t pt-1">
                        <span>Preço:</span>
                        <span className="font-bold text-blue-600">R$ {calc.precoFinal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mensagem quando nenhuma receita está selecionada */}
        {!selectedRecipe && (
          <div className="bg-white/20 backdrop-blur-lg rounded-3xl border border-white/30 p-16 text-center shadow-2xl">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-2xl opacity-30"></div>
              <div className="relative w-32 h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Calculator className="w-16 h-16 text-blue-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Selecione uma Receita</h3>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              Escolha uma receita da sua biblioteca de fichas técnicas para calcular o preço automaticamente
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Cálculo proporcional</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span>Precificação inteligente</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>Análise de margem</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

