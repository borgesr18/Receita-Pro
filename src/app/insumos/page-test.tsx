'use client'

import { useState } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  X,
  Search,
  Filter
} from 'lucide-react'

export default function Insumos() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [viewingItem, setViewingItem] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'farinha',
    unit: 'kg',
    price: 0,
    supplier: '',
    minStock: 0,
    currentStock: 0,
    conversionFactor: 1,
    nutritionalInfo: '',
    observations: ''
  })

  const [insumos, setInsumos] = useState([
    {
      id: 1,
      name: 'Farinha de Trigo Especial',
      brand: 'Dona Benta',
      category: 'farinha',
      unit: 'kg',
      price: 4.50,
      supplier: 'Distribuidora ABC',
      minStock: 50,
      currentStock: 25,
      conversionFactor: 1,
      nutritionalInfo: 'Proteína: 12g, Carboidratos: 75g',
      observations: 'Ideal para pães artesanais'
    },
    {
      id: 2,
      name: 'Açúcar Cristal',
      brand: 'União',
      category: 'açúcar',
      unit: 'kg',
      price: 3.20,
      supplier: 'Atacadão',
      minStock: 30,
      currentStock: 45,
      conversionFactor: 1,
      nutritionalInfo: 'Carboidratos: 99g',
      observations: 'Açúcar refinado especial'
    },
    {
      id: 3,
      name: 'Ovos Frescos',
      brand: 'Granja XYZ',
      category: 'proteína',
      unit: 'unidade',
      price: 0.35,
      supplier: 'Granja Local',
      minStock: 100,
      currentStock: 80,
      conversionFactor: 50, // 1 ovo = 50g
      nutritionalInfo: 'Proteína: 6g, Gordura: 5g',
      observations: 'Ovos de galinha caipira'
    }
  ])

  const filteredInsumos = insumos.filter(insumo => {
    const matchesSearch = insumo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         insumo.brand.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !filterCategory || insumo.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingItem) {
      setInsumos(prev => prev.map(item => item.id === editingItem.id ? { ...formData, id: editingItem.id } : item))
    } else {
      const newInsumo = { ...formData, id: Date.now() }
      setInsumos(prev => [...prev, newInsumo])
    }
    
    closeModal()
  }

  const handleEdit = (insumo: any) => {
    setFormData(insumo)
    setEditingItem(insumo)
    setIsModalOpen(true)
  }

  const handleView = (insumo: any) => {
    setViewingItem(insumo)
    setIsViewModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este insumo?')) {
      setInsumos(prev => prev.filter(item => item.id !== id))
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setFormData({
      name: '',
      brand: '',
      category: 'farinha',
      unit: 'kg',
      price: 0,
      supplier: '',
      minStock: 0,
      currentStock: 0,
      conversionFactor: 1,
      nutritionalInfo: '',
      observations: ''
    })
  }

  const closeViewModal = () => {
    setIsViewModalOpen(false)
    setViewingItem(null)
  }

  const getStockStatus = (current: number, min: number) => {
    if (current <= min * 0.5) return { status: 'critical', color: 'text-red-600', bg: 'bg-red-100' }
    if (current <= min) return { status: 'low', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    return { status: 'good', color: 'text-green-600', bg: 'bg-green-100' }
  }

  // Estatísticas
  const totalInsumos = insumos.length
  const lowStockItems = insumos.filter(item => item.currentStock <= item.minStock).length
  const totalValue = insumos.reduce((sum, item) => sum + (item.price * item.currentStock), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 space-y-6">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Gestão de Insumos
            </h1>
            <p className="text-gray-600 mt-1">Controle completo do seu estoque</p>
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
              <p className="text-2xl font-bold text-gray-900">{totalInsumos}</p>
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
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl flex items-center justify-center">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="">Todas as categorias</option>
            <option value="farinha">Farinha</option>
            <option value="açúcar">Açúcar</option>
            <option value="proteína">Proteína</option>
            <option value="gordura">Gordura</option>
            <option value="aditivo">Aditivo</option>
          </select>

          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all">
            <Filter size={20} />
            Filtros Avançados
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
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Insumo</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInsumos.map((insumo) => {
                const stockStatus = getStockStatus(insumo.currentStock, insumo.minStock)
                return (
                  <tr key={insumo.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{insumo.name}</div>
                      <div className="text-sm text-gray-500">{insumo.brand}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {insumo.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      R$ {insumo.price.toFixed(2)}/{insumo.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {insumo.currentStock} {insumo.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.bg} ${stockStatus.color}`}>
                        {stockStatus.status === 'critical' ? 'Crítico' : 
                         stockStatus.status === 'low' ? 'Baixo' : 'Normal'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(insumo)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(insumo)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(insumo.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Adição/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  {editingItem ? 'Editar Insumo' : 'Novo Insumo'}
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
                      Marca
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Ex: Dona Benta"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Categoria
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="farinha">Farinha</option>
                      <option value="açúcar">Açúcar</option>
                      <option value="proteína">Proteína</option>
                      <option value="gordura">Gordura</option>
                      <option value="aditivo">Aditivo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Unidade de Medida
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="kg">Quilograma (kg)</option>
                      <option value="g">Grama (g)</option>
                      <option value="l">Litro (l)</option>
                      <option value="ml">Mililitro (ml)</option>
                      <option value="unidade">Unidade</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Preço por Unidade (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Fator de Conversão (g)
                    </label>
                    <input
                      type="number"
                      value={formData.conversionFactor}
                      onChange={(e) => setFormData(prev => ({ ...prev, conversionFactor: Number(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Fornecedor
                    </label>
                    <input
                      type="text"
                      value={formData.supplier}
                      onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Nome do fornecedor"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Estoque Mínimo
                    </label>
                    <input
                      type="number"
                      value={formData.minStock}
                      onChange={(e) => setFormData(prev => ({ ...prev, minStock: Number(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Estoque Atual
                    </label>
                    <input
                      type="number"
                      value={formData.currentStock}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentStock: Number(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Informações Nutricionais
                  </label>
                  <textarea
                    value={formData.nutritionalInfo}
                    onChange={(e) => setFormData(prev => ({ ...prev, nutritionalInfo: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    rows={3}
                    placeholder="Ex: Proteína: 12g, Carboidratos: 75g..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Observações
                  </label>
                  <textarea
                    value={formData.observations}
                    onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    rows={3}
                    placeholder="Observações adicionais..."
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
                  {editingItem ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Visualização */}
      {isViewModalOpen && viewingItem && (
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
                      <p className="font-medium">{viewingItem.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Marca:</span>
                      <p className="font-medium">{viewingItem.brand}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Categoria:</span>
                      <p className="font-medium capitalize">{viewingItem.category}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Preços e Medidas</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Preço:</span>
                      <p className="font-medium">R$ {viewingItem.price.toFixed(2)}/{viewingItem.unit}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Unidade:</span>
                      <p className="font-medium">{viewingItem.unit}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Fator de Conversão:</span>
                      <p className="font-medium">{viewingItem.conversionFactor}g</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Estoque</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Atual:</span>
                      <p className="font-medium">{viewingItem.currentStock} {viewingItem.unit}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Mínimo:</span>
                      <p className="font-medium">{viewingItem.minStock} {viewingItem.unit}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockStatus(viewingItem.currentStock, viewingItem.minStock).bg} ${getStockStatus(viewingItem.currentStock, viewingItem.minStock).color}`}>
                        {getStockStatus(viewingItem.currentStock, viewingItem.minStock).status === 'critical' ? 'Crítico' : 
                         getStockStatus(viewingItem.currentStock, viewingItem.minStock).status === 'low' ? 'Baixo' : 'Normal'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Fornecedor</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Nome:</span>
                      <p className="font-medium">{viewingItem.supplier || 'Não informado'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {viewingItem.nutritionalInfo && (
                <div className="mt-6 bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Informações Nutricionais</h3>
                  <p className="text-gray-700">{viewingItem.nutritionalInfo}</p>
                </div>
              )}

              {viewingItem.observations && (
                <div className="mt-6 bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Observações</h3>
                  <p className="text-gray-700">{viewingItem.observations}</p>
                </div>
              )}
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

