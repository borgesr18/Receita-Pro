'use client'

import React, { useState } from 'react'
import { 
  Printer, 
  FileText, 
  Download,
  Eye,
  Settings,
  Layout,
  Scale,
  DollarSign,
  ChefHat,
  Thermometer,
  Package,
  AlertCircle,
  Clock
} from 'lucide-react'
import { Recipe, Ingredient } from '@/lib/types'

export default function Impressao() {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
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
    showPercentages: true,
    showWeights: true,
    showHeader: true,
    showFooter: true
  })
  const [calculatedRecipe, setCalculatedRecipe] = useState<Recipe | null>(null)
  const [flourQuantity, setFlourQuantity] = useState(1000)

  const availableRecipes = [
    {
      id: 1,
      name: 'Pão Francês Tradicional',
      description: 'Receita clássica de pão francês com fermentação natural',
      category: 'Pães',
      prepTime: 180,
      ovenTemp: 220,
      yield: 2000,
      version: '2.1',
      lastModified: '2025-06-25',
      ingredients: [
        { name: 'Farinha de Trigo Especial', quantity: 1000, unit: 'g', percentage: 100.0, cost: 4.50 },
        { name: 'Água', quantity: 650, unit: 'ml', percentage: 65.0, cost: 0.00 },
        { name: 'Sal', quantity: 20, unit: 'g', percentage: 2.0, cost: 0.05 },
        { name: 'Fermento Biológico Seco', quantity: 8, unit: 'g', percentage: 0.8, cost: 0.32 },
        { name: 'Açúcar Cristal', quantity: 30, unit: 'g', percentage: 3.0, cost: 0.10 },
        { name: 'Óleo de Soja', quantity: 25, unit: 'ml', percentage: 2.5, cost: 0.08 }
      ],
      instructions: [
        'Dissolva o fermento em água morna (35°C) com uma pitada de açúcar',
        'Em uma tigela grande, misture a farinha e o sal',
        'Adicione a água com fermento e o óleo, misture bem',
        'Sove a massa por 10-12 minutos até ficar lisa e elástica',
        'Deixe descansar em local aquecido por 1 hora ou até dobrar de volume',
        'Divida a massa em porções de 50g e modele os pães',
        'Deixe crescer novamente por 45 minutos',
        'Asse em forno pré-aquecido a 220°C por 15-18 minutos'
      ],
      observations: 'Para melhor resultado, use farinha com 11-12% de proteína. A temperatura da água deve estar entre 32-35°C.',
      totalCost: 5.05,
      costPerGram: 0.002525
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
      lastModified: '2025-06-20',
      ingredients: [
        { name: 'Farinha de Trigo Especial', quantity: 300, unit: 'g', percentage: 100.0, cost: 1.35 },
        { name: 'Açúcar Cristal', quantity: 240, unit: 'g', percentage: 80.0, cost: 0.77 },
        { name: 'Cacau em Pó', quantity: 60, unit: 'g', percentage: 20.0, cost: 1.80 },
        { name: 'Ovos', quantity: 180, unit: 'g', percentage: 60.0, cost: 2.70 },
        { name: 'Manteiga sem Sal', quantity: 120, unit: 'g', percentage: 40.0, cost: 1.54 },
        { name: 'Leite Integral', quantity: 180, unit: 'ml', percentage: 60.0, cost: 0.72 },
        { name: 'Fermento em Pó', quantity: 12, unit: 'g', percentage: 4.0, cost: 0.24 }
      ],
      instructions: [
        'Pré-aqueça o forno a 180°C e unte uma forma de 24cm',
        'Peneire a farinha, cacau e fermento em uma tigela',
        'Em outra tigela, bata a manteiga com açúcar até obter um creme',
        'Adicione os ovos um a um, batendo bem após cada adição',
        'Alterne a adição dos ingredientes secos com o leite',
        'Despeje na forma e asse por 35-40 minutos',
        'Teste com palito - deve sair limpo',
        'Deixe esfriar antes de desenformar'
      ],
      observations: 'Para um bolo mais úmido, adicione 1 colher de sopa de café forte à massa.',
      totalCost: 9.12,
      costPerGram: 0.0076
    }
  ]

  const handleRecipeSelect = (recipeId: number) => {
    const recipe = availableRecipes.find(r => r.id === recipeId)
    if (recipe) {
      setSelectedRecipe({
        id: recipe.id.toString(),
        name: recipe.name,
        category: recipe.category,
        description: recipe.description,
        prepTime: recipe.prepTime,
        ovenTemperature: recipe.ovenTemp,
        instructions: recipe.instructions.join('\n'),
        technicalNotes: recipe.observations || '',
        ingredients: recipe.ingredients.map((ing: {name: string; quantity: number; unit: string; percentage: number; cost: number}) => ({
          id: Math.random(),
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
          percentage: ing.percentage,
          cost: ing.cost
        }))
      })
    }
    if (selectedRecipe) {
      calculateRecipe(selectedRecipe, flourQuantity)
    }
  }

  const calculateRecipe = (recipe: Recipe, flourQty: number) => {
    const flourIngredient = recipe.ingredients.find((ing: Ingredient) => (ing.percentage || 0) === 100.0)
    if (!flourIngredient) return

    const multiplier = flourQty / flourIngredient.quantity
    
    const calculatedIngredients = recipe.ingredients.map((ingredient: Ingredient) => ({
      ...ingredient,
      calculatedQuantity: ingredient.quantity * multiplier,
      calculatedCost: (ingredient.cost || 0) * multiplier
    }))

    const totalWeight = calculatedIngredients.reduce((sum: number, ing: Ingredient & {calculatedQuantity: number; calculatedCost: number}) => sum + ing.calculatedQuantity, 0)
    const totalCost = calculatedIngredients.reduce((sum: number, ing: Ingredient & {calculatedQuantity: number; calculatedCost: number}) => sum + ing.calculatedCost, 0)

    setCalculatedRecipe({
      ...recipe,
      ingredients: calculatedIngredients,
      calculatedYield: totalWeight,
      calculatedCost: totalCost,
      calculatedCostPerGram: totalWeight > 0 ? totalCost / totalWeight : 0,
      flourQuantity: flourQty,
      multiplier
    })
  }

  const handleFlourQuantityChange = (quantity: number) => {
    setFlourQuantity(quantity)
    if (selectedRecipe) {
      calculateRecipe(selectedRecipe, quantity)
    }
  }

  const formatWeight = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(2)} kg`
    }
    return `${value.toFixed(0)} g`
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const printRecipe = () => {
    window.print()
  }

  const exportToPDF = () => {
    alert('Funcionalidade de exportação para PDF será implementada em breve')
  }

  const previewRecipe = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Impressão</h1>
          <p className="text-gray-600 mt-1">Imprima fichas técnicas e receitas calculadas</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={previewRecipe}
            disabled={!selectedRecipe}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Eye size={16} />
            <span>Visualizar</span>
          </button>
          <button
            onClick={exportToPDF}
            disabled={!selectedRecipe}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            <span>Exportar PDF</span>
          </button>
          <button
            onClick={printRecipe}
            disabled={!selectedRecipe}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer size={16} />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recipe Selection */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Selecionar Receita</h3>
            <div className="space-y-3">
              {availableRecipes.map(recipe => (
                <button
                  key={recipe.id}
                  onClick={() => handleRecipeSelect(recipe.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedRecipe?.id === recipe.id.toString()
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-gray-900">{recipe.name}</div>
                  <div className="text-sm text-gray-600">{recipe.category}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Versão {recipe.version} • {formatDate(recipe.lastModified)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recipe Calculator */}
          {selectedRecipe && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Calcular Receita</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantidade de Farinha (g)
                  </label>
                  <input
                    type="number"
                    value={flourQuantity}
                    onChange={(e) => handleFlourQuantityChange(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 1000"
                  />
                </div>
                {calculatedRecipe && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Rendimento:</span>
                        <div className="font-medium">{formatWeight(calculatedRecipe.calculatedYield || 0)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Custo Total:</span>
                        <div className="font-medium text-green-600">{formatCurrency(calculatedRecipe.calculatedCost || 0)}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Print Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="mr-2" size={20} />
              Configurações de Impressão
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Incluir na Impressão</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={printSettings.includeIngredients}
                      onChange={(e) => setPrintSettings({...printSettings, includeIngredients: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm">Ingredientes</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={printSettings.includeInstructions}
                      onChange={(e) => setPrintSettings({...printSettings, includeInstructions: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm">Modo de Preparo</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={printSettings.includeCosts}
                      onChange={(e) => setPrintSettings({...printSettings, includeCosts: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm">Custos</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={printSettings.showPercentages}
                      onChange={(e) => setPrintSettings({...printSettings, showPercentages: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm">Porcentagens</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tamanho do Papel</label>
                <select
                  value={printSettings.paperSize}
                  onChange={(e) => setPrintSettings({...printSettings, paperSize: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  onChange={(e) => setPrintSettings({...printSettings, orientation: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="portrait">Retrato</option>
                  <option value="landscape">Paisagem</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tamanho da Fonte</label>
                <select
                  value={printSettings.fontSize}
                  onChange={(e) => setPrintSettings({...printSettings, fontSize: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="small">Pequena</option>
                  <option value="medium">Média</option>
                  <option value="large">Grande</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Print Preview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Layout className="mr-2" size={20} />
                Visualização da Impressão
              </h3>
            </div>
            
            <div className="p-8 bg-gray-50 min-h-[800px]">
              {selectedRecipe ? (
                <div className="bg-white shadow-lg mx-auto max-w-4xl min-h-[700px]">
                  {/* Print Content */}
                  <div className="p-8 print-content">
                    {/* Header */}
                    {printSettings.showHeader && (
                      <div className="text-center mb-8 pb-4 border-b-2 border-gray-300">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Receita Pro</h1>
                        <p className="text-gray-600">Sistema de Fichas para Panificação</p>
                      </div>
                    )}

                    {/* Recipe Title */}
                    <div className="mb-6">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        {calculatedRecipe ? calculatedRecipe.name : selectedRecipe.name}
                      </h2>
                      <p className="text-gray-600 mb-4">
                        {calculatedRecipe ? calculatedRecipe.description : selectedRecipe.description}
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center">
                          <Clock className="mr-2 text-gray-500" size={16} />
                          <span>{selectedRecipe.prepTime} min</span>
                        </div>
                        <div className="flex items-center">
                          <Thermometer className="mr-2 text-gray-500" size={16} />
                          <span>{selectedRecipe.ovenTemperature}°C</span>
                        </div>
                        <div className="flex items-center">
                          <Scale className="mr-2 text-gray-500" size={16} />
                          <span>{formatWeight(calculatedRecipe ? (calculatedRecipe.calculatedYield || 0) : 1000)}</span>
                        </div>
                        {printSettings.includeCosts && (
                          <div className="flex items-center">
                            <DollarSign className="mr-2 text-gray-500" size={16} />
                            <span>{formatCurrency(calculatedRecipe ? (calculatedRecipe.calculatedCost || 0) : 0)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ingredients */}
                    {printSettings.includeIngredients && (
                      <div className="mb-8">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                          <Package className="mr-2" size={20} />
                          Ingredientes
                          {calculatedRecipe && (
                            <span className="ml-2 text-sm font-normal text-gray-600">
                              (Base: {formatWeight(calculatedRecipe.flourQuantity || 0)} farinha)
                            </span>
                          )}
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse border border-gray-300">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2 text-left">Ingrediente</th>
                                <th className="border border-gray-300 px-4 py-2 text-center">Quantidade</th>
                                {printSettings.showPercentages && (
                                  <th className="border border-gray-300 px-4 py-2 text-center">%</th>
                                )}
                                {printSettings.includeCosts && (
                                  <th className="border border-gray-300 px-4 py-2 text-center">Custo</th>
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {(calculatedRecipe ? calculatedRecipe.ingredients : selectedRecipe.ingredients).map((ingredient: Ingredient, index: number) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="border border-gray-300 px-4 py-2 font-medium">
                                    {ingredient.name}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-2 text-center">
                                    {formatWeight(calculatedRecipe ? (ingredient.calculatedQuantity || 0) : ingredient.quantity)}
                                  </td>
                                  {printSettings.showPercentages && (
                                    <td className="border border-gray-300 px-4 py-2 text-center">
                                      {(ingredient.percentage || 0).toFixed(1)}%
                                    </td>
                                  )}
                                  {printSettings.includeCosts && (
                                    <td className="border border-gray-300 px-4 py-2 text-center">
                                      {formatCurrency(calculatedRecipe ? (ingredient.calculatedCost || 0) : (ingredient.cost || 0))}
                                    </td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                            {printSettings.includeCosts && (
                              <tfoot>
                                <tr className="bg-gray-100 font-semibold">
                                  <td className="border border-gray-300 px-4 py-2">Total</td>
                                  <td className="border border-gray-300 px-4 py-2 text-center">
                                    {formatWeight(calculatedRecipe ? (calculatedRecipe.calculatedYield || 0) : 1000)}
                                  </td>
                                  {printSettings.showPercentages && (
                                    <td className="border border-gray-300 px-4 py-2"></td>
                                  )}
                                  <td className="border border-gray-300 px-4 py-2 text-center">
                                    {formatCurrency(calculatedRecipe ? (calculatedRecipe.calculatedCost || 0) : 0)}
                                  </td>
                                </tr>
                              </tfoot>
                            )}
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Instructions */}
                    {printSettings.includeInstructions && (
                      <div className="mb-8">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                          <ChefHat className="mr-2" size={20} />
                          Modo de Preparo
                        </h3>
                        <ol className="space-y-3">
                          {(selectedRecipe.instructions || '').split('\n').map((instruction: string, index: number) => (
                            <li key={index} className="flex">
                              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                                {index + 1}
                              </span>
                              <span className="text-gray-700 leading-relaxed">{instruction}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Observations */}
                    {selectedRecipe.technicalNotes && (
                      <div className="mb-8">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                          <AlertCircle className="mr-2" size={20} />
                          Observações Técnicas
                        </h3>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <p className="text-gray-700">{selectedRecipe.technicalNotes}</p>
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    {printSettings.showFooter && (
                      <div className="mt-12 pt-4 border-t-2 border-gray-300 text-sm text-gray-600">
                        <div className="flex justify-between items-center">
                          <div>
                            <p>Versão: 1.0</p>
                            <p>Última modificação: {formatDate(new Date().toISOString())}</p>
                          </div>
                          {printSettings.includeDate && (
                            <div className="text-right">
                              <p>Impresso em: {new Date().toLocaleDateString('pt-BR')}</p>
                              <p>Receita Pro - Sistema de Fichas para Panificação</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <FileText size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-lg">Selecione uma receita para visualizar a impressão</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body * {
              visibility: hidden;
            }
            .print-content,
            .print-content * {
              visibility: visible;
            }
            .print-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100% !important;
              max-width: none !important;
            }
            @page {
              margin: 2cm;
              size: ${printSettings.paperSize} ${printSettings.orientation};
            }
            .text-3xl {
              font-size: 1.875rem !important;
            }
            .text-2xl {
              font-size: 1.5rem !important;
            }
            .text-xl {
              font-size: 1.25rem !important;
            }
            table {
              page-break-inside: avoid;
            }
            tr {
              page-break-inside: avoid;
            }
            h1, h2, h3 {
              page-break-after: avoid;
            }
          }
        `
      }} />
    </div>
  )
}
