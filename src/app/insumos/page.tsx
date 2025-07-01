'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Edit, Trash2, Filter, X, Save, MoreHorizontal, Package, TrendingUp, AlertTriangle } from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'

interface Ingredient {
  id: string
  name: string
  categoryId: string
  unitId: string
  minimumStock: number
  pricePerUnit: number
  supplierId: string
  currentStock: number
  category?: { name: string }
  unit?: { name: string }
  supplier?: { name: string }
}

interface Category {
  id: string
  name: string
}

interface Unit {
  id: string
  name: string
}

interface Supplier {
  id: string
  name: string
}

export default function Insumos() {
  const { showSuccess, showError } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [insumos, setInsumos] = useState<Ingredient[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [editingItem, setEditingItem] = useState<Ingredient | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    unitId: '',
    minimumStock: 0,
    pricePerUnit: 0,
    supplierId: '',
    currentStock: 0
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
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
  }

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
        minimumStock: 0,
        pricePerUnit: 0,
        supplierId: '',
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

  const openEditModal = (item: Ingredient) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      categoryId: item.categoryId,
      unitId: item.unitId,
      minimumStock: item.minimumStock,
      pricePerUnit: item.pricePerUnit,
      supplierId: item.supplierId,
      currentStock: item.currentStock
    })
    setIsModalOpen(true)
  }

  const filteredInsumos = insumos.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || item.categoryId === selectedCategory
    return matchesSearch && matchesCategory
  })

  const stats = [
    {
      title: 'Total de Insumos',
      value: insumos.length.toString(),
      icon: Package,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Estoque Baixo',
      value: insumos.filter(item => item.currentStock <= item.minimumStock).length.toString(),
      icon: AlertTriangle,
      color: 'from-red-500 to-red-600'
    },
    {
      title: 'Valor Total',
      value: `R$ ${insumos.reduce((total, item) => total + (item.currentStock * item.pricePerUnit), 0).toLocaleString()}`,
      icon: TrendingUp,
      color: 'from-green-500 to-green-600'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
          <div className="text-sm text-gray-600">Carregando insumos...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cadastro de Insumos</h1>
          <p className="text-gray-600 mt-1">Gerencie todos os ingredientes e insumos</p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
        >
          <Plus size={18} />
          <span>Novo Insumo</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome ou fornecedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
          >
            <option value="">Todas as categorias</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">INSUMO</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">CATEGORIA</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">ESTOQUE</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">PREÇO/UNIDADE</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">FORNECEDOR</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">VALIDADE</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-900">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInsumos.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package size={16} className="text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.unit?.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {item.category?.name}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{item.currentStock}</span>
                      {item.currentStock <= item.minimumStock && (
                        <AlertTriangle size={14} className="text-red-500" />
                      )}
                    </div>
                    <div className="text-sm text-gray-500">Min: {item.minimumStock}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-medium text-gray-900">
                      R$ {item.pricePerUnit.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-gray-900">{item.supplier?.name}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-green-600 text-sm">30 dias</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreHorizontal size={16} />
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingItem ? 'Editar Insumo' : 'Novo Insumo'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Insumo</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    placeholder="Ex: Farinha de Trigo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
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
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                  >
                    <option value="">Selecione uma unidade</option>
                    {units.map(unit => (
                      <option key={unit.id} value={unit.id}>{unit.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estoque Mínimo</label>
                  <input
                    type="number"
                    value={formData.minimumStock}
                    onChange={(e) => setFormData({ ...formData, minimumStock: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
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
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fornecedor</label>
                  <select
                    value={formData.supplierId}
                    onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                  >
                    <option value="">Selecione um fornecedor</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estoque Atual</label>
                <input
                  type="number"
                  value={formData.currentStock}
                  onChange={(e) => setFormData({ ...formData, currentStock: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Save size={16} />
                <span>Salvar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

