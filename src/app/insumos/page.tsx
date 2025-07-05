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

  // Função para calcular porcentagens automaticamente
  const calculatePercentages = (updatedIngredients: typeof formData.ingredients) => {
    const flourIngredient = updatedIngredients.find(ing => {
      const ingredient = ingredients.find(i => i.id === ing.ingredientId)
      return ingredient?.ingredientType === 'Farinha' || 
             ingredient?.name.toLowerCase().includes('farinha')
    })

    if (!flourIngredient || flourIngredient.quantity === 0) {
      return updatedIngredients
    }

    const flourIngredientData = ingredients.find(i => i.id === flourIngredient.ingredientId)
    const flourUnit = units.find(u => u.id === flourIngredientData?.unit?.id || '')
    
    if (!flourIngredientData || !flourUnit) {
      return updatedIngredients
    }

    const flourQuantityInGrams = convertToGrams(flourIngredient.quantity, flourIngredientData, flourUnit)

    return updatedIngredients.map(ing => {
      const ingredient = ingredients.find(i => i.id === ing.ingredientId)
      const unit = units.find(u => u.id === ingredient?.unit?.id || '')
      
      if (!ingredient || !unit) return ing

      // Se é farinha, sempre 100%
      if (ingredient.ingredientType === 'Farinha' || ingredient.name.toLowerCase().includes('farinha')) {
        return { ...ing, percentage: 100 }
      }

      // Calcula porcentagem baseada na farinha
      const quantityInGrams = convertToGrams(ing.quantity, ingredient, unit)
      const percentage = flourQuantityInGrams > 0 ? (quantityInGrams / flourQuantityInGrams) * 100 : 0

      return { ...ing, percentage: Math.round(percentage * 100) / 100 }
    })
  }

  // Carregar dados com useCallback
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [recipesRes, categoriesRes, ingredientsRes, unitsRes] = await Promise.all([
        api.get('/api/recipes'),
        api.get('/api/recipe-categories'),
        api.get('/api/ingredients'),
        api.get('/api/measurement-units')
      ])

      setRecipes(Array.isArray(recipesRes.data) ? recipesRes.data : [])
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : [])
      setIngredients(Array.isArray(ingredientsRes.data) ? ingredientsRes.data : [])
      setUnits(Array.isArray(unitsRes.data) ? unitsRes.data : [])
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
    const updatedIngredients = formData.ingredients.map((ing, i) => 
      i === index ? { ...ing, [field]: value } : ing
    )
    
    // Recalcular porcentagens automaticamente quando quantidade mudar
    if (field === 'quantity' || field === 'ingredientId') {
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fichas Técnicas</h1>
          <p className="text-gray-600 mt-1">Gerencie suas receitas e fichas técnicas</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setIsModalOpen(true)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Ficha Técnica
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar receitas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas as categorias</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Receitas */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tempo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temperatura</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingredientes</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecipes.map((recipe) => (
                <tr key={recipe.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{recipe.name}</div>
                    {recipe.description && (
                      <div className="text-sm text-gray-500">{recipe.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {recipe.category?.name || 'Sem categoria'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {recipe.preparationTime} min
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-1">
                      <Thermometer className="w-4 h-4 text-gray-400" />
                      {recipe.ovenTemperature}°C
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {recipe.ingredients?.length || 0} ingredientes
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleView(recipe)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(recipe)}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(recipe.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
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

      {/* Modal de Criação/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  {editingItem ? 'Editar Ficha Técnica' : 'Nova Ficha Técnica'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'info'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Informações Gerais
                </button>
                <button
                  onClick={() => setActiveTab('ingredients')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'ingredients'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Ingredientes
                </button>
                <button
                  onClick={() => setActiveTab('instructions')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'instructions'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Instruções
                </button>
              </nav>
            </div>

            <div className="p-6">
              {/* Tab: Informações Gerais */}
              {activeTab === 'info' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Receita</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: Pão Francês Tradicional"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                      <select
                        value={formData.categoryId}
                        onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Selecione uma categoria</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Descrição da receita..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tempo de Preparo (min)</label>
                      <input
                        type="number"
                        value={formData.preparationTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, preparationTime: Number(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Temperatura do Forno (°C)</label>
                      <input
                        type="number"
                        value={formData.ovenTemperature}
                        onChange={(e) => setFormData(prev => ({ ...prev, ovenTemperature: Number(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Ingredientes */}
              {activeTab === 'ingredients' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Ingredientes</h3>
                    <button
                      onClick={addIngredient}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.ingredients.map((ingredient, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 bg-gray-50 rounded-lg">
                        <div className="col-span-4">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Ingrediente</label>
                          <select
                            value={ingredient.ingredientId}
                            onChange={(e) => updateIngredient(index, 'ingredientId', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="">Selecione...</option>
                            {ingredients.map(ing => (
                              <option key={ing.id} value={ing.id}>{ing.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Quantidade</label>
                          <input
                            type="number"
                            value={ingredient.quantity}
                            onChange={(e) => updateIngredient(index, 'quantity', Number(e.target.value))}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            step="0.01"
                            min="0"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Unidade</label>
                          <select
                            value={ingredient.unitId}
                            onChange={(e) => updateIngredient(index, 'unitId', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="">Selecione...</option>
                            {units.map(unit => (
                              <option key={unit.id} value={unit.id}>{unit.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Porcentagem</label>
                          <input
                            type="number"
                            value={ingredient.percentage}
                            readOnly
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-gray-100"
                            step="0.01"
                          />
                        </div>
                        <div className="col-span-2">
                          <button
                            onClick={() => removeIngredient(index)}
                            className="w-full bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                          >
                            <Trash2 className="w-4 h-4 mx-auto" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {formData.ingredients.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Nenhum ingrediente adicionado. Clique em "Adicionar" para começar.
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Instruções */}
              {activeTab === 'instructions' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Modo de Preparo</label>
                    <textarea
                      value={formData.instructions}
                      onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Descreva o passo a passo do preparo..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Observações Técnicas</label>
                    <textarea
                      value={formData.technicalNotes}
                      onChange={(e) => setFormData(prev => ({ ...prev, technicalNotes: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Dicas técnicas, cuidados especiais, variações..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer do Modal */}
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingItem ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Visualização */}
      {isViewModalOpen && viewingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">{viewingItem.name}</h2>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Informações Gerais</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Categoria:</span> {viewingItem.category?.name || 'Sem categoria'}</div>
                    <div><span className="font-medium">Tempo de Preparo:</span> {viewingItem.preparationTime} min</div>
                    <div><span className="font-medium">Temperatura:</span> {viewingItem.ovenTemperature}°C</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Descrição</h3>
                  <p className="text-sm text-gray-600">{viewingItem.description || 'Sem descrição'}</p>
                </div>
              </div>

              {viewingItem.ingredients && viewingItem.ingredients.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-3">Ingredientes</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left">Ingrediente</th>
                          <th className="px-3 py-2 text-right">Quantidade</th>
                          <th className="px-3 py-2 text-right">Unidade</th>
                          <th className="px-3 py-2 text-right">Porcentagem</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {viewingItem.ingredients.map((ing, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2">{ing.ingredient?.name || 'Ingrediente não encontrado'}</td>
                            <td className="px-3 py-2 text-right">{ing.quantity}</td>
                            <td className="px-3 py-2 text-right">{ing.unit?.name || 'Unidade não encontrada'}</td>
                            <td className="px-3 py-2 text-right">{ing.percentage.toFixed(2)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {viewingItem.instructions && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">Modo de Preparo</h3>
                  <div className="text-sm text-gray-600 whitespace-pre-wrap">{viewingItem.instructions}</div>
                </div>
              )}

              {viewingItem.technicalNotes && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Observações Técnicas</h3>
                  <div className="text-sm text-gray-600 whitespace-pre-wrap">{viewingItem.technicalNotes}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}






