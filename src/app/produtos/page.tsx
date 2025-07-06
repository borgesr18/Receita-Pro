'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Edit, Trash2, X, Package, TrendingUp, AlertTriangle, Eye } from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'

interface Product {
  id: string
  name: string
  categoryId: string
  averageWeight: number
  description?: string
  createdAt?: string
  updatedAt?: string
  category?: { name: string }
}

interface ProductCategory {
  id: string
  name: string
  description?: string
}

export default function Produtos() {
  const { showSuccess, showError } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [viewingItem, setViewingItem] = useState<Product | null>(null)
  const [produtos, setProdutos] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [editingItem, setEditingItem] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    averageWeight: 0,
    description: ''
  })

  // Carregar dados com useCallback para evitar warning
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      console.log('🔄 Carregando dados dos produtos...')
      
      const [productsRes, categoriesRes] = await Promise.all([
        api.get('/api/products'),
        api.get('/api/product-categories')
      ])

      const productsData = Array.isArray(productsRes.data) ? productsRes.data : []
      const categoriesData = Array.isArray(categoriesRes.data) ? categoriesRes.data : []

      setProdutos(productsData)
      setCategories(categoriesData)

      console.log('✅ Dados carregados:', {
        products: productsData.length,
        categories: categoriesData.length
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

  const handleView = (item: Product) => {
    setViewingItem(item)
    setIsViewModalOpen(true)
  }

  const handleAdd = () => {
    setEditingItem(null)
    setFormData({
      name: '',
      categoryId: '',
      averageWeight: 0,
      description: ''
    })
    setIsModalOpen(true)
  }

  const handleEdit = (item: Product) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      categoryId: item.categoryId,
      averageWeight: item.averageWeight,
      description: item.description || ''
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
      if (!formData.categoryId) {
        showError('Categoria é obrigatória')
        return
      }
      if (formData.averageWeight <= 0) {
        showError('Peso médio deve ser maior que zero')
        return
      }

      let response: any

      if (editingItem) {
        // Editar item existente
        response = await api.put(`/api/products/${editingItem.id}`, formData)
        const updatedData = produtos.map(item => 
          item.id === editingItem.id ? response.data as Product : item
        )
        setProdutos(updatedData)
        showSuccess('Produto atualizado com sucesso!')
      } else {
        // Criar novo item
        response = await api.post('/api/products', formData)
        setProdutos([...produtos, response.data as Product])
        showSuccess('Produto criado com sucesso!')
      }

      setIsModalOpen(false)
      setEditingItem(null)
    } catch (error) {
      console.error('❌ Erro ao salvar:', error)
      showError('Erro ao salvar produto')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return

    try {
      await api.delete(`/api/products/${id}`)
      const filteredData = produtos.filter(item => item.id !== id)
      setProdutos(filteredData)
      showSuccess('Produto excluído com sucesso!')
    } catch (error) {
      console.error('❌ Erro ao excluir:', error)
      showError('Erro ao excluir produto')
    }
  }

  const filteredProdutos = produtos.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || item.categoryId === selectedCategory
    return matchesSearch && matchesCategory
  })

  const stats = [
    {
      title: 'Total de Produtos',
      value: produtos.length.toString(),
      icon: Package,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Categorias',
      value: categories.length.toString(),
      icon: AlertTriangle,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Peso Médio Total',
      value: `${produtos.reduce((total, item) => total + item.averageWeight, 0).toFixed(2)}g`,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600'
    }
  ]

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderViewModal = () => {
    if (!isViewModalOpen || !viewingItem) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Detalhes do Produto
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {viewingItem.category?.name || '-'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Peso Médio
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {viewingItem.averageWeight}g
                </p>
              </div>
            </div>

            {/* Informações secundárias */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded min-h-[60px]">
                  {viewingItem.description || '-'}
                </p>
              </div>

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
        <h1 className="text-2xl font-bold text-gray-900">Gestão de Produtos</h1>
        <p className="mt-2 text-sm text-gray-600">
          Gerencie seus produtos finais
        </p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className={`bg-gradient-to-r ${stat.color} rounded-lg p-6 text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <Icon className="h-8 w-8 text-white/80" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Filtros e busca */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas as categorias</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Adicionar Produto</span>
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Peso Médio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descrição
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProdutos.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.category?.name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.averageWeight}g
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {item.description || '-'}
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
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProdutos.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum produto encontrado
          </div>
        )}
      </div>

      {/* Modal de Edição/Criação */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingItem ? 'Editar' : 'Adicionar'} Produto
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome do produto"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Peso Médio (gramas) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.averageWeight}
                  onChange={(e) => setFormData({ ...formData, averageWeight: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
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
                  placeholder="Descrição do produto"
                  rows={3}
                />
              </div>
              
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

