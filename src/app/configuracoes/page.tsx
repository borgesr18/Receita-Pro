'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2,
  Package,
  Scale,
  Tag,
  Truck,
  Eye
} from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'

interface Category {
  id: string
  name: string
  description: string
}

interface Unit {
  id: string
  name: string
  symbol: string
  abbreviation?: string
  type?: string
  baseUnit?: string
  conversionFactor?: number
  createdAt?: string
  updatedAt?: string
}

interface Supplier {
  id: string
  name: string
  contact: string
  phone: string
  email: string
  address: string
  createdAt?: string
  updatedAt?: string
}

export default function Configuracoes() {
  const [activeTab, setActiveTab] = useState('categorias-receitas')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const { showSuccess, showError } = useToast()

  // Estado para modal de visualização
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [viewingItem, setViewingItem] = useState<any>(null)

  // Estados para cada tipo de dados
  const [categoriasReceitas, setCategoriasReceitas] = useState<Category[]>([])
  const [categoriasInsumos, setCategoriasInsumos] = useState<Category[]>([])
  const [unidadesMedida, setUnidadesMedida] = useState<Unit[]>([])
  const [fornecedores, setFornecedores] = useState<Supplier[]>([])

  // Estado do formulário
  const [editingItem, setEditingItem] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    symbol: '',
    type: 'WEIGHT',
    baseUnit: '',
    conversionFactor: 1,
    contact: '',
    phone: '',
    email: '',
    address: ''
  })

  const tabs = [
    { id: 'categorias-receitas', label: 'Categorias de Receitas', icon: Tag },
    { id: 'categorias-insumos', label: 'Categorias de Insumos', icon: Package },
    { id: 'unidades-medida', label: 'Unidades de Medida', icon: Scale },
    { id: 'fornecedores', label: 'Fornecedores', icon: Truck }
  ]

  // Tipos de unidades disponíveis
  const unitTypes = [
    { value: 'WEIGHT', label: 'Peso' },
    { value: 'VOLUME', label: 'Volume' },
    { value: 'LENGTH', label: 'Comprimento' },
    { value: 'AREA', label: 'Área' },
    { value: 'COUNT', label: 'Contagem' },
    { value: 'TIME', label: 'Tempo' },
    { value: 'TEMPERATURE', label: 'Temperatura' }
  ]

  // Carregar dados com useCallback para evitar warning
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      console.log('🔄 Carregando dados das configurações...')
      
      const [receitasRes, insumosRes, unidadesRes, fornecedoresRes] = await Promise.all([
        api.get('/api/recipe-categories'),
        api.get('/api/ingredient-categories'),
        api.get('/api/measurement-units'),
        api.get('/api/suppliers')
      ])

      setCategoriasReceitas(Array.isArray(receitasRes.data) ? receitasRes.data : [])
      setCategoriasInsumos(Array.isArray(insumosRes.data) ? insumosRes.data : [])
      setUnidadesMedida(Array.isArray(unidadesRes.data) ? unidadesRes.data : [])
      setFornecedores(Array.isArray(fornecedoresRes.data) ? fornecedoresRes.data : [])

      console.log('✅ Dados carregados:', {
        receitas: Array.isArray(receitasRes.data) ? receitasRes.data.length : 0,
        insumos: Array.isArray(insumosRes.data) ? insumosRes.data.length : 0,
        unidades: Array.isArray(unidadesRes.data) ? unidadesRes.data.length : 0,
        fornecedores: Array.isArray(fornecedoresRes.data) ? fornecedoresRes.data.length : 0
      })
    } catch (error) {
      console.error('❌ Erro ao carregar configurações:', error)
      showError('Erro ao carregar configurações')
    } finally {
      setLoading(false)
    }
  }, [showError])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Função para visualizar item
  const handleView = (item: any) => {
    setViewingItem(item)
    setIsViewModalOpen(true)
  }

  // Obter dados da aba atual
  const getCurrentData = () => {
    switch (activeTab) {
      case 'categorias-receitas': return categoriasReceitas
      case 'categorias-insumos': return categoriasInsumos
      case 'unidades-medida': return unidadesMedida
      case 'fornecedores': return fornecedores
      default: return []
    }
  }

  // Obter endpoint da API
  const getApiEndpoint = () => {
    switch (activeTab) {
      case 'categorias-receitas': return '/api/recipe-categories'
      case 'categorias-insumos': return '/api/ingredient-categories'
      case 'unidades-medida': return '/api/measurement-units'
      case 'fornecedores': return '/api/suppliers'
      default: return ''
    }
  }

  // Atualizar estado após operação
  const updateState = (newData: any[]) => {
    switch (activeTab) {
      case 'categorias-receitas': setCategoriasReceitas(newData); break
      case 'categorias-insumos': setCategoriasInsumos(newData); break
      case 'unidades-medida': setUnidadesMedida(newData); break
      case 'fornecedores': setFornecedores(newData); break
    }
  }

  const handleAdd = () => {
    setEditingItem(null)
    setFormData({
      name: '',
      description: '',
      symbol: '',
      type: 'WEIGHT',
      baseUnit: '',
      conversionFactor: 1,
      contact: '',
      phone: '',
      email: '',
      address: ''
    })
    setIsModalOpen(true)
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setFormData({
      name: item.name || '',
      description: item.description || '',
      symbol: item.symbol || item.abbreviation || '',
      type: item.type || 'WEIGHT',
      baseUnit: item.baseUnit || '',
      conversionFactor: item.conversionFactor || 1,
      contact: item.contact || '',
      phone: item.phone || '',
      email: item.email || '',
      address: item.address || ''
    })
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    try {
      const endpoint = getApiEndpoint()
      let response: any

      if (editingItem) {
        // Editar item existente
        response = await api.put(`${endpoint}/${editingItem.id}`, formData)
        const currentData = getCurrentData()
        const updatedData = currentData.map(item => 
          item.id === editingItem.id ? response.data : item
        )
        updateState(updatedData)
        showSuccess('Item atualizado com sucesso!')
      } else {
        // Criar novo item
        response = await api.post(endpoint, formData)
        const currentData = getCurrentData()
        updateState([...currentData, response.data])
        showSuccess('Item criado com sucesso!')
      }

      setIsModalOpen(false)
      setEditingItem(null)
    } catch (error) {
      console.error('❌ Erro ao salvar:', error)
      showError('Erro ao salvar item')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return

    try {
      const endpoint = getApiEndpoint()
      await api.delete(`${endpoint}/${id}`)
      
      const currentData = getCurrentData()
      const filteredData = currentData.filter(item => item.id !== id)
      updateState(filteredData)
      
      showSuccess('Item excluído com sucesso!')
    } catch (error) {
      console.error('❌ Erro ao excluir:', error)
      showError('Erro ao excluir item')
    }
  }

  const renderFormFields = () => {
    switch (activeTab) {
      case 'categorias-receitas':
      case 'categorias-insumos':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome da categoria"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descrição da categoria"
                rows={3}
              />
            </div>
          </>
        )

      case 'unidades-medida':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome da unidade"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Símbolo *
                </label>
                <input
                  type="text"
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Símbolo (ex: kg, L, un)"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {unitTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fator de Conversão
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={formData.conversionFactor}
                  onChange={(e) => setFormData({ ...formData, conversionFactor: parseFloat(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1.0"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unidade Base
              </label>
              <input
                type="text"
                value={formData.baseUnit}
                onChange={(e) => setFormData({ ...formData, baseUnit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Unidade de referência (opcional)"
              />
            </div>
          </>
        )

      case 'fornecedores':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome do fornecedor"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contato
              </label>
              <input
                type="text"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome do contato"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(11) 99999-9999"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="contato@fornecedor.com"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endereço
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Endereço completo"
                rows={3}
              />
            </div>
          </>
        )

      default:
        return null
    }
  }

  const renderTableHeaders = () => {
    switch (activeTab) {
      case 'categorias-receitas':
      case 'categorias-insumos':
        return (
          <>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nome
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Descrição
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </>
        )

      case 'unidades-medida':
        return (
          <>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nome
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Símbolo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </>
        )

      case 'fornecedores':
        return (
          <>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nome
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contato
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Telefone
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </>
        )

      default:
        return null
    }
  }

  const renderTableRow = (item: any) => {
    switch (activeTab) {
      case 'categorias-receitas':
      case 'categorias-insumos':
        return (
          <>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {item.name}
            </td>
            <td className="px-6 py-4 text-sm text-gray-500">
              {item.description}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                onClick={() => handleEdit(item)}
                className="text-blue-600 hover:text-blue-900 mr-3"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-red-600 hover:text-red-900"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </td>
          </>
        )

      case 'unidades-medida':
        return (
          <>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {item.name}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {item.symbol || item.abbreviation}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {unitTypes.find(t => t.value === item.type)?.label || item.type}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                onClick={() => handleView(item)}
                className="text-green-600 hover:text-green-900 mr-3"
                title="Visualizar"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleEdit(item)}
                className="text-blue-600 hover:text-blue-900 mr-3"
                title="Editar"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-red-600 hover:text-red-900"
                title="Excluir"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </td>
          </>
        )

      case 'fornecedores':
        return (
          <>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {item.name}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {item.contact || '-'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {item.phone || '-'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {item.email || '-'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                onClick={() => handleView(item)}
                className="text-green-600 hover:text-green-900 mr-3"
                title="Visualizar"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleEdit(item)}
                className="text-blue-600 hover:text-blue-900 mr-3"
                title="Editar"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-red-600 hover:text-red-900"
                title="Excluir"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </td>
          </>
        )

      default:
        return null
    }
  }

  // Renderizar modal de visualização
  const renderViewModal = () => {
    if (!isViewModalOpen || !viewingItem) return null

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const getViewTitle = () => {
      switch (activeTab) {
        case 'unidades-medida': return 'Detalhes da Unidade de Medida'
        case 'fornecedores': return 'Detalhes do Fornecedor'
        default: return 'Detalhes'
      }
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {getViewTitle()}
            </h2>
            <button
              onClick={() => setIsViewModalOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informações principais */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {viewingItem.name}
                </p>
              </div>

              {activeTab === 'unidades-medida' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Símbolo
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {viewingItem.symbol || viewingItem.abbreviation}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {unitTypes.find(t => t.value === viewingItem.type)?.label || viewingItem.type}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fator de Conversão
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {viewingItem.conversionFactor || 1}
                    </p>
                  </div>
                </>
              )}

              {activeTab === 'fornecedores' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contato
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {viewingItem.contact || '-'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {viewingItem.phone || '-'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {viewingItem.email || '-'}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Informações secundárias */}
            <div className="space-y-4">
              {activeTab === 'unidades-medida' && viewingItem.baseUnit && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unidade Base
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {viewingItem.baseUnit}
                  </p>
                </div>
              )}

              {activeTab === 'fornecedores' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded min-h-[60px]">
                    {viewingItem.address || '-'}
                  </p>
                </div>
              )}

              {viewingItem.createdAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Criado em
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {formatDate(viewingItem.createdAt)}
                  </p>
                </div>
              )}

              {viewingItem.updatedAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Atualizado em
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {formatDate(viewingItem.updatedAt)}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID
                </label>
                <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded font-mono">
                  {viewingItem.id}
                </p>
              </div>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <button
              onClick={() => {
                setIsViewModalOpen(false)
                handleEdit(viewingItem)
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Editar
            </button>
            <button
              onClick={() => setIsViewModalOpen(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="mt-2 text-sm text-gray-600">
          Gerencie categorias, unidades de medida e fornecedores do sistema
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Botão Adicionar */}
      <div className="mb-6">
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Adicionar</span>
        </button>
      </div>

      {/* Tabela */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {renderTableHeaders()}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {getCurrentData().map((item) => (
              <tr key={item.id}>
                {renderTableRow(item)}
              </tr>
            ))}
          </tbody>
        </table>

        {getCurrentData().length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum item cadastrado
          </div>
        )}
      </div>

      {/* Modal de Edição/Criação */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingItem ? 'Editar' : 'Adicionar'} Item
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              {renderFormFields()}
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Visualização */}
      {renderViewModal()}
    </div>
  )
}


