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
  Package
} from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

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
  yield?: number
  ingredients?: any[]
}

export default function ProducaoMelhorada() {
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
  const { toast } = useToast()

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

  const operators = [
    'João Silva',
    'Maria Santos', 
    'Pedro Oliveira',
    'Ana Costa',
    'Carlos Ferreira'
  ]

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
      
      // Carregar produções e receitas em paralelo
      const [productionsResponse, recipesResponse] = await Promise.all([
        api.get('/api/productions'),
        api.get('/api/recipes')
      ])

      if (productionsResponse.ok) {
        const productionsData = await productionsResponse.json()
        // Mapear dados do banco para formato da interface
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
        setRecipes(recipesData)
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast({
        title: "Erro",
        description: "Falha ao carregar dados. Tente novamente.",
        variant: "destructive"
      })
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
        toast({
          title: "Sucesso",
          description: "Produção excluída com sucesso!"
        })
      } else {
        throw new Error('Falha ao excluir')
      }
    } catch (error) {
      console.error('Erro ao excluir:', error)
      toast({
        title: "Erro",
        description: "Falha ao excluir produção. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setDeleting(null)
    }
  }

  const handleRecipeSelect = (recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId)
    if (recipe) {
      const batchNumber = generateBatchNumber(recipe.name, formData.productionDate)
      setFormData({
        ...formData,
        recipeId: recipe.id,
        recipeName: recipe.name,
        plannedQuantity: recipe.yield || 1000,
        batchNumber
      })
    }
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
        toast({
          title: "Erro",
          description: "Selecione uma receita",
          variant: "destructive"
        })
        return
      }

      if (!formData.batchNumber) {
        toast({
          title: "Erro", 
          description: "Número do lote é obrigatório",
          variant: "destructive"
        })
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
        toast({
          title: "Sucesso",
          description: editingItem ? "Produção atualizada com sucesso!" : "Produção criada com sucesso!"
        })
        setIsModalOpen(false)
        setEditingItem(null)
        await loadData() // Recarregar dados
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Falha ao salvar')
      }

    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast({
        title: "Erro",
        description: "Falha ao salvar produção. Tente novamente.",
        variant: "destructive"
      })
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando dados de produção...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
            Produção
          </h1>
          <p className="text-gray-600 mt-1">Gerencie a produção e consumo de insumos</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Plus size={20} />
          <span>Nova Produção</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/50 p-6 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <Calendar className="text-white" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Hoje</p>
              <p className="text-2xl font-bold text-gray-900">{producaoHoje}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/50 p-6 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg">
              <Clock className="text-white" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Em Andamento</p>
              <p className="text-2xl font-bold text-gray-900">{emAndamento}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/50 p-6 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
              <CheckCircle className="text-white" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Concluídas</p>
              <p className="text-2xl font-bold text-gray-900">{concluidas}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/50 p-6 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
              <TrendingUp className="text-white" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Eficiência Média</p>
              <p className="text-2xl font-bold text-gray-900">{eficienciaMedia}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/50 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por receita, lote ou operador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
            >
              <option value="">Todos os status</option>
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
          <div className="md:w-48">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Lote</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Receita</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantidade</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Data/Hora</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Operador</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Eficiência</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white/50 divide-y divide-gray-200">
              {filteredProducoes.map((producao) => {
                const efficiency = calculateEfficiency(producao.quantityProduced, producao.plannedQuantity)
                const statusBadge = getStatusBadge(producao.status)
                
                return (
                  <tr key={producao.id} className="hover:bg-white/70 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{producao.batchNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{producao.recipeName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {producao.quantityProduced > 0 ? `${producao.quantityProduced}g` : '-'} / {producao.plannedQuantity}g
                      </div>
                      {producao.losses > 0 && (
                        <div className="text-xs text-red-600">
                          Perda: {producao.losses}{producao.lossType === 'weight' ? 'g' : '%'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(producao.productionDate)}</div>
                      <div className="text-xs text-gray-500">
                        {formatTime(producao.startTime)} - {formatTime(producao.endTime)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {producao.operator}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusBadge.color}`}>
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {producao.status === 'concluida' ? (
                        <div className={`text-sm font-medium ${
                          efficiency >= 90 ? 'text-green-600' : 
                          efficiency >= 80 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {efficiency.toFixed(1)}%
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(producao)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(producao.id || '')}
                          disabled={deleting === producao.id}
                          className="text-red-600 hover:text-red-900 p-1 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          {deleting === producao.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
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
          <div className="text-center py-12">
            <Factory className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma produção encontrada</h3>
            <p className="text-gray-500">Comece criando uma nova produção.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {editingItem ? 'Editar' : 'Adicionar'} Produção
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Receita *</label>
                <select
                  value={formData.recipeId}
                  onChange={(e) => handleRecipeSelect(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                >
                  <option value="">Selecione a receita</option>
                  {recipes.map(recipe => (
                    <option key={recipe.id} value={recipe.id}>{recipe.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quantidade Planejada (g) *</label>
                <input
                  type="number"
                  value={formData.plannedQuantity || ''}
                  onChange={(e) => setFormData({ ...formData, plannedQuantity: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  placeholder="Ex: 1000"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Data de Produção *</label>
                <input
                  type="date"
                  value={formData.productionDate}
                  onChange={(e) => setFormData({ ...formData, productionDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Operador</label>
                <select
                  value={formData.operator}
                  onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                >
                  <option value="">Selecione o operador</option>
                  {operators.map(operator => (
                    <option key={operator} value={operator}>{operator}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Hora de Início</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Hora de Término</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Número do Lote *</label>
                <input
                  type="text"
                  value={formData.batchNumber}
                  onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  placeholder="Ex: PF-20250629-001"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Production['status'] })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quantidade Produzida (g)</label>
                <input
                  type="number"
                  value={formData.quantityProduced || ''}
                  onChange={(e) => setFormData({ ...formData, quantityProduced: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  placeholder="Ex: 950"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Perdas</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={formData.losses || ''}
                    onChange={(e) => setFormData({ ...formData, losses: parseFloat(e.target.value) || 0 })}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                    placeholder="Ex: 50"
                  />
                  <select
                    value={formData.lossType}
                    onChange={(e) => setFormData({ ...formData, lossType: e.target.value as Production['lossType'] })}
                    className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  >
                    <option value="weight">g</option>
                    <option value="percentage">%</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Observações</label>
                <textarea
                  value={formData.observations}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  rows={3}
                  placeholder="Observações sobre a produção..."
                />
              </div>
            </div>

            <div className="flex space-x-4 mt-8">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>Salvar Produção</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={saving}
                className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

