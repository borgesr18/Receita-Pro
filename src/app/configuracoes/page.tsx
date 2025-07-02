'use client'

import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2,
  Package,
  Scale,
  Tag,
  Truck
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
  email: string
  phone: string
}

export default function Configuracoes() {
  const [activeTab, setActiveTab] = useState('categorias-receitas')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const { showSuccess, showError } = useToast()

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
    email: '',
    phone: ''
  })

  const tabs = [
    { id: 'categorias-receitas', label: 'Categorias de Receitas', icon: Tag },
    { id: 'categorias-insumos', label: 'Categorias de Insumos', icon: Package },
    { id: 'unidades-medida', label: 'Unidades de Medida', icon: Scale },
    { id: 'fornecedores', label: 'Fornecedores', icon: Truck }
  ]

  // Carregar dados
  const loadData = async () => {
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
        receitas: receitasRes.data?.length || 0,
        insumos: insumosRes.data?.length || 0,
        unidades: unidadesRes.data?.length || 0,
        fornecedores: fornecedoresRes.data?.length || 0
      })
    } catch (error) {
      console.error('❌ Erro ao carregar configurações:', error)
      showError('Erro ao carregar configurações')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

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
      email: '',
      phone: ''
    })
    setIsModalOpen(true)
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setFormData({
      name: item.name || '',
      description: item.description || '',
      symbol: item.symbol || '',
      email: item.email || '',
      phone: item.phone || ''
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return

    try {
      const endpoint = getApiEndpoint()
      await api.delete(`${endpoint}/${id}`)
      
      const currentData = getCurrentData()
      updateState(currentData.filter(item => item.id !== id))
      
      showSuccess('Item excluído com sucesso!')
    } catch (error) {
      console.error('❌ Erro ao excluir:', error)
      showError('Erro ao excluir item')
    }
  }

  const handleSave = async () => {
    try {
      const endpoint = getApiEndpoint()
      let payload: any = {}

      // Preparar payload baseado no tipo
      if (activeTab === 'unidades-medida') {
        payload = {
          name: formData.name,
          symbol: formData.symbol
        }
      } else if (activeTab === 'fornecedores') {
        payload = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        }
      } else {
        payload = {
          name: formData.name,
          description: formData.description
        }
      }

      let response
      if (editingItem) {
        response = await api.put(`${endpoint}/${editingItem.id}`, payload)
        const currentData = getCurrentData()
        updateState(currentData.map(item => 
          item.id === editingItem.id ? response.data as any : item
        ))
        showSuccess('Item atualizado com sucesso!')
      } else {
        response = await api.post(endpoint, payload)
        const currentData = getCurrentData()
        updateState([...currentData, response.data as any])
        showSuccess('Item criado com sucesso!')
      }

      setIsModalOpen(false)
      setEditingItem(null)
      setFormData({
        name: '',
        description: '',
        symbol: '',
        email: '',
        phone: ''
      })
    } catch (error) {
      console.error('❌ Erro ao salvar:', error)
      showError('Erro ao salvar item')
    }
  }

  const renderTableHeaders = () => {
    switch (activeTab) {
      case 'unidades-medida':
        return (
          <>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Símbolo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
          </>
        )
      case 'fornecedores':
        return (
          <>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
          </>
        )
      default:
        return (
          <>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
          </>
        )
    }
  }

  const renderTableRow = (item: any) => {
    switch (activeTab) {
      case 'unidades-medida':
        return (
          <>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.symbol}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div className="flex space-x-2">
                <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-900">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </td>
          </>
        )
      case 'fornecedores':
        return (
          <>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.email}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.phone}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div className="flex space-x-2">
                <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-900">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </td>
          </>
        )
      default:
        return (
          <>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.description}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div className="flex space-x-2">
                <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-900">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </td>
          </>
        )
    }
  }

  const renderFormFields = () => {
    switch (activeTab) {
      case 'unidades-medida':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Quilograma"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Símbolo</label>
              <input
                type="text"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: kg"
              />
            </div>
          </>
        )
      case 'fornecedores':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nome do fornecedor"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="email@fornecedor.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="(11) 99999-9999"
              />
            </div>
          </>
        )
      default:
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nome da categoria"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Descrição da categoria"
              />
            </div>
          </>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando configurações...</div>
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
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">
            {tabs.find(tab => tab.id === activeTab)?.label}
          </h2>
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
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
              Nenhum item encontrado
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingItem ? 'Editar' : 'Adicionar'} {tabs.find(tab => tab.id === activeTab)?.label.slice(0, -1)}
            </h2>
            
            <div className="space-y-4">
              {renderFormFields()}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

