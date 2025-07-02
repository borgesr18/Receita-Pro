'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  Search,
  Clock,
  Thermometer,
  Copy,
  Eye
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
  ingredient?: { name: string; pricePerUnit: number }
  unit?: { name: string; symbol?: string }
}

interface Category {
  id: string
  name: string
  description?: string
}

interface Ingredient {
  id: string
  name: string
  pricePerUnit: number
  unit?: { name: string; symbol?: string }
}

interface Unit {
  id: string
  name: string
  symbol?: string
}

export default function FichasTecnicas() {
  const { showSuccess, showError } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [viewingItem, setViewingItem] = useState<Recipe | null>(null)
  const [editingItem, setEditingItem] = useState<Recipe | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [activeTab, setActiveTab] = useState('info')
  const [loading, setLoading] = useState(true)

  // Estados para dados
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [units, setUnits] = useState<Unit[]>([])

  // Estado do formulário
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    productId: '',
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

  // Carregar dados com useCallback
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      console.log('🔄 Carregando dados das fichas técnicas...')
      
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

      setRecipes(recipesData)
      setCategories(categoriesData)
      setIngredients(ingredientsData)
      setUnits(unitsData)

      console.log('✅ Dados carregados:', {
        recipes: recipesData.length,
        categories: categoriesData.length,
        ingredients: ingredientsData.length,
        units: unitsData.length
      })
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

  const handleView = (item: Recipe) => {
    setViewingItem(item)
    setIsViewModalOpen(true)
  }

  const handleAdd = () => {
    setEditingItem(null)
    setFormData({
      name: '',
      description: '',
      categoryId: '',
      productId: '',
      preparationTime: 0,
      ovenTemperature: 0,
      instructions: '',
      technicalNotes: '',
      ingredients: []
    })
    setIsModalOpen(true)
    setActiveTab('info')
  }

  const handleEdit = (item: Recipe) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description || '',
      categoryId: item.categoryId,
      productId: item.productId || '',
      preparationTime: item.preparationTime,
      ovenTemperature: item.ovenTemperature,
      instructions: item.instructions || '',
      technicalNotes: item.technicalNotes || '',
      ingredients: item.ingredients?.map((ing, index) => ({
        ingredientId: ing.ingredientId,
        quantity: ing.quantity,
        percentage: ing.percentage,
        unitId: ing.unitId,
        order: ing.order || index
      })) || []
    })
    setIsModalOpen(true)
    setActiveTab('info')
  }

  const handleSave = async () => {
    try {
      console.log('📤 Enviando dados:', formData)

      // Validação básica
      if (!formData.name.trim()) {
        showError('Nome é obrigatório')
        return
      }
      if (!formData.categoryId) {
        showError('Categoria é obrigatória')
        return
      }

      let response: any

      if (editingItem) {
        // Editar item existente
        response = await api.put(`/api/recipes/${editingItem.id}`, formData)
        const updatedData = recipes.map(item => 
          item.id === editingItem.id ? response.data as Recipe : item
        )
        setRecipes(updatedData)
        showSuccess('Ficha técnica atualizada com sucesso!')
      } else {
        // Criar novo item
        response = await api.post('/api/recipes', formData)
        setRecipes([...recipes, response.data as Recipe])
        showSuccess('Ficha técnica criada com sucesso!')
      }

      setIsModalOpen(false)
      setEditingItem(null)
    } catch (error) {
      console.error('❌ Erro ao salvar:', error)
      showError('Erro ao salvar ficha técnica')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta ficha técnica?')) return

    try {
      await api.delete(`/api/recipes/${id}`)
      const filteredData = recipes.filter(item => item.id !== id)
      setRecipes(filteredData)
      showSuccess('Ficha técnica excluída com sucesso!')
    } catch (error) {
      console.error('❌ Erro ao excluir:', error)
      showError('Erro ao excluir ficha técnica')
    }
  }

  const addIngredient = () => {
    const newIngredient = {
      ingredientId: '',
      quantity: 0,
      percentage: 0,
      unitId: '',
      order: formData.ingredients.length
    }
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, newIngredient]
    })
  }

  const removeIngredient = (index: number) => {
    const newIngredients = formData.ingredients.filter((_, i) => i !== index)
    setFormData({ ...formData, ingredients: newIngredients })
  }

  const updateIngredient = (index: number, field: string, value: string | number) => {
    const newIngredients = [...formData.ingredients]
    newIngredients[index] = { ...newIngredients[index], [field]: value }
    setFormData({ ...formData, ingredients: newIngredients })
  }

  const calculateTotalCost = () => {
    return formData.ingredients.reduce((total, ing) => {
      const ingredient = ingredients.find(i => i.id === ing.ingredientId)
      return total + (ingredient ? ingredient.pricePerUnit * ing.quantity : 0)
    }, 0)
  }

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (recipe.description && recipe.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = filterCategory === '' || recipe.categoryId === filterCategory
    return matchesSearch && matchesCategory
  })

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const renderViewModal = () => {
    if (!isViewModalOpen || !viewingItem) return null

    const totalCost = viewingItem.ingredients?.reduce((total, ing) => {
      return total + (ing.ingredient ? ing.ingredient.pricePerUnit * ing.quantity : 0)
    }, 0) || 0

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Detalhes da Ficha Técnica
            </h2>
            <button
              onClick={() => setIsViewModalOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Informações básicas */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {viewingItem.name}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {viewingItem.category?.name || '-'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tempo de Preparo
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {viewingItem.preparationTime} minutos
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperatura do Forno
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {viewingItem.ovenTemperature}°C
                </p>
              </div>
            </div>

            {/* Informações secundárias */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded min-h-[60px]">
                  {viewingItem.description || '-'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custo Total Estimado
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  R$ {totalCost.toFixed(2)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Criado em
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {formatDate(viewingItem.createdAt || '')}
                </p>
              </div>
            </div>
          </div>

          {/* Ingredientes */}
          {viewingItem.ingredients && viewingItem.ingredients.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Ingredientes</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Ingrediente
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Quantidade
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Porcentagem
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Custo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {viewingItem.ingredients.map((ing, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {ing.ingredient?.name || '-'}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {ing.quantity} {ing.unit?.symbol || ing.unit?.name}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {ing.percentage}%
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          R$ {(ing.ingredient ? ing.ingredient.pricePerUnit * ing.quantity : 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Instruções */}
          {viewingItem.instructions && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Instruções</h3>
              <div className="bg-gray-50 p-4 rounded">
                <pre className="whitespace-pre-wrap text-sm text-gray-700">
                  {viewingItem.instructions}
                </pre>
              </div>
            </div>
          )}

          {/* Observações técnicas */}
          {viewingItem.technicalNotes && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Observações Técnicas</h3>
              <div className="bg-gray-50 p-4 rounded">
                <pre className="whitespace-pre-wrap text-sm text-gray-700">
                  {viewingItem.technicalNotes}
                </pre>
              </div>
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={() => {
                setIsViewModalOpen(false)
                handleEdit(viewingItem)
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Editar
            </button>
            <button
              onClick={() => setIsViewModalOpen(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Fichas Técnicas</h1>
        <p className="mt-2 text-sm text-gray-600">
          Gerencie suas receitas e fichas técnicas de produção
        </p>
      </div>

      {/* Filtros e busca */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar fichas técnicas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas as categorias</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Ficha</span>
          </button>
        </div>
      </div>

      {/* Lista de fichas técnicas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map((recipe) => (
          <div key={recipe.id} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {recipe.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {recipe.category?.name}
                </p>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {recipe.description || 'Sem descrição'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {recipe.preparationTime}min
              </div>
              <div className="flex items-center">
                <Thermometer className="h-4 w-4 mr-1" />
                {recipe.ovenTemperature}°C
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => handleView(recipe)}
                className="p-2 text-green-600 hover:text-green-900"
                title="Visualizar"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleEdit(recipe)}
                className="p-2 text-blue-600 hover:text-blue-900"
                title="Editar"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(recipe.id)}
                className="p-2 text-red-600 hover:text-red-900"
                title="Excluir"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhuma ficha técnica encontrada</p>
        </div>
      )}

      {/* Modal de Edição/Criação */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingItem ? 'Editar' : 'Nova'} Ficha Técnica
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'info'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Informações Básicas
                </button>
                <button
                  onClick={() => setActiveTab('ingredients')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'ingredients'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Ingredientes
                </button>
                <button
                  onClick={() => setActiveTab('instructions')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'instructions'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Instruções
                </button>
              </nav>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              {/* Tab: Informações Básicas */}
              {activeTab === 'info' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nome da receita"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Categoria *
                      </label>
                      <select
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Selecione uma categoria</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Descrição da receita"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tempo de Preparo (minutos)
                      </label>
                      <input
                        type="number"
                        value={formData.preparationTime}
                        onChange={(e) => setFormData({ ...formData, preparationTime: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Temperatura do Forno (°C)
                      </label>
                      <input
                        type="number"
                        value={formData.ovenTemperature}
                        onChange={(e) => setFormData({ ...formData, ovenTemperature: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Ingredientes */}
              {activeTab === 'ingredients' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Ingredientes</h3>
                    <button
                      type="button"
                      onClick={addIngredient}
                      className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm"
                    >
                      <Plus className="h-4 w-4 inline mr-1" />
                      Adicionar
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.ingredients.map((ingredient, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 border rounded-md">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Ingrediente
                          </label>
                          <select
                            value={ingredient.ingredientId}
                            onChange={(e) => updateIngredient(index, 'ingredientId', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="">Selecione</option>
                            {ingredients.map((ing) => (
                              <option key={ing.id} value={ing.id}>
                                {ing.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Quantidade
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={ingredient.quantity}
                            onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Porcentagem
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={ingredient.percentage}
                            onChange={(e) => updateIngredient(index, 'percentage', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Unidade
                          </label>
                          <select
                            value={ingredient.unitId}
                            onChange={(e) => updateIngredient(index, 'unitId', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="">Selecione</option>
                            {units.map((unit) => (
                              <option key={unit.id} value={unit.id}>
                                {unit.name} {unit.symbol && `(${unit.symbol})`}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => removeIngredient(index)}
                            className="w-full bg-red-600 text-white px-2 py-1 rounded text-sm hover:bg-red-700"
                          >
                            <Trash2 className="h-4 w-4 inline" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {formData.ingredients.length > 0 && (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm font-medium text-gray-700">
                        Custo Total Estimado: R$ {calculateTotalCost().toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Instruções */}
              {activeTab === 'instructions' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instruções de Preparo
                    </label>
                    <textarea
                      value={formData.instructions}
                      onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Descreva o passo a passo da receita..."
                      rows={8}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observações Técnicas
                    </label>
                    <textarea
                      value={formData.technicalNotes}
                      onChange={(e) => setFormData({ ...formData, technicalNotes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Dicas técnicas, temperaturas específicas, cuidados especiais..."
                      rows={4}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Visualização */}
      {renderViewModal()}
    </div>
  )
}


