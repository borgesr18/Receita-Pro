'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Package, 
  Plus, 
  Save,
  X,
  Search,
  Calendar,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Loader2,
  Eye,
  Edit,
  Trash2,
  Factory,
  DollarSign,
  Clock,
  Archive,
  ArrowUpCircle,
  ArrowDownCircle,
  History,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react'
import { api } from '@/lib/api'

interface Ingredient {
  id: string
  name: string
  categoryId: string
  unitId: string
  pricePerUnit: number
  supplierId?: string
  purchaseDate?: string
  ingredientType: string
  expirationDate?: string
  storageCondition: string
  currentStock: number
  minimumStock: number
  createdAt: string
  updatedAt: string
  category?: {
    id: string
    name: string
  }
  unit?: {
    id: string
    name: string
    abbreviation: string
  }
  supplier?: {
    id: string
    name: string
  }
}

interface StockMovement {
  id: string
  ingredientId: string
  type: 'Entrada' | 'Saída'
  quantity: number
  reason: string
  date: string
  reference?: string
  ingredient?: Ingredient
}

interface IngredientCategory {
  id: string
  name: string
  description?: string
}

interface MeasurementUnit {
  id: string
  name: string
  abbreviation: string
  type: string
}

interface Supplier {
  id: string
  name: string
  email?: string
  phone?: string
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

export default function EstoqueCompleto() {
  const [activeTab, setActiveTab] = useState('insumos')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Ingredient | null>(null)
  const [viewingItem, setViewingItem] = useState<Ingredient | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [movementSearchTerm, setMovementSearchTerm] = useState('')
  const [movementFilterType, setMovementFilterType] = useState('')
  
  // Estados para dados
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [categories, setCategories] = useState<IngredientCategory[]>([])
  const [units, setUnits] = useState<MeasurementUnit[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [movements, setMovements] = useState<StockMovement[]>([])
  
  // Estados de loading
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [loadingMovements, setLoadingMovements] = useState(false)

  // Formulário de ingrediente
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    unitId: '',
    pricePerUnit: 0,
    supplierId: '',
    purchaseDate: '',
    ingredientType: 'PRINCIPAL',
    expirationDate: '',
    storageCondition: 'AMBIENTE_SECO',
    currentStock: 0,
    minimumStock: 0
  })

  // Formulário de movimentação
  const [movementData, setMovementData] = useState({
    ingredientId: '',
    type: 'Entrada' as 'Entrada' | 'Saída',
    quantity: 0,
    reason: '',
    reference: ''
  })

  // Carregar dados
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      console.log('🔄 Carregando dados do estoque...')
      
      const [ingredientsRes, categoriesRes, unitsRes, suppliersRes] = await Promise.all([
        api.get('/api/ingredients'),
        api.get('/api/ingredient-categories'),
        api.get('/api/measurement-units'),
        api.get('/api/suppliers')
      ])

      if (ingredientsRes.data) {
        setIngredients(Array.isArray(ingredientsRes.data) ? ingredientsRes.data : [])
        console.log('✅ Ingredientes carregados:', ingredientsRes.data.length)
      } else {
        setIngredients([])
      }

