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
  abbreviation: string
  type: string
  baseUnit?: string
  conversionFactor: number
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

interface UnitType {
  value: string
  label: string
}

export default function Configuracoes() {
  const [activeTab, setActiveTab] = useState('categorias-receitas')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [viewingItem, setViewingItem] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const { showSuccess, showError } = useToast()

  // Estados para dados
  const [categoriasReceitas, setCategoriasReceitas] = useState<Category[]>([])
  const [categoriasInsumos, setCategoriasInsumos] = useState<Category[]>([])
  const [unidadesMedida, setUnidadesMedida] = useState<Unit[]>([])
  const [fornecedores, setFornecedores] = useState<Supplier[]>([])
  const [unitTypes, setUnitTypes] = useState<UnitType[]>([])

  // Estado do formulário
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    abbreviation: '',
    type: '',
    baseUnit: '',
    conversionFactor: 1.0,
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

  // Carregar tipos de unidades dinamicamente
  const loadUnitTypes = useCallback(async () => {
    try {
      console.log('🔄 Carregando tipos de unidades do banco...')
      const response = await api.get('/api/enums/unit-types')
      const types = response.data || []
      setUnitTypes(types)
      
      // Definir o primeiro tipo como padrão se existir
      if (types.length > 0) {
        setFormData(prev => ({ ...prev, type: types[0].value }))
      }
      
      console.log('✅ Tipos de unidades carregados:', types)
    } catch (error) {
      console.error('❌ Erro ao carregar tipos de unidades:', error)
      // Fallback para valores padrão em caso de erro
      const fallbackTypes = [
        { value: 'Peso', label: 'Peso' },
        { value: 'Volume', label: 'Volume' },
        { value: 'Comprimento', label: 'Comprimento' },
        { value: 'Pacote', label: 'Pacote' }
      ]
      setUnitTypes(fallbackTypes)
      showError('Erro ao carregar tipos de unidades, usando valores padrão')
    }
  }, [showError])

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
      showError('Erro ao carregar dados das configurações')
    } finally {
      setLoading(false)
    }
  }, [showError])

  useEffect(() => {
    loadData()
    loadUnitTypes()
  }, [loadData, loadUnitTypes])

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      abbreviation: '',
      type: unitTypes.length > 0 ? unitTypes[0].value : '',
      baseUnit: '',
      conversionFactor: 1.0,
      contact: '',
      phone: '',
      email: '',
      address: ''
    })
  }

  const handleAdd = () => {
    setEditingItem(null)
    resetForm()
    setIsModalOpen(true)
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setFormData({
      name: item.name || '',
      description: item.description || '',
      abbreviation: item.abbreviation || '',
      type: item.type || (unitTypes.length > 0 ? unitTypes[0].value : ''),
      baseUnit: item.baseUnit || '',
      conversionFactor: item.conversionFactor || 1.0,
      contact: item.contact || '',
      phone: item.phone || '',
      email: item.email || '',
      address: item.address || ''
    })
    setIsModalOpen(true)
  }

  const handleView = (item: any) => {
    setViewingItem(item)
    setIsViewModalOpen(true)
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
          if (!formData.abbreviation.trim()) {
            showError('Símbolo é obrigatório')
            return
          }
          if (!formData.type.trim()) {
            showError('Tipo é obrigatório')
            return
          }
          dataToSend = {
            name: formData.name,
            abbreviation: formData.abbreviation,
            type: formData.type,
            baseUnit: formData.baseUnit || null,
            conversionFactor: parseFloat(formData.conversionFactor.toString()) || 1.0
          }
          console.log('📤 Dados específicos para unidade de medida:', dataToSend)
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
      resetForm()
      setEditingItem(null)
    } catch (error: any) {
      console.error('❌ Erro ao salvar:', error)
      const errorMessage = error.response?.data?.error || 'Erro ao salvar item'
      showError(errorMessage)
    }
  }

  const handleDelete = async (item: any) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) {
      return
    }

    try {
      let endpoint = ''
      
      switch (activeTab) {
        case 'categorias-receitas':
          endpoint = `/api/recipe-categories/${item.id}`
          break
        case 'categorias-insumos':
          endpoint = `/api/ingredient-categories/${item.id}`
          break
        case 'unidades-medida':
          endpoint = `/api/measurement-units/${item.id}`
          break
        case 'fornecedores':
          endpoint = `/api/suppliers/${item.id}`
          break
      }

      await api.delete(endpoint)

      // Remover do estado local
      switch (activeTab) {
        case 'categorias-receitas':
          setCategoriasReceitas(categoriasReceitas.filter(i => i.id !== item.id))
          break
        case 'categorias-insumos':
          setCategoriasInsumos(categoriasInsumos.filter(i => i.id !== item.id))
          break
        case 'unidades-medida':
          setUnidadesMedida(unidadesMedida.filter(i => i.id !== item.id))
          break
        case 'fornecedores':
          setFornecedores(fornecedores.filter(i => i.id !== item.id))
          break
      }

      showSuccess('Item excluído com sucesso!')
    } catch (error: any) {
      console.error('❌ Erro ao excluir:', error)
      const errorMessage = error.response?.data?.error || 'Erro ao excluir item'
      showError(errorMessage)
    }
  }

  const getCurrentData = () => {
    switch (activeTab) {
      case 'categorias-receitas': return categoriasReceitas
      case 'categorias-insumos': return categoriasInsumos
      case 'unidades-medida': return unidadesMedida
      case 'fornecedores': return fornecedores
      default: return []
    }
  }

  const renderTableHeaders = () => {
    switch (activeTab) {
      case 'unidades-medida':
        return (
          <tr className="bg-gray-50">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Símbolo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
          </tr>
        )
      case 'fornecedores':
        return (
          <tr className="bg-gray-50">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contato</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
          </tr>
        )
      default:
        return (
          <tr className="bg-gray-50">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
          </tr>
        )
    }
  }

  const renderTableRows = () => {
    const data = getCurrentData()
    
    if (data.length === 0) {
      return (
        <tr>
          <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
            Nenhum item cadastrado
          </td>
        </tr>
      )
    }

    return data.map((item: any) => (
      <tr key={item.id} className="bg-white border-b border-gray-200 hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          {item.name}
        </td>
        {activeTab === 'unidades-medida' ? (
          <>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {item.abbreviation}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {item.type}
            </td>
          </>
        ) : activeTab === 'fornecedores' ? (
          <>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {item.contact}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {item.phone}
            </td>
          </>
        ) : (
          <td className="px-6 py-4 text-sm text-gray-500">
            {item.description}
          </td>
        )}
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
          <button
            onClick={() => handleView(item)}
            className="text-green-600 hover:text-green-900 p-1 rounded"
            title="Visualizar"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleEdit(item)}
            className="text-blue-600 hover:text-blue-900 p-1 rounded"
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(item)}
            className="text-red-600 hover:text-red-900 p-1 rounded"
            title="Excluir"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </td>
      </tr>
    ))
  }

  const renderFormFields = () => {
    switch (activeTab) {
      case 'unidades-medida':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Símbolo *
              </label>
              <input
                type="text"
                value={formData.abbreviation}
                onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, conversionFactor: parseFloat(e.target.value) || 1.0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1.0"
              />
            </div>
            <div className="md:col-span-2">
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
          </div>
        )
      case 'fornecedores':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome do fornecedor"
              />
            </div>
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
            <div className="md:col-span-2">
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
          </div>
        )
      default:
        return (
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
                placeholder="Nome da categoria"
              />
            </div>
            <div>
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
          </div>
        )
    }
  }

  const renderViewModal = () => {
    if (!viewingItem) return null

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleString('pt-BR')
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Visualizar Item
            </h3>
            <button
              onClick={() => setIsViewModalOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{viewingItem.name}</p>
            </div>

            {activeTab === 'unidades-medida' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Símbolo</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{viewingItem.abbreviation}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{viewingItem.type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fator de Conversão</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{viewingItem.conversionFactor}</p>
                </div>
                {viewingItem.baseUnit && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unidade Base</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{viewingItem.baseUnit}</p>
                  </div>
                )}
              </>
            )}

            {activeTab === 'fornecedores' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contato</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{viewingItem.contact}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{viewingItem.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{viewingItem.email}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{viewingItem.address}</p>
                </div>
              </>
            )}

            {(activeTab === 'categorias-receitas' || activeTab === 'categorias-insumos') && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{viewingItem.description}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Criado em</label>
              <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                {viewingItem.createdAt ? formatDate(viewingItem.createdAt) : 'N/A'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Atualizado em</label>
              <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                {viewingItem.updatedAt ? formatDate(viewingItem.updatedAt) : 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600">Gerencie categorias, unidades de medida e fornecedores do sistema</p>
        </div>
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
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
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
            <thead>
              {renderTableHeaders()}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {renderTableRows()}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Adição/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingItem ? 'Editar Item' : 'Adicionar Item'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {renderFormFields()}

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
      )}

      {/* Modal de Visualização */}
      {isViewModalOpen && renderViewModal()}
    </div>
  )
}
