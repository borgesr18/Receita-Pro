// Configurações centralizadas da aplicação

// Configurações da aplicação
export const APP_CONFIG = {
  NAME: process.env.APP_NAME || 'Receita Pro',
  VERSION: process.env.APP_VERSION || '1.0.0',
  URL: process.env.APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'),
  TIMEOUT: parseInt(process.env.API_TIMEOUT || '30000'),
  RETRY_ATTEMPTS: parseInt(process.env.API_RETRY_ATTEMPTS || '3')
} as const

// URLs da API
export const API_ENDPOINTS = {
  // Recursos principais
  RECIPES: '/api/recipes',
  PRODUCTS: '/api/products',
  INGREDIENTS: '/api/ingredients',
  PRODUCTIONS: '/api/productions',
  SALES: '/api/sales',
  STOCK_MOVEMENTS: '/api/stock-movements',
  
  // Configurações
  RECIPE_CATEGORIES: '/api/recipe-categories',
  INGREDIENT_CATEGORIES: '/api/ingredient-categories',
  MEASUREMENT_UNITS: '/api/measurement-units',
  SUPPLIERS: '/api/suppliers',
  SALES_CHANNELS: '/api/sales-channels',
  USERS: '/api/users',
  
  // Enums
  INGREDIENT_TYPES: '/api/enums/ingredient-types',
  UNIT_TYPES: '/api/enums/unit-types',
  
  // Funcionalidades especiais
  DASHBOARD: '/api/dashboard',
  CALCULO_PRECO: '/api/calculo-preco',
  CALCULO_PRECO_HISTORICO: '/api/calculo-preco/historico'
} as const

// Configurações de paginação
export const PAGINATION = {
  DEFAULT_LIMIT: parseInt(process.env.DEFAULT_PAGE_SIZE || '50'),
  DEFAULT_OFFSET: 0,
  MAX_LIMIT: parseInt(process.env.MAX_PAGE_SIZE || '100')
} as const

// Status padrão
export const STATUS = {
  PRODUCTION: {
    EM_ANDAMENTO: 'em_andamento',
    CONCLUIDA: 'concluida',
    CANCELADA: 'cancelada'
  },
  SALES: {
    PENDENTE: 'pendente',
    CONCLUIDA: 'concluida',
    CANCELADA: 'cancelada'
  },
  STOCK: {
    BAIXO: 'baixo',
    NORMAL: 'normal',
    VENCENDO: 'vencendo'
  }
} as const

// Tipos de movimento de estoque
export const MOVEMENT_TYPES = {
  ENTRADA: 'Entrada',
  SAIDA: 'Saida'
} as const

// Canais de venda
export const SALES_CHANNELS = {
  VAREJO: 'varejo',
  ATACADO: 'atacado'
} as const

// Configurações de UI
export const UI_CONFIG = {
  TOAST_DURATION: parseInt(process.env.TOAST_DURATION || '3000'),
  DEBOUNCE_DELAY: parseInt(process.env.DEBOUNCE_DELAY || '300'),
  ANIMATION_DURATION: parseInt(process.env.ANIMATION_DURATION || '200')
} as const

// Configurações de validação
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: parseInt(process.env.MIN_PASSWORD_LENGTH || '6'),
  MAX_NAME_LENGTH: parseInt(process.env.MAX_NAME_LENGTH || '100'),
  MAX_DESCRIPTION_LENGTH: parseInt(process.env.MAX_DESCRIPTION_LENGTH || '500'),
  DECIMAL_PLACES: 2
} as const

// Configurações de formatação
export const FORMAT = {
  CURRENCY: 'pt-BR',
  DATE: 'pt-BR',
  NUMBER: 'pt-BR'
} as const