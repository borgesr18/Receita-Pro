'use client'

import React, { useState } from 'react'
import { 
  Package, 
  Plus, 
  Save,
  X,
  Search,
  Calendar,
  AlertTriangle,
  TrendingDown,
  TrendingUp
} from 'lucide-react'

export default function Estoque() {
  const [activeTab, setActiveTab] = useState('insumos')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [, setEditingItem] = useState<{id: number; name: string; category: string; currentStock: number; minStock: number; expiryDate: string} | null>(null)
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
      storageLocation: 'Estoque Seco - Prateleira A1',
      status: 'normal',
      batches: [
        { batch: 'FT-20250625-001', quantity: 15000, expiration: '2025-12-15', cost: 0.0045 },
        { batch: 'FT-20250620-001', quantity: 10000, expiration: '2025-11-30', cost: 0.0042 }
      ]
    },
    {
      id: 2,
      name: 'Açúcar Cristal',
      category: 'Açúcares',
      currentStock: 8000,
      unit: 'g',
      minStock: 3000,
      maxStock: 20000,
      avgCost: 0.0032,
      totalValue: 25.60,
      lastEntry: '2025-06-20',
      expirationDate: '2026-06-20',
      supplier: 'Usina Santa Clara',
      storageLocation: 'Estoque Seco - Prateleira B2',
      status: 'normal',
      batches: [
        { batch: 'AC-20250620-001', quantity: 8000, expiration: '2026-06-20', cost: 0.0032 }
      ]
    },
    {
      id: 3,
      name: 'Fermento Biológico Seco',
      category: 'Fermentos',
      currentStock: 500,
      unit: 'g',
      minStock: 200,
      maxStock: 1000,
      avgCost: 0.08,
      totalValue: 40.00,
      lastEntry: '2025-06-28',
      expirationDate: '2025-08-15',
      supplier: 'Fermentec',
      storageLocation: 'Geladeira - Prateleira 1',
      status: 'baixo',
      batches: [
        { batch: 'FB-20250628-001', quantity: 300, expiration: '2025-08-15', cost: 0.08 },
        { batch: 'FB-20250615-001', quantity: 200, expiration: '2025-07-30', cost: 0.075 }
      ]
    },
    {
      id: 4,
      name: 'Manteiga sem Sal',
      category: 'Gorduras',
      currentStock: 1200,
      unit: 'g',
      minStock: 500,
      maxStock: 3000,
      avgCost: 0.0128,
      totalValue: 15.36,
      lastEntry: '2025-06-27',
      expirationDate: '2025-07-10',
      supplier: 'Laticínios Vale Verde',
      storageLocation: 'Geladeira - Prateleira 2',
      status: 'vencendo',
      batches: [
        { batch: 'MT-20250627-001', quantity: 1200, expiration: '2025-07-10', cost: 0.0128 }
      ]
    }
  ])

  const [estoqueProdutos] = useState([
    {
      id: 1,
      name: 'Pão Francês Tradicional',
      category: 'Pães',
      currentStock: 2400,
      unit: 'g',
      unitWeight: 50,
      pieces: 48,
      productionDate: '2025-06-29',
      expirationDate: '2025-06-30',
      batchNumber: 'PF-20250629-001',
      productionCost: 3.45,
      totalValue: 165.60,
      status: 'normal',
      storageLocation: 'Vitrine Principal'
    },
    {
      id: 2,
      name: 'Bolo de Chocolate Premium',
      category: 'Bolos',
      currentStock: 1200,
      unit: 'g',
      unitWeight: 1200,
      pieces: 1,
      productionDate: '2025-06-28',
      expirationDate: '2025-07-02',
      batchNumber: 'BC-20250628-001',
      productionCost: 8.75,
      totalValue: 8.75,
      status: 'normal',
      storageLocation: 'Vitrine Refrigerada'
    },
    {
      id: 3,
      name: 'Croissant Folhado',
      category: 'Doces',
      currentStock: 640,
      unit: 'g',
      unitWeight: 80,
      pieces: 8,
      productionDate: '2025-06-28',
      expirationDate: '2025-06-29',
      batchNumber: 'CF-20250628-001',
      productionCost: 1.25,
      totalValue: 10.00,
      status: 'vencendo',
      storageLocation: 'Vitrine Principal'
    }
  ])

  const [movimentacoes, setMovimentacoes] = useState([
    {
      id: 1,
      type: 'entrada',
      itemName: 'Farinha de Trigo Especial',
      quantity: 15000,
      unit: 'g',
      reason: 'Compra',
      batchNumber: 'FT-20250625-001',
      date: '2025-06-25T10:30:00',
      user: 'João Silva',
      cost: 67.50,
      supplier: 'Moinho São Paulo'
    },
    {
      id: 2,
      type: 'saida',
      itemName: 'Farinha de Trigo Especial',
      quantity: 500,
      unit: 'g',
      reason: 'Produção - PF-20250629-001',
      batchNumber: 'FT-20250625-001',
      date: '2025-06-29T06:00:00',
      user: 'Sistema',
      cost: 2.25
    },
    {
      id: 3,
      type: 'entrada',
      itemName: 'Pão Francês Tradicional',
      quantity: 1000,
      unit: 'g',
      reason: 'Produção',
      batchNumber: 'PF-20250629-001',
      date: '2025-06-29T09:30:00',
      user: 'Sistema',
      cost: 3.45
    }
  ])

  const categoriesInsumos = ['Farinhas', 'Açúcares', 'Fermentos', 'Gorduras', 'Líquidos', 'Temperos']
  const categoriesProdutos = ['Pães', 'Bolos', 'Doces', 'Salgados', 'Biscoitos', 'Tortas']
  const statusOptions = [
    { value: 'normal', label: 'Normal', color: 'bg-green-100 text-green-800' },
    { value: 'baixo', label: 'Estoque Baixo', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'vencendo', label: 'Vencendo', color: 'bg-orange-100 text-orange-800' },
    { value: 'vencido', label: 'Vencido', color: 'bg-red-100 text-red-800' }
  ]


  const getCurrentCategories = () => {
    return activeTab === 'insumos' ? categoriesInsumos : categoriesProdutos
  }

  


  const handleAddMovement = () => {
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
    setIsModalOpen(true)
  }

  const handleSaveMovement = () => {
    const newMovement = {
      id: Math.max(...movimentacoes.map(m => m.id)) + 1,
      type: formData.type,
      itemName: formData.itemName,
      quantity: formData.quantity,
      unit: formData.unit,
      reason: formData.reason,
      batchNumber: formData.batchNumber,
      date: new Date().toISOString(),
      user: 'Usuário Atual',
      cost: formData.cost,
      supplier: formData.supplier
    }

    setMovimentacoes([newMovement, ...movimentacoes])
    
    if (activeTab === 'insumos') {
      setEstoqueInsumos(estoqueInsumos.map(item => {
        if (item.id === formData.itemId) {
          const newStock = formData.type === 'entrada' 
            ? item.currentStock + formData.quantity
            : item.currentStock - formData.quantity
          
          return {
            ...item,
            currentStock: Math.max(0, newStock),
            totalValue: newStock * item.avgCost,
            lastEntry: formData.type === 'entrada' ? new Date().toISOString().split('T')[0] : item.lastEntry
          }
        }
        return item
      }))
    }
    
    setIsModalOpen(false)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = statusOptions.find(s => s.value === status)
    return statusConfig || statusOptions[0]
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatWeight = (value: number, unit: string = 'g') => {
    if (unit === 'g' && value >= 1000) {
      return `${(value / 1000).toFixed(2)} kg`
    }
    if (unit === 'ml' && value >= 1000) {
      return `${(value / 1000).toFixed(2)} L`
    }
    return `${value.toFixed(0)} ${unit}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getDaysUntilExpiration = (expirationDate: string) => {
    const today = new Date()
    const expDate = new Date(expirationDate)
    const diffTime = expDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Estoque</h1>
          <p className="text-gray-600 mt-1">Gerencie o estoque de insumos e produtos finais</p>
        </div>
        <button
          onClick={handleAddMovement}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          <span>Nova Movimentação</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Itens em Estoque</p>
              <p className="text-xl font-bold text-gray-900">
                {estoqueInsumos.length + estoqueProdutos.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="text-yellow-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Estoque Baixo</p>
              <p className="text-xl font-bold text-gray-900">
                {estoqueInsumos.filter(item => item.status === 'baixo').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="text-orange-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Vencendo</p>
              <p className="text-xl font-bold text-gray-900">
                {[...estoqueInsumos, ...estoqueProdutos].filter(item => item.status === 'vencendo').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Valor Total</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency([...estoqueInsumos, ...estoqueProdutos].reduce((sum, item) => sum + item.totalValue, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('insumos')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'insumos'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Estoque de Insumos
            </button>
            <button
              onClick={() => setActiveTab('produtos')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'produtos'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Estoque de Produtos
            </button>
            <button
              onClick={() => setActiveTab('movimentacoes')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'movimentacoes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Movimentações
            </button>
          </nav>
        </div>

        {/* Filters */}
        {activeTab !== 'movimentacoes' && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Buscar por nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="md:w-48">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas as categorias</option>
                  {getCurrentCategories().map(categoria => (
                    <option key={categoria} value={categoria}>{categoria}</option>
                  ))}
                </select>
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
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {activeTab === 'insumos' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Insumo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque Atual</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min/Max</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Local</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {estoqueInsumos.filter(item => {
                    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
                    const matchesCategory = filterCategory === '' || item.category === filterCategory
                    const matchesStatus = filterStatus === '' || item.status === filterStatus
                    return matchesSearch && matchesCategory && matchesStatus
                  }).map((item) => {
                    const statusBadge = getStatusBadge(item.status)
                    const daysUntilExpiration = getDaysUntilExpiration(item.expirationDate)
                    
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500">{item.category}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatWeight(item.currentStock, item.unit)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatWeight(item.minStock, item.unit)} / {formatWeight(item.maxStock, item.unit)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{formatCurrency(item.totalValue)}</div>
                          <div className="text-sm text-gray-500">{formatCurrency(item.avgCost)}/{item.unit}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(item.expirationDate)}</div>
                          <div className={`text-xs ${
                            daysUntilExpiration <= 7 ? 'text-red-600' : 
                            daysUntilExpiration <= 30 ? 'text-yellow-600' : 'text-gray-500'
                          }`}>
                            {daysUntilExpiration > 0 ? `${daysUntilExpiration} dias` : 'Vencido'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.storageLocation}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${statusBadge.color}`}>
                            {statusBadge.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'produtos' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lote</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produção</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {estoqueProdutos.filter(item => {
                    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
                    const matchesCategory = filterCategory === '' || item.category === filterCategory
                    const matchesStatus = filterStatus === '' || item.status === filterStatus
                    return matchesSearch && matchesCategory && matchesStatus
                  }).map((item) => {
                    const statusBadge = getStatusBadge(item.status)
                    const daysUntilExpiration = getDaysUntilExpiration(item.expirationDate)
                    
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500">{item.category}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatWeight(item.currentStock, item.unit)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.pieces} {item.pieces === 1 ? 'unidade' : 'unidades'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.batchNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(item.productionDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(item.expirationDate)}</div>
                          <div className={`text-xs ${
                            daysUntilExpiration <= 1 ? 'text-red-600' : 
                            daysUntilExpiration <= 3 ? 'text-yellow-600' : 'text-gray-500'
                          }`}>
                            {daysUntilExpiration > 0 ? `${daysUntilExpiration} dias` : 'Vencido'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{formatCurrency(item.totalValue)}</div>
                          <div className="text-sm text-gray-500">Custo: {formatCurrency(item.productionCost)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${statusBadge.color}`}>
                            {statusBadge.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'movimentacoes' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {movimentacoes.map((movement) => (
                    <tr key={movement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          movement.type === 'entrada' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {movement.type === 'entrada' ? (
                            <><TrendingUp className="inline w-3 h-3 mr-1" />Entrada</>
                          ) : (
                            <><TrendingDown className="inline w-3 h-3 mr-1" />Saída</>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{movement.itemName}</div>
                        {movement.batchNumber && (
                          <div className="text-sm text-gray-500">Lote: {movement.batchNumber}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatWeight(movement.quantity, movement.unit)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {movement.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(movement.date).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {movement.user}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {movement.cost ? formatCurrency(movement.cost) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Movement */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Nova Movimentação</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Movimentação</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saída</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item</label>
                <select
                  value={formData.itemId}
                  onChange={(e) => {
                    const itemId = parseInt(e.target.value)
                    const item = estoqueInsumos.find(i => i.id === itemId)
                    setFormData({ 
                      ...formData, 
                      itemId, 
                      itemName: item?.name || '',
                      unit: item?.unit || 'g'
                    })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>Selecione o item</option>
                  {estoqueInsumos.map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantidade</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Motivo</label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Compra, Produção, Perda"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Número do Lote</label>
                <input
                  type="text"
                  value={formData.batchNumber}
                  onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: FT-20250629-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Custo (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 25.50"
                />
              </div>

              {formData.type === 'entrada' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fornecedor</label>
                    <input
                      type="text"
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Moinho São Paulo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data de Validade</label>
                    <input
                      type="date"
                      value={formData.expirationDate}
                      onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                <textarea
                  value={formData.observations}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Observações sobre a movimentação..."
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleSaveMovement}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save size={16} />
                <span>Salvar Movimentação</span>
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
