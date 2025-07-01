'use client'

import React, { useState } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  Search,
  DollarSign,
  TrendingUp,
  Receipt,
  ShoppingCart
} from 'lucide-react'

export default function Vendas() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterChannel, setFilterChannel] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [formData, setFormData] = useState({
    productId: 0,
    productName: '',
    quantity: 0,
    unitWeight: 0,
    totalWeight: 0,
    channel: 'varejo',
    unitPrice: 0,
    totalPrice: 0,
    profitMargin: 0,
    customerName: '',
    customerPhone: '',
    paymentMethod: 'dinheiro',
    saleDate: '',
    saleTime: '',
    observations: '',
    status: 'concluida' // concluida, cancelada, pendente
  })

  const availableProducts = [
    {
      id: 1,
      name: 'Pão Francês Tradicional',
      unitWeight: 50,
      costPrice: 0.17,
      retailPrice: 0.35,
      wholesalePrice: 0.28,
      currentStock: 2400
    },
    {
      id: 2,
      name: 'Bolo de Chocolate Premium',
      unitWeight: 1200,
      costPrice: 8.75,
      retailPrice: 25.00,
      wholesalePrice: 18.00,
      currentStock: 1200
    },
    {
      id: 3,
      name: 'Croissant Folhado',
      unitWeight: 80,
      costPrice: 1.25,
      retailPrice: 4.50,
      wholesalePrice: 3.20,
      currentStock: 640
    },
    {
      id: 4,
      name: 'Torta de Frango',
      unitWeight: 1500,
      costPrice: 12.50,
      retailPrice: 45.00,
      wholesalePrice: 32.00,
      currentStock: 3000
    }
  ]

  const [vendas, setVendas] = useState([
    {
      id: 1,
      productId: 1,
      productName: 'Pão Francês Tradicional',
      quantity: 20,
      unitWeight: 50,
      totalWeight: 1000,
      channel: 'varejo',
      unitPrice: 0.35,
      totalPrice: 7.00,
      costPrice: 3.40,
      profitMargin: 105.88,
      customerName: 'Maria Silva',
      customerPhone: '(11) 99999-9999',
      paymentMethod: 'dinheiro',
      saleDate: '2025-06-29',
      saleTime: '08:30',
      observations: '',
      status: 'concluida',
      createdAt: '2025-06-29T08:30:00'
    },
    {
      id: 2,
      productId: 2,
      productName: 'Bolo de Chocolate Premium',
      quantity: 1,
      unitWeight: 1200,
      totalWeight: 1200,
      channel: 'varejo',
      unitPrice: 25.00,
      totalPrice: 25.00,
      costPrice: 8.75,
      profitMargin: 185.71,
      customerName: 'João Santos',
      customerPhone: '(11) 88888-8888',
      paymentMethod: 'cartao',
      saleDate: '2025-06-29',
      saleTime: '14:15',
      observations: 'Entrega agendada para amanhã',
      status: 'concluida',
      createdAt: '2025-06-29T14:15:00'
    },
    {
      id: 3,
      productId: 3,
      productName: 'Croissant Folhado',
      quantity: 6,
      unitWeight: 80,
      totalWeight: 480,
      channel: 'atacado',
      unitPrice: 3.20,
      totalPrice: 19.20,
      costPrice: 7.50,
      profitMargin: 156.00,
      customerName: 'Café Central',
      customerPhone: '(11) 77777-7777',
      paymentMethod: 'pix',
      saleDate: '2025-06-28',
      saleTime: '16:45',
      observations: 'Cliente atacadista',
      status: 'concluida',
      createdAt: '2025-06-28T16:45:00'
    },
    {
      id: 4,
      productId: 4,
      productName: 'Torta de Frango',
      quantity: 1,
      unitWeight: 1500,
      totalWeight: 1500,
      channel: 'varejo',
      unitPrice: 45.00,
      totalPrice: 45.00,
      costPrice: 12.50,
      profitMargin: 260.00,
      customerName: 'Ana Costa',
      customerPhone: '(11) 66666-6666',
      paymentMethod: 'cartao',
      saleDate: '2025-06-29',
      saleTime: '10:20',
      observations: 'Festa de aniversário',
      status: 'pendente',
      createdAt: '2025-06-29T10:20:00'
    }
  ])

  const salesChannels = [
    { value: 'varejo', label: 'Varejo', description: 'Venda direta ao consumidor' },
    { value: 'atacado', label: 'Atacado', description: 'Venda para revendedores' },
    { value: 'delivery', label: 'Delivery', description: 'Entrega em domicílio' },
    { value: 'eventos', label: 'Eventos', description: 'Vendas para eventos' }
  ]

  const paymentMethods = [
    { value: 'dinheiro', label: 'Dinheiro' },
    { value: 'cartao', label: 'Cartão' },
    { value: 'pix', label: 'PIX' },
    { value: 'transferencia', label: 'Transferência' },
    { value: 'cheque', label: 'Cheque' }
  ]

  const statusOptions = [
    { value: 'concluida', label: 'Concluída', color: 'bg-green-100 text-green-800' },
    { value: 'pendente', label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'cancelada', label: 'Cancelada', color: 'bg-red-100 text-red-800' }
  ]

  const filteredVendas = vendas.filter(venda => {
    const matchesSearch = venda.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         venda.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesChannel = filterChannel === '' || venda.channel === filterChannel
    const matchesDate = filterDate === '' || venda.saleDate === filterDate
    const matchesStatus = filterStatus === '' || venda.status === filterStatus
    return matchesSearch && matchesChannel && matchesDate && matchesStatus
  })

  const handleAdd = () => {
    setEditingItem(null)
    const today = new Date().toISOString().split('T')[0]
    const now = new Date().toTimeString().slice(0, 5)
    setFormData({
      productId: 0,
      productName: '',
      quantity: 0,
      unitWeight: 0,
      totalWeight: 0,
      channel: 'varejo',
      unitPrice: 0,
      totalPrice: 0,
      profitMargin: 0,
      customerName: '',
      customerPhone: '',
      paymentMethod: 'dinheiro',
      saleDate: today,
      saleTime: now,
      observations: '',
      status: 'concluida'
    })
    setIsModalOpen(true)
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setFormData(item)
    setIsModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta venda?')) {
      setVendas(vendas.filter(item => item.id !== id))
    }
  }

  const handleProductSelect = (productId: number) => {
    const product = availableProducts.find(p => p.id === productId)
    if (product) {
      const price = formData.channel === 'atacado' ? product.wholesalePrice : product.retailPrice
      setFormData({
        ...formData,
        productId: product.id,
        productName: product.name,
        unitWeight: product.unitWeight,
        unitPrice: price
      })
      calculateTotals(formData.quantity, product.unitWeight, price, product.costPrice)
    }
  }

  const calculateTotals = (quantity: number, unitWeight: number, unitPrice: number, costPrice: number) => {
    const totalWeight = quantity * unitWeight
    const totalPrice = quantity * unitPrice
    const totalCost = quantity * costPrice
    const profitMargin = totalCost > 0 ? ((totalPrice - totalCost) / totalCost) * 100 : 0

    setFormData(prev => ({
      ...prev,
      totalWeight,
      totalPrice,
      profitMargin
    }))
  }

  const handleQuantityChange = (quantity: number) => {
    const product = availableProducts.find(p => p.id === formData.productId)
    if (product) {
      const price = formData.channel === 'atacado' ? product.wholesalePrice : product.retailPrice
      calculateTotals(quantity, formData.unitWeight, price, product.costPrice)
    }
    setFormData(prev => ({ ...prev, quantity }))
  }

  const handleChannelChange = (channel: string) => {
    const product = availableProducts.find(p => p.id === formData.productId)
    if (product) {
      const price = channel === 'atacado' ? product.wholesalePrice : product.retailPrice
      calculateTotals(formData.quantity, formData.unitWeight, price, product.costPrice)
      setFormData(prev => ({ ...prev, channel, unitPrice: price }))
    } else {
      setFormData(prev => ({ ...prev, channel }))
    }
  }

  const handleSave = () => {
    if (editingItem) {
      setVendas(vendas.map(item => 
        item.id === editingItem.id 
          ? { ...item, ...formData }
          : item
      ))
    } else {
      const newId = Math.max(...vendas.map(item => item.id)) + 1
      const product = availableProducts.find(p => p.id === formData.productId)
      const costPrice = product ? formData.quantity * product.costPrice : 0
      
      setVendas([...vendas, { 
        id: newId, 
        ...formData,
        costPrice,
        createdAt: new Date().toISOString()
      }])
    }
    
    setIsModalOpen(false)
    setEditingItem(null)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatWeight = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(2)} kg`
    }
    return `${value.toFixed(0)} g`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatTime = (timeString: string) => {
    return timeString
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = statusOptions.find(s => s.value === status)
    return statusConfig || statusOptions[0]
  }

  const getChannelLabel = (channel: string) => {
    const channelConfig = salesChannels.find(c => c.value === channel)
    return channelConfig?.label || channel
  }

  const getPaymentMethodLabel = (method: string) => {
    const methodConfig = paymentMethods.find(m => m.value === method)
    return methodConfig?.label || method
  }

  const getTotalSales = () => {
    return vendas.filter(v => v.status === 'concluida').reduce((sum, v) => sum + v.totalPrice, 0)
  }

  const getTotalProfit = () => {
    return vendas.filter(v => v.status === 'concluida').reduce((sum, v) => sum + (v.totalPrice - v.costPrice), 0)
  }

  const getAverageTicket = () => {
    const completedSales = vendas.filter(v => v.status === 'concluida')
    return completedSales.length > 0 ? getTotalSales() / completedSales.length : 0
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendas</h1>
          <p className="text-gray-600 mt-1">Registre e gerencie as vendas por canal</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          <span>Nova Venda</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Vendas Hoje</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(vendas.filter(v => v.saleDate === new Date().toISOString().split('T')[0] && v.status === 'concluida').reduce((sum, v) => sum + v.totalPrice, 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Lucro Total</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(getTotalProfit())}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Receipt className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ticket Médio</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(getAverageTicket())}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ShoppingCart className="text-orange-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Vendas Concluídas</p>
              <p className="text-xl font-bold text-gray-900">
                {vendas.filter(v => v.status === 'concluida').length}
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
                placeholder="Buscar por produto ou cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={filterChannel}
              onChange={(e) => setFilterChannel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os canais</option>
              {salesChannels.map(channel => (
                <option key={channel.value} value={channel.value}>{channel.label}</option>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Canal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lucro</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data/Hora</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVendas.map((venda) => {
                const statusBadge = getStatusBadge(venda.status)
                const profit = venda.totalPrice - venda.costPrice
                const profitPercentage = venda.costPrice > 0 ? (profit / venda.costPrice) * 100 : 0
                
                return (
                  <tr key={venda.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{venda.productName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{venda.quantity} un</div>
                      <div className="text-sm text-gray-500">{formatWeight(venda.totalWeight)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {getChannelLabel(venda.channel)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{venda.customerName}</div>
                      <div className="text-sm text-gray-500">{getPaymentMethodLabel(venda.paymentMethod)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(venda.totalPrice)}</div>
                      <div className="text-sm text-gray-500">{formatCurrency(venda.unitPrice)}/un</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(profit)}
                      </div>
                      <div className={`text-xs ${profitPercentage >= 50 ? 'text-green-600' : profitPercentage >= 20 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {profitPercentage.toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(venda.saleDate)}</div>
                      <div className="text-sm text-gray-500">{formatTime(venda.saleTime)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${statusBadge.color}`}>
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(venda)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(venda.id)}
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
                {editingItem ? 'Editar' : 'Adicionar'} Venda
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Produto</label>
                <select
                  value={formData.productId}
                  onChange={(e) => handleProductSelect(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>Selecione o produto</option>
                  {availableProducts.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - Estoque: {formatWeight(product.currentStock)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantidade</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Canal de Venda</label>
                <select
                  value={formData.channel}
                  onChange={(e) => handleChannelChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {salesChannels.map(channel => (
                    <option key={channel.value} value={channel.value}>
                      {channel.label} - {channel.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preço Unitário (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 3.50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Cliente</label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Maria Silva"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefone do Cliente</label>
                <input
                  type="text"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: (11) 99999-9999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Forma de Pagamento</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {paymentMethods.map(method => (
                    <option key={method.value} value={method.value}>{method.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data da Venda</label>
                <input
                  type="date"
                  value={formData.saleDate}
                  onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hora da Venda</label>
                <input
                  type="time"
                  value={formData.saleTime}
                  onChange={(e) => setFormData({ ...formData, saleTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                <textarea
                  value={formData.observations}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Observações sobre a venda..."
                />
              </div>
            </div>

            {/* Sale Summary */}
            {formData.quantity > 0 && formData.unitPrice > 0 && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Resumo da Venda</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Peso Total:</span>
                    <div className="font-medium">{formatWeight(formData.totalWeight)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Valor Total:</span>
                    <div className="font-medium text-green-600">{formatCurrency(formData.totalPrice)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Margem de Lucro:</span>
                    <div className={`font-medium ${formData.profitMargin >= 50 ? 'text-green-600' : formData.profitMargin >= 20 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {formData.profitMargin.toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Preço/Grama:</span>
                    <div className="font-medium">{formatCurrency(formData.totalWeight > 0 ? formData.totalPrice / formData.totalWeight : 0)}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save size={16} />
                <span>Salvar Venda</span>
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
