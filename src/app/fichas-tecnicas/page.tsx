'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  BookOpen,
  Utensils,
  ChefHat,
  Search,
  Filter,
  Grid3X3,
  List,
  Clock,
  Users,
  Star,
  Package
} from 'lucide-react'
import { api } from '@/lib/api'

interface Recipe {
  id: string
  name: string
  description: string
  categoryId: string
  category?: {
    id: string
    name: string
  }
  servings: number
  prepTime: number
  cookTime: number
  difficulty: string
  instructions: string
  observations: string
  ingredients: RecipeIngredient[]
  createdAt: string
  updatedAt: string
}

interface RecipeIngredient {
  id: string
  ingredientId: string
  quantity: number
  unitId: string
  percentage: number
  ingredient?: {
    id: string
    name: string
    conversionFactor?: number
    baseUnit?: string
  }
  unit?: {
    id: string
    name: string
    symbol: string
  }
}

interface Ingredient {
  id: string
  name: string
  conversionFactor?: number
  baseUnit?: string
  unit?: {
    id: string
    name: string
    symbol: string
  }
}

interface Unit {
  id: string
  name: string
  symbol: string
  type: string
}

interface Category {
  id: string
  name: string
}

export default function FichasTecnicas() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('info')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [baseIngredientIndex, setBaseIngredientIndex] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    servings: 1,
    prepTime: 0,
    cookTime: 0,
    difficulty: 'Fácil',
    instructions: '',
    observations: '',
    ingredients: [] as RecipeIngredient[]
  })

  // Função para encontrar ingrediente base (farinha)
  const findBaseIngredient = (ingredientsList: typeof formData.ingredients) => {
    console.log('🔍 Procurando ingrediente base...')
    console.log('📊 Lista de ingredientes:', ingredientsList.length)

    // Se há seleção manual, usar ela
    if (baseIngredientIndex !== null && ingredientsList[baseIngredientIndex]) {
      const ingredient = ingredientsList[baseIngredientIndex]
      console.log('👆 Ingrediente base selecionado manualmente:', baseIngredientIndex)
      return { ingredient, index: baseIngredientIndex }
    }

    // Buscar farinha automaticamente
    for (let i = 0; i < ingredientsList.length; i++) {
      const recipeIngredient = ingredientsList[i]
      const ingredient = ingredients.find(ing => ing.id === recipeIngredient.ingredientId)
      
      if (!ingredient) continue

      console.log(`🔍 Verificando ingrediente ${i + 1}:`, {
        name: ingredient.name,
        id: ingredient.id
      })

      // Lista expandida de termos para identificar farinha
      const flourTerms = [
        'farinha', 'flour', 'farine', 'harina', 'wheat', 'trigo',
        'integral', 'refinada', 'especial', 'tipo 1', 'tipo 2'
      ]

      const name = ingredient.name.toLowerCase()
      const isFlour = flourTerms.some(term => name.includes(term))

      if (isFlour) {
        console.log('🌾 Farinha encontrada automaticamente:', ingredient.name)
        return { ingredient: recipeIngredient, index: i }
      }
    }

    // Fallback: primeiro ingrediente com quantidade > 0
    const firstValidIngredient = ingredientsList.find((ing) => {
      return ing.quantity > 0
    })

    if (firstValidIngredient) {
      const index = ingredientsList.indexOf(firstValidIngredient)
      console.log('📦 Usando primeiro ingrediente como base:', index)
      return { ingredient: firstValidIngredient, index }
    }

    console.log('❌ Nenhum ingrediente base encontrado')
    return null
  }

  // Função para converter quantidade para gramas
  const convertToGrams = async (quantity: number, ingredientId: string, unitId: string) => {
    console.log('🔄 Convertendo para gramas:', { 
      quantity, 
      ingredientId, 
      unitId 
    })

    try {
      // Buscar dados completos do ingrediente
      const ingredientRes = await api.get(`/ingredients/${ingredientId}`)
      const ingredient = ingredientRes.data as {
        name: string;
        conversionFactor?: number;
        baseUnit?: string;
      }
      
      // Buscar dados da unidade
      const unitRes = await api.get(`/measurement-units`)
      const unit = Array.isArray(unitRes.data) ? unitRes.data.find((u: any) => u.id === unitId) : null

      console.log('📊 Dados do ingrediente:', {
        name: ingredient.name,
        conversionFactor: ingredient.conversionFactor,
        baseUnit: ingredient.baseUnit
      })
      
      console.log('📊 Dados da unidade:', {
        name: unit?.name,
        symbol: unit?.symbol,
        type: unit?.type
      })

      if (!unit) {
        console.log('⚠️ Unidade não encontrada, assumindo gramas')
        return quantity
      }

      // Se já está em gramas
      if (unit.name?.toLowerCase().includes('grama') || unit.symbol?.toLowerCase() === 'g') {
        console.log('✅ Já em gramas:', quantity)
        return quantity
      }
      
      // Se está em kg
      if (unit.name?.toLowerCase().includes('kg') || unit.symbol?.toLowerCase() === 'kg' || 
          unit.name?.toLowerCase().includes('quilograma')) {
        const result = quantity * 1000
        console.log('✅ Convertido de kg para gramas:', result)
        return result
      }
      
      // Se é unidade (ovos, latas, etc.) e tem fator de conversão
      if ((unit.name?.toLowerCase().includes('unidade') || unit.symbol?.toLowerCase() === 'un') && 
          ingredient.conversionFactor) {
        const result = quantity * ingredient.conversionFactor
        console.log('✅ Convertido usando fator específico:', {
          quantidade: quantity,
          fator: ingredient.conversionFactor,
          resultado: result
        })
        return result
      }
      
      // Fallback: usar fator de conversão se disponível
      if (ingredient.conversionFactor && ingredient.conversionFactor > 0) {
        const result = quantity * ingredient.conversionFactor
        console.log('✅ Convertido usando fator de conversão:', result)
        return result
      }
      
      console.log('⚠️ Fallback: assumindo gramas:', quantity)
      return quantity
      
    } catch (error) {
      console.error('❌ Erro ao buscar dados para conversão:', error)
      return quantity
    }
  }

  // Função para calcular porcentagens automaticamente
  const calculatePercentages = async (updatedIngredients: typeof formData.ingredients) => {
    console.log('🧮 Iniciando cálculo de porcentagens...')
    console.log('📊 Ingredientes da receita:', updatedIngredients.length)

    // Encontra ingrediente base
    const baseResult = findBaseIngredient(updatedIngredients)
    
    if (!baseResult) {
      console.log('❌ Nenhum ingrediente base encontrado')
      return updatedIngredients
    }

    const { ingredient: baseIngredient, index: baseIndex } = baseResult

    try {
      // Converter ingrediente base para gramas
      const baseGrams = await convertToGrams(
        baseIngredient.quantity, 
        baseIngredient.ingredientId, 
        baseIngredient.unitId
      )

      console.log('🌾 Ingrediente base em gramas:', {
        quantidade: baseIngredient.quantity,
        gramas: baseGrams
      })

      if (baseGrams <= 0) {
        console.log('❌ Quantidade base inválida')
        return updatedIngredients
      }

      // Calcular porcentagens para todos os ingredientes
      const updatedWithPercentages = await Promise.all(
        updatedIngredients.map(async (ing, index) => {
          if (ing.quantity <= 0) {
            return { ...ing, percentage: 0 }
          }

          // Converter ingrediente atual para gramas
          const gramsQuantity = await convertToGrams(
            ing.quantity,
            ing.ingredientId,
            ing.unitId
          )

          // Calcular porcentagem baseada na farinha
          const percentage = index === baseIndex ? 100 : (gramsQuantity / baseGrams) * 100

          console.log('📊 Calculando porcentagem:', {
            ingrediente: ing.ingredientId,
            quantidade: ing.quantity,
            gramas: gramsQuantity,
            porcentagem: percentage.toFixed(2)
          })

          return {
            ...ing,
            percentage: Math.round(percentage * 100) / 100 // 2 casas decimais
          }
        })
      )

      console.log('✅ Cálculo de porcentagens concluído')
      return updatedWithPercentages

    } catch (error) {
      console.error('❌ Erro no cálculo de porcentagens:', error)
      return updatedIngredients
    }
  }

  // Carregar dados com useCallback
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      console.log('🔄 Carregando dados...')
      
      const [recipesRes, categoriesRes, ingredientsRes, unitsRes] = await Promise.all([
        api.get('/recipes'),
        api.get('/recipe-categories'),
        api.get('/ingredients'),
        api.get('/measurement-units')
      ])

      console.log('✅ Dados carregados:', {
        recipes: Array.isArray(recipesRes.data) ? recipesRes.data.length : 0,
        categories: Array.isArray(categoriesRes.data) ? categoriesRes.data.length : 0,
        ingredients: Array.isArray(ingredientsRes.data) ? ingredientsRes.data.length : 0,
        units: Array.isArray(unitsRes.data) ? unitsRes.data.length : 0
      })

      setRecipes(Array.isArray(recipesRes.data) ? recipesRes.data : [])
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : [])
      setIngredients(Array.isArray(ingredientsRes.data) ? ingredientsRes.data : [])
      setUnits(Array.isArray(unitsRes.data) ? unitsRes.data : [])
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      categoryId: '',
      servings: 1,
      prepTime: 0,
      cookTime: 0,
      difficulty: 'Fácil',
      instructions: '',
      observations: '',
      ingredients: []
    })
    setEditingId(null)
    setActiveTab('info')
    setBaseIngredientIndex(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const payload = {
        ...formData,
        servings: Number(formData.servings),
        prepTime: Number(formData.prepTime),
        cookTime: Number(formData.cookTime)
      }

      if (editingId) {
        await api.put(`/recipes/${editingId}`, payload)
      } else {
        await api.post('/recipes', payload)
      }

      await loadData()
      setIsModalOpen(false)
      resetForm()
    } catch (error) {
      console.error('Erro ao salvar receita:', error)
    }
  }

  const handleEdit = (item: Recipe) => {
    setFormData({
      name: item.name,
      description: item.description,
      categoryId: item.categoryId,
      servings: item.servings,
      prepTime: item.prepTime,
      cookTime: item.cookTime,
      difficulty: item.difficulty,
      instructions: item.instructions,
      observations: item.observations,
      ingredients: item.ingredients || []
    })
    setEditingId(item.id)
    setIsModalOpen(true)
    
    // Detectar ingrediente base automaticamente
    const baseResult = findBaseIngredient(item.ingredients || [])
    setBaseIngredientIndex(baseResult?.index ?? null)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta receita?')) {
      try {
        await api.delete(`/recipes/${id}`)
        await loadData()
      } catch (error) {
        console.error('Erro ao excluir receita:', error)
      }
    }
  }

  const addIngredient = () => {
    const newIngredient: RecipeIngredient = {
      id: Date.now().toString(),
      ingredientId: '',
      quantity: 0,
      unitId: '',
      percentage: 0
    }
    
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, newIngredient]
    }))
  }

  const updateIngredient = async (index: number, field: string, value: any) => {
    console.log('🔄 Atualizando ingrediente:', { index, field, value })
    
    const updatedIngredients = formData.ingredients.map((ing, i) => 
      i === index ? { ...ing, [field]: value } : ing
    )
    
    if (field === 'quantity' || field === 'ingredientId' || field === 'unitId') {
      console.log('🧮 Recalculando porcentagens...')
      const recalculatedIngredients = await calculatePercentages(updatedIngredients)
      setFormData(prev => ({ ...prev, ingredients: recalculatedIngredients }))
    } else {
      setFormData(prev => ({ ...prev, ingredients: updatedIngredients }))
    }
  }

  const removeIngredient = async (index: number) => {
    const updatedIngredients = formData.ingredients.filter((_, i) => i !== index)
    const recalculatedIngredients = await calculatePercentages(updatedIngredients)
    setFormData(prev => ({ ...prev, ingredients: recalculatedIngredients }))
  }

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !filterCategory || recipe.categoryId === filterCategory
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <ChefHat className="w-16 h-16 text-blue-600 mx-auto animate-bounce" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          </div>
          <p className="text-gray-600 mt-4 text-lg font-medium">Carregando fichas técnicas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Moderno */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Fichas Técnicas
                </h1>
                <p className="text-gray-600 mt-1 text-lg">Gerencie suas receitas com precisão profissional</p>
              </div>
            </div>
            
            <button
              onClick={() => {
                resetForm()
                setIsModalOpen(true)
              }}
              className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-semibold">Nova Ficha Técnica</span>
            </button>
          </div>
        </div>

        {/* Filtros e Controles Modernos */}
        <div className="mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar receitas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80"
                />
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 min-w-[200px]"
                >
                  <option value="">Todas as categorias</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'grid' 
                      ? 'bg-white shadow-md text-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'list' 
                      ? 'bg-white shadow-md text-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Receitas */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <div key={recipe.id} className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl">
                      <Utensils className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors duration-300">
                        {recipe.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {categories.find(c => c.id === recipe.categoryId)?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(recipe)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 hover:scale-110"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(recipe.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 hover:scale-110"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2">{recipe.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{recipe.servings} porções</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{recipe.prepTime + recipe.cookTime}min</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nome</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Categoria</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Porções</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tempo</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRecipes.map((recipe) => (
                    <tr key={recipe.id} className="hover:bg-blue-50/50 transition-colors duration-300">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg">
                            <Utensils className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{recipe.name}</div>
                            <div className="text-sm text-gray-500 line-clamp-1">{recipe.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {categories.find(c => c.id === recipe.categoryId)?.name}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{recipe.servings}</td>
                      <td className="px-6 py-4 text-gray-600">{recipe.prepTime + recipe.cookTime}min</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(recipe)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(recipe.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredRecipes.length === 0 && (
          <div className="text-center py-12">
            <div className="p-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Nenhuma receita encontrada</h3>
            <p className="text-gray-500">Crie sua primeira ficha técnica para começar</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header do Modal */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ChefHat className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">
                  {editingId ? 'Editar Ficha Técnica' : 'Nova Ficha Técnica'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-300"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Tabs */}
              <div className="border-b border-gray-200 bg-gray-50">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('info')}
                    className={`flex items-center gap-2 px-6 py-4 font-medium transition-all duration-300 ${
                      activeTab === 'info'
                        ? 'border-b-2 border-blue-600 text-blue-600 bg-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    Informações Gerais
                  </button>
                  <button
                    onClick={() => setActiveTab('ingredients')}
                    className={`flex items-center gap-2 px-6 py-4 font-medium transition-all duration-300 ${
                      activeTab === 'ingredients'
                        ? 'border-b-2 border-blue-600 text-blue-600 bg-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Utensils className="w-4 h-4" />
                    Ingredientes
                  </button>
                  <button
                    onClick={() => setActiveTab('instructions')}
                    className={`flex items-center gap-2 px-6 py-4 font-medium transition-all duration-300 ${
                      activeTab === 'instructions'
                        ? 'border-b-2 border-blue-600 text-blue-600 bg-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <ChefHat className="w-4 h-4" />
                    Instruções
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                {/* Tab: Informações Gerais */}
                {activeTab === 'info' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nome da Receita *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                          placeholder="Ex: Pão Francês Tradicional"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Categoria *
                        </label>
                        <select
                          required
                          value={formData.categoryId}
                          onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        >
                          <option value="">Selecione uma categoria</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Descrição
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        placeholder="Descreva brevemente a receita..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Porções
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={formData.servings}
                          onChange={(e) => setFormData(prev => ({ ...prev, servings: Number(e.target.value) }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Tempo Preparo (min)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.prepTime}
                          onChange={(e) => setFormData(prev => ({ ...prev, prepTime: Number(e.target.value) }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Tempo Cozimento (min)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.cookTime}
                          onChange={(e) => setFormData(prev => ({ ...prev, cookTime: Number(e.target.value) }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Dificuldade
                        </label>
                        <select
                          value={formData.difficulty}
                          onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        >
                          <option value="Fácil">Fácil</option>
                          <option value="Médio">Médio</option>
                          <option value="Difícil">Difícil</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Ingredientes */}
                {activeTab === 'ingredients' && (
                  <div className="space-y-6">
                    {/* Seleção de Ingrediente Base */}
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="w-5 h-5 text-yellow-600" />
                        <h3 className="font-semibold text-yellow-800">Ingrediente Base (100%)</h3>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                        <p className="text-sm text-blue-700">
                          💡 <strong>Dica:</strong> O sistema detecta automaticamente farinhas. Use a seleção manual apenas se necessário.
                        </p>
                      </div>
                      <select
                        value={baseIngredientIndex ?? ''}
                        onChange={(e) => setBaseIngredientIndex(e.target.value ? Number(e.target.value) : null)}
                        className="w-full px-4 py-3 border border-yellow-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 bg-white"
                      >
                        <option value="">Detecção automática</option>
                        {formData.ingredients.map((ing, index) => {
                          const ingredient = ingredients.find(i => i.id === ing.ingredientId)
                          return (
                            <option key={index} value={index}>
                              {ingredient?.name || `Ingrediente ${index + 1}`}
                            </option>
                          )
                        })}
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Lista de Ingredientes</h3>
                      <button
                        type="button"
                        onClick={addIngredient}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar
                      </button>
                    </div>

                    {formData.ingredients.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500 mb-4">
                          Nenhum ingrediente adicionado. Clique em &quot;Adicionar&quot; para começar.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {formData.ingredients.map((ingredient, index) => (
                          <div key={ingredient.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Ingrediente
                                </label>
                                <select
                                  value={ingredient.ingredientId}
                                  onChange={(e) => updateIngredient(index, 'ingredientId', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                >
                                  <option value="">Selecione...</option>
                                  {ingredients.map(ing => (
                                    <option key={ing.id} value={ing.id}>{ing.name}</option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Quantidade
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={ingredient.quantity}
                                  onChange={(e) => updateIngredient(index, 'quantity', Number(e.target.value))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Unidade
                                </label>
                                <select
                                  value={ingredient.unitId}
                                  onChange={(e) => updateIngredient(index, 'unitId', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                >
                                  <option value="">Selecione...</option>
                                  {units.map(unit => (
                                    <option key={unit.id} value={unit.id}>{unit.name}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="flex-1">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Porcentagem
                                  </label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={ingredient.percentage}
                                      onChange={(e) => updateIngredient(index, 'percentage', Number(e.target.value))}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                    />
                                    <span className="text-blue-600 font-medium">%</span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeIngredient(index)}
                                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: Instruções */}
                {activeTab === 'instructions' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Modo de Preparo
                      </label>
                      <textarea
                        value={formData.instructions}
                        onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                        rows={8}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        placeholder="Descreva o passo a passo do preparo..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Observações
                      </label>
                      <textarea
                        value={formData.observations}
                        onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        placeholder="Dicas, variações ou observações importantes..."
                      />
                    </div>
                  </div>
                )}

                {/* Botões do Modal */}
                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-medium"
                  >
                    <Save className="w-4 h-4" />
                    {editingId ? 'Atualizar' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


