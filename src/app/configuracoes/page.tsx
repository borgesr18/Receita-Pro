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
  createdAt?: string
  updatedAt?: string
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

  // Tipos de unidades conforme enum UnitType do schema.prisma
  const unitTypes = [
    { value: 'WEIGHT', label: 'Peso' },
    { value: 'VOLUME', label: 'Volume' },
    { value: 'LENGTH', label: 'Comprimento' },
    { value: 'UNIT', label: 'Unidade' }
  ]

  // Carregar dados com useCallback para evitar warning
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      console.log('🔄 Carregando dados das configurações...')
      
      const [categoriasReceitasRes, categoriasInsumosRes, unidadesMedidaRes, fornecedoresRes] = await Promise.all([
        api.get('/api/recipe-categories'),
        api.get('/api/ingredient-categories'),
        api.get('/api/measurement-units'),
        api.get('/api/suppliers')
      ])

      const categoriasReceitasData = Array.isArray(categoriasReceitasRes.data) ? categoriasReceitasRes.data : []
      const categoriasInsumosData = Array.isArray(categoriasInsumosRes.data) ? categoriasInsumosRes.data : []
      const unidadesMedidaData = Array.isArray(unidadesMedidaRes.data) ? unidadesMedidaRes.data : []
      const fornecedoresData = Array.isArray(fornecedoresRes.data) ? fornecedoresRes.data : []

      setCategoriasReceitas(categoriasReceitasData)
      setCategoriasInsumos(categoriasInsumosData)
      setUnidadesMedida(unidadesMedidaData)
      setFornecedores(fornecedoresData)

      console.log('✅ Dados carregados:', {
        categoriasReceitas: categoriasReceitasData.length,
        categoriasInsumos: categoriasInsumosData.length,
        unidadesMedida: unidadesMedidaData.length,
        fornecedores: fornecedoresData.length
      })
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error)
      showError('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [showError])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleView = (item: any) => {
    setViewingItem(item)
    setIsViewModalOpen(true)
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
      console.log('📤 Enviando dados:', formData)

      // Validação básica
      if (!formData.name.trim()) {
        showError('Nome é obrigatório')
        return
      }

      let response: any
      let endpoint = ''
      let dataToSend: any = {}

      // Preparar dados baseado na aba ativa
      switch (activeTab) {
        case 'categorias-receitas':
          endpoint = '/api/recipe-categories'
          dataToSend = {
            name: formData.name,
            description: formData.description
          }
          break
        case 'categorias-insumos':
          endpoint = '/api/ingredient-categories'
          dataToSend = {
            name: formData.name,
            description: formData.description
          }
          break
        case 'unidades-medida':
          endpoint = '/api/measurement-units'
          if (!formData.symbol.trim()) {
            showError('Símbolo é obrigatório')
            return
          }
          dataToSend = {
            name: formData.name,
            abbreviation: formData.symbol,
            type: formData.type,
            baseUnit: formData.baseUnit || null,
            conversionFactor: formData.conversionFactor
          }
          break
        case 'fornecedores':
          endpoint = '/api/suppliers'
          dataToSend = {
            name: formData.name,
            contact: formData.contact,
            phone: formData.phone,
            email: formData.email,
            address: formData.address
          }
          break
      }

      if (editingItem) {
        // Editar item existente
        response = await api.put(`${endpoint}/${editingItem.id}`, dataToSend)
        
        // Atualizar estado local
        switch (activeTab) {
          case 'categorias-receitas':
            const updatedCategoriasReceitas = categoriasReceitas.map(item => 
              item.id === editingItem.id ? response.data as Category : item
            )
            setCategoriasReceitas(updatedCategoriasReceitas)
            break
          case 'categorias-insumos':
            const updatedCategoriasInsumos = categoriasInsumos.map(item => 
              item.id === editingItem.id ? response.data as Category : item
            )
            setCategoriasInsumos(updatedCategoriasInsumos)
            break
          case 'unidades-medida':
            const updatedUnidades = unidadesMedida.map(item => 
              item.id === editingItem.id ? response.data as Unit : item
            )
            setUnidadesMedida(updatedUnidades)
            break
          case 'fornecedores':
            const updatedFornecedores = fornecedores.map(item => 
              item.id === editingItem.id ? response.data as Supplier : item
            )
            setFornecedores(updatedFornecedores)
            break
        }
        showSuccess('Item atualizado com sucesso!')
      } else {
        // Criar novo item
        response = await api.post(endpoint, dataToSend)
        
        // Adicionar ao estado local
        switch (activeTab) {
          case 'categorias-receitas':
            setCategoriasReceitas([...categoriasReceitas, response.data as Category])
            break
          case 'categorias-insumos':
            setCategoriasInsumos([...categoriasInsumos, response.data as Category])
            break
          case 'unidades-medida':
            setUnidadesMedida([...unidadesMedida, response.data as Unit])
            break
          case 'fornecedores':
            setFornecedores([...fornecedores, response.data as Supplier])
            break
        }
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
      let endpoint = ''
      
      switch (activeTab) {
        case 'categorias-receitas':
          endpoint = '/api/recipe-categories'
          break
        case 'categorias-insumos':
          endpoint = '/api/ingredient-categories'
          break
        case 'unidades-medida':
          endpoint = '/api/measurement-units'
          break
        case 'fornecedores':
          endpoint = '/api/suppliers'
          break
      }

      await api.delete(`${endpoint}/${id}`)
      
      // Remover do estado local
      switch (activeTab) {
        case 'categorias-receitas':
          const filteredCategoriasReceitas = categoriasReceitas.filter(item => item.id !== id)
          setCategoriasReceitas(filteredCategoriasReceitas)
          break
        case 'categorias-insumos':
          const filteredCategoriasInsumos = categoriasInsumos.filter(item => item.id !== id)
          setCategoriasInsumos(filteredCategoriasInsumos)
          break
        case 'unidades-medida':
          const filteredUnidades = unidadesMedida.filter(item => item.id !== id)
          setUnidadesMedida(filteredUnidades)
          break
        case 'fornecedores':
          const filteredFornecedores = fornecedores.filter(item => item.id !== id)
          setFornecedores(filteredFornecedores)
          break
      }
      
      showSuccess('Item excluído com sucesso!')
    } catch (error) {
      console.error('❌ Erro ao excluir:', error)
      showError('Erro ao excluir item')
    }
  }

  const getCurrentData = () => {
    switch (activeTab) {
      case 'categorias-receitas':
        return categoriasReceitas
      case 'categorias-insumos':
        return categoriasInsumos
      case 'unidades-medida':
        return unidadesMedida
      case 'fornecedores':
        return fornecedores
      default:
        return []
    }
  }

  const getModalTitle = () => {
    const action = editingItem ? 'Editar' : 'Adicionar'
    switch (activeTab) {
      case 'categorias-receitas':
        return `${action} Categoria de Receita`
      case 'categorias-insumos':
        return `${action} Categoria de Insumo`
      case 'unidades-medida':
        return `${action} Unidade de Medida`
      case 'fornecedores':
        return `${action} Fornecedor`
      default:
        return `${action} Item`
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getTypeLabel = (type: string) => {
    const unitType = unitTypes.find(ut => ut.value === type)
    return unitType ? unitType.label : type
  }

  const renderViewModal = () => {
    if (!isViewModalOpen || !viewingItem) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Detalhes do Item
            </h2>
            <button
              onClick={() => setIsViewModalOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informações básicas */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {viewingItem.name}
                </p>
              </div>

              {(activeTab === 'categorias-receitas' || activeTab === 'categorias-insumos') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded min-h-[60px]">
                    {viewingItem.description || '-'}
                  </p>
                </div>
              )}

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
                      {getTypeLabel(viewingItem.type)}
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
                </>
              )}
            </div>

            {/* Informações secundárias */}
            <div className="space-y-4">
              {activeTab === 'unidades-medida' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fator de Conversão
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {viewingItem.conversionFactor || 1}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unidade Base
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {viewingItem.baseUnit || '-'}
                    </p>
                  </div>
                </>
              )}

              {activeTab === 'fornecedores' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {viewingItem.email || '-'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Endereço
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded min-h-[60px]">
                      {viewingItem.address || '-'}
                    </p>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Criado em
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {formatDate(viewingItem.createdAt)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Atualizado em
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {formatDate(viewingItem.updatedAt)}
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 mt-1">Gerencie categorias, unidades de medida e fornecedores do sistema</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon
                  className={`-ml-0.5 mr-2 h-5 w-5 ${
                    activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h3>
            <button
              onClick={handleAdd}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="-ml-1 mr-2 h-4 w-4" />
              Adicionar
            </button>
          </div>

          {/* Table */}
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  {activeTab === 'unidades-medida' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Símbolo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                    </>
                  )}
                  {activeTab === 'fornecedores' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contato
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Telefone
                      </th>
                    </>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getCurrentData().map((item: any) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.name}
                    </td>
                    {activeTab === 'unidades-medida' && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.symbol || item.abbreviation}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getTypeLabel(item.type)}
                        </td>
                      </>
                    )}
                    {activeTab === 'fornecedores' && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.contact}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.phone}
                        </td>
                      </>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleView(item)}
                        className="text-green-600 hover:text-green-900"
                        title="Visualizar"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-900"
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
                  </tr>
                ))}
              </tbody>
            </table>
            
            {getCurrentData().length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Nenhum item cadastrado</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {getModalTitle()}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={
                      activeTab === 'unidades-medida' 
                        ? 'Nome da unidade' 
                        : activeTab === 'fornecedores'
                        ? 'Nome do fornecedor'
                        : 'Nome da categoria'
                    }
                  />
                </div>

                {(activeTab === 'categorias-receitas' || activeTab === 'categorias-insumos') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Descrição da categoria"
                    />
                  </div>
                )}

                {activeTab === 'unidades-medida' && (
                  <>
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
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {unitTypes.map((type) => (
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
                        step="0.01"
                        value={formData.conversionFactor}
                        onChange={(e) => setFormData({ ...formData, conversionFactor: parseFloat(e.target.value) || 1 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unidade Base (opcional)
                      </label>
                      <input
                        type="text"
                        value={formData.baseUnit}
                        onChange={(e) => setFormData({ ...formData, baseUnit: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Unidade base para conversão"
                      />
                    </div>
                  </>
                )}

                {activeTab === 'fornecedores' && (
                  <>
                    <div>
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefone
                      </label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Telefone"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Endereço
                      </label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="Endereço completo"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Visualização */}
      {renderViewModal()}
    </div>
  )
}



