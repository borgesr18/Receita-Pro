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

  // NOVO: Estado para modal de visualização
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

  // NOVA: Função para visualizar item
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
      symbol: item.symbol || '',
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
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome
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
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Símbolo
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
              {item.symbol}
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
              {/* NOVO: Botão de visualização */}
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

      default:
        return null
    }
  }

  const getModalTitle = () => {
    const action = editingItem ? 'Editar' : 'Adicionar'
    switch (activeTab) {
      case 'categorias-receitas': return `${action} Categoria de Receita`
      case 'categorias-insumos': return `${action} Categoria de Insumo`
      case 'unidades-medida': return `${action} Unidade de Medida`
      case 'fornecedores': return `${action} Fornecedor`
      default: return action
    }
  }

  // NOVA: Função para formatar data
  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return '-'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Carregando configurações...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600">Gerencie as configurações do sistema</p>
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
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
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

      {/* Content */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">
            {tabs.find(tab => tab.id === activeTab)?.label}
          </h2>
          <button
            onClick={handleAdd}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </button>
        </div>

        <div className="overflow-x-auto">
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
              {getCurrentData().length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Nenhum item encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Edição/Criação */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {getModalTitle()}
              </h3>
              
              <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                {renderFormFields()}
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* NOVO: Modal de Visualização */}
      {isViewModalOpen && viewingItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-medium text-gray-900">
                  Detalhes do Fornecedor
                </h3>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Trash2 className="h-5 w-5 rotate-45" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Nome
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      {viewingItem.name || '-'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Contato
                    </label>
                    <p className="text-gray-900">
                      {viewingItem.contact || '-'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Telefone
                    </label>
                    <p className="text-gray-900">
                      {viewingItem.phone || '-'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Email
                    </label>
                    <p className="text-gray-900">
                      {viewingItem.email || '-'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Endereço
                    </label>
                    <p className="text-gray-900">
                      {viewingItem.address || '-'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Criado em
                    </label>
                    <p className="text-gray-900">
                      {formatDate(viewingItem.createdAt)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Atualizado em
                    </label>
                    <p className="text-gray-900">
                      {formatDate(viewingItem.updatedAt)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      ID
                    </label>
                    <p className="text-xs text-gray-500 font-mono">
                      {viewingItem.id}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={() => {
                    setIsViewModalOpen(false)
                    handleEdit(viewingItem)
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Editar
                </button>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
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


