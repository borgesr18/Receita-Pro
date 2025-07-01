'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Edit, Trash2, X, Save } from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'

interface Ingredient {
  id: string
  name: string
  category: { id: string; name: string }
  unit: { id: string; name: string; symbol: string }
  supplier: { id: string; name: string }
  minimumStock: number
  pricePerUnit: number
  currentStock: number
  createdAt: string
}

interface Category {
  id: string
  name: string
}

interface Unit {
  id: string
  name: string
  symbol: string
}

interface Supplier {
  id: string
  name: string
}

export default function Insumos() {
  const { showSuccess, showError } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Ingredient | null>(null)
  const [insumos, setInsumos] = useState<Ingredient[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    unitId: '',
    supplierId: '',
    minimumStock: 0,
    pricePerUnit: 0,
    currentStock: 0
  })

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [ingredientsRes, categoriesRes, unitsRes, suppliersRes] = await Promise.all([
        api.get('/ingredients'),
        api.get('/ingredient-categories'),
        api.get('/units'),
        api.get('/suppliers')
      ])
      
      setInsumos(ingredientsRes.data || [])
      setCategories(categoriesRes.data || [])
      setUnits(unitsRes.data || [])
      setSuppliers(suppliersRes.data || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      showError('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [showError])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSave = async () => {
    try {
      if (editingItem) {
        const response = await api.put(`/ingredients/${editingItem.id}`, formData)
        setInsumos(insumos.map(item => item.id === editingItem.id ? response.data : item))
        showSuccess('Insumo atualizado com sucesso!')
      } else {
        const response = await api.post('/ingredients', formData)
        setInsumos([...insumos, response.data])
        showSuccess('Insumo criado com sucesso!')
      }
      
      setIsModalOpen(false)
      setEditingItem(null)
      setFormData({
        name: '',
        categoryId: '',
        unitId: '',
        supplierId: '',
        minimumStock: 0,
        pricePerUnit: 0,
        currentStock: 0
      })
    } catch (error) {
      console.error('Erro ao salvar:', error)
      showError('Erro ao salvar insumo')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/ingredients/${id}`)
      setInsumos(insumos.filter(item => item.id !== id))
      showSuccess('Insumo excluído com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir:', error)
      showError('Erro ao excluir insumo')
    }
  }

  const handleEdit = (item: Ingredient) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      categoryId: item.category.id,
      unitId: item.unit.id,
      supplierId: item.supplier.id,
      minimumStock: item.minimumStock,
      pricePerUnit: item.pricePerUnit,
      currentStock: item.currentStock
    })
    setIsModalOpen(true)
  }

  const filteredInsumos = insumos.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || item.category.id === selectedCategory
    return matchesSearch && matchesCategory
  })

  const totalValue = filteredInsumos.reduce((sum, item) => sum + (item.currentStock * item.pricePerUnit), 0)
  const lowStockCount = filteredInsumos.filter(item => item.currentStock <= item.minimumStock).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-3 text-gray-600">Carregando insumos...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cadastro de Insumos</h1>
          <p className="text-gray-600">Gerencie todos os ingredientes e insumos</p>
        </div>

        {/* Action Button */}
        <div className="mb-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Novo Insumo
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Insumos</p>
                <p className="text-3xl font-bold text-gray-900">{filteredInsumos.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <div className="w-6 h-6 bg-blue-600 rounded"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Estoque Baixo</p>
                <p className="text-3xl font-bold text-gray-900">{lowStockCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <div className="w-6 h-6 bg-red-600 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-3xl font-bold text-gray-900">R$ {totalValue.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <div className="w-6 h-6 bg-green-600 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nome ou fornecedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
            >
              <option value="">Todas as categorias</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">INSUMO</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CATEGORIA</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ESTOQUE</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PREÇO/UNIDADE</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FORNECEDOR</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInsumos.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{item.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {item.category.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {item.currentStock} {item.unit.symbol}
                        {item.currentStock <= item.minimumStock && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            Baixo
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      R$ {item.pricePerUnit.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.supplier.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-purple-600 hover:text-purple-900 p-2 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingItem ? 'Editar Insumo' : 'Novo Insumo'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Insumo</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Ex: Farinha de Trigo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unidade</label>
                  <select
                    value={formData.unitId}
                    onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                  >
                    <option value="">Selecione uma unidade</option>
                    {units.map(unit => (
                      <option key={unit.id} value={unit.id}>{unit.name} ({unit.symbol})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estoque Mínimo</label>
                  <input
                    type="number"
                    value={formData.minimumStock}
                    onChange={(e) => setFormData({ ...formData, minimumStock: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preço por Unidade</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.pricePerUnit}
                    onChange={(e) => setFormData({ ...formData, pricePerUnit: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fornecedor</label>
                  <select
                    value={formData.supplierId}
                    onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                  >
                    <option value="">Selecione um fornecedor</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estoque Atual</label>
                  <input
                    type="number"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 mt-8">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {editingItem ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}



