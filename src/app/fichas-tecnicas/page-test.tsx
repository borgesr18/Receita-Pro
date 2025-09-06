'use client'

import { useState } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  X,
  Search,
  Clock,
  Thermometer,
  Scale,
  Calculator,
  Printer,
  ChefHat,
  Eye,
  Copy
} from 'lucide-react'

export default function FichasTecnicas() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [viewingItem, setViewingItem] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')

  const [fichas, setFichas] = useState([
    {
      id: 1,
      name: 'Pão Francês Tradicional',
      description: 'Receita clássica de pão francês com fermentação natural',
      category: 'Pães',
      prepTime: 180,
      ovenTemp: 220,
      yield: 2000,
      cost: 4.50,
      version: '2.1',
      ingredients: [
        { name: 'Farinha de Trigo Especial', quantity: 1000, unit: 'g', percentage: 100, cost: 2.25 },
        { name: 'Água', quantity: 650, unit: 'ml', percentage: 65, cost: 0.00 },
        { name: 'Sal Refinado', quantity: 18, unit: 'g', percentage: 1.8, cost: 0.05 },
        { name: 'Fermento Biológico Seco', quantity: 8, unit: 'g', percentage: 0.8, cost: 0.32 },
        { name: 'Açúcar Cristal', quantity: 25, unit: 'g', percentage: 2.5, cost: 0.08 }
      ],
      instructions: [
        'Misture todos os ingredientes secos em uma tigela grande',
        'Adicione a água gradualmente e misture até formar uma massa homogênea',
        'Sove a massa por 10-15 minutos até ficar lisa e elástica',
        'Deixe descansar por 1 hora em local protegido',
        'Divida a massa em porções de 50g e modele os pães',
        'Deixe crescer por mais 45 minutos',
        'Asse em forno pré-aquecido a 220°C por 15-20 minutos'
      ]
    },
    {
      id: 2,
      name: 'Bolo de Chocolate Premium',
      description: 'Bolo de chocolate úmido com cobertura cremosa',
      category: 'Bolos',
      prepTime: 90,
      ovenTemp: 180,
      yield: 1200,
      cost: 12.80,
      version: '1.5',
      ingredients: [
        { name: 'Farinha de Trigo', quantity: 300, unit: 'g', percentage: 100, cost: 0.68 },
        { name: 'Açúcar Cristal', quantity: 250, unit: 'g', percentage: 83.3, cost: 0.75 },
        { name: 'Cacau em Pó', quantity: 80, unit: 'g', percentage: 26.7, cost: 2.40 },
        { name: 'Ovos', quantity: 4, unit: 'unidades', percentage: 133.3, cost: 1.40 },
        { name: 'Óleo de Soja', quantity: 120, unit: 'ml', percentage: 40, cost: 0.36 }
      ],
      instructions: [
        'Pré-aqueça o forno a 180°C',
        'Misture os ingredientes secos em uma tigela',
        'Em outra tigela, bata os ovos com o açúcar',
        'Adicione o óleo e misture bem',
        'Incorpore os ingredientes secos gradualmente',
        'Despeje na forma untada e asse por 35-40 minutos'
      ]
    },
    {
      id: 3,
      name: 'Croissant Artesanal',
      description: 'Croissant folhado com manteiga francesa',
      category: 'Pães',
      prepTime: 480,
      ovenTemp: 200,
      yield: 800,
      cost: 8.90,
      version: '3.0',
      ingredients: [
        { name: 'Farinha de Trigo Especial', quantity: 500, unit: 'g', percentage: 100, cost: 1.13 },
        { name: 'Manteiga Francesa', quantity: 300, unit: 'g', percentage: 60, cost: 4.50 },
        { name: 'Leite Integral', quantity: 150, unit: 'ml', percentage: 30, cost: 0.45 },
        { name: 'Açúcar Cristal', quantity: 50, unit: 'g', percentage: 10, cost: 0.15 },
        { name: 'Sal Refinado', quantity: 10, unit: 'g', percentage: 2, cost: 0.03 }
      ],
      instructions: [
        'Prepare a massa base misturando farinha, leite, açúcar e sal',
        'Deixe descansar por 30 minutos',
        'Lamine a manteiga em formato retangular',
        'Envolva a manteiga na massa e faça as dobras',
        'Repita o processo de laminação 3 vezes',
        'Corte e modele os croissants',
        'Deixe crescer por 2 horas',
        'Asse a 200°C por 15-18 minutos'
      ]
    }
  ])

  const categories = [...new Set(fichas.map(ficha => ficha.category))]

  const filteredFichas = fichas.filter(ficha => {
    const matchesSearch = ficha.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !filterCategory || ficha.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const handleView = (ficha: any) => {
    setViewingItem(ficha)
    setIsViewModalOpen(true)
  }

  const handleEdit = (ficha: any) => {
    setEditingItem(ficha)
    setIsModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta ficha técnica?')) {
      setFichas(prev => prev.filter(item => item.id !== id))
    }
  }

  const handleDuplicate = (ficha: any) => {
    const newFicha = { ...ficha, id: Date.now(), name: `${ficha.name} (Cópia)` }
    setFichas(prev => [...prev, newFicha])
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingItem(null)
  }

  const closeViewModal = () => {
    setIsViewModalOpen(false)
    setViewingItem(null)
  }

  // Estatísticas
  const totalFichas = fichas.length
  const avgCost = fichas.reduce((sum, ficha) => sum + ficha.cost, 0) / fichas.length
  const totalCategories = categories.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 space-y-6">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Fichas Técnicas
            </h1>
            <p className="text-gray-600 mt-1">Gerencie suas receitas profissionais</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            Nova Ficha Técnica
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Receitas</p>
              <p className="text-2xl font-bold text-gray-900">{totalFichas}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center">
              <ChefHat size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Custo Médio</p>
              <p className="text-2xl font-bold text-gray-900">R$ {avgCost.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl flex items-center justify-center">
              <Calculator size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categorias</p>
              <p className="text-2xl font-bold text-gray-900">{totalCategories}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl flex items-center justify-center">
              <Scale size={20} />
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
              placeholder="Buscar receitas..."
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
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all">
            <ChefHat size={20} />
            Filtros Avançados
          </button>
        </div>
      </div>

      {/* Grid de Fichas Técnicas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFichas.map((ficha) => (
          <div key={ficha.id} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white truncate">{ficha.name}</h3>
              <p className="text-blue-100 text-sm">{ficha.category}</p>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{ficha.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={16} />
                  <span>{ficha.prepTime}min</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Thermometer size={16} />
                  <span>{ficha.ovenTemp}°C</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Scale size={16} />
                  <span>{ficha.yield}g</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                  <Calculator size={16} />
                  <span>R$ {ficha.cost.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">v{ficha.version}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleView(ficha)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Visualizar"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleEdit(ficha)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDuplicate(ficha)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Duplicar"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(ficha.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Visualização */}
      {isViewModalOpen && viewingItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">{viewingItem.name}</h2>
                  <p className="text-blue-100">{viewingItem.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors">
                    <Printer size={20} />
                  </button>
                  <button
                    onClick={closeViewModal}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Informações Gerais */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Informações Gerais</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Categoria:</span>
                        <p className="font-medium">{viewingItem.category}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Versão:</span>
                        <p className="font-medium">{viewingItem.version}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Tempo de Preparo:</span>
                        <p className="font-medium">{viewingItem.prepTime} min</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Temperatura:</span>
                        <p className="font-medium">{viewingItem.ovenTemp}°C</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Rendimento:</span>
                        <p className="font-medium">{viewingItem.yield}g</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Custo Total:</span>
                        <p className="font-medium text-green-600">R$ {viewingItem.cost.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Ingredientes */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Ingredientes</h3>
                    <div className="space-y-2">
                      {viewingItem.ingredients.map((ingredient: any, index: number) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                          <div>
                            <p className="font-medium text-sm">{ingredient.name}</p>
                            <p className="text-xs text-gray-600">{ingredient.quantity} {ingredient.unit} ({ingredient.percentage}%)</p>
                          </div>
                          <span className="text-sm text-green-600 font-medium">R$ {ingredient.cost.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Modo de Preparo */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Modo de Preparo</h3>
                  <ol className="space-y-3">
                    {viewingItem.instructions.map((instruction: string, index: number) => (
                      <li key={index} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        <span className="text-sm text-gray-700">{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => handleEdit(viewingItem)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all"
                >
                  <Edit size={16} />
                  Editar
                </button>
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

      {/* Modal de Edição (simplificado para teste) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  {editingItem ? 'Editar Ficha Técnica' : 'Nova Ficha Técnica'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 text-center">
                Funcionalidade de edição em desenvolvimento...
              </p>
              <div className="flex justify-end mt-6">
                <button
                  onClick={closeModal}
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

