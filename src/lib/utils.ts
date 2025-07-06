import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export function formatWeight(grams: number): string {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(2)} kg`
  }
  return `${grams.toFixed(0)} g`
}

export function formatVolume(ml: number): string {
  if (ml >= 1000) {
    return `${(ml / 1000).toFixed(2)} L`
  }
  return `${ml.toFixed(0)} ml`
}

export function convertToBaseUnit(quantity: number, unitType: string, conversionFactor: number): number {
  return quantity * conversionFactor
}

export function calculatePercentage(quantity: number, flourQuantity: number): number {
  if (flourQuantity === 0) return 0
  return (quantity / flourQuantity) * 100
}

export function calculateRecipeCost(ingredients: Array<{quantity: number, pricePerUnit: number, conversionFactor: number}>): number {
  return ingredients.reduce((total, ingredient) => {
    const costPerGram = ingredient.pricePerUnit / (1000 * ingredient.conversionFactor)
    return total + (ingredient.quantity * costPerGram)
  }, 0)
}

export function generateBatchNumber(): string {
  const now = new Date()
  const timestamp = now.getTime().toString().slice(-6)
  return `LOTE-${timestamp}`
}
