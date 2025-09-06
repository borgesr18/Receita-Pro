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
  DollarSign,
  Filter,
  Eye
} from 'lucide-react'
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

export default function Insumos() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [viewingIngredient, setViewingIngredient] = useState<Ingredient | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    unitId: '',
    minimumStock: 0,
    pricePerUnit: 0,
    supplierId: '',
    currentStock: 0,
    ingredientType: 'Sólido',
    storageCondition: 'Ambiente',
    purchaseDate: '',
    expirationDate: '',
    conversionFactor: 1,
    baseUnit: ''
  })

  const { showError, showSuccess } = useToast()

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [ingredientsRes, categoriesRes, unitsRes, suppliersRes] = await Promise.all([
        api.get('/api/ingredients'),
        api.get('/api/ingredient-categories'),
        api.get('/api/measurement-units'),
        api.get('/api/suppliers')
      ])

      setIngredients(ingredientsRes.data as Ingredient[])
      setCategories(categoriesRes.data as Category[])
      setUnits(unitsRes.data as Unit[])
      setSuppliers(suppliersRes.data as Supplier[])
      setFilteredIngredients(ingredientsRes.data as Ingredient[])
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

  useEffect(() => {
    let filtered = ingredients

    if (searchTerm) {
      filtered = filtered.filter(ingredient =>
        ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter(ingredient => ingredient.categoryId === selectedCategory)
    }

    if (selectedType) {
      filtered = filtered.filter(ingredient => ingredient.ingredientType === selectedType)
    }

    setFilteredIngredients(filtered)
  }, [ingredients, searchTerm, selectedCategory, selectedType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        minimumStock: Number(formData.minimumStock),
        pricePerUnit: Number(formData.pricePerUnit),
        currentStock: Number(formData.currentStock),
        conversionFactor: Number(formData.conversionFactor)
      }

      if (editingId) {
        await api.put(`/api/ingredients/${editingId}`, payload)
        showSuccess('Insumo atualizado com sucesso!')
      } else {
        await api.post('/api/ingredients', payload)
        showSuccess('Insumo criado com sucesso!')
      }

      setIsModalOpen(false)
      setEditingId(null)
      setFormData({
        name: '',
        categoryId: '',
        unitId: '',
        minimumStock: 0,
        pricePerUnit: 0,
        supplierId: '',
        currentStock: 0,
        ingredientType: 'Sólido',
        storageCondition: 'Ambiente',
        purchaseDate: '',
        expirationDate: '',
        conversionFactor: 1,
        baseUnit: ''
      })
      loadData()
    } catch (error) {
      console.error('Erro ao salvar insumo:', error)
      showError('Erro ao salvar insumo')
    }
  }

  const handleEdit = (ingredient: Ingredient) => {
    setFormData({
      name: ingredient.name,
      categoryId: ingredient.categoryId,
      unitId: ingredient.unitId,
      minimumStock: ingredient.minimumStock,
      pricePerUnit: ingredient.pricePerUnit,
      supplierId: ingredient.supplierId,
      currentStock: ingredient.currentStock,
      ingredientType: ingredient.ingredientType,
      storageCondition: ingredient.storageCondition,
      purchaseDate: ingredient.purchaseDate || '',
      expirationDate: ingredient.expirationDate || '',
      conversionFactor: ingredient.conversionFactor || 1,
      baseUnit: ingredient.baseUnit || ''
    })
    setEditingId(ingredient.id)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este insumo?')) {
      try {
        await api.delete(`/api/ingredients/${id}`)
        showSuccess('Insumo excluído com sucesso!')
        loadData()
      } catch (error) {
        console.error('Erro ao excluir insumo:', error)
        showError('Erro ao excluir insumo')
      }
    }
  }

  const handleView = (ingredient: Ingredient) => {
    setViewingIngredient(ingredient)
    setIsViewModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setFormData({
      name: '',
      categoryId: '',
      unitId: '',
      minimumStock: 0,
      pricePerUnit: 0,
      supplierId: '',
      currentStock: 0,
      ingredientType: 'Sólido',
      storageCondition: 'Ambiente',
      purchaseDate: '',
      expirationDate: '',
      conversionFactor: 1,
      baseUnit: ''
    })
  }

  const closeViewModal = () => {
    setIsViewModalOpen(false)
    setViewingIngredient(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando insumos...</p>
        </div>
      </div>
    )
  }

  // Calcular estatísticas
  const totalIngredients = ingredients.length
  const lowStockItems = ingredients.filter(ing => ing.currentStock <= ing.minimumStock).length
  const totalValue = ingredients.reduce((sum, ing) => sum + (ing.currentStock * ing.pricePerUnit), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 space-y-6">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Gestão de Insumos
            </h1>
            <p className="text-gray-600 mt-1">Controle completo dos ingredientes e matérias-primas</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            Novo Insumo
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Insumos</p>
              <p className="text-2xl font-bold text-gray-900">{totalIngredients}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center">
              <Package size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Estoque Baixo</p>
              <p className="text-2xl font-bold text-gray-900">{lowStockItems}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-gray-900">R$ {totalValue.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl flex items-center justify-center">
              <DollarSign size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar insumos..."
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
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="">Todos os tipos</option>
            <option value="Sólido">Sólido</option>
            <option value="Líquido">Líquido</option>
            <option value="Unidade">Unidade</option>
          </select>

          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all">
            <Filter size={20} />
            Filtros
          </button>
        </div>
      </div>

      {/* Tabela de Insumos */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <h3 className="text-xl font-bold text-white">Lista de Insumos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidade</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredIngredients.map((ingredient) => (
                <tr key={ingredient.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{ingredient.name}</div>
                    <div className="text-sm text-gray-500">{ingredient.supplier?.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ingredient.category?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{ingredient.currentStock}</div>
                    <div className="text-xs text-gray-500">Min: {ingredient.minimumStock}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    R$ {ingredient.pricePerUnit.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ingredient.unit?.abbreviation || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      ingredient.ingredientType === 'Sólido' ? 'bg-blue-100 text-blue-800' :
                      ingredient.ingredientType === 'Líquido' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {ingredient.ingredientType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(ingredient)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(ingredient)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(ingredient.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Adição/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  {editingId ? 'Editar Insumo' : 'Novo Insumo'}
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
                      Nome do Insumo
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Ex: Farinha de Trigo"
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
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Unidade de Medida
                    </label>
                    <select
                      required
                      value={formData.unitId}
                      onChange={(e) => setFormData(prev => ({ ...prev, unitId: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">Selecione uma unidade</option>
                      {units.map(unit => (
                        <option key={unit.id} value={unit.id}>{unit.name} ({unit.abbreviation})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Fornecedor
                    </label>
                    <select
                      value={formData.supplierId}
                      onChange={(e) => setFormData(prev => ({ ...prev, supplierId: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">Selecione um fornecedor</option>
                      {suppliers.map(supplier => (
                        <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Preço por Unidade (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.pricePerUnit}
                      onChange={(e) => setFormData(prev => ({ ...prev, pricePerUnit: Number(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Estoque Atual
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.currentStock}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentStock: Number(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Estoque Mínimo
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.minimumStock}
                      onChange={(e) => setFormData(prev => ({ ...prev, minimumStock: Number(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tipo
                    </label>
                    <select
                      value={formData.ingredientType}
                      onChange={(e) => setFormData(prev => ({ ...prev, ingredientType: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="Sólido">Sólido</option>
                      <option value="Líquido">Líquido</option>
                      <option value="Unidade">Unidade</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Condição de Armazenamento
                    </label>
                    <select
                      value={formData.storageCondition}
                      onChange={(e) => setFormData(prev => ({ ...prev, storageCondition: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="Ambiente">Ambiente</option>
                      <option value="Refrigerado">Refrigerado</option>
                      <option value="Congelado">Congelado</option>
                      <option value="Seco">Local Seco</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Fator de Conversão
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.conversionFactor}
                      onChange={(e) => setFormData(prev => ({ ...prev, conversionFactor: Number(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="1.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Data de Compra
                    </label>
                    <input
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Data de Validade
                    </label>
                    <input
                      type="date"
                      value={formData.expirationDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, expirationDate: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Unidade Base
                  </label>
                  <input
                    type="text"
                    value={formData.baseUnit}
                    onChange={(e) => setFormData(prev => ({ ...prev, baseUnit: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Ex: gramas, mililitros"
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
                  {editingId ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Visualização */}
      {isViewModalOpen && viewingIngredient && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Detalhes do Insumo</h2>
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
                      <p className="font-medium">{viewingIngredient.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Categoria:</span>
                      <p className="font-medium">{viewingIngredient.category?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Tipo:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        viewingIngredient.ingredientType === 'Sólido' ? 'bg-blue-100 text-blue-800' :
                        viewingIngredient.ingredientType === 'Líquido' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {viewingIngredient.ingredientType}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Estoque e Preços</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Estoque Atual:</span>
                      <p className="font-medium">{viewingIngredient.currentStock}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Estoque Mínimo:</span>
                      <p className="font-medium">{viewingIngredient.minimumStock}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Preço por Unidade:</span>
                      <p className="font-medium text-green-600">R$ {viewingIngredient.pricePerUnit.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Fornecedor e Unidades</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Fornecedor:</span>
                      <p className="font-medium">{viewingIngredient.supplier?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Unidade de Medida:</span>
                      <p className="font-medium">{viewingIngredient.unit?.name} ({viewingIngredient.unit?.abbreviation})</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Fator de Conversão:</span>
                      <p className="font-medium">{viewingIngredient.conversionFactor}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Armazenamento e Datas</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Condição de Armazenamento:</span>
                      <p className="font-medium">{viewingIngredient.storageCondition}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Data de Compra:</span>
                      <p className="font-medium">{viewingIngredient.purchaseDate ? new Date(viewingIngredient.purchaseDate).toLocaleDateString('pt-BR') : 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Data de Validade:</span>
                      <p className="font-medium">{viewingIngredient.expirationDate ? new Date(viewingIngredient.expirationDate).toLocaleDateString('pt-BR') : 'N/A'}</p>
                    </div>
                  </div>
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

