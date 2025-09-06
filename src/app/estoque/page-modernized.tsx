'use client'

import React, { useState } from 'react'
import { 
  Package, 
  Plus, 
  X,
  Search,
  TrendingDown,
  Warehouse,
  Edit,
  ArrowUp,
  ArrowDown,
  Clock,
  DollarSign,
  AlertTriangle,
  Filter,
  Eye,
  Save
} from 'lucide-react'

export default function Estoque() {
  const [activeTab, setActiveTab] = useState('insumos')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<{id: number; name: string; category: string; currentStock: number; minStock: number; expiryDate: string} | null>(null)
  const [viewingItem, setViewingItem] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [formData, setFormData] = useState({
    type: 'entrada', // entrada, saida
    itemId: 0,
    itemName: '',
    quantity: 0,
    unit: 'g',
    reason: '',
    batchNumber: '',
    expirationDate: '',
    supplier: '',
    cost: 0,
    observations: ''
  })

  const [estoqueInsumos, setEstoqueInsumos] = useState([
    {
      id: 1,
      name: 'Farinha de Trigo Especial',
      category: 'Farinhas',
      currentStock: 25000,
      unit: 'g',
      minStock: 5000,
      maxStock: 50000,
      avgCost: 0.0045,
      totalValue: 112.50,
      lastEntry: '2025-06-25',
      expirationDate: '2025-12-15',
      supplier: 'Moinho São Paulo',
      status: 'normal'
    },
    {
      id: 2,
      name: 'Açúcar Cristal',
      category: 'Açúcares',
      currentStock: 3000,
      unit: 'g',
      minStock: 5000,
      maxStock: 30000,
      avgCost: 0.003,
      totalValue: 9.00,
      lastEntry: '2025-06-20',
      expirationDate: '2026-01-10',
      supplier: 'Usina Central',
      status: 'baixo'
    },
    {
      id: 3,
      name: 'Ovos Frescos',
      category: 'Proteínas',
      currentStock: 120,
      unit: 'unidades',
      minStock: 50,
      maxStock: 300,
      avgCost: 0.35,
      totalValue: 42.00,
      lastEntry: '2025-07-01',
      expirationDate: '2025-07-15',
      supplier: 'Granja Feliz',
      status: 'vencendo'
    }
  ])

  const [estoqueProdutos, setEstoqueProdutos] = useState([
    {
      id: 1,
      name: 'Pão Francês',
      category: 'Pães',
      currentStock: 150,
      unit: 'unidades',
      minStock: 50,
      maxStock: 500,
      avgCost: 0.45,
      totalValue: 67.50,
      lastProduction: '2025-07-06',
      expirationDate: '2025-07-07',
      status: 'normal'
    },
    {
      id: 2,
      name: 'Bolo de Chocolate',
      category: 'Bolos',
      currentStock: 8,
      unit: 'unidades',
      minStock: 5,
      maxStock: 30,
      avgCost: 12.50,
      totalValue: 100.00,
      lastProduction: '2025-07-05',
      expirationDate: '2025-07-08',
      status: 'normal'
    }
  ])

  const [movimentacoes, setMovimentacoes] = useState([
    {
      id: 1,
      type: 'entrada',
      itemName: 'Farinha de Trigo Especial',
      quantity: 10000,
      unit: 'g',
      date: '2025-07-06',
      reason: 'Compra',
      operator: 'João Silva',
      cost: 45.00
    },
    {
      id: 2,
      type: 'saida',
      itemName: 'Açúcar Cristal',
      quantity: 2000,
      unit: 'g',
      date: '2025-07-06',
      reason: 'Produção - Bolo de Chocolate',
      operator: 'Maria Santos',
      cost: 6.00
    }
  ])

  const currentData = activeTab === 'insumos' ? estoqueInsumos : estoqueProdutos

  const filteredData = currentData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !filterCategory || item.category === filterCategory
    const matchesStatus = !filterStatus || item.status === filterStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-800'
      case 'baixo': return 'bg-yellow-100 text-yellow-800'
      case 'vencendo': return 'bg-orange-100 text-orange-800'
      case 'vencido': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'normal': return 'Normal'
      case 'baixo': return 'Estoque Baixo'
      case 'vencendo': return 'Vencendo'
      case 'vencido': return 'Vencido'
      default: return status
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newMovimentacao = {
      id: Date.now(),
      type: formData.type,
      itemName: formData.itemName,
      quantity: formData.quantity,
      unit: formData.unit,
      date: new Date().toISOString().split('T')[0],
      reason: formData.reason,
      operator: 'Usuário Atual',
      cost: formData.cost
    }
    
    setMovimentacoes(prev => [newMovimentacao, ...prev])
    closeModal()
  }

  const handleView = (item: any) => {
    setViewingItem(item)
    setIsViewModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setFormData({
      type: 'entrada',
      itemId: 0,
      itemName: '',
      quantity: 0,
      unit: 'g',
      reason: '',
      batchNumber: '',
      expirationDate: '',
      supplier: '',
      cost: 0,
      observations: ''
    })
  }

  const closeViewModal = () => {
    setIsViewModalOpen(false)
    setViewingItem(null)
  }

  // Estatísticas
  const totalItems = currentData.length
  const lowStockItems = currentData.filter(item => item.status === 'baixo').length
  const expiringItems = currentData.filter(item => item.status === 'vencendo').length
  const totalValue = currentData.reduce((sum, item) => sum + item.totalValue, 0)

  const categories = [...new Set(currentData.map(item => item.category))]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 space-y-6">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Controle de Estoque
            </h1>
            <p className="text-gray-600 mt-1">Gerencie insumos, produtos e movimentações</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            Nova Movimentação
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('insumos')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              activeTab === 'insumos'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-blue-50'
            }`}
          >
            Insumos
          </button>
          <button
            onClick={() => setActiveTab('produtos')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              activeTab === 'produtos'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-blue-50'
            }`}
          >
            Produtos
          </button>
          <button
            onClick={() => setActiveTab('movimentacoes')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              activeTab === 'movimentacoes'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-blue-50'
            }`}
          >
            Movimentações
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      {activeTab !== 'movimentacoes' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Itens</p>
                <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center">
                <Warehouse size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Estoque Baixo</p>
                <p className="text-2xl font-bold text-gray-900">{lowStockItems}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vencendo</p>
                <p className="text-2xl font-bold text-gray-900">{expiringItems}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl flex items-center justify-center">
                <Clock size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-gray-900">R$ {totalValue.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl flex items-center justify-center">
                <DollarSign size={20} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      {activeTab !== 'movimentacoes' && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar itens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Todas as categorias</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Todos os status</option>
              <option value="normal">Normal</option>
              <option value="baixo">Estoque Baixo</option>
              <option value="vencendo">Vencendo</option>
              <option value="vencido">Vencido</option>
            </select>

            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all">
              <Filter size={20} />
              Filtros
            </button>
          </div>
        </div>
      )}

      {/* Conteúdo das Tabs */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <h3 className="text-xl font-bold text-white">
            {activeTab === 'insumos' ? 'Estoque de Insumos' : 
             activeTab === 'produtos' ? 'Estoque de Produtos' : 
             'Movimentações de Estoque'}
          </h3>
        </div>

        {activeTab === 'movimentacoes' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivo</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operador</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movimentacoes.map((mov) => (
                  <tr key={mov.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {mov.type === 'entrada' ? (
                          <ArrowUp className="text-green-600" size={16} />
                        ) : (
                          <ArrowDown className="text-red-600" size={16} />
                        )}
                        <span className={`text-sm font-medium ${
                          mov.type === 'entrada' ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {mov.type === 'entrada' ? 'Entrada' : 'Saída'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {mov.itemName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {mov.quantity} {mov.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(mov.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {mov.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {mov.operator}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      R$ {mov.cost.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque Atual</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque Mín.</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Total</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500">
                        {activeTab === 'insumos' 
                          ? (item as any).supplier 
                          : `Última produção: ${(item as any).lastProduction || 'N/A'}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.currentStock} {item.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.minStock} {item.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      R$ {item.totalValue.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                        {getStatusText(item.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(item)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                        <button className="text-indigo-600 hover:text-indigo-900 transition-colors">
                          <Edit size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Nova Movimentação */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Nova Movimentação</h2>
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
                      Tipo de Movimentação
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="entrada">Entrada</option>
                      <option value="saida">Saída</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Item
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.itemName}
                      onChange={(e) => setFormData(prev => ({ ...prev, itemName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Nome do item"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Quantidade
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Unidade
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="g">Gramas (g)</option>
                      <option value="kg">Quilogramas (kg)</option>
                      <option value="ml">Mililitros (ml)</option>
                      <option value="l">Litros (l)</option>
                      <option value="unidades">Unidades</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Motivo
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.reason}
                      onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Ex: Compra, Produção, Venda"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Valor (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.cost}
                      onChange={(e) => setFormData(prev => ({ ...prev, cost: Number(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="0.00"
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
                    placeholder="Observações sobre a movimentação..."
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
                  Salvar
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
                <h2 className="text-2xl font-bold text-white">Detalhes do Item</h2>
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
                      <span className="text-sm text-gray-600">Nome:</span>
                      <p className="font-medium">{viewingItem.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Categoria:</span>
                      <p className="font-medium">{viewingItem.category}</p>
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
                  <h3 className="font-semibold text-gray-900 mb-3">Estoque</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Atual:</span>
                      <p className="font-medium">{viewingItem.currentStock} {viewingItem.unit}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Mínimo:</span>
                      <p className="font-medium">{viewingItem.minStock} {viewingItem.unit}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Máximo:</span>
                      <p className="font-medium">{viewingItem.maxStock} {viewingItem.unit}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Valores</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Custo Médio:</span>
                      <p className="font-medium">R$ {viewingItem.avgCost.toFixed(4)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Valor Total:</span>
                      <p className="font-medium text-green-600">R$ {viewingItem.totalValue.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Datas</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Última Entrada:</span>
                      <p className="font-medium">{viewingItem.lastEntry ? new Date(viewingItem.lastEntry).toLocaleDateString('pt-BR') : 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Validade:</span>
                      <p className="font-medium">{viewingItem.expirationDate ? new Date(viewingItem.expirationDate).toLocaleDateString('pt-BR') : 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
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

