'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Edit, Trash2, Filter, X, Save, MoreHorizontal, Package, TrendingUp, AlertTriangle, Eye } from 'lucide-react'
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
        api.get('/ingredient-categories'), // API correta para categorias de ingredientes
        api.get('/measurement-units'), // API correta para unidades de medida
        api.get('/suppliers')
      ])

      console.log('📊 Dados carregados:', {
        ingredients: ingredientsRes.data?.length || 0,
        categories: categoriesRes.data?.length || 0,
        units: unitsRes.data?.length || 0,
        suppliers: suppliersRes.data?.length || 0
      })

      setInsumos(Array.isArray(ingredientsRes.data) ? ingredientsRes.data : [])
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : [])
      setUnits(Array.isArray(unitsRes.data) ? unitsRes.data : [])
      setSuppliers(Array.isArray(suppliersRes.data) ? suppliersRes.data : [])
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error)
      showError('Erro ao carregar dados')
      // Definir arrays vazios em caso de erro
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
      
      // Validação básica
      if (!formData.name || !formData.categoryId || !formData.unitId) {
        showError('Nome, categoria e unidade são obrigatórios')
        return
      }

      // Preparar dados para envio
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Insumos</h1>
        <p className="text-gray-600">Gerencie seus ingredientes e matérias-primas</p>
      </div>

      {/* Cards de Estatísticas */}
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

      {/* Filtros e Busca */}
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

      {/* Tabela */}
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

      {/* Modal de Adição/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingItem ? 'Editar Insumo' : 'Adicionar Insumo'}
              </h2>
              <button
                onClick={()
(Content truncated due to size limit. Use line ranges to read in chunks)
