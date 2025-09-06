'use client'

import React, { useState } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  X,
  Search,
  Clock,
  CheckCircle,
  Factory,
  Square,
  TrendingUp,
  Filter,
  Eye,
  Save
} from 'lucide-react'
type ProductionUI = {
  recipeId: number;
  recipeName: string;
  quantityProduced: number;
  plannedQuantity: number;
  productionDate: string;
  startTime: string;
  endTime: string;
  operator: string;
  batchNumber: string;
  losses: number;
  lossType: 'weight' | 'percentage';
  observations: string;
  status: 'planejada' | 'em_andamento' | 'concluida' | 'cancelada';
  ingredients: never[];
}

export default function Producao() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<(ProductionUI & { id: number }) | null>(null)
  const [viewingItem, setViewingItem] = useState<(ProductionUI & { id: number }) | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [formData, setFormData] = useState<ProductionUI>({
    recipeId: 0,
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

  const availableRecipes = [
    {
      id: 1,
      name: 'Pão Francês Tradicional',
      yield: 1000,
      ingredients: [
        { id: 1, name: 'Farinha de Trigo Especial', quantity: 500, unit: 'g' },
        { id: 5, name: 'Leite Integral', quantity: 300, unit: 'ml' },
        { id: 4, name: 'Fermento Biológico Seco', quantity: 10, unit: 'g' },
        { id: 7, name: 'Sal Refinado', quantity: 8, unit: 'g' }
      ]
    },
    {
      id: 2,
      name: 'Bolo de Chocolate',
      yield: 800,
      ingredients: [
        { id: 1, name: 'Farinha de Trigo', quantity: 200, unit: 'g' },
        { id: 2, name: 'Açúcar Cristal', quantity: 150, unit: 'g' },
        { id: 3, name: 'Ovos', quantity: 3, unit: 'unidades' }
      ]
    }
  ]

  const mockProductions: Array<ProductionUI & { id: number }> = [
    {
      id: 1,
      recipeId: 1,
      recipeName: 'Pão Francês Tradicional',
      quantityProduced: 950,
      plannedQuantity: 1000,
      productionDate: '2025-01-06',
      startTime: '06:00',
      endTime: '08:30',
      operator: 'João Silva',
      batchNumber: 'PF001',
      losses: 50,
      lossType: 'weight' as const,
      observations: 'Produção normal',
      status: 'concluida' as const,
      ingredients: []
    },
    {
      id: 2,
      recipeId: 2,
      recipeName: 'Bolo de Chocolate',
      quantityProduced: 0,
      plannedQuantity: 800,
      productionDate: '2025-01-06',
      startTime: '14:00',
      endTime: '',
      operator: 'Maria Santos',
      batchNumber: 'BC002',
      losses: 0,
      lossType: 'weight' as const,
      observations: '',
      status: 'em_andamento' as const,
      ingredients: []
    }
  ]

  const [productions, setProductions] = useState<Array<ProductionUI & { id: number }>>(mockProductions)

  const filteredProductions = productions.filter(production => {
    const matchesSearch = production.recipeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         production.operator.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !filterStatus || production.status === filterStatus
    const matchesDate = !filterDate || production.productionDate === filterDate
    return matchesSearch && matchesStatus && matchesDate
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingItem) {
      setProductions(prev => prev.map(p => p.id === editingItem.id ? { ...formData, id: editingItem.id } : p))
    } else {
      const newProduction = { ...formData, id: Date.now() }
      setProductions(prev => [...prev, newProduction])
    }
    
    closeModal()
  }

  const handleEdit = (production: ProductionUI & { id: number }) => {
    setFormData(production)
    setEditingItem(production)
    setIsModalOpen(true)
  }

  const handleView = (production: ProductionUI & { id: number }) => {
    setViewingItem(production)
    setIsViewModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta produção?')) {
      setProductions(prev => prev.filter(p => p.id !== id))
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setFormData({
      recipeId: 0,
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
  }

  const closeViewModal = () => {
    setIsViewModalOpen(false)
    setViewingItem(null)
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planejada': return 'Planejada'
      case 'em_andamento': return 'Em Andamento'
      case 'concluida': return 'Concluída'
      case 'cancelada': return 'Cancelada'
      default: return status
    }
  }

  // Estatísticas
  const totalProductions = productions.length
  const completedProductions = productions.filter(p => p.status === 'concluida').length
  const inProgressProductions = productions.filter(p => p.status === 'em_andamento').length
  const totalQuantityProduced = productions.reduce((sum, p) => sum + p.quantityProduced, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 space-y-6">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Controle de Produção
            </h1>
            <p className="text-gray-600 mt-1">Gerencie e monitore todas as produções</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            Nova Produção
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Produções</p>
              <p className="text-2xl font-bold text-gray-900">{totalProductions}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center">
              <Factory size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Concluídas</p>
              <p className="text-2xl font-bold text-gray-900">{completedProductions}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl flex items-center justify-center">
              <CheckCircle size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Em Andamento</p>
              <p className="text-2xl font-bold text-gray-900">{inProgressProductions}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl flex items-center justify-center">
              <Clock size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Quantidade Total</p>
              <p className="text-2xl font-bold text-gray-900">{totalQuantityProduced}g</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar produções..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="">Todos os status</option>
            <option value="planejada">Planejada</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="concluida">Concluída</option>
            <option value="cancelada">Cancelada</option>
          </select>

          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />

          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all">
            <Filter size={20} />
            Filtros
          </button>
        </div>
      </div>

      {/* Tabela de Produções */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <h3 className="text-xl font-bold text-white">Lista de Produções</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receita</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lote</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operador</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProductions.map((production) => (
                <tr key={production.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{production.recipeName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {production.batchNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {production.operator}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(production.productionDate).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {production.quantityProduced}/{production.plannedQuantity}g
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(production.status)}`}>
                      {getStatusText(production.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(production)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(production)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(production.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Adição/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  {editingItem ? 'Editar Produção' : 'Nova Produção'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Receita
                    </label>
                    <select
                      required
                      value={formData.recipeId}
                      onChange={(e) => {
                        const recipeId = Number(e.target.value)
                        const recipe = availableRecipes.find(r => r.id === recipeId)
                        setFormData(prev => ({ 
                          ...prev, 
                          recipeId,
                          recipeName: recipe?.name || ''
                        }))
                      }}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">Selecione uma receita</option>
                      {availableRecipes.map(recipe => (
                        <option key={recipe.id} value={recipe.id}>{recipe.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Número do Lote
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.batchNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, batchNumber: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Ex: PF001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Quantidade Planejada (g)
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.plannedQuantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, plannedQuantity: Number(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Quantidade Produzida (g)
                    </label>
                    <input
                      type="number"
                      value={formData.quantityProduced}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantityProduced: Number(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Data de Produção
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.productionDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, productionDate: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Operador
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.operator}
                      onChange={(e) => setFormData(prev => ({ ...prev, operator: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Nome do operador"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Horário de Início
                    </label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Horário de Término
                    </label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="planejada">Planejada</option>
                      <option value="em_andamento">Em Andamento</option>
                      <option value="concluida">Concluída</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Perdas (g)
                    </label>
                    <input
                      type="number"
                      value={formData.losses}
                      onChange={(e) => setFormData(prev => ({ ...prev, losses: Number(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Observações
                  </label>
                  <textarea
                    value={formData.observations}
                    onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    rows={3}
                    placeholder="Observações sobre a produção..."
                  />
                </div>
              </form>
            </div>

            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
                >
                  <Save size={20} />
                  {editingItem ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Visualização */}
      {isViewModalOpen && viewingItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Detalhes da Produção</h2>
                <button
                  onClick={closeViewModal}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Informações Básicas</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Receita:</span>
                      <p className="font-medium">{viewingItem.recipeName}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Lote:</span>
                      <p className="font-medium">{viewingItem.batchNumber}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Operador:</span>
                      <p className="font-medium">{viewingItem.operator}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(viewingItem.status)}`}>
                        {getStatusText(viewingItem.status)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Produção</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Data:</span>
                      <p className="font-medium">{new Date(viewingItem.productionDate).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Horário:</span>
                      <p className="font-medium">{viewingItem.startTime} - {viewingItem.endTime}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Quantidade:</span>
                      <p className="font-medium">{viewingItem.quantityProduced}/{viewingItem.plannedQuantity}g</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Perdas:</span>
                      <p className="font-medium">{viewingItem.losses}g</p>
                    </div>
                  </div>
                </div>
              </div>

              {viewingItem.observations && (
                <div className="mt-6 bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Observações</h3>
                  <p className="text-gray-700">{viewingItem.observations}</p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
              <div className="flex justify-end">
                <button
                  onClick={closeViewModal}
                  className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

