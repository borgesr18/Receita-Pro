import { z } from 'zod'

export const ingredientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  unitId: z.string().min(1, 'Unidade é obrigatória'),
  pricePerUnit: z.coerce.number().min(0, 'Preço deve ser maior ou igual a zero'),
  supplierId: z.string().optional(),
  purchaseDate: z.string().optional(),
  ingredientType: z.enum([
    'Açúcares', 'Aditivos_Industriais', 'Adoçantes', 'Agentes_de_Crescimento',
    'Coberturas', 'Derivados', 'Enriquecedores', 'Farinha', 'Fermentos',
    'Finalizações', 'Gorduras', 'Ingredientes_Adicionais', 'Ingredientes_Secundários',
    'Líquidos', 'Recheios', 'Sal', 'Temperos'
  ]).default('Ingredientes_Adicionais'),
  expirationDate: z.string().optional(),
  storageCondition: z.enum([
    'Ambiente_Controlado', 'Ambiente_Seco', 'Congelado', 'Refrigerado', 'Uso_Imediato'
  ]).default('Ambiente_Seco'),
  currentStock: z.coerce.number().min(0, 'Estoque atual deve ser maior ou igual a zero').default(0),
  minimumStock: z.coerce.number().min(0, 'Estoque mínimo deve ser maior ou igual a zero').default(0),
  conversionFactor: z.coerce.number().optional(),
  baseUnit: z.string().optional()
})

export const recipeSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  productId: z.string().optional(),
  preparationTime: z.coerce.number().min(0, 'Tempo de preparo deve ser maior ou igual a zero').default(0),
  ovenTemperature: z.coerce.number().min(0, 'Temperatura do forno deve ser maior ou igual a zero').default(0),
  instructions: z.string().optional(),
  technicalNotes: z.string().optional(),
  ingredients: z.array(z.object({
    ingredientId: z.string().min(1, 'Ingrediente é obrigatório'),
    quantity: z.coerce.number().min(0, 'Quantidade deve ser maior que zero'),
    percentage: z.coerce.number().min(0, 'Porcentagem deve ser maior ou igual a zero').default(0),
    unitId: z.string().min(1, 'Unidade é obrigatória')
  })).optional()
})

export const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  averageWeight: z.coerce.number().min(0, 'Peso médio deve ser maior que zero'),
  description: z.string().optional()
})

export const productionSchema = z.object({
  recipeId: z.string().min(1, 'Receita é obrigatória'),
  productId: z.string().min(1, 'Produto é obrigatório'),
  batchNumber: z.string().min(1, 'Número do lote é obrigatório'),
  quantityPlanned: z.coerce.number().min(0, 'Quantidade planejada deve ser maior que zero'),
  quantityProduced: z.coerce.number().min(0, 'Quantidade produzida deve ser maior ou igual a zero').optional(),
  lossPercentage: z.coerce.number().min(0, 'Percentual de perda deve ser maior ou igual a zero').default(0),
  lossWeight: z.coerce.number().min(0, 'Peso de perda deve ser maior ou igual a zero').default(0),
  productionDate: z.string().optional(),
  expirationDate: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('PLANNED')
})

export const saleSchema = z.object({
  productId: z.string().min(1, 'Produto é obrigatório'),
  channelId: z.string().min(1, 'Canal de venda é obrigatório'),
  quantity: z.coerce.number().min(0, 'Quantidade deve ser maior que zero'),
  weight: z.coerce.number().min(0, 'Peso deve ser maior que zero'),
  unitPrice: z.coerce.number().min(0, 'Preço unitário deve ser maior que zero'),
  totalPrice: z.coerce.number().min(0, 'Preço total deve ser maior que zero'),
  profitMargin: z.coerce.number().min(0, 'Margem de lucro deve ser maior ou igual a zero').default(0),
  saleDate: z.string().optional(),
  notes: z.string().optional()
})

export const ingredientCategorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional()
})

export const recipeCategorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional()
})

export const precoCalculadoSchema = z.object({
  custo: z.coerce.number().min(0, 'Custo deve ser maior ou igual a zero'),
  peso: z.coerce.number().min(0, 'Peso deve ser maior que zero'),
  lucro: z.coerce.number().min(0, 'Lucro deve ser maior ou igual a zero'),
  precoFinal: z.coerce.number().min(0, 'Preço final deve ser maior que zero')
})
