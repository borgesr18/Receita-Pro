// Tipos principais da aplicação

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  instructions?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  categoryId?: string;
  category?: RecipeCategory;
  ingredients?: RecipeIngredient[];
  cost?: number;
  price?: number;
  margin?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipeCategory {
  id: string;
  name: string;
  description?: string;
  recipes?: Recipe[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Ingredient {
  id: string;
  name: string;
  description?: string;
  unit: string;
  costPerUnit: number;
  supplierId?: string;
  supplier?: Supplier;
  stockQuantity?: number;
  minStockLevel?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipeIngredient {
  id: string;
  recipeId: string;
  ingredientId: string;
  quantity: number;
  recipe?: Recipe;
  ingredient?: Ingredient;
  createdAt: Date;
  updatedAt: Date;
}

export interface Supplier {
  id: string;
  name: string;
  contact?: string;
  email?: string;
  phone?: string;
  address?: string;
  ingredients?: Ingredient[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  recipeId?: string;
  recipe?: Recipe;
  price: number;
  cost?: number;
  margin?: number;
  stockQuantity?: number;
  minStockLevel?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Production {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  cost: number;
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMovement {
  id: string;
  ingredientId?: string;
  productId?: string;
  ingredient?: Ingredient;
  product?: Product;
  type: 'IN' | 'OUT';
  quantity: number;
  reason: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para filtros e consultas
export interface RecipeFilters {
  categoryId?: string;
  search?: string;
  minCost?: number;
  maxCost?: number;
  minPrice?: number;
  maxPrice?: number;
}

export interface IngredientFilters {
  supplierId?: string;
  search?: string;
  lowStock?: boolean;
}

export interface ProductFilters {
  search?: string;
  lowStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

// Tipos para API responses
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Tipos para formulários
export interface CreateRecipeData {
  name: string;
  description?: string;
  instructions?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  categoryId?: string;
  ingredients: {
    ingredientId: string;
    quantity: number;
  }[];
}

export interface CreateIngredientData {
  name: string;
  description?: string;
  unit: string;
  costPerUnit: number;
  supplierId?: string;
  stockQuantity?: number;
  minStockLevel?: number;
}

export interface CreateProductData {
  name: string;
  description?: string;
  recipeId?: string;
  price: number;
  stockQuantity?: number;
  minStockLevel?: number;
}

export interface CreateSupplierData {
  name: string;
  contact?: string;
  email?: string;
  phone?: string;
  address?: string;
}

// Tipos para cache
export interface CacheOptions {
  ttl?: number;
  persistToStorage?: boolean;
  storageKey?: string;
}

// Tipos para toast notifications
export interface ToastData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Tipos para tabelas
export interface TableColumn<T = any> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  selection?: {
    selectedRows: string[];
    onSelectionChange: (selectedRows: string[]) => void;
  };
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  actions?: {
    label: string;
    onClick: (row: T) => void;
    icon?: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
  }[];
}