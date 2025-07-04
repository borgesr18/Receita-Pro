'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Edit, Trash2, X, Save, Package, TrendingUp, AlertTriangle, Eye } from 'lucide-react'
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
  ingredientType: string
  storageCondition: string
  purchaseDate?: string
  expirationDate?: string
  category?: { name: string }
  unit?: { name: string; abbreviation: string }
  supplier?: { name: string }
  createdAt: string
  updatedAt: string
}

interface Category {
  id: string
  name: string
}

interface Unit {
  id: string
  name: string
  abbreviation: string
}

interface Supplier {
  id: string
  name: string
}

export default function Insumos() {
  const { showSuccess, showError } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [viewingItem, setViewingItem] = useState<Ingredient | null>(null)
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
    currentStock: 0,
    ingredientType: 'PRINCIPAL',
    storageCondition: 'AMBIENTE_SECO',
    purchaseDate: '',
    expirationDate: ''
  })

  const loadData = useCallback(async () => {
    try {
      console.log('🔄 Carregando dados dos insumos...')
      
      const [ingredientsRes, categoriesRes, unitsRes, suppliersRes] = await Promise.all([
        api.get('/ingredients'),
        api.get('/ingredient-categories'),
        api.get('/measurement-units'),
        api.get('/suppliers')
      ])

      console.log('📊 Dados carregados:', {
        ingredients: Array.isArray(ingredientsRes.data) ? ingredientsRes.data.length : 0,
        categories: Array.isArray(categoriesRes.data) ? categoriesRes.data.length : 0,
        units: Array.isArray(unitsRes.data) ? unitsRes.data.length : 0,
        suppliers: Array.isArray(suppliersRes.data) ? suppliersRes.data.length : 0
      })

      setInsumos(Array.isArray(ingredientsRes.data) ? ingredientsRes.data : [])
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : [])
      setUnits(Array.isArray(unitsRes.data) ? unitsRes.data : [])
      setSuppliers(Array.isArray(suppliersRes.data) ? suppliersRes.data : [])
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error)
      showError('Erro ao carregar dados')
      setInsumos([])
      setCategories([])
      setUnits([])
      setSuppliers([])
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
      
      if (!formData.name || !formData.categoryId || !formData.unitId) {
        showError('Nome, categoria e unidade são obrigatórios')
        return
      }

      const dataToSend = {
        name: formData.name.trim(),
        categoryId: formData.categoryId,
        unitId: formData.unitId,
        minimumStock: parseFloat(formData.minimumStock.toString()) || 0,
        pricePerUnit: parseFloat(formData.pricePerUnit.toString()) || 0,
        supplierId: formData.supplierId || null,
        currentStock: parseFloat(formData.currentStock.toString()) || 0,
        ingredientType: formData.ingredientType || 'PRINCIPAL',
        storageCondition: formData.storageCondition || 'AMBIENTE_SECO',
        purchaseDate: formData.purchaseDate || null,
        expirationDate: formData.expirationDate || null
      }

      console.log('📤 Dados preparados para envio:', dataToSend)

      if (editingItem) {
        const response = await api.put(`/ingredients/${editingItem.id}`, dataToSend)
        setInsumos(insumos.map(item => item.id === editingItem.id ? response.data : item))
        showSuccess('Insumo atualizado com sucesso!')
      } else {
        const response = await api.post('/ingredients', dataToSend)
        setInsumos([...insumos, response.data])
        showSuccess('Insumo criado com sucesso!')
      }
      
      setIsModalOpen(false)
      setEditingItem(null)
      resetForm()
    } catch (error) {
      console.error('❌ Erro ao salvar insumo:', error)
      showError('Erro ao salvar insumo')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      categoryId: '',
      unitId: '',
      minimumStock: 0,
      pricePerUnit: 0,
      supplierId: '',
      currentStock: 0,
      ingredientType: 'PRINCIPAL',
      storageCondition: 'AMBIENTE_SECO',
      purchaseDate: '',
      expirationDate: ''
    })
  }

  const handleEdit = (item: Ingredient) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      categoryId: item.categoryId,
      unitId: item.unitId,
      minimumStock: item.minimumStock,
      pricePerUnit: item.pricePerUnit,
      supplierId: item.supplierId || '',
      currentStock: item.currentStock,
      ingredientType: item.ingredientType || 'PRINCIPAL',
      storageCondition: item.storageCondition || 'AMBIENTE_SECO',
      purchaseDate: item.purchaseDate || '',
      expirationDate: item.expirationDate || ''
    })
    setIsModalOpen(true)
  }

  const handleView = (item: Ingredient) => {
    setViewingItem(item)
    setIsViewModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este insumo?')) {
      try {
        await api.delete(`/ingredients/${id}`)
        setInsumos(insumos.filter(item => item.id !== id))
        showSuccess('Insumo excluído com sucesso!')
      } catch (error) {
        console.error('❌ Erro ao excluir insumo:', error)
        showError('Erro ao excluir insumo')
      }
    }
  }

  const filteredInsumos = insumos.filter(insumo => {
    const matchesSearch = insumo.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || insumo.categoryId === selectedCategory
    return matchesSearch && matchesCategory
  })

  const totalInsumos = insumos.length
  const lowStockInsumos = insumos.filter(insumo => insumo.currentStock <= insumo.minimumStock).length
  const totalValue = insumos.reduce((sum, insumo) => sum + (insumo.currentStock * insumo.pricePerUnit), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Insumos</h1>
        <p className="text-gray-600">Gerencie seus ingredientes e matérias-primas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Insumos</p>
              <p className="text-2xl font-bold text-gray-900">{totalInsumos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Estoque Baixo</p>
              <p className="text-2xl font-bold text-gray-900">{lowStockInsumos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-gray-900">R$ {totalValue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar insumos..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="sm:w-48">
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
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
            onClick={() => {
              setEditingItem(null)
              resetForm()
              setIsModalOpen(true)
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar Insumo
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
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
                  Unidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estoque Atual
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estoque Mínimo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preço/Unidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInsumos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Nenhum insumo encontrado
                  </td>
                </tr>
              ) : (
                filteredInsumos.map((insumo) => (
                  <tr key={insumo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{insumo.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{insumo.category?.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{insumo.unit?.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        insumo.currentStock <= insumo.minimumStock ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {insumo.currentStock}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{insumo.minimumStock}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">R$ {insumo.pricePerUnit.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(insumo)}
                          className="text-green-600 hover:text-green-900"
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(insumo)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(insumo.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingItem ? 'Editar Insumo' : 'Adicionar Insumo'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nome do insumo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria *
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
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
                    Unidade *
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.unitId}
                    onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                  >
                    <option value="">Selecione uma unidade</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name} ({unit.abbreviation})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fornecedor
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.supplierId}
                    onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                  >
                    <option value="">Selecione um fornecedor</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estoque Atual
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estoque Mínimo
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.minimumStock}
                    onChange={(e) => setFormData({ ...formData, minimumStock: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preço por Unidade
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.pricePerUnit}
                    onChange={(e) => setFormData({ ...formData, pricePerUnit: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Ingrediente
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.ingredientType}
                    onChange={(e) => setFormData({ ...formData, ingredientType: e.target.value })}
                  >
                    <option value="PRINCIPAL">Principal</option>
                    <option value="SECUNDARIO">Secundário</option>
                    <option value="ADITIVO">Aditivo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condição de Armazenamento
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.storageCondition}
                    onChange={(e) => setFormData({ ...formData, storageCondition: e.target.value })}
                  >
                    <option value="AMBIENTE_SECO">Ambiente Seco</option>
                    <option value="REFRIGERADO">Refrigerado</option>
                    <option value="CONGELADO">Congelado</option>
                    <option value="AMBIENTE_CONTROLADO">Ambiente Controlado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Compra
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Validade
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.expirationDate}
                    onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {isViewModalOpen && viewingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Detalhes do Insumo</h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Básicas</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Nome:</span>
                      <p className="text-sm text-gray-900">{viewingItem.name}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Categoria:</span>
                      <p className="text-sm text-gray-900">{viewingItem.category?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Unidade:</span>
                      <p className="text-sm text-gray-900">{viewingItem.unit?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Fornecedor:</span>
                      <p className="text-sm text-gray-900">{viewingItem.supplier?.name || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Estoque e Preços</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Estoque Atual:</span>
                      <p className="text-sm text-gray-900">{viewingItem.currentStock}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Estoque Mínimo:</span>
                      <p className="text-sm text-gray-900">{viewingItem.minimumStock}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Preço por Unidade:</span>
                      <p className="text-sm text-gray-900">R$ {viewingItem.pricePerUnit.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Valor Total:</span>
                      <p className="text-sm text-gray-900">R$ {(viewingItem.currentStock * viewingItem.pricePerUnit).toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Detalhes Técnicos</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Tipo:</span>
                      <p className="text-sm text-gray-900">{viewingItem.ingredientType || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Armazenamento:</span>
                      <p className="text-sm text-gray-900">{viewingItem.storageCondition || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Data de Compra:</span>
                      <p className="text-sm text-gray-900">
                        {viewingItem.purchaseDate ? new Date(viewingItem.purchaseDate).toLocaleDateString('pt-BR') : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Data de Validade:</span>
                      <p className="text-sm text-gray-900">
                        {viewingItem.expirationDate ? new Date(viewingItem.expirationDate).toLocaleDateString('pt-BR') : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Informações do Sistema</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Criado em:</span>
                      <p className="text-sm text-gray-900">
                        {new Date(viewingItem.createdAt).toLocaleDateString('pt-BR')} às {new Date(viewingItem.createdAt).toLocaleTimeString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Atualizado em:</span>
                      <p className="text-sm text-gray-900">
                        {new Date(viewingItem.updatedAt).toLocaleDateString('pt-BR')} às {new Date(viewingItem.updatedAt).toLocaleTimeString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setIsViewModalOpen(false)
                  handleEdit(viewingItem)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar
              </button>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

