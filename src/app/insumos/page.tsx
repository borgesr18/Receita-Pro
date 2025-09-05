'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Save, 
  Package, 
  AlertTriangle, 
  Eye,
  Filter,
  Utensils,
  Clock,
  DollarSign
} from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'
import { API_ENDPOINTS } from '@/lib/config'

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
  conversionFactor?: number
  baseUnit?: string
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

interface IngredientType {
  value: string
  label: string
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
  const [ingredientTypes, setIngredientTypes] = useState<IngredientType[]>([])
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
    ingredientType: 'Ingredientes_Adicionais',
    storageCondition: 'Ambiente_Seco',
    purchaseDate: '',
    expirationDate: '',
    conversionFactor: '',
    baseUnit: 'g'
  })

  const loadData = useCallback(async () => {
    try {
      console.log('🔄 Carregando dados dos insumos...')
      
      const [ingredientsRes, categoriesRes, unitsRes, suppliersRes, ingredientTypesRes] = await Promise.all([
        api.get(API_ENDPOINTS.INGREDIENTS),
        api.get(API_ENDPOINTS.INGREDIENT_CATEGORIES),
        api.get(API_ENDPOINTS.MEASUREMENT_UNITS),
        api.get(API_ENDPOINTS.SUPPLIERS),
        api.get(API_ENDPOINTS.INGREDIENT_TYPES)
      ])

      console.log('📊 Dados carregados:', {
        ingredients: Array.isArray(ingredientsRes.data) ? ingredientsRes.data.length : 0,
        categories: Array.isArray(categoriesRes.data) ? categoriesRes.data.length : 0,
        units: Array.isArray(unitsRes.data) ? unitsRes.data.length : 0,
        suppliers: Array.isArray(suppliersRes.data) ? suppliersRes.data.length : 0,
        ingredientTypes: Array.isArray(ingredientTypesRes.data) ? ingredientTypesRes.data.length : 0
      })

      setInsumos(Array.isArray(ingredientsRes.data) ? ingredientsRes.data : [])
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : [])
      setUnits(Array.isArray(unitsRes.data) ? unitsRes.data : [])
      setSuppliers(Array.isArray(suppliersRes.data) ? suppliersRes.data : [])
      setIngredientTypes(Array.isArray(ingredientTypesRes.data) ? ingredientTypesRes.data : [])
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error)
      showError('Erro ao carregar dados')
      setInsumos([])
      setCategories([])
      setUnits([])
      setSuppliers([])
      setIngredientTypes([])
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
        ingredientType: formData.ingredientType || 'Ingredientes_Adicionais',
        storageCondition: formData.storageCondition || 'Ambiente_Seco',
        purchaseDate: formData.purchaseDate || null,
        expirationDate: formData.expirationDate || null,
        conversionFactor: formData.conversionFactor ? parseFloat(formData.conversionFactor.toString()) : null,
        baseUnit: formData.baseUnit || null
      }

      console.log('📤 Dados preparados para envio:', dataToSend)

      if (editingItem) {
        const response = await api.put(`${API_ENDPOINTS.INGREDIENTS}/${editingItem.id}`, dataToSend)
        setInsumos(insumos.map(item => item.id === editingItem.id ? response.data as Ingredient : item))
        showSuccess('Insumo atualizado com sucesso!')
      } else {
        const response = await api.post(API_ENDPOINTS.INGREDIENTS, dataToSend)
        setInsumos([...insumos, response.data as Ingredient])
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
      ingredientType: 'Ingredientes_Adicionais',
      storageCondition: 'Ambiente_Seco',
      purchaseDate: '',
      expirationDate: '',
      conversionFactor: '',
      baseUnit: 'g'
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
      ingredientType: item.ingredientType || 'Ingredientes_Adicionais',
      storageCondition: item.storageCondition || 'Ambiente_Seco',
      purchaseDate: item.purchaseDate || '',
      expirationDate: item.expirationDate || '',
      conversionFactor: item.conversionFactor?.toString() || '',
      baseUnit: item.baseUnit || 'g'
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
        await api.delete(`${API_ENDPOINTS.INGREDIENTS}/${id}`)
        setInsumos(insumos.filter(item => item.id !== id))
        showSuccess('Insumo excluído com sucesso!')
      } catch (error) {
        console.error('❌ Erro ao excluir insumo:', error)
        showError('Erro ao excluir insumo')
      }
    }
  }

  const filteredInsumos = insumos.filter(insumo => {
    if (!insumo || !insumo.name) return false
    const matchesSearch = insumo.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || insumo.categoryId === selectedCategory
    return matchesSearch && matchesCategory
  })

  const totalInsumos = insumos.length
  const lowStockInsumos = insumos.filter(insumo => 
    insumo && 
    typeof insumo.currentStock === 'number' && 
    typeof insumo.minimumStock === 'number' && 
    insumo.currentStock <= insumo.minimumStock
  ).length
  const totalValue = insumos.reduce((sum, insumo) => {
    if (!insumo || typeof insumo.currentStock !== 'number' || typeof insumo.pricePerUnit !== 'number') {
      return sum
    }
    return sum + (insumo.currentStock * insumo.pricePerUnit)
  }, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600 mx-auto"></div>
            <Package className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Carregando insumos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 space-y-6">
      {/* Header Moderno */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
            <Package className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Insumos
            </h1>
            <p className="text-gray-600 mt-1 text-lg">Gerencie seus ingredientes e matérias-primas</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
              <Package className="text-white" size={24} />
            </div>
            <div className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full shadow-sm">
              Total
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total de Insumos</h3>
            <p className="text-2xl font-bold text-gray-900">{totalInsumos}</p>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-md">
              <AlertTriangle className="text-white" size={24} />
            </div>
            <div className="text-sm font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full shadow-sm">
              Alerta
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Estoque Baixo</h3>
            <p className="text-2xl font-bold text-gray-900">{lowStockInsumos}</p>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md">
              <DollarSign className="text-white" size={24} />
            </div>
            <div className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full shadow-sm">
              Inventário
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Valor Total</h3>
            <p className="text-2xl font-bold text-gray-900">R$ {totalValue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar insumos..."
                className="w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="sm:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                className="w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm appearance-none"
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
          </div>

          <button
            onClick={() => {
              setEditingItem(null)
              resetForm()
              setIsModalOpen(true)
            }}
            className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
          >
            <Plus className="h-5 w-5" />
            Adicionar Insumo
          </button>
        </div>
      </div>

      {/* Ingredients Table */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                  Unidade
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                  Estoque Atual
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                  Estoque Mínimo
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                  Preço/Unidade
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/50 divide-y divide-gray-200">
              {filteredInsumos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <Package className="h-12 w-12 text-gray-300 mb-2" />
                      <p className="text-lg font-medium">Nenhum insumo encontrado</p>
                      <p className="text-sm text-gray-400">Tente ajustar os filtros ou adicione um novo insumo</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInsumos.map((insumo) => (
                  <tr key={insumo.id} className="hover:bg-blue-50/50 transition-colors">
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
                        insumo.currentStock <= insumo.minimumStock 
                          ? 'text-red-600 bg-red-50 px-2 py-1 rounded-full inline-block' 
                          : 'text-gray-900'
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
                          className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(insumo)}
                          className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(insumo.id)}
                          className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    {editingItem ? 'Editar Insumo' : 'Adicionar Insumo'}
                  </h2>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
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
                    className="w-full px-3 py-2 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
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
                    className="w-full px-3 py-2 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
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
                    className="w-full px-3 py-2 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
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
                    className="w-full px-3 py-2 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
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
                    className="w-full px-3 py-2 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
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
                    className="w-full px-3 py-2 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
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
                    className="w-full px-3 py-2 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                    value={formData.ingredientType}
                    onChange={(e) => setFormData({ ...formData, ingredientType: e.target.value })}
                  >
                    <option value="">Selecione um tipo</option>
                    {ingredientTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condição de Armazenamento
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                    value={formData.storageCondition}
                    onChange={(e) => setFormData({ ...formData, storageCondition: e.target.value })}
                  >
                    <option value="Ambiente_Seco">Ambiente Seco</option>
                    <option value="Refrigerado">Refrigerado</option>
                    <option value="Congelado">Congelado</option>
                    <option value="Ambiente_Controlado">Ambiente Controlado</option>
                    <option value="Uso_Imediato">Uso Imediato</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Compra
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
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
                    className="w-full px-3 py-2 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                    value={formData.expirationDate}
                    onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fator de Conversão
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                    value={formData.conversionFactor}
                    onChange={(e) => setFormData({ ...formData, conversionFactor: e.target.value })}
                    placeholder="Ex: 50 (1 ovo = 50g)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Quantos gramas/ml equivale a 1 unidade deste insumo
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unidade Base
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                    value={formData.baseUnit}
                    onChange={(e) => setFormData({ ...formData, baseUnit: e.target.value })}
                  >
                    <option value="g">Gramas (g)</option>
                    <option value="ml">Mililitros (ml)</option>
                    <option value="kg">Quilogramas (kg)</option>
                    <option value="l">Litros (l)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Unidade usada nos cálculos das receitas
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 shadow-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
              >
                <Save className="h-4 w-4" />
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && viewingItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Eye className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Detalhes do Insumo</h2>
                </div>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    Informações Básicas
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Nome:</span>
                      <p className="text-sm text-gray-900 font-medium">{viewingItem.name}</p>
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

                <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Estoque e Preços
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Estoque Atual:</span>
                      <p className={`text-sm font-medium ${
                        viewingItem.currentStock <= viewingItem.minimumStock 
                          ? 'text-red-600 bg-red-50 px-2 py-0.5 rounded-full inline-block' 
                          : 'text-gray-900'
                      }`}>
                        {viewingItem.currentStock}
                      </p>
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
                      <p className="text-sm text-green-600 font-medium">R$ {(viewingItem.currentStock * viewingItem.pricePerUnit).toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Utensils className="h-5 w-5 text-purple-600" />
                    Detalhes Técnicos
                  </h3>
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
                    <div>
                      <span className="text-sm font-medium text-gray-500">Fator de Conversão:</span>
                      <p className="text-sm text-gray-900">
                        {viewingItem.conversionFactor ? `${viewingItem.conversionFactor} ${viewingItem.baseUnit || 'g'}` : 'Não definido'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Unidade Base:</span>
                      <p className="text-sm text-gray-900">{viewingItem.baseUnit || 'Não definida'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    Informações do Sistema
                  </h3>
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

            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setIsViewModalOpen(false)
                  handleEdit(viewingItem)
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
              >
                <Edit className="h-4 w-4" />
                Editar
              </button>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 shadow-sm"
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







