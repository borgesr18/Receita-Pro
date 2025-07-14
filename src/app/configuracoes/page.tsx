'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  Users,
  Package,
  Scale,
  Tag,
  Settings,
  Search
} from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'

interface ConfigurationItem {
  id: string
  name: string
  description?: string
  abbreviation?: string
  type?: string
  baseUnit?: string
  email?: string
  phone?: string
  address?: string
  role?: string
  active?: boolean
  createdAt?: string
  updatedAt?: string
}

export default function Configuracoes() {
  const [activeTab, setActiveTab] = useState('categorias-receitas')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingItem, setEditingItem] = useState<ConfigurationItem | null>(null)
  
  // Estados para dados reais das APIs
  const [categoriasReceitas, setCategoriasReceitas] = useState<ConfigurationItem[]>([])
  const [categoriasInsumos, setCategoriasInsumos] = useState<ConfigurationItem[]>([])
  const [unidadesMedida, setUnidadesMedida] = useState<ConfigurationItem[]>([])
  const [fornecedores, setFornecedores] = useState<ConfigurationItem[]>([])
  const [unitTypes, setUnitTypes] = useState<{value: string, label: string}[]>([])
  
  const [formData, setFormData] = useState<ConfigurationItem>({
    id: '',
    name: '',
    description: '',
    abbreviation: '',
    type: '',
    baseUnit: '',
    email: '',
    phone: '',
    address: '',
    role: '',
    active: true
  })

  const { showSuccess, showError } = useToast()

  const tabs = [
    { id: 'categorias-receitas', label: 'Categorias de Receitas', icon: Tag, color: 'from-blue-500 to-indigo-600' },
    { id: 'categorias-insumos', label: 'Categorias de Insumos', icon: Package, color: 'from-green-500 to-emerald-600' },
    { id: 'unidades-medida', label: 'Unidades de Medida', icon: Scale, color: 'from-purple-500 to-violet-600' },
    { id: 'fornecedores', label: 'Fornecedores', icon: Users, color: 'from-orange-500 to-red-600' }
  ]

  // Carregar tipos de unidades
  const loadUnitTypes = useCallback(async () => {
    try {
      const response = await api.get('/api/enums/unit-types')
      setUnitTypes(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error('Erro ao carregar tipos de unidades:', error)
      setUnitTypes([
        { value: 'weight', label: 'Peso' },
        { value: 'volume', label: 'Volume' },
        { value: 'unit', label: 'Unidade' }
      ])
    }
  }, [])

  // Carregar dados das configurações
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      console.log('🔄 Carregando dados das configurações...')
      
      // Carregar dados com tratamento de erro individual
      const loadWithFallback = async (endpoint: string, fallback: ConfigurationItem[] = []) => {
        try {
          const response = await api.get(endpoint)
          return Array.isArray(response.data) ? response.data : fallback
        } catch (error) {
          console.warn(`Erro ao carregar ${endpoint}:`, error)
          return fallback
        }
      }

      const [recipeCategoriesData, ingredientCategoriesData, measurementUnitsData, suppliersData] = await Promise.all([
        loadWithFallback('/api/recipe-categories'),
        loadWithFallback('/api/ingredient-categories'),
        loadWithFallback('/api/measurement-units'),
        loadWithFallback('/api/suppliers')
      ])

      setCategoriasReceitas(recipeCategoriesData)
      setCategoriasInsumos(ingredientCategoriesData)
      setUnidadesMedida(measurementUnitsData)
      setFornecedores(suppliersData)

      console.log('✅ Dados carregados:', {
        recipeCategories: recipeCategoriesData.length,
        ingredientCategories: ingredientCategoriesData.length,
        measurementUnits: measurementUnitsData.length,
        suppliers: suppliersData.length
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

  const getCurrentData = (): ConfigurationItem[] => {
    let data: ConfigurationItem[] = []
    
    switch (activeTab) {
      case 'categorias-receitas': 
        data = categoriasReceitas || []
        break
      case 'categorias-insumos': 
        data = categoriasInsumos || []
        break
      case 'unidades-medida': 
        data = unidadesMedida || []
        break
      case 'fornecedores': 
        data = fornecedores || []
        break
      default: 
        data = []
    }
    
    // Filtrar por termo de busca - verificar se item e propriedades existem
    if (searchTerm && Array.isArray(data) && data.length > 0) {
      return data.filter(item => {
        if (!item) return false
        
        const name = item.name || ''
        const description = item.description || ''
        const searchLower = searchTerm.toLowerCase()
        
        return name.toLowerCase().includes(searchLower) || 
               description.toLowerCase().includes(searchLower)
      })
    }
    
    return Array.isArray(data) ? data : []
  }

  const getCurrentSetter = () => {
    switch (activeTab) {
      case 'categorias-receitas': return setCategoriasReceitas
      case 'categorias-insumos': return setCategoriasInsumos
      case 'unidades-medida': return setUnidadesMedida
      case 'fornecedores': return setFornecedores
      default: return () => {}
    }
  }

  const getApiEndpoint = () => {
    switch (activeTab) {
      case 'categorias-receitas': return '/api/recipe-categories'
      case 'categorias-insumos': return '/api/ingredient-categories'
      case 'unidades-medida': return '/api/measurement-units'
      case 'fornecedores': return '/api/suppliers'
      default: return ''
    }
  }

  const handleAdd = () => {
    setEditingItem(null)
    setFormData({
      id: '',
      name: '',
      description: '',
      abbreviation: '',
      type: '',
      baseUnit: '',
      email: '',
      phone: '',
      address: '',
      role: '',
      active: true
    })
    setIsModalOpen(true)
  }

  const handleEdit = (item: ConfigurationItem) => {
    if (!item) return
    
    setEditingItem(item)
    setFormData({ 
      ...item,
      name: item.name || '',
      description: item.description || '',
      abbreviation: item.abbreviation || '',
      type: item.type || '',
      baseUnit: item.baseUnit || '',
      email: item.email || '',
      phone: item.phone || '',
      address: item.address || '',
      role: item.role || '',
      active: item.active !== false
    })
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      showError('Nome é obrigatório')
      return
    }

    try {
      setLoading(true)
      const endpoint = getApiEndpoint()
      
      if (!endpoint) {
        showError('Endpoint não encontrado')
        return
      }
      
      // Preparar dados específicos para cada tipo
      const dataToSend = (() => {
        switch (activeTab) {
          case 'unidades-medida':
            return {
              name: formData.name.trim(),
              abbreviation: formData.abbreviation?.trim() || '',
              type: formData.type || '',
              baseUnit: formData.baseUnit || ''
            }
          case 'fornecedores':
            return {
              name: formData.name.trim(),
              contact: formData.description?.trim() || '',
              phone: formData.phone?.trim() || '',
              email: formData.email?.trim() || '',
              address: formData.address?.trim() || ''
            }
          default:
            return {
              name: formData.name.trim(),
              description: formData.description?.trim() || ''
            }
        }
      })()

      console.log('📤 Enviando dados:', dataToSend)

      let response
      if (editingItem?.id) {
        response = await api.put(`${endpoint}/${editingItem.id}`, dataToSend)
      } else {
        response = await api.post(endpoint, dataToSend)
      }

      const currentSetter = getCurrentSetter()
      const currentData = getCurrentData()

      if (editingItem?.id) {
        currentSetter(currentData.map(item => 
          item?.id === editingItem.id ? (response.data as ConfigurationItem) : item
        ))
        showSuccess('Item atualizado com sucesso!')
      } else {
        currentSetter([...currentData, response.data as ConfigurationItem])
        showSuccess('Item criado com sucesso!')
      }

      setIsModalOpen(false)
      setFormData({
        id: '',
        name: '',
        description: '',
        abbreviation: '',
        type: '',
        baseUnit: '',
        email: '',
        phone: '',
        address: '',
        role: '',
        active: true
      })
    } catch (error: any) {
      console.error('❌ Erro ao salvar:', error)
      if (error.response?.status === 409) {
        showError('Já existe um item com esse nome')
      } else if (error.response?.status === 405) {
        showError('Método não permitido - verifique a API')
      } else {
        showError('Erro ao salvar item')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (item: ConfigurationItem) => {
    if (!item?.id || !item?.name) return
    
    if (!confirm(`Tem certeza que deseja excluir "${item.name}"?`)) return

    try {
      setLoading(true)
      const endpoint = getApiEndpoint()
      
      if (!endpoint) {
        showError('Endpoint não encontrado')
        return
      }
      
      await api.delete(`${endpoint}/${item.id}`)

      const currentSetter = getCurrentSetter()
      const currentData = getCurrentData()
      currentSetter(currentData.filter(i => i?.id !== item.id))
      
      showSuccess('Item excluído com sucesso!')
    } catch (error: any) {
      console.error('❌ Erro ao excluir:', error)
      if (error.response?.status === 405) {
        showError('Método não permitido - verifique a API')
      } else {
        showError('Erro ao excluir item')
      }
    } finally {
      setLoading(false)
    }
  }

  const renderFormFields = () => {
    switch (activeTab) {
      case 'unidades-medida':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Unidade *
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  placeholder="Ex: Quilograma"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Abreviação
                </label>
                <input
                  type="text"
                  value={formData.abbreviation || ''}
                  onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  placeholder="Ex: kg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <select
                value={formData.type || ''}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              >
                <option value="">Selecione um tipo</option>
                {unitTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        )
      
      case 'fornecedores':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Fornecedor *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                placeholder="Ex: Atacadão"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contato
                </label>
                <input
                  type="text"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                  placeholder="Nome do contato"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                  placeholder="contato@fornecedor.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Endereço
                </label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                  placeholder="Rua, número, bairro, cidade"
                />
              </div>
            </div>
          </>
        )
      
      default:
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-${activeTab === 'categorias-receitas' ? 'blue' : 'green'}-500 focus:border-transparent transition-all duration-300`}
                placeholder="Nome da categoria"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-${activeTab === 'categorias-receitas' ? 'blue' : 'green'}-500 focus:border-transparent transition-all duration-300`}
                placeholder="Descrição da categoria"
                rows={3}
              />
            </div>
          </>
        )
    }
  }

  const renderTableHeaders = () => {
    switch (activeTab) {
      case 'unidades-medida':
        return (
          <>
            <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Nome</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Abreviação</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Tipo</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Ações</th>
          </>
        )
      case 'fornecedores':
        return (
          <>
            <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Nome</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Contato</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Telefone</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Email</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Endereço</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Ações</th>
          </>
        )
      default:
        return (
          <>
            <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Nome</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Descrição</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Ações</th>
          </>
        )
    }
  }

  const renderTableRow = (item: ConfigurationItem) => {
    if (!item) return null
    
    switch (activeTab) {
      case 'unidades-medida':
        return (
          <>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name || '-'}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.abbreviation || '-'}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.type || '-'}</td>
          </>
        )
      case 'fornecedores':
        return (
          <>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name || '-'}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.description || '-'}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.phone || '-'}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.email || '-'}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.address || '-'}</td>
          </>
        )
      default:
        return (
          <>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name || '-'}</td>
            <td className="px-6 py-4 text-sm text-gray-600">{item.description || '-'}</td>
          </>
        )
    }
  }

  const currentTab = tabs.find(tab => tab.id === activeTab)
  const currentData = getCurrentData()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className={`bg-gradient-to-r ${currentTab?.color || 'from-blue-500 to-indigo-600'} rounded-3xl p-8 text-white shadow-2xl`}>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Settings size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Configurações</h1>
                <p className="text-white/90 mt-1">Gerencie categorias, unidades e fornecedores</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20">
            <nav className="flex space-x-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                      activeTab === tab.id
                        ? `bg-gradient-to-r ${tab.color} text-white shadow-lg transform scale-105`
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header da seção */}
          <div className={`bg-gradient-to-r ${currentTab?.color || 'from-blue-500 to-indigo-600'} p-6`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {currentTab && <currentTab.icon size={24} className="text-white" />}
                <h3 className="text-xl font-bold text-white">
                  {currentTab?.label}
                </h3>
              </div>
              <button
                onClick={handleAdd}
                disabled={loading}
                className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50"
              >
                <Plus size={18} />
                <span>Adicionar</span>
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
              </div>
              <div className="text-sm text-gray-600">
                {currentData.length} {currentData.length === 1 ? 'item' : 'itens'}
              </div>
            </div>
          </div>

          {/* Tabela */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Carregando...</span>
              </div>
            ) : currentData.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  {currentTab && <currentTab.icon size={48} className="mx-auto mb-4" />}
                </div>
                <p className="text-gray-600 text-lg">
                  {searchTerm ? 'Nenhum item encontrado' : 'Nenhum item cadastrado'}
                </p>
                <p className="text-gray-400 mt-2">
                  {searchTerm ? 'Tente ajustar sua busca' : 'Clique em "Adicionar" para começar'}
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className={`bg-gradient-to-r ${currentTab?.color || 'from-blue-500 to-indigo-600'}`}>
                  <tr>
                    {renderTableHeaders()}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentData.map((item, index) => {
                    if (!item) return null
                    
                    return (
                      <tr key={item.id || index} className={`hover:bg-gray-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        {renderTableRow(item)}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
                              title="Editar"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(item)}
                              className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                              title="Excluir"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Header do Modal */}
              <div className={`bg-gradient-to-r ${currentTab?.color || 'from-blue-500 to-indigo-600'} p-6 rounded-t-3xl`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {currentTab && <currentTab.icon size={24} className="text-white" />}
                    <h3 className="text-xl font-bold text-white">
                      {editingItem ? 'Editar' : 'Adicionar'} {currentTab?.label.slice(0, -1)}
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/20 transition-all duration-200"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Conteúdo do Modal */}
              <div className="p-6 space-y-6">
                {renderFormFields()}
              </div>

              {/* Footer do Modal */}
              <div className="p-6 border-t border-gray-200 flex items-center justify-end space-x-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading || !formData.name?.trim()}
                  className={`flex items-center space-x-2 bg-gradient-to-r ${currentTab?.color || 'from-blue-500 to-indigo-600'} text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Save size={18} />
                  <span>{loading ? 'Salvando...' : 'Salvar'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
