'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Edit, Trash2, X, Factory, Users, Package, TrendingUp, Calendar, Clock, Loader2, AlertCircle, ChevronDown, Eye } from 'lucide-react'
import { api } from '@/lib/api'

interface Production {
  id: string
  productId: string
  batchNumber: string
  quantityPlanned: number
  quantityProduced?: number
  lossPercentage?: number
  lossWeight?: number
  productionDate: string
  expirationDate?: string
  notes?: string
  status: string
  createdAt?: string
  updatedAt?: string
  product?: {
    id: string
    name: string
    averageWeight: number
    category?: { name: string }
  }
}

interface Product {
  id: string
  name: string
  categoryId: string
  averageWeight: number
  description?: string
  category?: { name: string }
  recipes?: Recipe[]
}

interface Recipe {
  id: string
  name: string
  description?: string
  productId?: string
}

interface User {
  id: string
  name: string
  email: string
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

export default function ProducaoSemEdicao() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [viewingItem, setViewingItem] = useState<Production | null>(null)
  const [productions, setProductions] = useState<Production[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [categories, setCategories] = useState<RecipeCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [formData, setFormData] = useState({
    productId: '',
    productName: '',
    recipeId: '',
    batchNumber: '',
    plannedQuantity: 0,
    quantityProduced: 0,
    lossType: 'percentage' as 'percentage' | 'weight',
    losses: 0,
    productionDate: new Date().toISOString().split('T')[0],
    expirationDate: '',
    observations: '',
    status: 'planejada' as 'planejada' | 'em_andamento' | 'concluida' | 'cancelada'
  })

  // Carregar dados
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      console.log('🔄 Carregando dados de produção...')
      
      const [productionsRes, productsRes, recipesRes, usersRes, categoriesRes] = await Promise.all([
        api.get('/api/productions'),
        api.get('/api/products'),
        api.get('/api/recipes'),
        api.get('/api/users'),
        api.get('/api/recipe-categories')
      ])

      if (productionsRes.data) {
        setProductions(Array.isArray(productionsRes.data) ? productionsRes.data : [])
        console.log('✅ Produções carregadas:', productionsRes.data.length)
      } else {
        setProductions([])
      }

      if (productsRes.data) {
        setProducts(Array.isArray(productsRes.data) ? productsRes.data : [])
        console.log('✅ Produtos carregados:', productsRes.data.length)
      } else {
        setProducts([])
      }

      if (recipesRes.data) {
        setRecipes(Array.isArray(recipesRes.data) ? recipesRes.data : [])
        console.log('✅ Receitas carregadas:', recipesRes.data.length)
      } else {
        setRecipes([])
      }

      if (usersRes.data) {
        setUsers(Array.isArray(usersRes.data) ? usersRes.data : [])
        console.log('✅ Usuários carregados:', usersRes.data.length)
      } else {
        setUsers([])
      }

      if (categoriesRes.data) {
        setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : [])
        console.log('✅ Categorias carregadas:', categoriesRes.data.length)
      } else {
        setCategories([])
      }

    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error)
      showToast('Falha ao carregar dados. Verifique sua conexão.', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Função para encontrar receita associada ao produto
  const findRecipeForProduct = (productId: string): Recipe | null => {
    if (!productId) return null
    
    const recipeByProductId = recipes.find(recipe => recipe.productId === productId)
    if (recipeByProductId) {
      console.log('✅ Receita encontrada por productId:', recipeByProductId.name)
      return recipeByProductId
    }

    const product = products.find(p => p.id === productId)
    if (product) {
      const recipeByName = recipes.find(recipe => 
        recipe.name.toLowerCase().includes(product.name.toLowerCase()) ||
        product.name.toLowerCase().includes(recipe.name.toLowerCase())
      )
      if (recipeByName) {
        console.log('✅ Receita encontrada por nome similar:', recipeByName.name)
        return recipeByName
      }
    }

    if (recipes.length > 0) {
      console.log('⚠️ Usando primeira receita como fallback:', recipes[0].name)
      return recipes[0]
    }

    console.log('❌ Nenhuma receita encontrada')
    return null
  }

  // Filtrar produções
  const filteredProductions = productions.filter(production => {
    const matchesSearch = production.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (production.product?.name && production.product.name.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === '' || production.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleAdd = () => {
    setFormData({
      productId: '',
      productName: '',
      recipeId: '',
      batchNumber: `LOTE-${Date.now()}`,
      plannedQuantity: 0,
      quantityProduced: 0,
      lossType: 'percentage',
      losses: 0,
      productionDate: new Date().toISOString().split('T')[0],
      expirationDate: '',
      observations: '',
      status: 'planejada'
    })
    setIsModalOpen(true)
  }

  // ❌ EDIÇÃO DESABILITADA TEMPORARIAMENTE
  const handleEdit = (item: Production) => {
    showToast('Edição temporariamente desabilitada. Use exclusão + nova criação como alternativa.', 'error')
    console.log('⚠️ Edição desabilitada para evitar erro 400')
  }

  const handleView = (item: Production) => {
    setViewingItem(item)
    setIsViewModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta produção?')) return

    try {
      setDeleting(id)
      console.log('🗑️ Excluindo produção:', id)
      
      const response = await api.delete(`/api/productions/${id}`)
      
      if (response.data || !response.error) {
        setProductions(productions.filter(item => item.id !== id))
        showToast('Produção excluída com sucesso!')
        console.log('✅ Produção excluída')
      } else {
        throw new Error(response.error || 'Falha ao excluir')
      }
    } catch (error) {
      console.error('❌ Erro ao excluir:', error)
      showToast('Falha ao excluir produção. Tente novamente.', 'error')
    } finally {
      setDeleting(null)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      console.log('💾 Salvando nova produção...')
      console.log('📋 Dados do formulário:', formData)

      // Validações básicas
      if (!formData.productId) {
        showToast('Selecione um produto', 'error')
        return
      }

      if (!formData.batchNumber.trim()) {
        showToast('Número do lote é obrigatório', 'error')
        return
      }

      if (!formData.plannedQuantity || formData.plannedQuantity <= 0) {
        showToast('Quantidade planejada deve ser maior que zero', 'error')
        return
      }

      if (!formData.productionDate) {
        showToast('Data de produção é obrigatória', 'error')
        return
      }

      // Buscar receita real associada ao produto
      const associatedRecipe = findRecipeForProduct(formData.productId)
      if (!associatedRecipe) {
        showToast('Nenhuma receita encontrada para este produto. Cadastre uma receita primeiro.', 'error')
        return
      }

      console.log('🍳 Receita encontrada:', associatedRecipe.name)

      // ✅ APENAS CRIAÇÃO - SEM EDIÇÃO
      const apiData = {
        recipeId: associatedRecipe.id,
        productId: formData.productId,
        batchNumber: formData.batchNumber.trim(),
        quantityPlanned: Number(formData.plannedQuantity),
        quantityProduced: formData.quantityProduced > 0 ? Number(formData.quantityProduced) : null,
        lossPercentage: formData.lossType === 'percentage' && formData.losses > 0 ? Number(formData.losses) : null,
        lossWeight: formData.lossType === 'weight' && formData.losses > 0 ? Number(formData.losses) : null,
        productionDate: formData.productionDate,
        expirationDate: formData.expirationDate || null,
        notes: formData.observations.trim() || null,
        status: formData.status
      }

      // Remover campos null/undefined para evitar problemas de validação
      Object.keys(apiData).forEach(key => {
        if (apiData[key] === null || apiData[key] === undefined || apiData[key] === '') {
          delete apiData[key]
        }
      })

      console.log('📡 Dados para API (apenas criação):', apiData)

      console.log('🆕 Criando nova produção')
      const response = await api.post('/api/productions', apiData)

      console.log('📊 Resposta da API:', response)

      if (response.data && !response.error) {
        showToast('Produção criada com sucesso!')
        setIsModalOpen(false)
        
        // Resetar formulário
        setFormData({
          productId: '',
          productName: '',
          recipeId: '',
          batchNumber: `LOTE-${Date.now()}`,
          plannedQuantity: 0,
          quantityProduced: 0,
          lossType: 'percentage',
          losses: 0,
          productionDate: new Date().toISOString().split('T')[0],
          expirationDate: '',
          observations: '',
          status: 'planejada'
        })
        
        // Recarregar dados
        console.log('🔄 Recarregando dados...')
        await loadData()
      } else {
        console.error('❌ API retornou erro:', response.error)
        throw new Error(response.error || 'Falha ao salvar')
      }

    } catch (error) {
      console.error('❌ Erro ao salvar:', error)
      
      let errorMessage = 'Erro desconhecido'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      
      showToast(`Falha ao salvar produção: ${errorMessage}`, 'error')
    } finally {
      setSaving(false)
    }
  }

  // Função para selecionar produto via dropdown
  const handleProductChange = (productId: string) => {
    const selectedProduct = products.find(p => p.id === productId)
    const associatedRecipe = findRecipeForProduct(productId)
    
    setFormData({
      ...formData,
      productId: productId,
      productName: selectedProduct?.name || '',
      recipeId: associatedRecipe?.id || ''
    })
    
    console.log('✅ Produto selecionado via dropdown:', selectedProduct?.name)
    if (associatedRecipe) {
      console.log('✅ Receita associada:', associatedRecipe.name)
    }
  }

  // Calcular métricas
  const totalProductions = productions.length
  const inProgressProductions = productions.filter(p => p.status === 'em_andamento').length
  const completedProductions = productions.filter(p => p.status === 'concluida').length
  const averageEfficiency = completedProductions > 0 
    ? productions
        .filter(p => p.status === 'concluida' && p.quantityProduced && p.quantityPlanned)
        .reduce((acc, p) => acc + ((p.quantityProduced! / p.quantityPlanned) * 100), 0) / completedProductions
    : 0

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatWeight = (weight: number) => {
    if (weight >= 1000) {
      return `${(weight / 1000).toFixed(1)}kg`
    }
    return `${weight}g`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planejada': return 'bg-blue-100 text-blue-800'
      case 'em_andamento': return 'bg-yellow-100 text-yellow-800'
      case 'concluida': return 'bg-green-100 text-green-800'
      case 'cancelada': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planejada': return 'Planejada'
      case 'em_andamento': return 'Em Andamento'
      case 'concluida': return 'Concluída'
      case 'cancelada': return 'Cancelada'
      default: return status
    }
  }

  // Encontrar nome da categoria
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category?.name || 'Sem categoria'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 text-lg">Carregando produção...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              Produção
            </h1>
            <p className="text-gray-600 mt-2 text-lg">Gerencie a produção dos seus produtos</p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus size={24} />
            <span className="font-semibold">Nova Produção</span>
          </button>
        </div>

        {/* Aviso sobre edição desabilitada */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="text-yellow-600" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800">Edição Temporariamente Desabilitada</h3>
              <p className="text-yellow-700 mt-1">
                Para evitar erros, a edição está desabilitada. Use <strong>exclusão + nova criação</strong> como alternativa.
                Apenas <strong>visualização</strong> e <strong>exclusão</strong> estão disponíveis.
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                <Factory className="text-white" size={28} />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Produções Hoje</p>
                <p className="text-3xl font-bold text-gray-900">{totalProductions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-lg">
                <Clock className="text-white" size={28} />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Em Andamento</p>
                <p className="text-3xl font-bold text-gray-900">{inProgressProductions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg">
                <Package className="text-white" size={28} />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Concluídas</p>
                <p className="text-3xl font-bold text-gray-900">{completedProductions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg">
                <TrendingUp className="text-white" size={28} />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Eficiência Média</p>
                <p className="text-3xl font-bold text-gray-900">{averageEfficiency.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 p-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
                <input
                  type="text"
                  placeholder="Buscar por lote ou produto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm text-lg"
                />
              </div>
            </div>
            <div className="lg:w-64">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm text-lg"
              >
                <option value="">Todos os status</option>
                <option value="planejada">Planejada</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="concluida">Concluída</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Lote</th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Produto</th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Quantidade</th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Data Produção</th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Data Validade</th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white/50 divide-y divide-gray-200">
                {filteredProductions.map((production) => (
                  <tr key={production.id} className="hover:bg-white/70 transition-colors duration-200">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{production.batchNumber}</div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{production.product?.name || 'Produto não encontrado'}</div>
                      {production.product?.category && (
                        <div className="text-sm text-gray-500">{production.product.category.name}</div>
                      )}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>Planejado: {formatWeight(production.quantityPlanned)}</div>
                        {production.quantityProduced && (
                          <div>Produzido: {formatWeight(production.quantityProduced)}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className={`px-4 py-2 text-sm font-semibold rounded-full ${getStatusColor(production.status)}`}>
                        {getStatusLabel(production.status)}
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(production.productionDate)}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-900">
                      {production.expirationDate ? formatDate(production.expirationDate) : '-'}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleView(production)}
                          className="text-green-600 hover:text-green-900 p-2 rounded-xl hover:bg-green-50 transition-colors"
                          title="Visualizar detalhes"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(production)}
                          className="text-gray-400 p-2 rounded-xl cursor-not-allowed opacity-50"
                          title="Edição temporariamente desabilitada"
                          disabled
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(production.id)}
                          disabled={deleting === production.id}
                          className="text-red-600 hover:text-red-900 p-2 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
                          title="Excluir produção"
                        >
                          {deleting === production.id ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProductions.length === 0 && (
            <div className="text-center py-16">
              <Factory className="mx-auto h-16 w-16 text-gray-400 mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Nenhuma produção encontrada</h3>
              <p className="text-gray-500 text-lg">Comece criando sua primeira produção.</p>
            </div>
          )}
        </div>

        {/* Modal de Criação */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-6 w-full max-w-4xl shadow-2xl border border-white/50 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Nova Produção
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Dropdown de Produtos */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Produto *</label>
                  <div className="relative">
                    <select
                      value={formData.productId}
                      onChange={(e) => handleProductChange(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm appearance-none pr-10"
                    >
                      <option value="">Selecione um produto</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} - {getCategoryName(product.categoryId)} - {formatWeight(product.averageWeight)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                  </div>
                  {products.length === 0 && (
                    <p className="text-sm text-red-600 mt-1">Nenhum produto cadastrado. Cadastre produtos primeiro.</p>
                  )}
                </div>

                {/* Dados da Produção */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Número do Lote *</label>
                    <input
                      type="text"
                      value={formData.batchNumber}
                      onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                      placeholder="Ex: LOTE-001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Quantidade Planejada (g) *</label>
                    <input
                      type="number"
                      value={formData.plannedQuantity || ''}
                      onChange={(e) => setFormData({ ...formData, plannedQuantity: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                      placeholder="Ex: 1000"
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Quantidade Produzida (g)</label>
                    <input
                      type="number"
                      value={formData.quantityProduced || ''}
                      onChange={(e) => setFormData({ ...formData, quantityProduced: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                      placeholder="Ex: 950"
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Data de Produção *</label>
                    <input
                      type="date"
                      value={formData.productionDate}
                      onChange={(e) => setFormData({ ...formData, productionDate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Data de Validade</label>
                    <input
                      type="date"
                      value={formData.expirationDate}
                      onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                    >
                      <option value="planejada">Planejada</option>
                      <option value="em_andamento">Em Andamento</option>
                      <option value="concluida">Concluída</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </div>
                </div>

                {/* Perdas */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Perdas</label>
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={formData.lossType}
                      onChange={(e) => setFormData({ ...formData, lossType: e.target.value as any })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                    >
                      <option value="percentage">Percentual (%)</option>
                      <option value="weight">Peso (g)</option>
                    </select>
                    <input
                      type="number"
                      value={formData.losses || ''}
                      onChange={(e) => setFormData({ ...formData, losses: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                      placeholder={formData.lossType === 'percentage' ? 'Ex: 5' : 'Ex: 50'}
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>

                {/* Observações */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Observações</label>
                  <textarea
                    value={formData.observations}
                    onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                    rows={3}
                    placeholder="Observações sobre a produção..."
                  />
                </div>
              </div>

              <div className="flex space-x-4 mt-8">
                <button
                  onClick={handleSave}
                  disabled={saving || !formData.productId}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {saving ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Factory size={20} />
                      <span>Salvar Produção</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Visualização */}
        {isViewModalOpen && viewingItem && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-6 w-full max-w-2xl shadow-2xl border border-white/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Detalhes da Produção
                </h3>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Lote</label>
                    <p className="text-gray-900">{viewingItem.batchNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Produto</label>
                    <p className="text-gray-900">{viewingItem.product?.name || 'Produto não encontrado'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Quantidade Planejada</label>
                    <p className="text-gray-900">{formatWeight(viewingItem.quantityPlanned)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Quantidade Produzida</label>
                    <p className="text-gray-900">{viewingItem.quantityProduced ? formatWeight(viewingItem.quantityProduced) : '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(viewingItem.status)}`}>
                      {getStatusLabel(viewingItem.status)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Data de Produção</label>
                    <p className="text-gray-900">{formatDate(viewingItem.productionDate)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Data de Validade</label>
                    <p className="text-gray-900">{viewingItem.expirationDate ? formatDate(viewingItem.expirationDate) : '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Perdas</label>
                    <p className="text-gray-900">
                      {viewingItem.lossPercentage ? `${viewingItem.lossPercentage}%` : 
                       viewingItem.lossWeight ? formatWeight(viewingItem.lossWeight) : '-'}
                    </p>
                  </div>
                </div>
                
                {viewingItem.notes && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Observações</label>
                    <p className="text-gray-900">{viewingItem.notes}</p>
                  </div>
                )}

                {viewingItem.quantityProduced && viewingItem.quantityPlanned && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Eficiência</label>
                    <p className="text-gray-900">
                      {((viewingItem.quantityProduced / viewingItem.quantityPlanned) * 100).toFixed(1)}%
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-8">
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

