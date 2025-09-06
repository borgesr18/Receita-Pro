'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Edit, Trash2, X, Package, TrendingUp, AlertTriangle, Eye, Loader2, ChefHat, Calculator, Layers, ArrowRight, DollarSign } from 'lucide-react'
import { api } from '@/lib/api'

interface Product {
  id: string
  name: string
  categoryId: string
  averageWeight: number
  description?: string
  defaultRecipeId?: string
  createdAt?: string
  updatedAt?: string
  category?: { name: string }
  productRecipes?: ProductRecipe[]
  defaultRecipe?: Recipe
}

interface ProductRecipe {
  id: string
  productId: string
  recipeId: string
  quantity: number
  order: number
  recipe: Recipe
}

interface Recipe {
  id: string
  name: string
  description?: string
  categoryId: string
  totalCost?: number
  adjustedCost?: number
  totalIngredients?: number
  category?: { name: string }
  ingredients?: RecipeIngredient[]
}

interface RecipeIngredient {
  id: string
  quantity: number
  ingredient: {
    id: string
    name: string
    pricePerUnit: number
    unit: { name: string }
  }
  unit: { name: string }
}

interface RecipeCategory {
  id: string
  name: string
  description?: string
}

// Sistema de toast simples sem dependências externas
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  const toast = document.createElement('div')
  toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 transform translate-x-full ${
    type === 'success' ? 'bg-green-500' : 'bg-red-500'
  }`
  toast.textContent = message
  
  document.body.appendChild(toast)
  
  setTimeout(() => {
    toast.style.transform = 'translateX(0)'
  }, 100)
  
  setTimeout(() => {
    toast.style.transform = 'translateX(full)'
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast)
      }
    }, 300)
  }, 3000)
}

export default function ProdutosReceitasCompostas() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false)
  const [viewingItem, setViewingItem] = useState<Product | null>(null)
  const [managingRecipesFor, setManagingRecipesFor] = useState<Product | null>(null)
  const [produtos, setProdutos] = useState<Product[]>([])
  const [categories, setCategories] = useState<RecipeCategory[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [productRecipes, setProductRecipes] = useState<ProductRecipe[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [loadingRecipes, setLoadingRecipes] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [editingItem, setEditingItem] = useState<Product | null>(null)
  const [activeTab, setActiveTab] = useState<'basic' | 'recipes'>('basic')
  
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    averageWeight: 0,
    description: '',
    defaultRecipeId: ''
  })

  const [recipeFormData, setRecipeFormData] = useState({
    recipeId: '',
    quantity: 1,
    order: 0
  })

  // Carregar dados com useCallback para evitar warning
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      console.log('🔄 Carregando dados dos produtos...')
      
      const [productsRes, categoriesRes, recipesRes] = await Promise.all([
        api.get('/api/products'),
        api.get('/api/recipe-categories'),
        api.get('/api/recipes')
      ])

      console.log('📊 Resposta produtos:', productsRes)
      console.log('📊 Resposta categorias:', categoriesRes)
      console.log('📊 Resposta receitas:', recipesRes)

      if (productsRes.data) {
        setProdutos(Array.isArray(productsRes.data) ? productsRes.data : [])
        console.log('✅ Produtos carregados:', productsRes.data.length)
      } else {
        setProdutos([])
        console.log('⚠️ Nenhum produto encontrado')
      }

      if (categoriesRes.data) {
        setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : [])
        console.log('✅ Categorias carregadas:', categoriesRes.data.length)
      } else {
        setCategories([])
        console.log('⚠️ Nenhuma categoria encontrada')
      }

      if (recipesRes.data) {
        setRecipes(Array.isArray(recipesRes.data) ? recipesRes.data : [])
        console.log('✅ Receitas carregadas:', recipesRes.data.length)
      } else {
        setRecipes([])
        console.log('⚠️ Nenhuma receita encontrada')
      }

    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error)
      showToast('Falha ao carregar dados. Verifique sua conexão.', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  // Carregar receitas de um produto específico
  const loadProductRecipes = useCallback(async (productId: string) => {
    try {
      setLoadingRecipes(true)
      console.log('🔄 Carregando receitas do produto:', productId)
      
      const response = await api.get(`/api/products/${productId}/recipes`)
      console.log('📊 Receitas do produto:', response)

      if (response.data && response.data.recipes) {
        setProductRecipes(response.data.recipes)
        console.log('✅ Receitas do produto carregadas:', response.data.recipes.length)
      } else {
        setProductRecipes([])
        console.log('⚠️ Nenhuma receita encontrada para o produto')
      }

    } catch (error) {
      console.error('❌ Erro ao carregar receitas do produto:', error)
      showToast('Falha ao carregar receitas do produto.', 'error')
      setProductRecipes([])
    } finally {
      setLoadingRecipes(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Filtrar produtos
  const filteredProdutos = produtos.filter(produto => {
    const matchesSearch = produto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || produto.categoryId === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Handlers para CRUD básico de produtos
  const handleAdd = () => {
    setEditingItem(null)
    setFormData({
      name: '',
      categoryId: '',
      averageWeight: 0,
      description: '',
      defaultRecipeId: ''
    })
    setActiveTab('basic')
    setIsModalOpen(true)
  }

  const handleEdit = (produto: Product) => {
    setEditingItem(produto)
    setFormData({
      name: produto.name,
      categoryId: produto.categoryId,
      averageWeight: produto.averageWeight,
      description: produto.description || '',
      defaultRecipeId: produto.defaultRecipeId || ''
    })
    setActiveTab('basic')
    setIsModalOpen(true)
  }

  const handleView = (produto: Product) => {
    setViewingItem(produto)
    setIsViewModalOpen(true)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      console.log('💾 Salvando produto:', formData)

      const response = editingItem
        ? await api.put(`/api/products/${editingItem.id}`, formData)
        : await api.post('/api/products', formData)

      console.log('📊 Resposta da API:', response)

      if (response.data) {
        console.log('✅ Produto salvo com sucesso')
        showToast(editingItem ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!')
        setIsModalOpen(false)
        await loadData()
      } else {
        console.error('❌ API retornou erro:', response.error)
        showToast(response.error || 'Erro ao salvar produto', 'error')
      }
    } catch (error) {
      console.error('❌ Erro ao salvar:', error)
      showToast('Erro ao salvar produto', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return

    try {
      setDeleting(id)
      console.log('🗑️ Excluindo produto:', id)

      const response = await api.delete(`/api/products/${id}`)
      console.log('📊 Resposta da API:', response)

      if (response.data) {
        console.log('✅ Produto excluído com sucesso')
        showToast('Produto excluído com sucesso!')
        await loadData()
      } else {
        console.error('❌ API retornou erro:', response.error)
        showToast(response.error || 'Erro ao excluir produto', 'error')
      }
    } catch (error) {
      console.error('❌ Erro ao excluir:', error)
      showToast('Erro ao excluir produto', 'error')
    } finally {
      setDeleting(null)
    }
  }

  // Handlers para receitas compostas
  const handleManageRecipes = async (produto: Product) => {
    setManagingRecipesFor(produto)
    await loadProductRecipes(produto.id)
    setIsRecipeModalOpen(true)
  }

  const handleAddRecipe = async () => {
    if (!managingRecipesFor || !recipeFormData.recipeId) return

    try {
      setSaving(true)
      console.log('➕ Adicionando receita ao produto:', recipeFormData)

      const response = await api.post(`/api/products/${managingRecipesFor.id}/recipes`, recipeFormData)
      console.log('📊 Resposta da API:', response)

      if (response.data) {
        console.log('✅ Receita adicionada com sucesso')
        showToast('Receita adicionada ao produto!')
        setRecipeFormData({ recipeId: '', quantity: 1, order: 0 })
        await loadProductRecipes(managingRecipesFor.id)
      } else {
        console.error('❌ API retornou erro:', response.error)
        showToast(response.error || 'Erro ao adicionar receita', 'error')
      }
    } catch (error) {
      console.error('❌ Erro ao adicionar receita:', error)
      showToast('Erro ao adicionar receita', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveRecipe = async (recipeId: string) => {
    if (!managingRecipesFor) return
    if (!confirm('Tem certeza que deseja remover esta receita do produto?')) return

    try {
      setDeleting(recipeId)
      console.log('🗑️ Removendo receita do produto:', recipeId)

      const response = await api.delete(`/api/products/${managingRecipesFor.id}/recipes/${recipeId}`)
      console.log('📊 Resposta da API:', response)

      if (response.data) {
        console.log('✅ Receita removida com sucesso')
        showToast('Receita removida do produto!')
        await loadProductRecipes(managingRecipesFor.id)
      } else {
        console.error('❌ API retornou erro:', response.error)
        showToast(response.error || 'Erro ao remover receita', 'error')
      }
    } catch (error) {
      console.error('❌ Erro ao remover receita:', error)
      showToast('Erro ao remover receita', 'error')
    } finally {
      setDeleting(null)
    }
  }

  // Calcular totais das receitas compostas
  const calculateProductTotals = (recipes: ProductRecipe[]) => {
    const totalCost = recipes.reduce((sum, pr) => sum + (pr.recipe.adjustedCost || 0), 0)
    const totalRecipes = recipes.length
    const totalIngredients = recipes.reduce((sum, pr) => sum + ((pr.recipe.totalIngredients || 0) * pr.quantity), 0)
    
    return { totalCost, totalRecipes, totalIngredients }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600 font-medium">Carregando produtos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                Gestão de Produtos
              </h1>
              <p className="text-gray-600 mt-2">Gerencie produtos e suas receitas compostas</p>
            </div>
            <button
              onClick={handleAdd}
              className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus size={20} />
              <span className="font-semibold">Novo Produto</span>
            </button>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total de Produtos</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{produtos.length}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Produtos com Receitas</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {produtos.filter(p => p.productRecipes && p.productRecipes.length > 0).length}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Categorias Ativas</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{categories.length}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl">
                <Layers className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
            >
              <option value="">Todas as categorias</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista de Produtos */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Produto</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Categoria</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Peso Médio</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Receitas</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Tipo</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProdutos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center space-y-3">
                        <Package className="w-12 h-12 text-gray-400" />
                        <p className="text-gray-500 font-medium">Nenhum produto encontrado</p>
                        <p className="text-gray-400 text-sm">Crie seu primeiro produto ou ajuste os filtros</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProdutos.map((produto) => {
                    const hasCompositeRecipes = produto.productRecipes && produto.productRecipes.length > 0
                    const recipeCount = hasCompositeRecipes ? produto.productRecipes.length : (produto.defaultRecipeId ? 1 : 0)
                    
                    return (
                      <tr key={produto.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-gray-900">{produto.name}</p>
                            {produto.description && (
                              <p className="text-sm text-gray-500 mt-1">{produto.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {produto.category?.name || 'Sem categoria'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-900 font-medium">{produto.averageWeight}g</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-900 font-medium">{recipeCount}</span>
                            {hasCompositeRecipes && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Composta
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {hasCompositeRecipes ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                              <Layers className="w-4 h-4 mr-1" />
                              Múltiplas
                            </span>
                          ) : produto.defaultRecipeId ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                              <ChefHat className="w-4 h-4 mr-1" />
                              Simples
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                              Sem receita
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleView(produto)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                              title="Visualizar"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleManageRecipes(produto)}
                              className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors duration-200"
                              title="Gerenciar Receitas"
                            >
                              <ChefHat size={16} />
                            </button>
                            <button
                              onClick={() => handleEdit(produto)}
                              className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors duration-200"
                              title="Editar"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(produto.id)}
                              disabled={deleting === produto.id}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
                              title="Excluir"
                            >
                              {deleting === produto.id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Produto */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingItem ? 'Editar Produto' : 'Novo Produto'}
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Abas */}
                <div className="flex space-x-1 mb-6 bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setActiveTab('basic')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                      activeTab === 'basic'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Dados Básicos
                  </button>
                  <button
                    onClick={() => setActiveTab('recipes')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                      activeTab === 'recipes'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Receitas
                  </button>
                </div>

                {/* Conteúdo das Abas */}
                {activeTab === 'basic' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Nome do Produto *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: Pão de Açúcar, Bolo de Chocolate..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Categoria *</label>
                      <select
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Selecione uma categoria</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Peso Médio (gramas) *</label>
                      <input
                        type="number"
                        value={formData.averageWeight}
                        onChange={(e) => setFormData({ ...formData, averageWeight: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: 500"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Receita Padrão (Opcional)</label>
                      <select
                        value={formData.defaultRecipeId}
                        onChange={(e) => setFormData({ ...formData, defaultRecipeId: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Nenhuma receita padrão</option>
                        {recipes.map(recipe => (
                          <option key={recipe.id} value={recipe.id}>{recipe.name}</option>
                        ))}
                      </select>
                      <p className="text-sm text-gray-500 mt-1">
                        Receita usada quando o produto não tem receitas compostas
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Descrição</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Descrição opcional do produto..."
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'recipes' && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <h3 className="font-semibold text-blue-900 mb-2">Receitas Compostas</h3>
                      <p className="text-blue-700 text-sm">
                        Configure múltiplas receitas para produtos complexos. Ex: Pão Recheado = Receita da Massa + Receita do Recheio.
                      </p>
                    </div>

                    <div className="text-center text-gray-500">
                      <ChefHat className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p>Funcionalidade de receitas compostas será configurada após salvar o produto.</p>
                      <p className="text-sm mt-1">Salve o produto primeiro, depois use o botão "Gerenciar Receitas" na lista.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-100 flex justify-end space-x-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !formData.name || !formData.categoryId}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  <span>{saving ? 'Salvando...' : 'Salvar'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Visualização */}
        {isViewModalOpen && viewingItem && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Detalhes do Produto</h2>
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nome</label>
                    <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-xl">{viewingItem.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Categoria</label>
                    <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-xl">{viewingItem.category?.name || 'Sem categoria'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Peso Médio</label>
                    <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-xl">{viewingItem.averageWeight}g</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Tipo de Receita</label>
                    <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-xl">
                      {viewingItem.productRecipes && viewingItem.productRecipes.length > 0 
                        ? `Composta (${viewingItem.productRecipes.length} receitas)`
                        : viewingItem.defaultRecipeId 
                          ? 'Simples (receita padrão)'
                          : 'Sem receita'
                      }
                    </p>
                  </div>
                </div>

                {viewingItem.description && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Descrição</label>
                    <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-xl">{viewingItem.description}</p>
                  </div>
                )}

                {viewingItem.productRecipes && viewingItem.productRecipes.length > 0 && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Receitas Compostas</label>
                    <div className="space-y-3">
                      {viewingItem.productRecipes.map((pr, index) => (
                        <div key={pr.id} className="bg-gray-50 px-4 py-3 rounded-xl">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{pr.recipe.name}</p>
                              <p className="text-sm text-gray-600">Quantidade: {pr.quantity}x</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Ordem: {pr.order}</p>
                              {pr.recipe.adjustedCost && (
                                <p className="text-sm font-medium text-green-600">
                                  R$ {pr.recipe.adjustedCost.toFixed(2)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal de Gerenciamento de Receitas */}
        {isRecipeModalOpen && managingRecipesFor && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Receitas Compostas</h2>
                    <p className="text-gray-600 mt-1">Produto: {managingRecipesFor.name}</p>
                  </div>
                  <button
                    onClick={() => setIsRecipeModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Formulário para adicionar receita */}
                <div className="bg-blue-50 rounded-xl p-6 mb-6">
                  <h3 className="font-semibold text-blue-900 mb-4">Adicionar Receita</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Receita *</label>
                      <select
                        value={recipeFormData.recipeId}
                        onChange={(e) => setRecipeFormData({ ...recipeFormData, recipeId: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Selecione uma receita</option>
                        {recipes
                          .filter(recipe => !productRecipes.some(pr => pr.recipeId === recipe.id))
                          .map(recipe => (
                            <option key={recipe.id} value={recipe.id}>{recipe.name}</option>
                          ))
                        }
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Quantidade</label>
                      <input
                        type="number"
                        value={recipeFormData.quantity}
                        onChange={(e) => setRecipeFormData({ ...recipeFormData, quantity: parseFloat(e.target.value) || 1 })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0.01"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Ordem</label>
                      <input
                        type="number"
                        value={recipeFormData.order}
                        onChange={(e) => setRecipeFormData({ ...recipeFormData, order: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={handleAddRecipe}
                      disabled={saving || !recipeFormData.recipeId}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {saving && <Loader2 size={16} className="animate-spin" />}
                      <Plus size={16} />
                      <span>{saving ? 'Adicionando...' : 'Adicionar Receita'}</span>
                    </button>
                  </div>
                </div>

                {/* Lista de receitas */}
                {loadingRecipes ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center space-y-4">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                      <p className="text-gray-600 font-medium">Carregando receitas...</p>
                    </div>
                  </div>
                ) : productRecipes.length === 0 ? (
                  <div className="text-center py-12">
                    <ChefHat className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma receita adicionada</h3>
                    <p className="text-gray-600">Adicione receitas para criar um produto composto</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Receitas do Produto</h3>
                      <div className="text-sm text-gray-600">
                        {(() => {
                          const totals = calculateProductTotals(productRecipes)
                          return (
                            <div className="flex items-center space-x-4">
                              <span>Total: R$ {totals.totalCost.toFixed(2)}</span>
                              <span>{totals.totalRecipes} receitas</span>
                              <span>{totals.totalIngredients} ingredientes</span>
                            </div>
                          )
                        })()}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {productRecipes
                        .sort((a, b) => a.order - b.order)
                        .map((productRecipe, index) => (
                          <div key={productRecipe.id} className="bg-white border border-gray-200 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold text-sm">
                                  {productRecipe.order}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">{productRecipe.recipe.name}</h4>
                                  <div className="flex items-center space-x-4 mt-1">
                                    <span className="text-sm text-gray-600">Quantidade: {productRecipe.quantity}x</span>
                                    {productRecipe.recipe.category && (
                                      <span className="text-sm text-gray-600">
                                        Categoria: {productRecipe.recipe.category.name}
                                      </span>
                                    )}
                                    {productRecipe.recipe.totalIngredients && (
                                      <span className="text-sm text-gray-600">
                                        {productRecipe.recipe.totalIngredients} ingredientes
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                {productRecipe.recipe.adjustedCost && (
                                  <div className="text-right">
                                    <p className="font-semibold text-green-600">
                                      R$ {productRecipe.recipe.adjustedCost.toFixed(2)}
                                    </p>
                                    {productRecipe.recipe.totalCost && (
                                      <p className="text-sm text-gray-500">
                                        Base: R$ {productRecipe.recipe.totalCost.toFixed(2)}
                                      </p>
                                    )}
                                  </div>
                                )}
                                <button
                                  onClick={() => handleRemoveRecipe(productRecipe.recipeId)}
                                  disabled={deleting === productRecipe.recipeId}
                                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
                                  title="Remover receita"
                                >
                                  {deleting === productRecipe.recipeId ? (
                                    <Loader2 size={16} className="animate-spin" />
                                  ) : (
                                    <Trash2 size={16} />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      }
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

