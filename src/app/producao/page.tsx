'use client'

import React, { useState } from 'react'
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
  TrendingUp
} from 'lucide-react'
import { Production } from '@/lib/types'

export default function Producao() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Production | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [formData, setFormData] = useState<Production>({
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
      name: 'Bolo de Chocolate Premium',
      yield: 1200,
      ingredients: [
        { id: 1, name: 'Farinha de Trigo Especial', quantity: 300, unit: 'g' },
        { id: 2, name: 'Açúcar Cristal', quantity: 250, unit: 'g' },
        { id: 3, name: 'Manteiga sem Sal', quantity: 150, unit: 'g' },
        { id: 6, name: 'Ovos', quantity: 200, unit: 'g' },
        { id: 5, name: 'Leite Integral', quantity: 200, unit: 'ml' }
      ]
    }
  ]

  const operators = [
    'João Silva',
    'Maria Santos',
    'Pedro Oliveira',
    'Ana Costa',
    'Carlos Ferreira'
  ]

  const [producoes, setProducoes] = useState<Production[]>([
    {
      id: 1,
      recipeId: 1,
      recipeName: 'Pão Francês Tradicional',
      quantityProduced: 950,
      plannedQuantity: 1000,
      productionDate: '2025-06-29',
      startTime: '06:00',
      endTime: '09:30',
      operator: 'João Silva',
      batchNumber: 'PF-20250629-001',
      losses: 50,
      lossType: 'weight',
      observations: 'Produção normal, pequena perda no forno',
      status: 'concluida',
      createdAt: '2025-06-29T06:00:00',
      ingredients: [
        { id: 1, name: 'Farinha de Trigo Especial', quantity: 500, consumed: 500, unit: 'g' },
        { id: 5, name: 'Leite Integral', quantity: 300, consumed: 300, unit: 'ml' },
        { id: 4, name: 'Fermento Biológico Seco', quantity: 10, consumed: 10, unit: 'g' },
        { id: 7, name: 'Sal Refinado', quantity: 8, consumed: 8, unit: 'g' }
      ]
    },
    {
      id: 2,
      recipeId: 2,
      recipeName: 'Bolo de Chocolate Premium',
      quantityProduced: 0,
      plannedQuantity: 2400,
      productionDate: '2025-06-29',
      startTime: '14:00',
      endTime: '',
      operator: 'Maria Santos',
      batchNumber: 'BC-20250629-001',
      losses: 0,
      lossType: 'weight',
      observations: '',
      status: 'em_andamento',
      createdAt: '2025-06-29T14:00:00',
      ingredients: []
    },
    {
      id: 3,
      recipeId: 1,
      recipeName: 'Pão Francês Tradicional',
      quantityProduced: 0,
      plannedQuantity: 1500,
      productionDate: '2025-06-30',
      startTime: '06:00',
      endTime: '',
      operator: 'Pedro Oliveira',
      batchNumber: 'PF-20250630-001',
      losses: 0,
      lossType: 'weight',
      observations: '',
      status: 'planejada',
      createdAt: '2025-06-29T16:00:00',
      ingredients: []
    }
  ])

  const statusOptions = [
    { value: 'planejada', label: 'Planejada', color: 'bg-blue-100 text-blue-800' },
    { value: 'em_andamento', label: 'Em Andamento', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'concluida', label: 'Concluída', color: 'bg-green-100 text-green-800' },
    { value: 'cancelada', label: 'Cancelada', color: 'bg-red-100 text-red-800' }
  ]

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
      recipeId: 0,
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

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setFormData(item)
    setIsModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta produção?')) {
      setProducoes(producoes.filter(item => item.id !== id))
    }
  }

  const handleRecipeSelect = (recipeId: number) => {
    const recipe = availableRecipes.find(r => r.id === recipeId)
    if (recipe) {
      const batchNumber = generateBatchNumber(recipe.name, formData.productionDate)
      setFormData({
        ...formData,
        recipeId: recipe.id,
        recipeName: recipe.name,
        plannedQuantity: recipe.yield,
        batchNumber,
        ingredients: recipe.ingredients.map((ing: {id: number; name: string; quantity: number; unit: string}) => ({
          id: ing.id,
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
          consumed: ing.quantity
        }))
      })
    }
  }

  const generateBatchNumber = (recipeName: string, date: string) => {
    const prefix = recipeName.split(' ').map(word => word.charAt(0)).join('').toUpperCase()
    const dateStr = date.replace(/-/g, '')
    const sequence = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')
    return `${prefix}-${dateStr}-${sequence}`
  }

  const handleSave = () => {
    if (editingItem) {
      setProducoes(producoes.map(item => 
        item.id === editingItem.id 
          ? { ...item, ...formData }
          : item
      ))
    } else {
      const newId = Math.max(...producoes.map(item => item.id || 0)) + 1
      setProducoes([...producoes, { 
        id: newId, 
        ...formData,
        createdAt: new Date().toISOString()
      }])
    }
    
    setIsModalOpen(false)
    setEditingItem(null)
  }

  const calculateEfficiency = (produced: number, planned: number) => {
    if (planned === 0) return 0
    return (produced / planned) * 100
  }

  const formatDate = (dateString: string) => {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produção</h1>
          <p className="text-gray-600 mt-1">Gerencie a produção e consumo de insumos</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          <span>Nova Produção</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Hoje</p>
              <p className="text-xl font-bold text-gray-900">
                {producoes.filter(p => p.productionDate === new Date().toISOString().split('T')[0]).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="text-yellow-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Em Andamento</p>
              <p className="text-xl font-bold text-gray-900">
                {producoes.filter(p => p.status === 'em_andamento').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Concluídas</p>
              <p className="text-xl font-bold text-gray-900">
                {producoes.filter(p => p.status === 'concluida').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Eficiência Média</p>
              <p className="text-xl font-bold text-gray-900">
                {producoes.filter(p => p.status === 'concluida').length > 0 
                  ? Math.round(producoes.filter(p => p.status === 'concluida')
                      .reduce((acc, p) => acc + calculateEfficiency(p.quantityProduced, p.plannedQuantity), 0) 
                      / producoes.filter(p => p.status === 'concluida').length)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Buscar por receita, lote ou operador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lote</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receita</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data/Hora</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operador</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Eficiência</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducoes.map((producao) => {
                const efficiency = calculateEfficiency(producao.quantityProduced, producao.plannedQuantity)
                const statusBadge = getStatusBadge(producao.status)
                
                return (
                  <tr key={producao.id} className="hover:bg-gray-50">
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
                      <span className={`px-2 py-1 text-xs rounded-full ${statusBadge.color}`}>
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
                      <button
                        onClick={() => handleEdit(producao)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(producao.id || 0)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingItem ? 'Editar' : 'Adicionar'} Produção
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Receita</label>
                <select
                  value={formData.recipeId}
                  onChange={(e) => handleRecipeSelect(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>Selecione a receita</option>
                  {availableRecipes.map(recipe => (
                    <option key={recipe.id} value={recipe.id}>{recipe.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantidade Planejada (g)</label>
                <input
                  type="number"
                  value={formData.plannedQuantity}
                  onChange={(e) => setFormData({ ...formData, plannedQuantity: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data de Produção</label>
                <input
                  type="date"
                  value={formData.productionDate}
                  onChange={(e) => setFormData({ ...formData, productionDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Operador</label>
                <select
                  value={formData.operator}
                  onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione o operador</option>
                  {operators.map(operator => (
                    <option key={operator} value={operator}>{operator}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hora de Início</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hora de Término</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Número do Lote</label>
                <input
                  type="text"
                  value={formData.batchNumber}
                  onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: PF-20250629-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Production['status'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantidade Produzida (g)</label>
                <input
                  type="number"
                  value={formData.quantityProduced}
                  onChange={(e) => setFormData({ ...formData, quantityProduced: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 950"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Perdas</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={formData.losses}
                    onChange={(e) => setFormData({ ...formData, losses: parseFloat(e.target.value) })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 50"
                  />
                  <select
                    value={formData.lossType}
                    onChange={(e) => setFormData({ ...formData, lossType: e.target.value as Production['lossType'] })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="weight">g</option>
                    <option value="percentage">%</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                <textarea
                  value={formData.observations}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Observações sobre a produção..."
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save size={16} />
                <span>Salvar Produção</span>
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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
