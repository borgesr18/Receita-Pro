export interface Ingredient {
  id: number
  name: string
  quantity: number
  unit: string
  percentage?: number
  originalQuantity?: number
  pricePerGram?: number
  calculatedQuantity?: number
  calculatedCost?: number
  cost?: number
  consumed?: number
  available?: number
}

export interface Recipe {
  id: string | number
  name: string
  category?: string
  description?: string
  prepTime?: number
  ovenTemperature?: number
  instructions?: string
  technicalNotes?: string
  ingredients: Ingredient[]
  yield?: number
  baseFlourQuantity?: number
  calculatedYield?: number
  calculatedCost?: number
  calculatedCostPerGram?: number
  flourQuantity?: number
  multiplier?: number
}

export interface Category {
  id: number
  name: string
  description?: string
}

export interface Unit {
  id: number
  name: string
  abbreviation: string
  type: string
  factor: number
}

export interface User {
  id: number
  name: string
  email: string
  role: string
  active?: boolean
}

export interface Production {
  id?: number
  recipeId: number
  recipeName: string
  quantityProduced: number
  plannedQuantity: number
  productionDate: string
  startTime: string
  endTime: string
  operator: string
  batchNumber: string
  losses: number
  lossType: 'weight' | 'percentage'
  observations: string
  status: 'planejada' | 'em_andamento' | 'concluida' | 'cancelada'
  ingredients: Array<{
    id: number
    name: string
    quantity: number
    unit: string
    consumed?: number
    available?: number
  }>
  createdAt?: string
}

export type ConfigurationItem = Category | Unit | User

export interface FormData {
  name: string
  description?: string
  abbreviation?: string
  type?: string
  factor?: number
  role?: string
  active?: boolean
  email?: string
}

export interface CalculatedIngredient extends Ingredient {
  calculatedQuantity: number
  calculatedCost: number
}
