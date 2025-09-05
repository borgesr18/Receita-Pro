// Ajuste para corrigir dropdown fixo com posição dinâmica (sem scrollY)

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Search, Clock, Thermometer, Users } from 'lucide-react'

interface Recipe {
  id: string
  name: string
  categoryId: string
  category?: {
    id: string
    name: string
  }
  ingredients: Array<{
    id: string
    ingredientId: string
    quantity: number
    unit: string
    ingredient: {
      id: string
      name: string
      unit: string
      pricePerUnit: number
      conversionFactor: number
    }
  }>
  instructions: string
  prepTime: number
  cookTime: number
  temperature: number
  yield: number
  totalWeight: number
  totalCost: number
}

interface RecipeCategory {
  id: string
  name: string
}

interface DropdownPortalProps {
  isOpen: boolean
  anchorRef: React.RefObject<HTMLButtonElement>
  searchTerm: string
  filterCategory: string
  onSearch: (term: string) => void
  onCategoryChange: (category: string) => void
  recipes: Recipe[]
  categories: RecipeCategory[]
  onSelect: (recipe: Recipe) => void
  onClose: () => void
  // calculateRecipeData: (recipe: Recipe) => { totalWeight: number; totalCost: number }
  loading?: boolean
}

export const DropdownPortal: React.FC<DropdownPortalProps> = ({
  isOpen,
  anchorRef,
  searchTerm,
  filterCategory,
  onSearch,
  onCategoryChange,
  recipes,
  categories,
  onSelect,
  onClose,
  // calculateRecipeData,
  loading = false
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })

  useEffect(() => {
    if (isOpen && anchorRef.current) {
      const updatePosition = () => {
        const rect = anchorRef.current!.getBoundingClientRect()
        setPosition({
          top: rect.bottom + 8, // corrigido: não somar window.scrollY
          left: rect.left,      // corrigido: não somar window.scrollX
          width: rect.width
        })
      }

      updatePosition()

      window.addEventListener('scroll', updatePosition, { passive: true })
      window.addEventListener('resize', updatePosition, { passive: true })

      return () => {
        window.removeEventListener('scroll', updatePosition)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [isOpen, anchorRef])

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !filterCategory || recipe.categoryId === filterCategory
    return matchesSearch && matchesCategory
  })

  if (!isOpen) return null

  return createPortal(
    <>
      <div className="fixed inset-0 z-[999998]" onClick={onClose} />

      <div
        className="fixed bg-white/95 backdrop-blur-lg border border-white/50 rounded-2xl shadow-2xl max-h-96 overflow-hidden z-[999999]"
        style={{
          top: position.top,
          left: position.left,
          width: Math.max(position.width, 500)
        }}
      >
        <div className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar receitas..."
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas as categorias</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <div className="max-h-64 overflow-y-auto space-y-2">
            {loading ? (
              <div className="text-center py-4 text-gray-500">Carregando receitas...</div>
            ) : filteredRecipes.length === 0 ? (
              <div className="text-center py-4 text-gray-500">Nenhuma receita encontrada</div>
            ) : (
              filteredRecipes.map(recipe => {
                // const recipeData = calculateRecipeData(recipe)
                return (
                  <div
                    key={recipe.id}
                    onClick={() => onSelect(recipe)}
                    className="p-3 hover:bg-blue-50 rounded-xl cursor-pointer transition-colors duration-200 border border-transparent hover:border-blue-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{recipe.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {recipe.prepTime + recipe.cookTime}min
                          </span>
                          <span className="flex items-center gap-1">
                            <Thermometer className="w-3 h-3" />
                            {recipe.temperature}°C
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {recipe.ingredients.length} ingredientes
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                          {recipe.category?.name || 'Sem categoria'}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}
