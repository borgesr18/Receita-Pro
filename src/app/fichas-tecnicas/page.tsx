'use client'

import React, { useState } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  Search,
  Clock,
  Thermometer,
  Copy
} from 'lucide-react'

export default function FichasTecnicas() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<{
    id: string;
    name: string;
    category: string;
    description: string;
    prepTime: number;
    ovenTemperature: number;
    instructions: string;
    technicalNotes: string;
    ingredients: Array<{
      ingredientId: string;
      quantity: number;
      percentage: number;
      unitId: string;
    }>;
  } | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [activeTab, setActiveTab] = useState('info')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    prepTime: 0,
    ovenTemp: 0,
    yield: 0,
    instructions: '',
    observations: '',
    version: '1.0',
    ingredients: [] as Array<{id: number; name: string; quantity: number; percentage: number; cost: number}>,
    totalCost: 0,
    costPerGram: 0
  })

  const availableIngredients = [
    { id: 1, name: 'Farinha de Trigo Especial', unit: 'g', pricePerGram: 0.0045 },
    { id: 2, name: 'Açúcar Cristal', unit: 'g', pricePerGram: 0.0032 },
    { id: 3, name: 'Manteiga sem Sal', unit: 'g', pricePerGram: 0.0128 },
    { id: 4, name: 'Fermento Biológico Seco', unit: 'g', pricePerGram: 0.08 },
    { id: 5, name: 'Leite Integral', unit: 'ml', pricePerGram: 0.0042 },
    { id: 6, name: 'Ovos', unit: 'g', pricePerGram: 0.012 },
    { id: 7, name: 'Sal Refinado', unit: 'g', pricePerGram: 0.002 }
  ]

  const [fichasTecnicas, setFichasTecnicas] = useState([
    {
      id: 1,
      name: 'Pão Francês Tradicional',
      description: 'Receita clássica de pão francês',
      category: 'Pães',
      prepTime: 180,
      ovenTemp: 220,
      yield: 1000,
      version: '2.1',
      totalCost: 3.45,
      costPerGram: 0.00345,
      ingredients: [
        { id: 1, name: 'Farinha de Trigo Especial', quantity: 500, percentage: 100, cost: 2.25 },
        { id: 5, name: 'Leite Integral', quantity: 300, percentage: 60, cost: 1.26 },
        { id: 4, name: 'Fermento Biológico Seco', quantity: 10, percentage: 2, cost: 0.80 },
        { id: 7, name: 'Sal Refinado', quantity: 8, percentage: 1.6, cost: 0.016 }
      ],
      instructions: '1. Misture todos os ingredientes secos\n2. Adicione o leite morno\n3. Sove por 10 minutos\n4. Deixe descansar por 1 hora\n5. Modele os pães\n6. Deixe crescer por 45 minutos\n7. Asse por 25 minutos',
      observations: 'Temperatura do leite deve estar entre 35-40°C. Umidade do forno importante nos primeiros 10 minutos.',
      createdAt: '2025-06-15',
      updatedAt: '2025-06-28'
    },
    {
      id: 2,
      name: 'Bolo de Chocolate Premium',
      description: 'Bolo de chocolate com cobertura especial',
      category: 'Bolos',
      prepTime: 120,
      ovenTemp: 180,
      yield: 1200,
      version: '1.5',
      totalCost: 8.75,
      costPerGram: 0.00729,
      ingredients: [
        { id: 1, name: 'Farinha de Trigo Especial', quantity: 300, percentage: 100, cost: 1.35 },
        { id: 2, name: 'Açúcar Cristal', quantity: 250, percentage: 83.3, cost: 0.80 },
        { id: 3, name: 'Manteiga sem Sal', quantity: 150, percentage: 50, cost: 1.92 },
        { id: 6, name: 'Ovos', quantity: 200, percentage: 66.7, cost: 2.40 },
        { id: 5, name: 'Leite Integral', quantity: 200, percentage: 66.7, cost: 0.84 }
      ],
      instructions: '1. Bata a manteiga com açúcar\n2. Adicione os ovos um a um\n3. Intercale farinha e leite\n4. Asse por 40 minutos\n5. Prepare a cobertura\n6. Decore após esfriar',
      observations: 'Não abra o forno nos primeiros 30 minutos. Teste com palito antes de retirar.',
      createdAt: '2025-06-10',
      updatedAt: '2025-06-25'
    }
  ])

  const categorias = ['Pães', 'Bolos', 'Doces', 'Salgados', 'Biscoitos', 'Tortas']

  const filteredFichas = fichasTecnicas.filter(ficha => {
    const matchesSearch = ficha.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ficha.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === '' || ficha.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const handleAdd = () => {
    setEditingItem(null)
    setFormData({
      name: '',
      description: '',
      category: '',
      prepTime: 0,
      ovenTemp: 0,
      yield: 0,
      instructions: '',
      observations: '',
      version: '1.0',
      ingredients: [],
      totalCost: 0,
      costPerGram: 0
    })
    setIsModalOpen(true)
    setActiveTab('info')
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setFormData(item)
    setIsModalOpen(true)
    setActiveTab('info')
  }

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta ficha técnica?')) {
      setFichasTecnicas(fichasTecnicas.filter(item => item.id !== id))
    }
  }

  const handleSave = () => {
    const updatedFormData = {
      ...formData,
      totalCost: calculateTotalCost(),
      costPerGram: calculateCostPerGram()
    }

    if (editingItem) {
      setFichasTecnicas(fichasTecnicas.map(item => 
        item.id.toString() === editingItem.id.toString() 
          ? { ...item, ...updatedFormData, updatedAt: new Date().toISOString().split('T')[0] }
          : item
      ))
    } else {
      const newId = Math.max(...fichasTecnicas.map(item => item.id)) + 1
      setFichasTecnicas([...fichasTecnicas, { 
        id: newId, 
        ...updatedFormData,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      }])
    }
    
    setIsModalOpen(false)
    setEditingItem(null)
  }

  const addIngredient = () => {
    const newIngredient = {
      id: 0,
      name: '',
      quantity: 0,
      percentage: 0,
      cost: 0
    }
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, newIngredient]
    })
  }

  const removeIngredient = (index: number) => {
    const newIngredients = formData.ingredients.filter((_, i) => i !== index)
    setFormData({ ...formData, ingredients: newIngredients })
  }

  const updateIngredient = (index: number, field: string, value: string | number) => {
    const newIngredients = [...formData.ingredients]
    newIngredients[index] = { ...newIngredients[index], [field]: value }
    
    if (field === 'quantity') {
      const flourQuantity = newIngredients.find(ing => ing.percentage === 100)?.quantity || 1
      newIngredients[index].percentage = (Number(value) / flourQuantity) * 100
    }
    
    if (field === 'id' || field === 'quantity') {
      const ingredient = availableIngredients.find(ing => ing.id === newIngredients[index].id)
      if (ingredient) {
        newIngredients[index].name = ingredient.name
        newIngredients[index].cost = newIngredients[index].quantity * ingredient.pricePerGram
      }
    }
    
    setFormData({ ...formData, ingredients: newIngredients })
  }

  const calculateTotalCost = () => {
    return formData.ingredients.reduce((total, ing) => total + (ing.cost || 0), 0)
  }

  const calculateCostPerGram = () => {
    const totalCost = calculateTotalCost()
    return formData.yield > 0 ? totalCost / formData.yield : 0
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fichas Técnicas</h1>
          <p className="text-gray-600 mt-1">Gerencie receitas e cálculos de custos</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          <span>Nova Ficha</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Buscar por nome ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas as categorias</option>
              {categorias.map(categoria => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receita</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rendimento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Custo Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Custo/g</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tempo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Versão</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFichas.map((ficha) => (
                <tr key={ficha.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{ficha.name}</div>
                      <div className="text-sm text-gray-500">{ficha.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ficha.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ficha.yield}g</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(ficha.totalCost)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(ficha.costPerGram)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Clock size={14} className="mr-1" />
                      {ficha.prepTime}min
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Thermometer size={14} className="mr-1" />
                      {ficha.ovenTemp}°C
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                      v{ficha.version}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(ficha)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(ficha.id)}
                      className="text-red-600 hover:text-red-900 mr-3"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <Copy size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingItem ? 'Editar' : 'Adicionar'} Ficha Técnica
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'info'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Informações Gerais
                </button>
                <button
                  onClick={() => setActiveTab('ingredients')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'ingredients'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Ingredientes
                </button>
                <button
                  onClick={() => setActiveTab('instructions')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'instructions'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Modo de Preparo
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'info' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Receita</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Pão Francês Tradicional"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione a categoria</option>
                    {categorias.map(categoria => (
                      <option key={categoria} value={categoria}>{categoria}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tempo de Preparo (min)</label>
                  <input
                    type="number"
                    value={formData.prepTime}
                    onChange={(e) => setFormData({ ...formData, prepTime: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 180"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Temperatura do Forno (°C)</label>
                  <input
                    type="number"
                    value={formData.ovenTemp}
                    onChange={(e) => setFormData({ ...formData, ovenTemp: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 220"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rendimento (g)</label>
                  <input
                    type="number"
                    value={formData.yield}
                    onChange={(e) => setFormData({ ...formData, yield: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Versão</label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 1.0"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Descrição da receita"
                  />
                </div>
              </div>
            )}

            {activeTab === 'ingredients' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-gray-900">Ingredientes</h4>
                  <button
                    onClick={addIngredient}
                    className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Plus size={14} />
                    <span>Adicionar</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ingrediente</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantidade (g/ml)</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Porcentagem (%)</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Custo (R$)</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.ingredients.map((ingredient, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2">
                            <select
                              value={ingredient.id}
                              onChange={(e) => updateIngredient(index, 'id', parseInt(e.target.value))}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value={0}>Selecione o ingrediente</option>
                              {availableIngredients.map(ing => (
                                <option key={ing.id} value={ing.id}>{ing.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              value={ingredient.quantity}
                              onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value))}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="0"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              step="0.1"
                              value={ingredient.percentage.toFixed(1)}
                              onChange={(e) => updateIngredient(index, 'percentage', parseFloat(e.target.value))}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="0.0"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <span className="text-sm text-gray-900">
                              {formatCurrency(ingredient.cost || 0)}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <button
                              onClick={() => removeIngredient(index)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Custo Total:</span>
                      <span className="ml-2 text-lg font-bold text-green-600">
                        {formatCurrency(calculateTotalCost())}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Custo por Grama:</span>
                      <span className="ml-2 text-lg font-bold text-blue-600">
                        {formatCurrency(calculateCostPerGram())}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'instructions' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Modo de Preparo</label>
                  <textarea
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={8}
                    placeholder="Descreva o passo a passo do preparo..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Observações Técnicas</label>
                  <textarea
                    value={formData.observations}
                    onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Dicas importantes, temperaturas, tempos de repouso, etc..."
                  />
                </div>
              </div>
            )}

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save size={16} />
                <span>Salvar Ficha</span>
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
