'use client'

import React, { useState } from 'react'
import { 
  Printer, 
  FileText, 
  Download,
  Settings,
  Scale,
  Thermometer,
  Clock,
  Search,
  Copy,
  Save,
  Eye
} from 'lucide-react'
type RecipePrint = {
  id: number;
  name: string;
  description?: string;
  category: string;
  prepTime: number;
  ovenTemp: number;
  yield: number;
  version: string;
  cost: number;
  ingredients: Array<{ id: number; name: string; quantity: number; unit: string; cost: number; percentage?: number }>;
  instructions: string[];
}

export default function Impressao() {
  const [selectedRecipe, setSelectedRecipe] = useState<RecipePrint | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [printSettings, setPrintSettings] = useState({
    includeIngredients: true,
    includeInstructions: true,
    includeCosts: true,
    includeNutrition: false,
    includeVersion: true,
    includeDate: true,
    paperSize: 'A4',
    orientation: 'portrait',
    fontSize: 'medium',
    showWeights: true,
    showHeader: true,
    showFooter: true,
    showPercentages: false
  })
  const [calculatedRecipe, setCalculatedRecipe] = useState<RecipePrint | null>(null)
  const [flourQuantity, setFlourQuantity] = useState(1000)

  const availableRecipes: RecipePrint[] = [
    {
      id: 1,
      name: 'Pão Francês Tradicional',
      description: 'Receita clássica de pão francês com fermentação natural',
      category: 'Pães',
      prepTime: 180,
      ovenTemp: 220,
      yield: 2000,
      version: '2.1',
      cost: 4.50,
      ingredients: [
        { id: 1, name: 'Farinha de Trigo Especial', quantity: 1000, unit: 'g', cost: 2.25, percentage: 100 },
        { id: 2, name: 'Água', quantity: 650, unit: 'ml', cost: 0.00, percentage: 65 },
        { id: 3, name: 'Sal Refinado', quantity: 18, unit: 'g', cost: 0.05, percentage: 1.8 },
        { id: 4, name: 'Fermento Biológico Seco', quantity: 8, unit: 'g', cost: 0.32, percentage: 0.8 },
        { id: 5, name: 'Açúcar Cristal', quantity: 25, unit: 'g', cost: 0.08, percentage: 2.5 }
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
      version: '1.5',
      cost: 12.80,
      ingredients: [
        { id: 1, name: 'Farinha de Trigo', quantity: 300, unit: 'g', cost: 0.68, percentage: 100 },
        { id: 2, name: 'Açúcar Cristal', quantity: 250, unit: 'g', cost: 0.75, percentage: 83.3 },
        { id: 3, name: 'Cacau em Pó', quantity: 80, unit: 'g', cost: 2.40, percentage: 26.7 },
        { id: 4, name: 'Ovos', quantity: 4, unit: 'unidades', cost: 1.40, percentage: 133.3 },
        { id: 5, name: 'Óleo de Soja', quantity: 120, unit: 'ml', cost: 0.36, percentage: 40 }
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
      version: '3.0',
      cost: 8.90,
      ingredients: [
        { id: 1, name: 'Farinha de Trigo Especial', quantity: 500, unit: 'g', cost: 1.13, percentage: 100 },
        { id: 2, name: 'Manteiga Francesa', quantity: 300, unit: 'g', cost: 4.50, percentage: 60 },
        { id: 3, name: 'Leite Integral', quantity: 150, unit: 'ml', cost: 0.45, percentage: 30 },
        { id: 4, name: 'Açúcar Cristal', quantity: 50, unit: 'g', cost: 0.15, percentage: 10 },
        { id: 5, name: 'Sal Refinado', quantity: 10, unit: 'g', cost: 0.03, percentage: 2 }
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
  ]

  const categories = [...new Set(availableRecipes.map(recipe => recipe.category))]

  const filteredRecipes = availableRecipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || recipe.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const calculateRecipe = (baseRecipe: any, newFlourQuantity: number) => {
    const flourIngredient = baseRecipe.ingredients.find((ing: any) => ing.percentage === 100)
    if (!flourIngredient) return baseRecipe

    const factor = newFlourQuantity / flourIngredient.quantity

    const calculatedIngredients = baseRecipe.ingredients.map((ingredient: any) => ({
      ...ingredient,
      quantity: Math.round(ingredient.quantity * factor * 100) / 100,
      cost: Math.round(ingredient.cost * factor * 100) / 100
    }))

    const totalCost = calculatedIngredients.reduce((sum: number, ing: any) => sum + ing.cost, 0)

    return {
      ...baseRecipe,
      ingredients: calculatedIngredients,
      cost: Math.round(totalCost * 100) / 100,
      yield: Math.round(baseRecipe.yield * factor)
    }
  }

  const handleRecipeSelect = (recipe: any) => {
    setSelectedRecipe(recipe)
    const calculated = calculateRecipe(recipe, flourQuantity)
    setCalculatedRecipe(calculated)
  }

  const handleFlourQuantityChange = (newQuantity: number) => {
    setFlourQuantity(newQuantity)
    if (selectedRecipe) {
      const calculated = calculateRecipe(selectedRecipe, newQuantity)
      setCalculatedRecipe(calculated)
    }
  }

  const handlePrint = () => {
    if (calculatedRecipe) {
      window.print()
    }
  }

  const handleExportPDF = () => {
    console.log('Exportando para PDF...')
    // Implementar lógica de exportação para PDF
  }

  const handleSaveTemplate = () => {
    console.log('Salvando template...')
    // Implementar lógica para salvar template
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 space-y-6">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Central de Impressão
            </h1>
            <p className="text-gray-600 mt-1">Imprima fichas técnicas profissionais</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSaveTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
            >
              <Save size={18} />
              Salvar Template
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
            >
              <Download size={18} />
              Exportar PDF
            </button>
            <button
              onClick={handlePrint}
              disabled={!calculatedRecipe}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer size={20} />
              Imprimir
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seleção de Receita */}
        <div className="space-y-6">
          {/* Filtros */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Selecionar Receita</h2>
            <div className="space-y-4">
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
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Todas as categorias</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Lista de Receitas */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white">Receitas Disponíveis</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {filteredRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  onClick={() => handleRecipeSelect(recipe)}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-blue-50 ${
                    selectedRecipe?.id === recipe.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{recipe.name}</h4>
                      <p className="text-sm text-gray-600">{recipe.category}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {recipe.prepTime}min
                        </span>
                        <span className="flex items-center gap-1">
                          <Thermometer size={12} />
                          {recipe.ovenTemp}°C
                        </span>
                        <span className="flex items-center gap-1">
                          <Scale size={12} />
                          {recipe.yield}g
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">R$ {recipe.cost.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">v{recipe.version}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Configurações de Cálculo */}
          {selectedRecipe && (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ajustar Quantidade</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantidade de Farinha (g)
                  </label>
                  <input
                    type="number"
                    value={flourQuantity}
                    onChange={(e) => handleFlourQuantityChange(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="1000"
                  />
                </div>
                {calculatedRecipe && (
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-medium text-green-900 mb-2">Receita Calculada</h4>
                    <div className="text-sm text-green-700 space-y-1">
                      <p>Rendimento: {calculatedRecipe.yield}g</p>
                      <p>Custo Total: R$ {calculatedRecipe.cost.toFixed(2)}</p>
                      <p>Custo por 100g: R$ {((calculatedRecipe.cost / calculatedRecipe.yield) * 100).toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Configurações de Impressão */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl flex items-center justify-center">
              <Settings size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Configurações de Impressão</h2>
          </div>

          <div className="space-y-6">
            {/* Conteúdo */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Conteúdo</h3>
              <div className="space-y-3">
                {[
                  { key: 'includeIngredients', label: 'Lista de Ingredientes' },
                  { key: 'includeInstructions', label: 'Modo de Preparo' },
                  { key: 'includeCosts', label: 'Custos e Valores' },
                  { key: 'includeNutrition', label: 'Informações Nutricionais' },
                  { key: 'includeVersion', label: 'Versão da Receita' },
                  { key: 'includeDate', label: 'Data de Impressão' }
                ].map((option) => (
                  <label key={option.key} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={printSettings[option.key as keyof typeof printSettings] as boolean}
                      onChange={(e) => setPrintSettings(prev => ({ ...prev, [option.key]: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Formato */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Formato</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tamanho do Papel</label>
                  <select
                    value={printSettings.paperSize}
                    onChange={(e) => setPrintSettings(prev => ({ ...prev, paperSize: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="A4">A4</option>
                    <option value="A3">A3</option>
                    <option value="Letter">Letter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Orientação</label>
                  <select
                    value={printSettings.orientation}
                    onChange={(e) => setPrintSettings(prev => ({ ...prev, orientation: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="portrait">Retrato</option>
                    <option value="landscape">Paisagem</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tamanho da Fonte</label>
                  <select
                    value={printSettings.fontSize}
                    onChange={(e) => setPrintSettings(prev => ({ ...prev, fontSize: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="small">Pequena</option>
                    <option value="medium">Média</option>
                    <option value="large">Grande</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Exibição */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Exibição</h3>
              <div className="space-y-3">
                {[
                  { key: 'showWeights', label: 'Mostrar Pesos' },
                  { key: 'showHeader', label: 'Cabeçalho' },
                  { key: 'showFooter', label: 'Rodapé' }
                ].map((option) => (
                  <label key={option.key} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={printSettings[option.key as keyof typeof printSettings] as boolean}
                      onChange={(e) => setPrintSettings(prev => ({ ...prev, [option.key]: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Preview da Ficha Técnica</h3>
              <Eye className="text-white" size={20} />
            </div>
          </div>

          <div className="p-6">
            {calculatedRecipe ? (
              <div className="space-y-6 text-sm">
                {/* Header */}
                {printSettings.showHeader && (
                  <div className="text-center border-b border-gray-200 pb-4">
                    <h1 className="text-2xl font-bold text-gray-900">{calculatedRecipe.name}</h1>
                    <p className="text-gray-600">{calculatedRecipe.description}</p>
                    <div className="flex justify-center gap-6 mt-2 text-xs text-gray-500">
                      <span>Categoria: {calculatedRecipe.category}</span>
                      {printSettings.includeVersion && <span>Versão: {calculatedRecipe.version}</span>}
                      {printSettings.includeDate && <span>Data: {new Date().toLocaleDateString('pt-BR')}</span>}
                    </div>
                  </div>
                )}

                {/* Informações Gerais */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Informações Gerais</h4>
                    <div className="space-y-1">
                      <p>Tempo de Preparo: {calculatedRecipe.prepTime} min</p>
                      <p>Temperatura: {calculatedRecipe.ovenTemp}°C</p>
                      <p>Rendimento: {calculatedRecipe.yield}g</p>
                    </div>
                  </div>
                  {printSettings.includeCosts && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Custos</h4>
                      <div className="space-y-1">
                        <p>Custo Total: R$ {calculatedRecipe.cost.toFixed(2)}</p>
                        <p>Custo/100g: R$ {((calculatedRecipe.cost / calculatedRecipe.yield) * 100).toFixed(2)}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Ingredientes */}
                {printSettings.includeIngredients && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Ingredientes</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2">Ingrediente</th>
                            <th className="text-left py-2">Quantidade</th>
                            {printSettings.showPercentages && <th className="text-left py-2">%</th>}
                            {printSettings.includeCosts && <th className="text-left py-2">Custo</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {calculatedRecipe.ingredients.map((ingredient: any, index: number) => (
                            <tr key={index} className="border-b border-gray-100">
                              <td className="py-2">{ingredient.name}</td>
                              <td className="py-2">{ingredient.quantity} {ingredient.unit}</td>
                              {printSettings.showPercentages && <td className="py-2">{ingredient.percentage}%</td>}
                              {printSettings.includeCosts && <td className="py-2">R$ {ingredient.cost.toFixed(2)}</td>}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Modo de Preparo */}
                {printSettings.includeInstructions && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Modo de Preparo</h4>
                    <ol className="space-y-2">
                      {calculatedRecipe.instructions.map((instruction: string, index: number) => (
                        <li key={index} className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </span>
                          <span className="text-gray-700">{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Footer */}
                {printSettings.showFooter && (
                  <div className="border-t border-gray-200 pt-4 text-center text-xs text-gray-500">
                    <p>Receita Pro - Sistema de Gestão para Panificação</p>
                    <p>Impresso em {new Date().toLocaleString('pt-BR')}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Selecione uma receita para visualizar o preview</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

