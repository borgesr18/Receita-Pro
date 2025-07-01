'use client'

import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  Search
} from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'

interface Product {
  id: string
  name: string
  categoryId: string
  averageWeight: number
  description?: string
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
  const [editingItem, setEditingItem] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [produtos, setProdutos] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    averageWeight: 0,
    description: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [productsRes, categoriesRes] = await Promise.all([
        api.get<Product[]>('/api/products'),
        api.get<ProductCategory[]>('/api/product-categories')
      ])

      if (productsRes.error) {
        throw new Error(`Products API error: ${productsRes.error}`)
      }
      if (categoriesRes.error) {
        throw new Error(`Categories API error: ${categoriesRes.error}`)
      }

      setProdutos(productsRes.data || [])
      setCategories(categoriesRes.data || [])
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data'
      setError(errorMessage)
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      categoryId: '',
      averageWeight: 0,
      description: ''
    })
    setEditingItem(null)
  }

  const openModal = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    resetForm()
  }

  const handleEdit = (item: Product) => {
    setFormData({
      name: item.name,
      categoryId: item.categoryId,
      averageWeight: item.averageWeight,
      description: item.description || ''
    })
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
      return
    }

    try {
      const result = await api.delete(`/api/products/${id}`)
      if (result.error) {
        throw new Error(result.error)
      }
      
      setProdutos(produtos.filter(item => item.id !== id))
      showSuccess('Produto excluído!', 'O produto foi removido com sucesso.')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete product'
      setError(errorMessage)
      showError('Erro ao excluir', errorMessage)
      console.error('Error deleting product:', err)
    }
  }

  const handleSave = async () => {
    try {
      if (editingItem) {
        const result = await api.put(`/api/products/${editingItem.id}`, formData)
        if (result.error) {
          throw new Error(result.error)
        }
        
        setProdutos(produtos.map(item => 
          item.id === editingItem.id 
            ? { ...item, ...result.data as Product }
            : item
        ))
        showSuccess('Produto atualizado!', 'O produto foi atualizado com sucesso.')
      } else {
        const result = await api.post<Product>('/api/products', formData)
        if (result.error) {
          throw new Error(result.error)
        }
        
        setProdutos([...produtos, result.data!])
        showSuccess('Produto criado!', 'O novo produto foi adicionado com sucesso.')
      }
      
      setIsModalOpen(false)
      setEditingItem(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save product'
      setError(errorMessage)
      showError('Erro ao salvar', errorMessage)
      console.error('Error saving product:', err)
    }
  }

  const filteredProdutos = produtos.filter(produto => {
    const matchesSearch = produto.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !filterCategory || produto.categoryId === filterCategory
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando produtos...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cadastro de Produtos</h1>
          <p className="text-gray-600">Gerencie todos os produtos da sua padaria</p>
        </div>
        <button
          onClick={openModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Produto
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas as categorias</option>
              {categories.map(categoria => (
                <option key={categoria.id} value={categoria.id}>{categoria.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produto
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
              {filteredProdutos.map((produto) => (
                <tr key={produto.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{produto.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {produto.category?.name || 'Sem categoria'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {produto.averageWeight}g
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    {produto.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(produto)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(produto.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingItem ? 'Editar Produto' : 'Adicionar Produto'}
              </h2>
              <button onClick={closeModal}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Produto</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Pão Francês"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione a categoria</option>
                  {categories.map(categoria => (
                    <option key={categoria.id} value={categoria.id}>{categoria.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Peso Médio (g)</label>
                <input
                  type="number"
                  value={formData.averageWeight}
                  onChange={(e) => setFormData({ ...formData, averageWeight: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descrição do produto..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Salvar
              </button>
              <button
                onClick={closeModal}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