      if (categoriesRes.data) {
        setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : [])
        console.log('✅ Categorias carregadas:', categoriesRes.data.length)
      } else {
        setCategories([])
      }

      if (unitsRes.data) {
        setUnits(Array.isArray(unitsRes.data) ? unitsRes.data : [])
        console.log('✅ Unidades carregadas:', unitsRes.data.length)
      } else {
        setUnits([])
      }

      if (suppliersRes.data) {
        setSuppliers(Array.isArray(suppliersRes.data) ? suppliersRes.data : [])
        console.log('✅ Fornecedores carregados:', suppliersRes.data.length)
      } else {
        setSuppliers([])
      }

    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error)
      showToast('Falha ao carregar dados. Verifique sua conexão.', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  // Carregar movimentações
  const loadMovements = useCallback(async () => {
    try {
      setLoadingMovements(true)
      console.log('🔄 Carregando movimentações...')
      
      const response = await api.get('/api/stock-movements')
      
      if (response.data) {
        setMovements(Array.isArray(response.data) ? response.data : [])
        console.log('✅ Movimentações carregadas:', response.data.length)
      } else {
        setMovements([])
      }

    } catch (error) {
      console.error('❌ Erro ao carregar movimentações:', error)
      showToast('Falha ao carregar movimentações.', 'error')
    } finally {
      setLoadingMovements(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (activeTab === 'movimentacoes') {
      loadMovements()
    }
  }, [activeTab, loadMovements])

  // Filtrar ingredientes
  const filteredIngredients = ingredients.filter(ingredient => {
    const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === '' || ingredient.categoryId === filterCategory
    const matchesStatus = filterStatus === '' || getIngredientStatus(ingredient) === filterStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  // Filtrar movimentações
  const filteredMovements = movements.filter(movement => {
    const matchesSearch = movement.ingredient?.name.toLowerCase().includes(movementSearchTerm.toLowerCase()) || 
                         movement.reason.toLowerCase().includes(movementSearchTerm.toLowerCase())
    const matchesType = movementFilterType === '' || movement.type === movementFilterType
    return matchesSearch && matchesType
  })

  // Determinar status do ingrediente
  const getIngredientStatus = (ingredient: Ingredient) => {
    if (ingredient.currentStock <= ingredient.minimumStock) return 'baixo'
    if (ingredient.expirationDate) {
      const daysUntilExpiration = getDaysUntilExpiration(ingredient.expirationDate)
      if (daysUntilExpiration <= 0) return 'vencido'
      if (daysUntilExpiration <= 7) return 'vencendo'
    }
    return 'normal'
  }

  const getDaysUntilExpiration = (expirationDate: string) => {
    const today = new Date()
    const expDate = new Date(expirationDate)
    const diffTime = expDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-800'
      case 'baixo': return 'bg-yellow-100 text-yellow-800'
      case 'vencendo': return 'bg-orange-100 text-orange-800'
      case 'vencido': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'normal': return 'Normal'
      case 'baixo': return 'Estoque Baixo'
      case 'vencendo': return 'Vencendo'
      case 'vencido': return 'Vencido'
      default: return status
    }
  }

  // Handlers para ingredientes
  const handleAdd = () => {
    setEditingItem(null)
    setFormData({
      name: '',
      categoryId: '',
      unitId: '',
      pricePerUnit: 0,
      supplierId: '',
      purchaseDate: '',
      ingredientType: 'PRINCIPAL',
      expirationDate: '',
      storageCondition: 'AMBIENTE_SECO',
      currentStock: 0,
      minimumStock: 0
    })
    setIsModalOpen(true)
  }

  const handleEdit = (item: Ingredient) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      categoryId: item.categoryId,
      unitId: item.unitId,
      pricePerUnit: item.pricePerUnit,
      supplierId: item.supplierId || '',
      purchaseDate: item.purchaseDate ? item.purchaseDate.split('T')[0] : '',
      ingredientType: item.ingredientType,
      expirationDate: item.expirationDate ? item.expirationDate.split('T')[0] : '',
      storageCondition: item.storageCondition,
      currentStock: item.currentStock,
      minimumStock: item.minimumStock
    })
    setIsModalOpen(true)
  }

  const handleView = (item: Ingredient) => {
    setViewingItem(item)
    setIsViewModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este ingrediente?')) return

    try {
      setDeleting(id)
      console.log('🗑️ Excluindo ingrediente:', id)
      
      const response = await api.delete(`/api/ingredients/${id}`)
      
      if (response.data || !response.error) {
        setIngredients(ingredients.filter(item => item.id !== id))
        showToast('Ingrediente excluído com sucesso!')
        console.log('✅ Ingrediente excluído')
      } else {
        throw new Error(response.error || 'Falha ao excluir')
      }
    } catch (error) {
      console.error('❌ Erro ao excluir:', error)
      showToast('Falha ao excluir ingrediente. Tente novamente.', 'error')
    } finally {
      setDeleting(null)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      console.log('💾 Salvando ingrediente...')
      console.log('📋 Dados do formulário:', formData)

      // Validações básicas
      if (!formData.name.trim()) {
        showToast('Nome do ingrediente é obrigatório', 'error')
        return
      }

      if (!formData.categoryId) {
        showToast('Categoria é obrigatória', 'error')
        return
      }

      if (!formData.unitId) {
        showToast('Unidade de medida é obrigatória', 'error')
        return
      }

      const apiData = {
        name: formData.name.trim(),
        categoryId: formData.categoryId,
        unitId: formData.unitId,
        pricePerUnit: Number(formData.pricePerUnit),
        supplierId: formData.supplierId || null,
        purchaseDate: formData.purchaseDate || null,
        ingredientType: formData.ingredientType,
        expirationDate: formData.expirationDate || null,
        storageCondition: formData.storageCondition,
        currentStock: Number(formData.currentStock),
        minimumStock: Number(formData.minimumStock)
      }

      console.log('📡 Dados para API:', apiData)

      let response
      if (editingItem) {
        console.log('✏️ Atualizando ingrediente existente')
        response = await api.put('/api/ingredients', { id: editingItem.id, ...apiData })
      } else {
        console.log('🆕 Criando novo ingrediente')
        response = await api.post('/api/ingredients', apiData)
      }

      console.log('📊 Resposta da API:', response)

      if (response.data && !response.error) {
        showToast(editingItem ? 'Ingrediente atualizado com sucesso!' : 'Ingrediente criado com sucesso!')
        setIsModalOpen(false)
        
        // Resetar formulário
        setFormData({
          name: '',
          categoryId: '',
          unitId: '',
          pricePerUnit: 0,
          supplierId: '',
          purchaseDate: '',
          ingredientType: 'PRINCIPAL',
          expirationDate: '',
          storageCondition: 'AMBIENTE_SECO',
          currentStock: 0,
          minimumStock: 0
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
      
      showToast(`Falha ao salvar ingrediente: ${errorMessage}`, 'error')
    } finally {
      setSaving(false)
    }
  }

  // Handlers para movimentações
  const handleAddMovement = () => {
    setMovementData({
      ingredientId: '',
      type: 'Entrada',
      quantity: 0,
      reason: '',
      reference: ''
    })
    setIsMovementModalOpen(true)
  }

  const handleSaveMovement = async () => {
    try {
      setSaving(true)
      console.log('💾 Salvando movimentação...')
      console.log('📋 Dados da movimentação:', movementData)

      // Validações básicas
      if (!movementData.ingredientId) {
        showToast('Selecione um ingrediente', 'error')
        return
      }

      if (!movementData.quantity || movementData.quantity <= 0) {
        showToast('Quantidade deve ser maior que zero', 'error')
        return
      }

      if (!movementData.reason.trim()) {
        showToast('Motivo é obrigatório', 'error')
        return
      }

      const apiData = {
        ingredientId: movementData.ingredientId,
        type: movementData.type,
        quantity: Number(movementData.quantity),
        reason: movementData.reason.trim(),
        reference: movementData.reference.trim() || null
      }

      console.log('📡 Dados para API:', apiData)

      const response = await api.post('/api/stock-movements', apiData)

      console.log('📊 Resposta da API:', response)

      if (response.data && !response.error) {
        showToast('Movimentação registrada com sucesso!')
        setIsMovementModalOpen(false)
        
        // Resetar formulário
        setMovementData({
          ingredientId: '',
          type: 'Entrada',
          quantity: 0,
          reason: '',
          reference: ''
        })
        
        // Recarregar dados
        console.log('🔄 Recarregando dados...')
        await Promise.all([loadData(), loadMovements()])
      } else {
        console.error('❌ API retornou erro:', response.error)
        throw new Error(response.error || 'Falha ao salvar movimentação')
      }

    } catch (error) {
      console.error('❌ Erro ao salvar movimentação:', error)
      
      let errorMessage = 'Erro desconhecido'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      
      showToast(`Falha ao registrar movimentação: ${errorMessage}`, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteMovement = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta movimentação? O estoque será revertido.')) return

    try {
      setDeleting(id)
      console.log('🗑️ Excluindo movimentação:', id)
      
      const response = await api.delete(`/api/stock-movements/${id}`)
      
      if (response.data || !response.error) {
        showToast('Movimentação excluída e estoque revertido!')
        console.log('✅ Movimentação excluída')
        
        // Recarregar dados
        await Promise.all([loadData(), loadMovements()])
      } else {
        throw new Error(response.error || 'Falha ao excluir')
      }
    } catch (error) {
      console.error('❌ Erro ao excluir movimentação:', error)
      showToast('Falha ao excluir movimentação. Tente novamente.', 'error')
    } finally {
      setDeleting(null)
    }
  }

  // Calcular métricas
  const totalIngredients = ingredients.length
  const lowStockIngredients = ingredients.filter(i => getIngredientStatus(i) === 'baixo').length
  const expiringIngredients = ingredients.filter(i => getIngredientStatus(i) === 'vencendo').length
  const totalValue = ingredients.reduce((sum, ingredient) => sum + (ingredient.currentStock * ingredient.pricePerUnit), 0)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatWeight = (value: number, unit?: string) => {
    const unitAbbr = unit || 'g'
    if (unitAbbr === 'g' && value >= 1000) {
      return `${(value / 1000).toFixed(2)} kg`
    }
    if (unitAbbr === 'ml' && value >= 1000) {
      return `${(value / 1000).toFixed(2)} L`
    }
    return `${value.toFixed(0)} ${unitAbbr}`
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('pt-BR')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 text-lg">Carregando estoque...</p>
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
              Estoque
            </h1>
            <p className="text-gray-600 mt-2 text-lg">Gerencie ingredientes e movimentações de estoque</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleAddMovement}
              className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <TrendingUp size={20} />
              <span className="font-semibold">Nova Movimentação</span>
            </button>
            <button
              onClick={handleAdd}
              className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus size={20} />
              <span className="font-semibold">Novo Ingrediente</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                <Package className="text-white" size={28} />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Total de Ingredientes</p>
                <p className="text-3xl font-bold text-gray-900">{totalIngredients}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-lg">
                <AlertTriangle className="text-white" size={28} />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Estoque Baixo</p>
                <p className="text-3xl font-bold text-gray-900">{lowStockIngredients}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg">
                <Calendar className="text-white" size={28} />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Vencendo</p>
                <p className="text-3xl font-bold text-gray-900">{expiringIngredients}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg">
                <DollarSign className="text-white" size={28} />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Valor Total</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-8">
              <button
                onClick={() => setActiveTab('insumos')}
                className={`py-6 px-1 border-b-2 font-bold text-lg transition-colors ${
                  activeTab === 'insumos'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Package size={20} />
                  <span>Ingredientes</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('movimentacoes')}
                className={`py-6 px-1 border-b-2 font-bold text-lg transition-colors ${
                  activeTab === 'movimentacoes'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <History size={20} />
                  <span>Movimentações</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Filters */}
          <div className="p-8 border-b border-gray-200">
            {activeTab === 'insumos' ? (
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
                    <input
                      type="text"
                      placeholder="Buscar por nome do ingrediente..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-14 pr-6 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm text-lg"
                    />
                  </div>
                </div>
                <div className="lg:w-64">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm text-lg"
                  >
                    <option value="">Todas as categorias</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div className="lg:w-64">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm text-lg"
                  >
                    <option value="">Todos os status</option>
                    <option value="normal">Normal</option>
                    <option value="baixo">Estoque Baixo</option>
                    <option value="vencendo">Vencendo</option>
                    <option value="vencido">Vencido</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
                    <input
                      type="text"
                      placeholder="Buscar por ingrediente ou motivo..."
                      value={movementSearchTerm}
                      onChange={(e) => setMovementSearchTerm(e.target.value)}
                      className="w-full pl-14 pr-6 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm text-lg"
                    />
                  </div>
                </div>
                <div className="lg:w-64">
                  <select
                    value={movementFilterType}
                    onChange={(e) => setMovementFilterType(e.target.value)}
                    className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm text-lg"
                  >
                    <option value="">Todos os tipos</option>
                    <option value="Entrada">Entrada</option>
                    <option value="Saída">Saída</option>
                  </select>
                </div>
                <button
                  onClick={loadMovements}
                  className="lg:w-auto px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <RefreshCw size={20} />
                  <span>Atualizar</span>
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-8">
            {activeTab === 'insumos' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                      <th className="px-8 py-6 text-left text-xs font-medium uppercase tracking-wider">Ingrediente</th>
                      <th className="px-8 py-6 text-left text-xs font-medium uppercase tracking-wider">Estoque Atual</th>
                      <th className="px-8 py-6 text-left text-xs font-medium uppercase tracking-wider">Estoque Mínimo</th>
                      <th className="px-8 py-6 text-left text-xs font-medium uppercase tracking-wider">Preço/Unidade</th>
                      <th className="px-8 py-6 text-left text-xs font-medium uppercase tracking-wider">Valor Total</th>
                      <th className="px-8 py-6 text-left text-xs font-medium uppercase tracking-wider">Validade</th>
                      <th className="px-8 py-6 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                      <th className="px-8 py-6 text-left text-xs font-medium uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/50 divide-y divide-gray-200">
                    {filteredIngredients.map((ingredient) => {
                      const status = getIngredientStatus(ingredient)
                      const totalValue = ingredient.currentStock * ingredient.pricePerUnit
                      const daysUntilExpiration = ingredient.expirationDate ? getDaysUntilExpiration(ingredient.expirationDate) : null
                      
                      return (
                        <tr key={ingredient.id} className="hover:bg-white/70 transition-colors duration-200">
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{ingredient.name}</div>
                              <div className="text-sm text-gray-500">{ingredient.category?.name}</div>
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">
                              {formatWeight(ingredient.currentStock, ingredient.unit?.abbreviation)}
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatWeight(ingredient.minimumStock, ingredient.unit?.abbreviation)}
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatCurrency(ingredient.pricePerUnit)}
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">
                              {formatCurrency(totalValue)}
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {ingredient.expirationDate ? formatDate(ingredient.expirationDate) : '-'}
                            </div>
                            {daysUntilExpiration !== null && (
                              <div className={`text-xs ${
                                daysUntilExpiration <= 0 ? 'text-red-600' : 
                                daysUntilExpiration <= 7 ? 'text-orange-600' : 'text-gray-500'
                              }`}>
                                {daysUntilExpiration > 0 ? `${daysUntilExpiration} dias` : 'Vencido'}
                              </div>
                            )}
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <span className={`px-4 py-2 text-sm font-semibold rounded-full ${getStatusColor(status)}`}>
                              {getStatusLabel(status)}
                            </span>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-3">
                              <button
                                onClick={() => handleView(ingredient)}
                                className="text-green-600 hover:text-green-900 p-2 rounded-xl hover:bg-green-50 transition-colors"
                                title="Visualizar detalhes"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={() => handleEdit(ingredient)}
                                className="text-blue-600 hover:text-blue-900 p-2 rounded-xl hover:bg-blue-50 transition-colors"
                                title="Editar ingrediente"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(ingredient.id)}
                                disabled={deleting === ingredient.id}
                                className="text-red-600 hover:text-red-900 p-2 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
                                title="Excluir ingrediente"
                              >
                                {deleting === ingredient.id ? (
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

                {filteredIngredients.length === 0 && (
                  <div className="text-center py-16">
                    <Package className="mx-auto h-16 w-16 text-gray-400 mb-6" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Nenhum ingrediente encontrado</h3>
                    <p className="text-gray-500 text-lg">Comece cadastrando seus primeiros ingredientes.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'movimentacoes' && (
              <div className="overflow-x-auto">
                {loadingMovements ? (
                  <div className="text-center py-16">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600 text-lg">Carregando movimentações...</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <th className="px-8 py-6 text-left text-xs font-medium uppercase tracking-wider">Tipo</th>
                        <th className="px-8 py-6 text-left text-xs font-medium uppercase tracking-wider">Ingrediente</th>
                        <th className="px-8 py-6 text-left text-xs font-medium uppercase tracking-wider">Quantidade</th>
                        <th className="px-8 py-6 text-left text-xs font-medium uppercase tracking-wider">Motivo</th>
                        <th className="px-8 py-6 text-left text-xs font-medium uppercase tracking-wider">Referência</th>
                        <th className="px-8 py-6 text-left text-xs font-medium uppercase tracking-wider">Data</th>
                        <th className="px-8 py-6 text-left text-xs font-medium uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white/50 divide-y divide-gray-200">
                      {filteredMovements.map((movement) => (
                        <tr key={movement.id} className="hover:bg-white/70 transition-colors duration-200">
                          <td className="px-8 py-6 whitespace-nowrap">
                            <span className={`px-4 py-2 text-sm font-semibold rounded-full flex items-center space-x-2 w-fit ${
                              movement.type === 'Entrada' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {movement.type === 'Entrada' ? (
                                <ArrowUpCircle size={16} />
                              ) : (
                                <ArrowDownCircle size={16} />
                              )}
                              <span>{movement.type}</span>
                            </span>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{movement.ingredient?.name}</div>
                              <div className="text-sm text-gray-500">{movement.ingredient?.category?.name}</div>
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">
                              {formatWeight(movement.quantity, movement.ingredient?.unit?.abbreviation)}
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{movement.reason}</div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{movement.reference || '-'}</div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDateTime(movement.date)}</div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleDeleteMovement(movement.id)}
                              disabled={deleting === movement.id}
                              className="text-red-600 hover:text-red-900 p-2 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
                              title="Excluir movimentação"
                            >
                              {deleting === movement.id ? (
                                <Loader2 size={18} className="animate-spin" />
                              ) : (
                                <Trash2 size={18} />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {!loadingMovements && filteredMovements.length === 0 && (
                  <div className="text-center py-16">
                    <History className="mx-auto h-16 w-16 text-gray-400 mb-6" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Nenhuma movimentação encontrada</h3>
                    <p className="text-gray-500 text-lg">Registre movimentações de entrada e saída de estoque.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal de Criação/Edição de Ingrediente */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-6 w-full max-w-4xl shadow-2xl border border-white/50 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {editingItem ? 'Editar Ingrediente' : 'Novo Ingrediente'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nome do Ingrediente *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                      placeholder="Ex: Farinha de Trigo Especial"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Categoria *</label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Unidade de Medida *</label>
                    <select
                      value={formData.unitId}
                      onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                    >
                      <option value="">Selecione uma unidade</option>
                      {units.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.name} ({unit.abbreviation})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Preço por Unidade (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.pricePerUnit || ''}
                      onChange={(e) => setFormData({ ...formData, pricePerUnit: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                      placeholder="Ex: 0.0045"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Estoque Atual</label>
                    <input
                      type="number"
                      value={formData.currentStock || ''}
                      onChange={(e) => setFormData({ ...formData, currentStock: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                      placeholder="Ex: 25000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Estoque Mínimo</label>
                    <input
                      type="number"
                      value={formData.minimumStock || ''}
                      onChange={(e) => setFormData({ ...formData, minimumStock: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                      placeholder="Ex: 5000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Fornecedor</label>
                    <select
                      value={formData.supplierId}
                      onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                    >
                      <option value="">Selecione um fornecedor</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Data de Compra</label>
                    <input
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
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
                    <label className="block text-sm font-bold text-gray-700 mb-2">Condição de Armazenamento</label>
                    <select
                      value={formData.storageCondition}
                      onChange={(e) => setFormData({ ...formData, storageCondition: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                    >
                      <option value="AMBIENTE_SECO">Ambiente Seco</option>
                      <option value="REFRIGERADO">Refrigerado</option>
                      <option value="CONGELADO">Congelado</option>
                      <option value="TEMPERATURA_CONTROLADA">Temperatura Controlada</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Tipo de Ingrediente</label>
                    <select
                      value={formData.ingredientType}
                      onChange={(e) => setFormData({ ...formData, ingredientType: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                    >
                      <option value="PRINCIPAL">Principal</option>
                      <option value="SECUNDARIO">Secundário</option>
                      <option value="TEMPERO">Tempero</option>
                      <option value="ADITIVO">Aditivo</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 mt-8">
                <button
                  onClick={handleSave}
                  disabled={saving || !formData.name || !formData.categoryId || !formData.unitId}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {saving ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      <span>{editingItem ? 'Atualizar' : 'Salvar'} Ingrediente</span>
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
                  Detalhes do Ingrediente
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
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nome</label>
                    <p className="text-gray-900">{viewingItem.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Categoria</label>
                    <p className="text-gray-900">{viewingItem.category?.name || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Estoque Atual</label>
                    <p className="text-gray-900">{formatWeight(viewingItem.currentStock, viewingItem.unit?.abbreviation)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Estoque Mínimo</label>
                    <p className="text-gray-900">{formatWeight(viewingItem.minimumStock, viewingItem.unit?.abbreviation)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Preço por Unidade</label>
                    <p className="text-gray-900">{formatCurrency(viewingItem.pricePerUnit)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Valor Total</label>
                    <p className="text-gray-900">{formatCurrency(viewingItem.currentStock * viewingItem.pricePerUnit)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Fornecedor</label>
                    <p className="text-gray-900">{viewingItem.supplier?.name || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Data de Validade</label>
                    <p className="text-gray-900">{viewingItem.expirationDate ? formatDate(viewingItem.expirationDate) : 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Condição de Armazenamento</label>
                    <p className="text-gray-900">{viewingItem.storageCondition.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(getIngredientStatus(viewingItem))}`}>
                      {getStatusLabel(getIngredientStatus(viewingItem))}
                    </span>
                  </div>
                </div>
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

        {/* Modal de Movimentação */}
        {isMovementModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-6 w-full max-w-2xl shadow-2xl border border-white/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Nova Movimentação de Estoque
                </h3>
                <button
                  onClick={() => setIsMovementModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Tipo de Movimentação *</label>
                    <select
                      value={movementData.type}
                      onChange={(e) => setMovementData({ ...movementData, type: e.target.value as 'Entrada' | 'Saída' })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                    >
                      <option value="Entrada">Entrada</option>
                      <option value="Saída">Saída</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Ingrediente *</label>
                    <select
                      value={movementData.ingredientId}
                      onChange={(e) => setMovementData({ ...movementData, ingredientId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                    >
                      <option value="">Selecione um ingrediente</option>
                      {ingredients.map((ingredient) => (
                        <option key={ingredient.id} value={ingredient.id}>
                          {ingredient.name} - {formatWeight(ingredient.currentStock, ingredient.unit?.abbreviation)} disponível
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Quantidade *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={movementData.quantity || ''}
                      onChange={(e) => setMovementData({ ...movementData, quantity: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                      placeholder="Ex: 1000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Referência</label>
                    <input
                      type="text"
                      value={movementData.reference}
                      onChange={(e) => setMovementData({ ...movementData, reference: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                      placeholder="Ex: NF-001, Lote-ABC123"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Motivo *</label>
                    <input
                      type="text"
                      value={movementData.reason}
                      onChange={(e) => setMovementData({ ...movementData, reason: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                      placeholder="Ex: Compra, Produção, Perda, Ajuste de inventário"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 mt-8">
                <button
                  onClick={handleSaveMovement}
                  disabled={saving || !movementData.ingredientId || !movementData.quantity || !movementData.reason}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {saving ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      <span>Registrar Movimentação</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setIsMovementModalOpen(false)}
                  disabled={saving}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
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

