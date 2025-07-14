'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Edit, Trash2, X, Package, Eye, Filter, Save } from 'lucide-react'
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

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      console.log('🔄 Carregando dados dos produtos...')
      
      // Carregar produtos
      const productsRes = await api.get('/api/products')
      console.log('📦 Produtos carregados:', productsRes.data)
      setProdutos(productsRes.data as Product[])

      // Tentar carregar categorias, mas não falhar se não existir
      try {
        const categoriesRes = await api.get('/api/product-categories')
        console.log('📂 Categorias carregadas:', categoriesRes.data)
        setCategories(categoriesRes.data as ProductCategory[] || [])
      } catch (categoryError) {
        console.log('⚠️ API de categorias não encontrada, usando categorias padrão')
        // Definir categorias padrão se a API não existir
        setCategories([
          { id: '1', name: 'Pães', description: 'Produtos de panificação' },
          { id: '2', name: 'Doces', description: 'Produtos doces' },
          { id: '3', name: 'Salgados', description: 'Produtos salgados' },
          { id: '4', name: 'Bolos', description: 'Bolos e tortas' }
        ])
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error)
      showError('Erro ao carregar dados')
      // Definir dados padrão em caso de erro
      setProdutos([])
      setCategories([
        { id: '1', name: 'Pães', description: 'Produtos de panificação' },
        { id: '2', name: 'Doces', description: 'Produtos doces' },
        { id: '3', name: 'Salgados', description: 'Produtos salgados' },
        { id: '4', name: 'Bolos', description: 'Bolos e tortas' }
      ])
    } finally {
      setLoading(false)
    }
  }, [showError])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredProdutos = produtos.filter(produto => {
    const matchesSearch = produto.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || produto.categoryId === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        averageWeight: Number(formData.averageWeight)
      }

      if (editingItem) {
        await api.put(`/api/products/${editingItem.id}`, payload)
        showSuccess('Produto atualizado com sucesso!')
      } else {
        await api.post('/api/products', payload)
        showSuccess('Produto criado com sucesso!')
      }

      setIsModalOpen(false)
      setEditingItem(null)
      setFormData({ name: '', categoryId: '', averageWeight: 0, description: '' })
      loadData()
    } catch (error) {
      console.error('❌ Erro ao salvar produto:', error)
      showError('Erro ao salvar produto')
    }
  }

  const handleEdit = (produto: Product) => {
    setFormData({
      name: produto.name,
      categoryId: produto.categoryId,
      averageWeight: produto.averageWeight,
      description: produto.description || ''
    })
    setEditingItem(produto)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await api.delete(`/api/products/${id}`)
        showSuccess('Produto excluído com sucesso!')
        loadData()
      } catch (error) {
        console.error('❌ Erro ao excluir produto:', error)
        showError('Erro ao excluir produto')
      }
    }
  }

  const handleView = (produto: Product) => {
    setViewingItem(produto)
    setIsViewModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setFormData({ name: '', categoryId: '', averageWeight: 0, description: '' })
  }

  const closeViewModal = () => {
    setIsViewModalOpen(false)
    setViewingItem(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando produtos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 space-y-6">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Gestão de Produtos
            </h1>
            <p className="text-gray-600 mt-1">Controle completo dos produtos finais</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            Novo Produto
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Produtos</p>
              <p className="text-2xl font-bold text-gray-900">{produtos.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center">
              <Package size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categorias</p>
              <p className="text-2xl font-bold text-gray-900">{categories?.length || 0}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl flex items-center justify-center">
              <Filter size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Peso Médio Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {produtos.reduce((sum, p) => sum + p.averageWeight, 0).toFixed(0)}g
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl flex items-center justify-center">
              <Package size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="">Todas as categorias</option>
            {categories && categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>

          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all">
            <Filter size={20} />
            Filtros
          </button>
        </div>
      </div>

      {/* Tabela de Produtos */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <h3 className="text-xl font-bold text-white">Lista de Produtos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peso Médio</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProdutos.length > 0 ? (
                filteredProdutos.map((produto) => (
                  <tr key={produto.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{produto.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {produto.category?.name || categories.find(c => c.id === produto.categoryId)?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {produto.averageWeight}g
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {produto.description || 'Sem descrição'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(produto)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(produto)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(produto.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <Package size={48} className="text-gray-300 mb-2" />
                      <p>Nenhum produto encontrado</p>
                      <p className="text-sm">Adicione produtos para começar</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Adição/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  {editingItem ? 'Editar Produto' : 'Novo Produto'}
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
                      Nome do Produto
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Ex: Pão Francês"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Categoria
                    </label>
                    <select
                      required
                      value={formData.categoryId}
                      onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories && categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Peso Médio (gramas)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      required
                      value={formData.averageWeight}
                      onChange={(e) => setFormData(prev => ({ ...prev, averageWeight: Number(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    rows={3}
                    placeholder="Descrição do produto..."
                  />
                </div>
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
                <h2 className="text-2xl font-bold text-white">Detalhes do Produto</h2>
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
                  <h3 className="font-semibold text-gray-900 mb-3">Informações Básicas</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Nome:</span>
                      <p className="font-medium">{viewingItem.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Categoria:</span>
                      <p className="font-medium">
                        {viewingItem.category?.name || categories.find(c => c.id === viewingItem.categoryId)?.name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Peso Médio:</span>
                      <p className="font-medium">{viewingItem.averageWeight}g</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Descrição</h3>
                  <p className="text-gray-700">{viewingItem.description || 'Sem descrição disponível'}</p>
                </div>
              </div>
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

