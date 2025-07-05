'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  X,
  Search,
  Clock,
  Thermometer,
  Eye,
  ChefHat,
  BookOpen,
  Utensils,
  Star,
  Filter,
  Grid3X3,
  List
} from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'

interface Recipe {
  id: string
  name: string
  description?: string
  categoryId: string
  productId?: string
  preparationTime: number
  ovenTemperature: number
  instructions?: string
  technicalNotes?: string
  createdAt?: string
  updatedAt?: string
  category?: { name: string }
  product?: { name: string }
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

interface Ingredient {
  id: string
  name: string
  pricePerUnit: number
  conversionFactor?: number
  baseUnit?: string
  ingredientType?: string
  unit?: { id: string; name: string; symbol?: string }
}

interface Unit {
  id: string
  name: string
  symbol?: string
}

export default function FichasTecnicas() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Recipe | null>(null)
  const [viewingItem, setViewingItem] = useState<Recipe | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [activeTab, setActiveTab] = useState('info')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  const { showSuccess, showError } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    preparationTime: 0,
    ovenTemperature: 0,
    instructions: '',
    technicalNotes: '',
    ingredients: [] as Array<{
      ingredientId: string
      quantity: number
      percentage: number
      unitId: string
      order: number
    }>
  })

  // Função para converter quantidade para gramas
  const convertToGrams = (quantity: number, ingredient: Ingredient, unit: Unit) => {
    console.log('🔄 Convertendo para gramas:', { 
      quantity, 
      ingredientName: ingredient.name, 
      unitName: unit.name, 
      conversionFactor: ingredient.conversionFactor 
    })

    if (unit.name.toLowerCase().includes('grama') || unit.symbol?.toLowerCase() === 'g') {
      console.log('✅ Já em gramas:', quantity)
      return quantity
    }
    
    if (unit.name.toLowerCase().includes('kg') || unit.symbol?.toLowerCase() === 'kg') {
      const result = quantity * 1000
      console.log('✅ Convertido de kg para gramas:', result)
      return result
    }
    
    if (ingredient.conversionFactor) {
      const result = quantity * ingredient.conversionFactor
      console.log('✅ Convertido usando fator específico:', result)
      return result
    }
    
    console.log('⚠️ Fallback: assumindo gramas:', quantity)
    return quantity
  }

  // Função para calcular porcentagens automaticamente
  const calculatePercentages = (updatedIngredients: typeof formData.ingredients) => {
    console.log('🧮 Iniciando cálculo de porcentagens...')
    console.log('📊 Ingredientes disponíveis:', ingredients.length)
    console.log('📊 Unidades disponíveis:', units.length)
    console.log('📊 Ingredientes da receita:', updatedIngredients.length)

    const flourIngredient = updatedIngredients.find(ing => {
      const ingredient = ingredients.find(i => i.id === ing.ingredientId)
      console.log('🔍 Verificando ingrediente:', { 
        id: ing.ingredientId, 
        name: ingredient?.name, 
        type: ingredient?.ingredientType 
      })
      
      const isFlour = ingredient?.ingredientType === 'Farinha' || 
                     ingredient?.name.toLowerCase().includes('farinha')
      
      if (isFlour) {
        console.log('🌾 Farinha encontrada:', ingredient?.name)
      }
      
      return isFlour
    })

    if (!flourIngredient) {
      console.log('❌ Nenhuma farinha encontrada')
      return updatedIngredients
    }

    if (flourIngredient.quantity === 0) {
      console.log('❌ Quantidade de farinha é zero')
      return updatedIngredients
    }

    const flourIngredientData = ingredients.find(i => i.id === flourIngredient.ingredientId)
    if (!flourIngredientData) {
      console.log('❌ Dados da farinha não encontrados')
      return updatedIngredients
    }

    let flourUnit = units.find(u => u.id === flourIngredient.unitId)
    if (!flourUnit && flourIngredientData.unit) {
      flourUnit = units.find(u => u.id === flourIngredientData.unit?.id)
    }
    
    if (!flourUnit) {
      console.log('❌ Unidade da farinha não encontrada')
      return updatedIngredients
    }

    console.log('🌾 Farinha selecionada:', {
      name: flourIngredientData.name,
      quantity: flourIngredient.quantity,
      unit: flourUnit.name
    })

    const flourQuantityInGrams = convertToGrams(flourIngredient.quantity, flourIngredientData, flourUnit)
    console.log('🌾 Quantidade da farinha em gramas:', flourQuantityInGrams)

    if (flourQuantityInGrams <= 0) {
      console.log('❌ Quantidade da farinha em gramas é inválida')
      return updatedIngredients
    }

    const recalculatedIngredients = updatedIngredients.map(ing => {
      const ingredient = ingredients.find(i => i.id === ing.ingredientId)
      let unit = units.find(u => u.id === ing.unitId)
      
      if (!unit && ingredient?.unit) {
        unit = units.find(u => u.id === ingredient.unit?.id)
      }
      
      if (!ingredient || !unit) {
        console.log('⚠️ Ingrediente ou unidade não encontrados:', { 
          ingredientId: ing.ingredientId, 
          unitId: ing.unitId 
        })
        return ing
      }

      if (ingredient.ingredientType === 'Farinha' || ingredient.name.toLowerCase().includes('farinha')) {
        console.log('🌾 Definindo farinha como 100%:', ingredient.name)
        return { ...ing, percentage: 100 }
      }

      const quantityInGrams = convertToGrams(ing.quantity, ingredient, unit)
      const percentage = (quantityInGrams / flourQuantityInGrams) * 100

      console.log('📊 Calculando porcentagem:', {
        ingredient: ingredient.name,
        quantity: ing.quantity,
        unit: unit.name,
        quantityInGrams,
        flourQuantityInGrams,
        percentage: Math.round(percentage * 100) / 100
      })

      return { ...ing, percentage: Math.round(percentage * 100) / 100 }
    })

    console.log('✅ Cálculo de porcentagens concluído')
    return recalculatedIngredients
  }

  // Carregar dados com useCallback
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      console.log('🔄 Carregando dados...')
      
      const [recipesRes, categoriesRes, ingredientsRes, unitsRes] = await Promise.all([
        api.get('/api/recipes'),
        api.get('/api/recipe-categories'),
        api.get('/api/ingredients'),
        api.get('/api/measurement-units')
      ])

      const recipesData = Array.isArray(recipesRes.data) ? recipesRes.data : []
      const categoriesData = Array.isArray(categoriesRes.data) ? categoriesRes.data : []
      const ingredientsData = Array.isArray(ingredientsRes.data) ? ingredientsRes.data : []
      const unitsData = Array.isArray(unitsRes.data) ? unitsRes.data : []

      console.log('📊 Dados carregados:', {
        recipes: recipesData.length,
        categories: categoriesData.length,
        ingredients: ingredientsData.length,
        units: unitsData.length
      })

      setRecipes(recipesData)
      setCategories(categoriesData)
      setIngredients(ingredientsData)
      setUnits(unitsData)
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

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      categoryId: '',
      preparationTime: 0,
      ovenTemperature: 0,
      instructions: '',
      technicalNotes: '',
      ingredients: []
    })
    setEditingItem(null)
    setActiveTab('info')
  }

  const handleSave = async () => {
    try {
      if (!formData.name.trim()) {
        showError('Nome é obrigatório')
        return
      }

      const dataToSend = {
        ...formData,
        ingredients: formData.ingredients.map((ing, index) => ({
          ...ing,
          order: index + 1
        }))
      }

      if (editingItem) {
        await api.put(`/api/recipes/${editingItem.id}`, dataToSend)
        showSuccess('Receita atualizada com sucesso!')
      } else {
        await api.post('/api/recipes', dataToSend)
        showSuccess('Receita criada com sucesso!')
      }

      setIsModalOpen(false)
      resetForm()
      loadData()
    } catch (error) {
      console.error('❌ Erro ao salvar:', error)
      showError('Erro ao salvar receita')
    }
  }

  const handleEdit = (item: Recipe) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description || '',
      categoryId: item.categoryId,
      preparationTime: item.preparationTime,
      ovenTemperature: item.ovenTemperature,
      instructions: item.instructions || '',
      technicalNotes: item.technicalNotes || '',
      ingredients: item.ingredients?.map(ing => ({
        ingredientId: ing.ingredientId,
        quantity: ing.quantity,
        percentage: ing.percentage,
        unitId: ing.unitId,
        order: ing.order || 0
      })) || []
    })
    setIsModalOpen(true)
  }

  const handleView = (item: Recipe) => {
    setViewingItem(item)
    setIsViewModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta receita?')) {
      try {
        await api.delete(`/api/recipes/${id}`)
        showSuccess('Receita excluída com sucesso!')
        loadData()
      } catch (error) {
        console.error('❌ Erro ao excluir:', error)
        showError('Erro ao excluir receita')
      }
    }
  }

  const addIngredient = () => {
    const newIngredient = {
      ingredientId: '',
      quantity: 0,
      percentage: 0,
      unitId: '',
      order: formData.ingredients.length + 1
    }
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, newIngredient]
    }))
  }

  const updateIngredient = (index: number, field: string, value: any) => {
    console.log('🔄 Atualizando ingrediente:', { index, field, value })
    
    const updatedIngredients = formData.ingredients.map((ing, i) => 
      i === index ? { ...ing, [field]: value } : ing
    )
    
    if (field === 'quantity' || field === 'ingredientId' || field === 'unitId') {
      console.log('🧮 Recalculando porcentagens...')
      const recalculatedIngredients = calculatePercentages(updatedIngredients)
      setFormData(prev => ({ ...prev, ingredients: recalculatedIngredients }))
    } else {
      setFormData(prev => ({ ...prev, ingredients: updatedIngredients }))
    }
  }

  const removeIngredient = (index: number) => {
    const updatedIngredients = formData.ingredients.filter((_, i) => i !== index)
    const recalculatedIngredients = calculatePercentages(updatedIngredients)
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
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600 mx-auto"></div>
            <ChefHat className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Carregando fichas técnicas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="p-6 max-w-7xl mx-auto">
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
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar receitas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 placeholder-gray-500"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="pl-10 pr-8 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 appearance-none cursor-pointer"
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
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lista/Grid de Receitas */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="group bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                        {recipe.name}
                      </h3>
                      {recipe.description && (
                        <p className="text-gray-600 text-sm line-clamp-2">{recipe.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-1 rounded-lg text-xs font-semibold">
                      <Star className="w-3 h-3" />
                      <span>Pro</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span>{recipe.preparationTime} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Thermometer className="w-4 h-4 text-red-500" />
                      <span>{recipe.ovenTemperature}°C</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Utensils className="w-4 h-4 text-green-500" />
                      <span>{recipe.ingredients?.length || 0}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {recipe.category?.name || 'Sem categoria'}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(recipe)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-300 hover:scale-110"
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(recipe)}
                        className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-all duration-300 hover:scale-110"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(recipe.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-300 hover:scale-110"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nome</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Categoria</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tempo</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Temperatura</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ingredientes</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRecipes.map((recipe) => (
                    <tr key={recipe.id} className="hover:bg-blue-50/50 transition-colors duration-300">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{recipe.name}</div>
                        {recipe.description && (
                          <div className="text-sm text-gray-500 mt-1">{recipe.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {recipe.category?.name || 'Sem categoria'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Clock className="w-4 h-4 text-blue-500" />
                          {recipe.preparationTime} min
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Thermometer className="w-4 h-4 text-red-500" />
                          {recipe.ovenTemperature}°C
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Utensils className="w-4 h-4 text-green-500" />
                          {recipe.ingredients?.length || 0} ingredientes
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleView(recipe)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-300 hover:scale-110"
                            title="Visualizar"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(recipe)}
                            className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-all duration-300 hover:scale-110"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(recipe.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-300 hover:scale-110"
                            title="Excluir"
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
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma receita encontrada</h3>
            <p className="text-gray-600 mb-6">Comece criando sua primeira ficha técnica</p>
            <button
              onClick={() => {
                resetForm()
                setIsModalOpen(true)
              }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 mx-auto transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Nova Ficha Técnica
            </button>
          </div>
        )}

        {/* Modal de Criação/Edição Moderno */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <ChefHat className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      {editingItem ? 'Editar Ficha Técnica' : 'Nova Ficha Técnica'}
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Tabs Modernos */}
              <div className="border-b border-gray-200 bg-gray-50">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'info', label: 'Informações Gerais', icon: BookOpen },
                    { id: 'ingredients', label: 'Ingredientes', icon: Utensils },
                    { id: 'instructions', label: 'Instruções', icon: ChefHat }
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-all duration-300 ${
                        activeTab === id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {/* Tab: Informações Gerais */}
                {activeTab === 'info' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nome da Receita</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                          placeholder="Ex: Pão Francês Tradicional"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Categoria</label>
                        <select
                          value={formData.categoryId}
                          onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        >
                          <option value="">Selecione uma categoria</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        placeholder="Descrição da receita..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Tempo de Preparo (min)</label>
                        <input
                          type="number"
                          value={formData.preparationTime}
                          onChange={(e) => setFormData(prev => ({ ...prev, preparationTime: Number(e.target.value) }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Temperatura do Forno (°C)</label>
                        <input
                          type="number"
                          value={formData.ovenTemperature}
                          onChange={(e) => setFormData(prev => ({ ...prev, ovenTemperature: Number(e.target.value) }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Ingredientes */}
                {activeTab === 'ingredients' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">Ingredientes</h3>
                      <button
                        onClick={addIngredient}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar
                      </button>
                    </div>

                    <div className="space-y-4">
                      {formData.ingredients.map((ingredient, index) => (
                        <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200">
                          <div className="grid grid-cols-12 gap-3 items-end">
                            <div className="col-span-4">
                              <label className="block text-xs font-semibold text-gray-700 mb-1">Ingrediente</label>
                              <select
                                value={ingredient.ingredientId}
                                onChange={(e) => updateIngredient(index, 'ingredientId', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                              >
                                <option value="">Selecione...</option>
                                {ingredients.map(ing => (
                                  <option key={ing.id} value={ing.id}>{ing.name}</option>
                                ))}
                              </select>
                            </div>
                            <div className="col-span-2">
                              <label className="block text-xs font-semibold text-gray-700 mb-1">Quantidade</label>
                              <input
                                type="number"
                                value={ingredient.quantity}
                                onChange={(e) => updateIngredient(index, 'quantity', Number(e.target.value))}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                step="0.01"
                                min="0"
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-xs font-semibold text-gray-700 mb-1">Unidade</label>
                              <select
                                value={ingredient.unitId}
                                onChange={(e) => updateIngredient(index, 'unitId', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                              >
                                <option value="">Selecione...</option>
                                {units.map(unit => (
                                  <option key={unit.id} value={unit.id}>{unit.name}</option>
                                ))}
                              </select>
                            </div>
                            <div className="col-span-2">
                              <label className="block text-xs font-semibold text-gray-700 mb-1">Porcentagem</label>
                              <div className="relative">
                                <input
                                  type="number"
                                  value={ingredient.percentage}
                                  readOnly
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-900 font-semibold"
                                  step="0.01"
                                />
                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-blue-600 font-semibold">%</span>
                              </div>
                            </div>
                            <div className="col-span-2">
                              <button
                                onClick={() => removeIngredient(index)}
                                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-2 rounded-lg text-sm transition-all duration-300 shadow-lg hover:shadow-xl"
                              >
                                <Trash2 className="w-4 h-4 mx-auto" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {formData.ingredients.length === 0 && (
                      <div className="text-center py-12 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
                        <Utensils className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum ingrediente adicionado</h3>
                        <p className="text-gray-600 mb-4">Clique em &quot;Adicionar&quot; para começar.</p>
                        <button
                          onClick={addIngredient}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 mx-auto transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                          <Plus className="w-5 h-5" />
                          Adicionar Ingrediente
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: Instruções */}
                {activeTab === 'instructions' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Modo de Preparo</label>
                      <textarea
                        value={formData.instructions}
                        onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                        rows={8}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        placeholder="Descreva o passo a passo do preparo..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Observações Técnicas</label>
                      <textarea
                        value={formData.technicalNotes}
                        onChange={(e) => setFormData(prev => ({ ...prev, technicalNotes: e.target.value }))}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        placeholder="Dicas técnicas, cuidados especiais, variações..."
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer do Modal */}
              <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
                >
                  {editingItem ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Visualização Moderno */}
        {isViewModalOpen && viewingItem && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">{viewingItem.name}</h2>
                  </div>
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      Informações Gerais
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-600">Categoria:</span>
                        <span className="text-gray-900">{viewingItem.category?.name || 'Sem categoria'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-600">Tempo de Preparo:</span>
                        <span className="text-gray-900">{viewingItem.preparationTime} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-600">Temperatura:</span>
                        <span className="text-gray-900">{viewingItem.ovenTemperature}°C</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Descrição</h3>
                    <p className="text-sm text-gray-600">{viewingItem.description || 'Sem descrição'}</p>
                  </div>
                </div>

                {viewingItem.ingredients && viewingItem.ingredients.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Utensils className="w-5 h-5 text-green-600" />
                      Ingredientes
                    </h3>
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Ingrediente</th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-700">Quantidade</th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-700">Unidade</th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-700">Porcentagem</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {viewingItem.ingredients.map((ing, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors duration-300">
                              <td className="px-4 py-3 font-medium text-gray-900">{ing.ingredient?.name || 'Ingrediente não encontrado'}</td>
                              <td className="px-4 py-3 text-right text-gray-900">{ing.quantity}</td>
                              <td className="px-4 py-3 text-right text-gray-900">{ing.unit?.name || 'Unidade não encontrada'}</td>
                              <td className="px-4 py-3 text-right">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                  {ing.percentage.toFixed(2)}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {viewingItem.instructions && (
                  <div className="mb-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <ChefHat className="w-5 h-5 text-purple-600" />
                      Modo de Preparo
                    </h3>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
                      <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{viewingItem.instructions}</div>
                    </div>
                  </div>
                )}

                {viewingItem.technicalNotes && (
                  <div>
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-600" />
                      Observações Técnicas
                    </h3>
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6">
                      <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{viewingItem.technicalNotes}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}



