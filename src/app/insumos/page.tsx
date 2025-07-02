'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
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
  unit?: { name: string; symbol: string }
  supplier?: { name: string }
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

export default function InsumosPage() {
  const [insumos, setInsumos] = useState<Ingredient[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Ingredient | null>(null)
  const { showSuccess, showError } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    unitId: '',
    minimumStock: 0,
    pricePerUnit: 0,
    supplierId: '',
    currentStock: 0
  })

  const loadData = useCallback(async () => {
    try {
      console.log('🔄 Carregando dados dos insumos...')
      
      const [ingredientsRes, categoriesRes, unitsRes, suppliersRes] = await Promise.all([
        api.get('/api/ingredients'),
        api.get('/api/ingredient-categories'),
        api.get('/api/measurement-units'),
        api.get('/api/suppliers')
      ])

      // Verificação segura de tipos para evitar erro de build
      const ingredientsData = Array.isArray(ingredientsRes.data) ? ingredientsRes.data : []
      const categoriesData = Array.isArray(categoriesRes.data) ? categoriesRes.data : []
      const unitsData = Array.isArray(unitsRes.data) ? unitsRes.data : []
      const suppliersData = Array.isArray(suppliersRes.data) ? suppliersRes.data : []

      console.log('📊 Dados carregados:', {
        ingredients: ingredientsData.length,
        categories: categoriesData.length,
        units: unitsData.length,
        suppliers: suppliersData.length
      })

      setInsumos(ingredientsData)
      setCategories(categoriesData)
      setUnits(unitsData)
      setSuppliers(suppliersData)
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

  const handleSave = async () => {
    try {
      console.log('💾 Salvando insumo:', formData)
      
      if (editingItem) {
        const response = await api.put(`/api/ingredients/${editingItem.id}`, formData)
        if (response.data) {
          setInsumos(insumos.map(item => item.id === editingItem.id ? response.data as Ingredient : item))
          showSuccess('Insumo atualizado com sucesso!')
        }
      } else {
        const response = await api.post('/api/ingredients', formData)
        if (response.data) {
          setInsumos([...insumos, response.data as Ingredient])
          showSuccess('Insumo criado com sucesso!')
        }
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
      console.error('❌ Erro ao salvar:', error)
      showError('Erro ao salvar insumo')
    }
  }

  const handleEdit = (item: Ingredient) => {
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

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este insumo?')) {
      try {
        await api.delete(`/api/ingredients/${id}`)
        setInsumos(insumos.filter(item => item.id !== id))
        showSuccess('Insumo excluído com sucesso!')
      } catch (error) {
        console.error('❌ Erro ao excluir:', error)
        showError('Erro ao excluir insumo')
      }
    }
  }

  const filteredInsumos = insumos.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Insumos</h1>
        <button
          onClick={() => {
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
            setIsModalOpen(true)
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Adicionar Insumo
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar insumos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unidade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preço/Unidade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estoque
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fornecedor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredInsumos.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.category?.name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.unit?.symbol || item.unit?.name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  R$ {item.pricePerUnit.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.currentStock} / {item.minimumStock}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.supplier?.name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredInsumos.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum insumo encontrado
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingItem ? 'Editar Insumo' : 'Adicionar Insumo'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unidade
                </label>
                <select
                  value={formData.unitId}
                  onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione uma unidade</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name} ({unit.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fornecedor
                </label>
                <select
                  value={formData.supplierId}
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione um fornecedor</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preço/Unidade
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.pricePerUnit}
                    onChange={(e) => setFormData({ ...formData, pricePerUnit: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estoque Atual
                  </label>
                  <input
                    type="number"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estoque Mínimo
                </label>
                <input
                  type="number"
                  value={formData.minimumStock}
                  onChange={(e) => setFormData({ ...formData, minimumStock: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
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
