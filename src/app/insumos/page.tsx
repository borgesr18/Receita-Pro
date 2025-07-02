'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Edit, Trash2, X, Package, TrendingUp, AlertTriangle, Eye } from 'lucide-react'
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
  symbol?: string
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
    ingredientType: 'OTHER',
    storageCondition: 'DRY',
    purchaseDate: '',
    expirationDate: ''
  })

  // Tipos de ingredientes disponíveis
  const ingredientTypes = [
    { value: 'FLOUR', label: 'Farinha' },
    { value: 'FAT', label: 'Gordura' },
    { value: 'YEAST', label: 'Fermento' },
    { value: 'SUGAR', label: 'Açúcar' },
    { value: 'DAIRY', label: 'Laticínio' },
    { value: 'EGG', label: 'Ovo' },
    { value: 'LIQUID', label: 'Líquido' },
    { value: 'ADDITIVE', label: 'Aditivo' },
    { value: 'SPICE', label: 'Tempero' },
    { value: 'OTHER', label: 'Outro' }
  ]

  // Condições de armazenamento
  const storageConditions = [
    { value: 'DRY', label: 'Seco' },
    { value: 'REFRIGERATED', label: 'Refrigerado' },
    { value: 'FROZEN', label: 'Congelado' }
  ]

  // Carregar dados com useCallback para evitar warning
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      console.log('🔄 Carregando dados dos insumos...')
      
      const [ingredientsRes, categoriesRes, unitsRes, suppliersRes] = await Promise.all([
        api.get('/api/ingredients'),
        api.get('/api/ingredient-categories'),
        api.get('/api/measurement-units'),
        api.get('/api/suppliers')
      ])

      const ingredientsData = Array.isArray(ingredientsRes.data) ? ingredientsRes.data : []
      const categoriesData = Array.isArray(categoriesRes.data) ? categoriesRes.data : []
      const unitsData = Array.isArray(unitsRes.data) ? unitsRes.data : []
      const suppliersData = Array.isArray(suppliersRes.data) ? suppliersRes.data : []

      setInsumos(ingredientsData)
      setCategories(categoriesData)
      setUnits(unitsData)
      setSuppliers(suppliersData)

      console.log('✅ Dados carregados:', {
        ingredients: ingredientsData.length,
        categories: categoriesData.length,
        units: unitsData.length,
        suppliers: suppliersData.length
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

  const handleView = (item: Ingredient) => {
    setViewingItem(item)
    setIsViewModalOpen(true)
  }

  const handleAdd = () => {
    setEditingItem(null)
    setFormData({
      name: '',
      categoryId: '',
      unitId: '',
      minimumStock: 0,
      pricePerUnit: 0,
      supplierId: '',
      currentStock: 0,
      ingredientType: 'OTHER',
      storageCondition: 'DRY',
      purchaseDate: '',
      expirationDate: ''
    })
    setIsModalOpen(true)
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
      ingredientType: item.ingredientType || 'OTHER',
      storageCondition: item.storageCondition || 'DRY',
      purchaseDate: item.purchaseDate || '',
      expirationDate: item.expirationDate || ''
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
      if (!formData.unitId) {
        showError('Unidade é obrigatória')
        return
      }

      let response: any

      if (editingItem) {
        // Editar item existente
        response = await api.put(`/api/ingredients/${editingItem.id}`, formData)
        const updatedData = insumos.map(item => 
          item.id === editingItem.id ? response.data as Ingredient : item
        )
        setInsumos(updatedData)
        showSuccess('Insumo atualizado com sucesso!')
      } else {
        // Criar novo item
        response = await api.post('/api/ingredients', formData)
        setInsumos([...insumos, response.data as Ingredient])
        showSuccess('Insumo criado com sucesso!')
      }

      setIsModalOpen(false)
      setEditingItem(null)
    } catch (error) {
      console.error('❌ Erro ao salvar:', error)
      showError('Erro ao salvar insumo')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este insumo?')) return

    try {
      await api.delete(`/api/ingredients/${id}`)
      const filteredData = insumos.filter(item => item.id !== id)
      setInsumos(filteredData)
      showSuccess('Insumo excluído com sucesso!')
    } catch (error) {
      console.error('❌ Erro ao excluir:', error)
      showError('Erro ao excluir insumo')
    }
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
      value: `R$ ${insumos.reduce((total, item) => total + (item.currentStock * item.pricePerUnit), 0).toFixed(2)}`,
      icon: TrendingUp,
      color: 'from-green-500 to-green-600'
    }
  ]

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const renderViewModal = () => {
    if (!isViewModalOpen || !viewingItem) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Detalhes do Insumo
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
                  Unidade
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {viewingItem.unit?.name || '-'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {ingredientTypes.find(t => t.value === viewingItem.ingredientType)?.label || viewingItem.ingredientType}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condição de Armazenamento
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {storageConditions.find(s => s.value === viewingItem.storageCondition)?.label || viewingItem.storageCondition}
                </p>
              </div>
            </div>

            {/* Informações secundárias */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fornecedor
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {viewingItem.supplier?.name || '-'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço por Unidade
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  R$ {viewingItem.pricePerUnit.toFixed(2)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estoque Atual
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {viewingItem.currentStock}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estoque Mínimo
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {viewingItem.minimumStock}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Compra
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {formatDate(viewingItem.purchaseDate || '')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Validade
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {formatDate(viewingItem.expirationDate || '')}
                </p>
              </div>
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
        <h1 className="text-2xl font-bold text-gray-900">Gestão de Insumos</h1>
        <p className="mt-2 text-sm text-gray-600">
          Gerencie seus ingredientes e matérias-primas
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
                placeholder="Buscar insumos..."
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
            <span>Adicionar Insumo</span>
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
                Estoque
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preço/Un
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
              <tr key={item.id} className={item.currentStock <= item.minimumStock ? 'bg-red-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.category?.name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={item.currentStock <= item.minimumStock ? 'text-red-600 font-medium' : ''}>
                    {item.currentStock} {item.unit?.name}
                  </span>
                  {item.currentStock <= item.minimumStock && (
                    <AlertTriangle className="inline h-4 w-4 text-red-500 ml-1" />
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  R$ {item.pricePerUnit.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.supplier?.name || '-'}
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

        {filteredInsumos.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum insumo encontrado
          </div>
        )}
      </div>

      {/* Modal de Edição/Criação */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingItem ? 'Editar' : 'Adicionar'} Insumo
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome do insumo"
                    required
                  />
                </div>
                <div>
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unidade *
                  </label>
                  <select
                    value={formData.unitId}
                    onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Selecione uma unidade</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name} {unit.symbol && `(${unit.symbol})`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo
                  </label>
                  <select
                    value={formData.ingredientType}
                    onChange={(e) => setFormData({ ...formData, ingredientType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {ingredientTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preço por Unidade
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.pricePerUnit}
                    onChange={(e) => setFormData({ ...formData, pricePerUnit: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fornecedor
                  </label>
                  <select
                    value={formData.supplierId}
                    onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione um fornecedor</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estoque Atual
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estoque Mínimo
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.minimumStock}
                    onChange={(e) => setFormData({ ...formData, minimumStock: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condição de Armazenamento
                  </label>
                  <select
                    value={formData.storageCondition}
                    onChange={(e) => setFormData({ ...formData, storageCondition: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {storageConditions.map((condition) => (
                      <option key={condition.value} value={condition.value}>
                        {condition.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Compra
                  </label>
                  <input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Validade
                </label>
                <input
                  type="date"
                  value={formData.expirationDate}
                  onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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


