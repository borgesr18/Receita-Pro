'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Edit, Trash2, X, Package, TrendingUp, AlertTriangle, Eye, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'

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

interface RecipeCategory {
  id: string
  name: string
  description?: string
}

// Sistema de toast simples sem dependências externas
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  const toast = document.createElement('div')
  toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 transform translate-x-full ${
    type === 'success' ? 'bg-green-500' : 'bg-red-500'
  }`
  toast.textContent = message
  
  document.body.appendChild(toast)
  
  setTimeout(() => {
    toast.style.transform = 'translateX(0)'
  }, 100)
  
  setTimeout(() => {
    toast.style.transform = 'translateX(full)'
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast)
      }
    }, 300)
  }, 3000)
}

export default function ProdutosMelhorada() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [viewingItem, setViewingItem] = useState<Product | null>(null)
  const [produtos, setProdutos] = useState<Product[]>([])
  const [categories, setCategories] = useState<RecipeCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
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
        api.get('/api/recipe-categories') // Usando categorias de receitas
      ])

      console.log('📊 Resposta produtos:', productsRes)
      console.log('📊 Resposta categorias de receitas:', categoriesRes)

      if (productsRes.data) {
        setProdutos(Array.isArray(productsRes.data) ? productsRes.data : [])
        console.log('✅ Produtos carregados:', productsRes.data.length)
      } else {
        setProdutos([])
        console.log('⚠️ Nenhum produto encontrado')
      }

      if (categoriesRes.data) {
        setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : [])
        console.log('✅ Categorias de receitas carregadas:', categoriesRes.data.length)
      } else {
        setCategories([])
        console.log('⚠️ Nenhuma categoria de receita encontrada')
      }

    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error)
      showToast('Falha ao carregar dados. Verifique sua conexão.', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredProdutos = produtos.filter(produto => {
    const matchesSearch = produto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (produto.description && produto.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === '' || produto.categoryId === selectedCategory
    return matchesSearch && matchesCategory
  })

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

  const handleView = (item: Product) => {
    setViewingItem(item)
    setIsViewModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return

    try {
      setDeleting(id)
      console.log('🗑️ Excluindo produto:', id)
      
      const response = await api.delete(`/api/products/${id}`)
      
      if (response.data || !response.error) {
        setProdutos(produtos.filter(item => item.id !== id))
        showToast('Produto excluído com sucesso!')
        console.log('✅ Produto excluído')
      } else {
        throw new Error(response.error || 'Falha ao excluir')
      }
    } catch (error) {
      console.error('❌ Erro ao excluir:', error)
      showToast('Falha ao excluir produto. Tente novamente.', 'error')
    } finally {
      setDeleting(null)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      console.log('💾 Salvando produto...')
      console.log('📊 Dados do formulário:', formData)

      // Validações básicas
      if (!formData.name.trim()) {
        showToast('Nome do produto é obrigatório', 'error')
        return
      }

      if (!formData.categoryId) {
        showToast('Categoria é obrigatória', 'error')
        return
      }

      if (!formData.averageWeight || formData.averageWeight <= 0) {
        showToast('Peso médio deve ser maior que zero', 'error')
        return
      }

      const apiData = {
        name: formData.name.trim(),
        categoryId: formData.categoryId,
        averageWeight: Number(formData.averageWeight),
        description: formData.description.trim() || undefined
      }

      console.log('📡 Dados para API:', apiData)

      let response
      if (editingItem?.id) {
        console.log('✏️ Atualizando produto existente:', editingItem.id)
        response = await api.put(`/api/products/${editingItem.id}`, apiData)
      } else {
        console.log('🆕 Criando novo produto')
        response = await api.post('/api/products', apiData)
      }

      console.log('📊 Resposta da API:', response)

      if (response.data && !response.error) {
        showToast(editingItem ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!')
        setIsModalOpen(false)
        setEditingItem(null)
        
        // Resetar formulário
        setFormData({
          name: '',
          categoryId: '',
          averageWeight: 0,
          description: ''
        })
        
        // Recarregar dados
        console.log('🔄 Recarregando dados...')
        await loadData()
      } else {
        console.error('❌ API retornou erro:', response.error)
        throw new Error(response.error || 'Falha ao salvar')
      }

    } catch (error) {
      console.error('❌ Erro ao salvar:', error)
      
      let errorMessage = 'Erro desconhecido'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      
      showToast(`Falha ao salvar produto: ${errorMessage}`, 'error')
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatWeight = (weight: number) => {
    if (weight >= 1000) {
      return `${(weight / 1000).toFixed(1)}kg`
    }
    return `${weight}g`
  }

  // Encontrar nome da categoria
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category?.name || 'Sem categoria'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 text-lg">Carregando produtos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              Produtos
            </h1>
            <p className="text-gray-600 mt-2 text-lg">Gerencie seus produtos usando categorias de receitas</p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus size={24} />
            <span className="font-semibold">Novo Produto</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                <Package className="text-white" size={28} />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Total de Produtos</p>
                <p className="text-3xl font-bold text-gray-900">{produtos.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg">
                <TrendingUp className="text-white" size={28} />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Categorias</p>
                <p className="text-3xl font-bold text-gray-900">{categories.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg">
                <AlertTriangle className="text-white" size={28} />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Peso Médio</p>
                <p className="text-3xl font-bold text-gray-900">
                  {produtos.length > 0 
                    ? formatWeight(produtos.reduce((acc, p) => acc + p.averageWeight, 0) / produtos.length)
                    : '0g'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 p-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm text-lg"
                />
              </div>
            </div>
            <div className="lg:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm text-lg"
              >
                <option value="">Todas as categorias</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Nome</th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Categoria</th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Peso Médio</th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Criado em</th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white/50 divide-y divide-gray-200">
                {filteredProdutos.map((produto) => (
                  <tr key={produto.id} className="hover:bg-white/70 transition-colors duration-200">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{produto.name}</div>
                      {produto.description && (
                        <div className="text-sm text-gray-500">{produto.description}</div>
                      )}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className="px-4 py-2 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                        {getCategoryName(produto.categoryId)}
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-900">
                      {formatWeight(produto.averageWeight)}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(produto.createdAt || '')}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleView(produto)}
                          className="text-green-600 hover:text-green-900 p-2 rounded-xl hover:bg-green-50 transition-colors"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(produto)}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-xl hover:bg-blue-50 transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(produto.id)}
                          disabled={deleting === produto.id}
                          className="text-red-600 hover:text-red-900 p-2 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          {deleting === produto.id ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProdutos.length === 0 && (
            <div className="text-center py-16">
              <Package className="mx-auto h-16 w-16 text-gray-400 mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Nenhum produto encontrado</h3>
              <p className="text-gray-500 text-lg">Comece criando seu primeiro produto.</p>
            </div>
          )}
        </div>

        {/* Modal de Criação/Edição - COMPACTO */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-white/50 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {editingItem ? 'Editar' : 'Adicionar'} Produto
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nome do Produto *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                    placeholder="Ex: Bolo de Chocolate"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Categoria *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                  {categories.length === 0 && (
                    <p className="text-sm text-red-600 mt-1">⚠️ Cadastre categorias em Configurações primeiro.</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Peso Médio (g) *</label>
                  <input
                    type="number"
                    value={formData.averageWeight || ''}
                    onChange={(e) => setFormData({ ...formData, averageWeight: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                    placeholder="Ex: 500"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Descrição</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                    rows={3}
                    placeholder="Descrição opcional do produto..."
                  />
                </div>
              </div>

              <div className="flex space-x-4 mt-8">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {saving ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Package size={20} />
                      <span>Salvar</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Visualização - COMPACTO */}
        {isViewModalOpen && viewingItem && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-white/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Detalhes do Produto
                </h3>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nome</label>
                    <p className="text-gray-900">{viewingItem.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Categoria</label>
                    <p className="text-gray-900">{getCategoryName(viewingItem.categoryId)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Peso Médio</label>
                    <p className="text-gray-900">{formatWeight(viewingItem.averageWeight)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Criado em</label>
                    <p className="text-gray-900">{formatDate(viewingItem.createdAt || '')}</p>
                  </div>
                </div>
                
                {viewingItem.description && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Descrição</label>
                    <p className="text-gray-900">{viewingItem.description}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-8">
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

