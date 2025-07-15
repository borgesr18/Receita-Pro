'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  Search,
  Calendar,
  Clock,
  CheckCircle,
  TrendingUp,
  Loader2,
  AlertCircle,
  Factory,
  Users,
  Package,
  ChefHat,
  Utensils,
  ChevronDown,
  User,
  Building
} from 'lucide-react'
import { api } from '@/lib/api'

interface Production {
  id?: string
  recipeId: string
  recipeName: string
  quantityProduced: number
  plannedQuantity: number
  productionDate: string
  startTime: string
  endTime: string
  operator: string
  batchNumber: string
  losses: number
  lossType: 'weight' | 'percentage'
  observations: string
  status: 'planejada' | 'em_andamento' | 'concluida' | 'cancelada'
  createdAt?: string
  ingredients?: any[]
}

interface Recipe {
  id: string
  name: string
  description?: string
  categoryId?: string
  preparationTime?: number
  ovenTemperature?: number
  yield?: number
  category?: { name: string }
  ingredients?: any[]
}

interface User {
  id: string
  name: string
  email: string
  role?: string
}

interface Category {
  id: string
  name: string
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

export default function ProducaoCorrigida() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Production | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [producoes, setProducoes] = useState<Production[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  
  // Estados para dropdown de receitas
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [recipeSearchTerm, setRecipeSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const [formData, setFormData] = useState<Production>({
    recipeId: '',
    recipeName: '',
    quantityProduced: 0,
    plannedQuantity: 0,
    productionDate: '',
    startTime: '',
    endTime: '',
    operator: '',
    batchNumber: '',
    losses: 0,
    lossType: 'weight',
    observations: '',
    status: 'planejada',
    ingredients: []
  })

  const statusOptions = [
    { value: 'planejada', label: 'Planejada', color: 'bg-blue-100 text-blue-800' },
    { value: 'em_andamento', label: 'Em Andamento', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'concluida', label: 'Concluída', color: 'bg-green-100 text-green-800' },
    { value: 'cancelada', label: 'Cancelada', color: 'bg-red-100 text-red-800' }
  ]

  // Carregar dados iniciais
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Carregar todos os dados em paralelo
      const [productionsResponse, recipesResponse, usersResponse, categoriesResponse] = await Promise.all([
        api.get('/api/productions').catch(() => ({ ok: false })),
        api.get('/api/recipes').catch(() => ({ ok: false })),
        api.get('/api/users').catch(() => ({ ok: false })),
        api.get('/api/recipe-categories').catch(() => ({ ok: false }))
      ])

      console.log('🔍 Respostas das APIs:', {
        productions: productionsResponse.ok,
        recipes: recipesResponse.ok,
        users: usersResponse.ok,
        categories: categoriesResponse.ok
      })

      if (productionsResponse.ok) {
        const productionsData = await productionsResponse.json()
        console.log('📊 Dados de produção:', productionsData)
        
        const mappedProductions = productionsData.map((prod: any) => ({
          id: prod.id,
          recipeId: prod.recipeId,
          recipeName: prod.recipe?.name || 'Receita não encontrada',
          quantityProduced: prod.quantityProduced || 0,
          plannedQuantity: prod.quantityPlanned,
          productionDate: prod.productionDate ? new Date(prod.productionDate).toISOString().split('T')[0] : '',
          startTime: '',
          endTime: '',
          operator: 'Operador não definido',
          batchNumber: prod.batchNumber,
          losses: prod.lossWeight || 0,
          lossType: 'weight' as const,
          observations: prod.notes || '',
          status: mapStatusFromDB(prod.status),
          createdAt: prod.createdAt,
          ingredients: []
        }))
        setProducoes(mappedProductions)
      }

      if (recipesResponse.ok) {
        const recipesData = await recipesResponse.json()
        console.log('🍳 Receitas carregadas:', recipesData.length)
        setRecipes(recipesData)
      } else {
        console.log('❌ Falha ao carregar receitas')
        showToast('Falha ao carregar receitas. Verifique se há receitas cadastradas.', 'error')
      }

      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        console.log('👥 Usuários carregados:', usersData.length)
        setUsers(usersData)
      } else {
        console.log('❌ Falha ao carregar usuários')
      }

      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        console.log('📂 Categorias carregadas:', categoriesData.length)
        setCategories(categoriesData)
      }

    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error)
      showToast('Falha ao carregar dados. Verifique sua conexão.', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Mapear status do banco para interface
  const mapStatusFromDB = (dbStatus: string): Production['status'] => {
    const statusMap: Record<string, Production['status']> = {
      'Planejado': 'planejada',
      'Em_Andamento': 'em_andamento', 
      'Completo': 'concluida',
      'Cancelado': 'cancelada'
    }
    return statusMap[dbStatus] || 'planejada'
  }

  // Filtrar receitas para dropdown
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(recipeSearchTerm.toLowerCase())
    const matchesCategory = selectedCategory === '' || recipe.categoryId === selectedCategory
    return matchesSearch && matchesCategory
  })

  const filteredProducoes = producoes.filter(producao => {
    const matchesSearch = producao.recipeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         producao.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         producao.operator.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === '' || producao.status === filterStatus
    const matchesDate = filterDate === '' || producao.productionDate === filterDate
    return matchesSearch && matchesStatus && matchesDate
  })

  const handleAdd = () => {
    setEditingItem(null)
    const today = new Date().toISOString().split('T')[0]
    const now = new Date().toTimeString().slice(0, 5)
    setFormData({
      recipeId: '',
      recipeName: '',
      quantityProduced: 0,
      plannedQuantity: 0,
      productionDate: today,
      startTime: now,
      endTime: '',
      operator: '',
      batchNumber: '',
      losses: 0,
      lossType: 'weight',
      observations: '',
      status: 'planejada',
      ingredients: []
    })
    setIsModalOpen(true)
  }

  const handleEdit = (item: Production) => {
    setEditingItem(item)
    setFormData(item)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta produção?')) return

    try {
      setDeleting(id)
      const response = await api.delete(`/api/productions/${id}`)
      
      if (response.ok) {
        setProducoes(producoes.filter(item => item.id !== id))
        showToast('Produção excluída com sucesso!')
      } else {
        throw new Error('Falha ao excluir')
      }
    } catch (error) {
      console.error('Erro ao excluir:', error)
      showToast('Falha ao excluir produção. Tente novamente.', 'error')
    } finally {
      setDeleting(null)
    }
  }

  const handleRecipeSelect = (recipe: Recipe) => {
    const batchNumber = generateBatchNumber(recipe.name, formData.productionDate)
    setFormData({
      ...formData,
      recipeId: recipe.id,
      recipeName: recipe.name,
      plannedQuantity: recipe.yield || 1000,
      batchNumber
    })
    setIsDropdownOpen(false)
    setRecipeSearchTerm('')
  }

  const generateBatchNumber = (recipeName: string, date: string) => {
    const prefix = recipeName.split(' ').map(word => word.charAt(0)).join('').toUpperCase()
    const dateStr = date.replace(/-/g, '')
    const sequence = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')
    return `${prefix}-${dateStr}-${sequence}`
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      // Validações básicas
      if (!formData.recipeId) {
        showToast('Selecione uma receita', 'error')
        return
      }

      if (!formData.batchNumber) {
        showToast('Número do lote é obrigatório', 'error')
        return
      }

      if (!formData.plannedQuantity || formData.plannedQuantity <= 0) {
        showToast('Quantidade planejada deve ser maior que zero', 'error')
        return
      }

      // Preparar dados para API
      const apiData = {
        recipeId: formData.recipeId,
        productId: formData.recipeId, // Usando recipeId como productId temporariamente
        batchNumber: formData.batchNumber,
        quantityPlanned: formData.plannedQuantity,
        quantityProduced: formData.quantityProduced,
        lossWeight: formData.losses,
        productionDate: formData.productionDate,
        notes: formData.observations,
        status: formData.status
      }

      let response
      if (editingItem?.id) {
        response = await api.put(`/api/productions/${editingItem.id}`, apiData)
      } else {
        response = await api.post('/api/productions', apiData)
      }

      if (response.ok) {
        showToast(editingItem ? 'Produção atualizada com sucesso!' : 'Produção criada com sucesso!')
        setIsModalOpen(false)
        setEditingItem(null)
        await loadData() // Recarregar dados
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Falha ao salvar')
      }

    } catch (error) {
      console.error('Erro ao salvar:', error)
      showToast('Falha ao salvar produção. Tente novamente.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const calculateEfficiency = (produced: number, planned: number) => {
    if (planned === 0) return 0
    return (produced / planned) * 100
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return '-'
    return timeString
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = statusOptions.find(s => s.value === status)
    return statusConfig || statusOptions[0]
  }

  // Calcular métricas do dashboard
  const today = new Date().toISOString().split('T')[0]
  const producaoHoje = producoes.filter(p => p.productionDate === today).length
  const emAndamento = producoes.filter(p => p.status === 'em_andamento').length
  const concluidas = producoes.filter(p => p.status === 'concluida').length
  const eficienciaMedia = concluidas > 0 
    ? Math.round(producoes.filter(p => p.status === 'concluida')
        .reduce((acc, p) => acc + calculateEfficiency(p.quantityProduced, p.plannedQuantity), 0) / concluidas)
    : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 text-lg">Carregando dados de produção...</p>
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
            <p className="text-gray-600 mt-2 text-lg">Gerencie a produção e consumo de insumos</p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus size={24} />
            <span className="font-semibold">Nova Produção</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                <Calendar className="text-white" size={28} />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Produções Hoje</p>
                <p className="text-3xl font-bold text-gray-900">{producaoHoje}</p>
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
                <p className="text-3xl font-bold text-gray-900">{emAndamento}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg">
                <CheckCircle className="text-white" size={28} />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Concluídas</p>
                <p className="text-3xl font-bold text-gray-900">{concluidas}</p>
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
                <p className="text-3xl font-bold text-gray-900">{eficienciaMedia}%</p>
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
                  placeholder="Buscar por receita, lote ou operador..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm text-lg"
                />
              </div>
            </div>
            <div className="lg:w-64">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm text-lg"
              >
                <option value="">Todos os status</option>
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
            <div className="lg:w-64">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm text-lg"
              />
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
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Receita</th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Quantidade</th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Data</th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Operador</th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Eficiência</th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white/50 divide-y divide-gray-200">
                {filteredProducoes.map((producao) => {
                  const efficiency = calculateEfficiency(producao.quantityProduced, producao.plannedQuantity)
                  const statusBadge = getStatusBadge(producao.status)
                  
                  return (
                    <tr key={producao.id} className="hover:bg-white/70 transition-colors duration-200">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{producao.batchNumber}</div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{producao.recipeName}</div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {producao.quantityProduced > 0 ? `${producao.quantityProduced}g` : '-'} / {producao.plannedQuantity}g
                        </div>
                        {producao.losses > 0 && (
                          <div className="text-xs text-red-600 font-medium">
                            Perda: {producao.losses}{producao.lossType === 'weight' ? 'g' : '%'}
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(producao.productionDate)}</div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-900">
                        {producao.operator}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className={`px-4 py-2 text-sm font-semibold rounded-full ${statusBadge.color}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        {producao.status === 'concluida' ? (
                          <div className={`text-sm font-bold ${
                            efficiency >= 90 ? 'text-green-600' : 
                            efficiency >= 80 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {efficiency.toFixed(1)}%
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleEdit(producao)}
                            className="text-blue-600 hover:text-blue-900 p-2 rounded-xl hover:bg-blue-50 transition-colors"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(producao.id || '')}
                            disabled={deleting === producao.id}
                            className="text-red-600 hover:text-red-900 p-2 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            {deleting === producao.id ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredProducoes.length === 0 && (
            <div className="text-center py-16">
              <Factory className="mx-auto h-16 w-16 text-gray-400 mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Nenhuma produção encontrada</h3>
              <p className="text-gray-500 text-lg">Comece criando uma nova produção.</p>
            </div>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/50">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {editingItem ? 'Editar' : 'Adicionar'} Produção
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-3 rounded-2xl hover:bg-gray-100 transition-colors"
                >
                  <X size={28} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Dropdown de Receitas */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-3">Receita *</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm text-left flex items-center justify-between text-lg"
                    >
                      <span className={formData.recipeName ? 'text-gray-900' : 'text-gray-500'}>
                        {formData.recipeName || 'Selecione uma receita...'}
                      </span>
                      <ChevronDown className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} size={24} />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-lg border border-white/50 rounded-2xl shadow-2xl max-h-96 overflow-hidden z-50">
                        {/* Busca e filtros */}
                        <div className="p-4 border-b border-gray-200">
                          <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                              type="text"
                              placeholder="Buscar receita..."
                              value={recipeSearchTerm}
                              onChange={(e) => setRecipeSearchTerm(e.target.value)}
                              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                            />
                          </div>
                          <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                          >
                            <option value="">Todas as categorias</option>
                            {categories.map(category => (
                              <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Lista de receitas */}
                        <div className="max-h-64 overflow-y-auto">
                          {filteredRecipes.length > 0 ? (
                            filteredRecipes.map((recipe) => (
                              <button
                                key={recipe.id}
                                onClick={() => handleRecipeSelect(recipe)}
                                className="w-full px-6 py-4 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                              >
                                <div className="flex items-center space-x-3">
                                  <ChefHat className="text-blue-600" size={20} />
                                  <div>
                                    <div className="font-semibold text-gray-900">{recipe.name}</div>
                                    {recipe.description && (
                                      <div className="text-sm text-gray-600">{recipe.description}</div>
                                    )}
                                    <div className="text-xs text-gray-500 mt-1">
                                      {recipe.preparationTime && `⏱️ ${recipe.preparationTime}min`}
                                      {recipe.ovenTemperature && ` • 🌡️ ${recipe.ovenTemperature}°C`}
                                      {recipe.category && ` • 📂 ${recipe.category.name}`}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="px-6 py-8 text-center text-gray-500">
                              <ChefHat className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                              <p>Nenhuma receita encontrada</p>
                              {recipes.length === 0 && (
                                <p className="text-sm mt-1">Cadastre receitas primeiro nas Fichas Técnicas</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Quantidade Planejada (g) *</label>
                  <input
                    type="number"
                    value={formData.plannedQuantity || ''}
                    onChange={(e) => setFormData({ ...formData, plannedQuantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm text-lg"
                    placeholder="Ex: 1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Data de Produção *</label>
                  <input
                    type="date"
                    value={formData.productionDate}
                    onChange={(e) => setFormData({ ...formData, productionDate: e.target.value })}
                    className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm text-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Operador</label>
                  <select
                    value={formData.operator}
                    onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                    className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm text-lg"
                  >
                    <option value="">Selecione o operador</option>
                    {users.map(user => (
                      <option key={user.id} value={user.name}>{user.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Número do Lote *</label>
                  <input
                    type="text"
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                    className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm text-lg"
                    placeholder="Ex: PF-20250715-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Production['status'] })}
                    className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm text-lg"
                  >
                    {statusOptions.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Quantidade Produzida (g)</label>
                  <input
                    type="number"
                    value={formData.quantityProduced || ''}
                    onChange={(e) => setFormData({ ...formData, quantityProduced: parseInt(e.target.value) || 0 })}
                    className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm text-lg"
                    placeholder="Ex: 950"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Perdas</label>
                  <div className="flex space-x-3">
                    <input
                      type="number"
                      value={formData.losses || ''}
                      onChange={(e) => setFormData({ ...formData, losses: parseFloat(e.target.value) || 0 })}
                      className="flex-1 px-6 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm text-lg"
                      placeholder="Ex: 50"
                    />
                    <select
                      value={formData.lossType}
                      onChange={(e) => setFormData({ ...formData, lossType: e.target.value as Production['lossType'] })}
                      className="px-6 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm text-lg"
                    >
                      <option value="weight">g</option>
                      <option value="percentage">%</option>
                    </select>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-3">Observações</label>
                  <textarea
                    value={formData.observations}
                    onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                    className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm text-lg"
                    rows={4}
                    placeholder="Observações sobre a produção..."
                  />
                </div>
              </div>

              <div className="flex space-x-6 mt-10">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
                >
                  {saving ? (
                    <>
                      <Loader2 size={24} className="animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Save size={24} />
                      <span>Salvar Produção</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                  className="flex-1 px-8 py-4 border-2 border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

