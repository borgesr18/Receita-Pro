'use client'

import React, { useState } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  X,
  Search,
  Receipt,
  ShoppingCart,
  Percent,
  Calendar,
  DollarSign,
  Filter,
  Eye,
  Save
} from 'lucide-react'

export default function Vendas() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [viewingItem, setViewingItem] = useState<any>(null)
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
      deliveryPrice: 0.40
    },
    {
      id: 2,
      name: 'Bolo de Chocolate',
      unitWeight: 800,
      costPrice: 8.50,
      retailPrice: 15.00,
      wholesalePrice: 12.00,
      deliveryPrice: 18.00
    },
    {
      id: 3,
      name: 'Croissant',
      unitWeight: 80,
      costPrice: 0.85,
      retailPrice: 2.50,
      wholesalePrice: 2.00,
      deliveryPrice: 3.00
    }
  ]

  const [vendas, setVendas] = useState([
    {
      id: 1,
      productName: 'Pão Francês Tradicional',
      quantity: 20,
      unitWeight: 50,
      totalWeight: 1000,
      channel: 'varejo',
      unitPrice: 0.35,
      totalPrice: 7.00,
      profitMargin: 51.4,
      customerName: 'João Silva',
      customerPhone: '(11) 99999-9999',
      paymentMethod: 'dinheiro',
      saleDate: '2025-01-06',
      saleTime: '08:30',
      observations: '',
      status: 'concluida'
    },
    {
      id: 2,
      productName: 'Bolo de Chocolate',
      quantity: 2,
      unitWeight: 800,
      totalWeight: 1600,
      channel: 'delivery',
      unitPrice: 18.00,
      totalPrice: 36.00,
      profitMargin: 52.8,
      customerName: 'Maria Santos',
      customerPhone: '(11) 88888-8888',
      paymentMethod: 'cartao',
      saleDate: '2025-01-06',
      saleTime: '14:15',
      observations: 'Entrega agendada para 16h',
      status: 'pendente'
    }
  ])

  const filteredVendas = vendas.filter(venda => {
    const matchesSearch = venda.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         venda.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesChannel = !filterChannel || venda.channel === filterChannel
    const matchesDate = !filterDate || venda.saleDate === filterDate
    const matchesStatus = !filterStatus || venda.status === filterStatus
    return matchesSearch && matchesChannel && matchesDate && matchesStatus
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingItem) {
      setVendas(prev => prev.map(v => v.id === editingItem.id ? { ...formData, id: editingItem.id } : v))
    } else {
      const newVenda = { ...formData, id: Date.now() }
      setVendas(prev => [...prev, newVenda])
    }
    
    closeModal()
  }

  const handleEdit = (venda: any) => {
    setFormData(venda)
    setEditingItem(venda)
    setIsModalOpen(true)
  }

  const handleView = (venda: any) => {
    setViewingItem(venda)
    setIsViewModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta venda?')) {
      setVendas(prev => prev.filter(v => v.id !== id))
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingItem(null)
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
      saleDate: '',
      saleTime: '',
      observations: '',
      status: 'concluida'
    })
  }

  const closeViewModal = () => {
    setIsViewModalOpen(false)
    setViewingItem(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluida': return 'bg-green-100 text-green-800'
      case 'pendente': return 'bg-yellow-100 text-yellow-800'
      case 'cancelada': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'concluida': return 'Concluída'
      case 'pendente': return 'Pendente'
      case 'cancelada': return 'Cancelada'
      default: return status
    }
  }

  const getChannelText = (channel: string) => {
    switch (channel) {
      case 'varejo': return 'Varejo'
      case 'atacado': return 'Atacado'
      case 'delivery': return 'Delivery'
      default: return channel
    }
  }

  const getPaymentText = (method: string) => {
    switch (method) {
      case 'dinheiro': return 'Dinheiro'
      case 'cartao': return 'Cartão'
      case 'pix': return 'PIX'
      case 'credito': return 'Crediário'
      default: return method
    }
  }

  // Estatísticas
  const totalVendas = vendas.length
  const vendasConcluidas = vendas.filter(v => v.status === 'concluida').length
  const vendasPendentes = vendas.filter(v => v.status === 'pendente').length
  const faturamentoTotal = vendas.filter(v => v.status === 'concluida').reduce((sum, v) => sum + v.totalPrice, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 space-y-6">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Controle de Vendas
            </h1>
            <p className="text-gray-600 mt-1">Gerencie todas as vendas e faturamento</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            Nova Venda
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Vendas</p>
              <p className="text-2xl font-bold text-gray-900">{totalVendas}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center">
              <ShoppingCart size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Concluídas</p>
              <p className="text-2xl font-bold text-gray-900">{vendasConcluidas}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl flex items-center justify-center">
              <Receipt size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-gray-900">{vendasPendentes}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl flex items-center justify-center">
              <Calendar size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Faturamento</p>
              <p className="text-2xl font-bold text-gray-900">R$ {faturamentoTotal.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl flex items-center justify-center">
              <DollarSign size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar vendas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <select
            value={filterChannel}
            onChange={(e) => setFilterChannel(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="">Todos os canais</option>
            <option value="varejo">Varejo</option>
            <option value="atacado">Atacado</option>
            <option value="delivery">Delivery</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="">Todos os status</option>
            <option value="concluida">Concluída</option>
            <option value="pendente">Pendente</option>
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

      {/* Tabela de Vendas */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <h3 className="text-xl font-bold text-white">Lista de Vendas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Canal</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Total</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVendas.map((venda) => (
                <tr key={venda.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{venda.productName}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(venda.saleDate).toLocaleDateString('pt-BR')} às {venda.saleTime}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{venda.customerName}</div>
                    <div className="text-sm text-gray-500">{venda.customerPhone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {venda.quantity} un ({venda.totalWeight}g)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getChannelText(venda.channel)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">R$ {venda.totalPrice.toFixed(2)}</div>
                    <div className="text-sm text-green-600">Margem: {venda.profitMargin.toFixed(1)}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(venda.status)}`}>
                      {getStatusText(venda.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(venda)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(venda)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(venda.id)}
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
                  {editingItem ? 'Editar Venda' : 'Nova Venda'}
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
                      Produto
                    </label>
                    <select
                      required
                      value={formData.productId}
                      onChange={(e) => {
                        const productId = Number(e.target.value)
                        const product = availableProducts.find(p => p.id === productId)
                        if (product) {
                          setFormData(prev => ({ 
                            ...prev, 
                            productId,
                            productName: product.name,
                            unitWeight: product.unitWeight,
                            unitPrice: product.retailPrice
                          }))
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">Selecione um produto</option>
                      {availableProducts.map(product => (
                        <option key={product.id} value={product.id}>{product.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Quantidade
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.quantity}
                      onChange={(e) => {
                        const quantity = Number(e.target.value)
                        setFormData(prev => ({ 
                          ...prev, 
                          quantity,
                          totalWeight: quantity * prev.unitWeight,
                          totalPrice: quantity * prev.unitPrice
                        }))
                      }}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Canal de Venda
                    </label>
                    <select
                      value={formData.channel}
                      onChange={(e) => setFormData(prev => ({ ...prev, channel: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="varejo">Varejo</option>
                      <option value="atacado">Atacado</option>
                      <option value="delivery">Delivery</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Preço Unitário (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.unitPrice}
                      onChange={(e) => {
                        const unitPrice = Number(e.target.value)
                        setFormData(prev => ({ 
                          ...prev, 
                          unitPrice,
                          totalPrice: prev.quantity * unitPrice
                        }))
                      }}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nome do Cliente
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.customerName}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Nome do cliente"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Telefone do Cliente
                    </label>
                    <input
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Forma de Pagamento
                    </label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="dinheiro">Dinheiro</option>
                      <option value="cartao">Cartão</option>
                      <option value="pix">PIX</option>
                      <option value="credito">Crediário</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="concluida">Concluída</option>
                      <option value="pendente">Pendente</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Data da Venda
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.saleDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, saleDate: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Horário da Venda
                    </label>
                    <input
                      type="time"
                      value={formData.saleTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, saleTime: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                    placeholder="Observações sobre a venda..."
                  />
                </div>

                {/* Resumo da Venda */}
                {formData.quantity > 0 && formData.unitPrice > 0 && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                    <h3 className="font-semibold text-green-900 mb-3">Resumo da Venda</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-green-700">Quantidade:</span>
                        <p className="font-medium text-green-900">{formData.quantity} unidades</p>
                      </div>
                      <div>
                        <span className="text-green-700">Peso Total:</span>
                        <p className="font-medium text-green-900">{formData.totalWeight}g</p>
                      </div>
                      <div>
                        <span className="text-green-700">Preço Unitário:</span>
                        <p className="font-medium text-green-900">R$ {formData.unitPrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-green-700">Total:</span>
                        <p className="font-bold text-green-900 text-lg">R$ {formData.totalPrice.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                )}
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
                <h2 className="text-2xl font-bold text-white">Detalhes da Venda</h2>
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
                  <h3 className="font-semibold text-gray-900 mb-3">Produto</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Nome:</span>
                      <p className="font-medium">{viewingItem.productName}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Quantidade:</span>
                      <p className="font-medium">{viewingItem.quantity} unidades</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Peso Total:</span>
                      <p className="font-medium">{viewingItem.totalWeight}g</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Cliente</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Nome:</span>
                      <p className="font-medium">{viewingItem.customerName}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Telefone:</span>
                      <p className="font-medium">{viewingItem.customerPhone}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Canal:</span>
                      <p className="font-medium">{getChannelText(viewingItem.channel)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Valores</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Preço Unitário:</span>
                      <p className="font-medium">R$ {viewingItem.unitPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Total:</span>
                      <p className="font-medium text-green-600">R$ {viewingItem.totalPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Margem:</span>
                      <p className="font-medium">{viewingItem.profitMargin.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Venda</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Data:</span>
                      <p className="font-medium">{new Date(viewingItem.saleDate).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Horário:</span>
                      <p className="font-medium">{viewingItem.saleTime}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Pagamento:</span>
                      <p className="font-medium">{getPaymentText(viewingItem.paymentMethod)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(viewingItem.status)}`}>
                        {getStatusText(viewingItem.status)}
                      </span>
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

