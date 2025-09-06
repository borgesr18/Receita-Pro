'use client';

import { useApiCache, useUICache } from './useCache';
import { Recipe, RecipeCategory, Ingredient } from '@/types';

// Types for recipe-specific cache
interface RecipeFilters {
  category?: string;
  difficulty?: string;
  prepTime?: number;
  search?: string;
}

interface DashboardStats {
  totalRecipes: number;
  favoriteRecipes: number;
  recentActivity: number;
  popularCategories: RecipeCategory[];
}

// Mock API functions (replace with real API calls)
const api = {
  getRecipes: async (): Promise<Recipe[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock data - replace with actual API call
    return [
      {
        id: '1',
        title: 'Bolo de Chocolate',
        description: 'Delicioso bolo de chocolate com cobertura',
        category: 'Sobremesas',
        difficulty: 'Médio',
        prepTime: 45,
        servings: 8,
        ingredients: [],
        instructions: [],
        image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=chocolate%20cake%20with%20frosting&image_size=square',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  },
  
  getRecipeById: async (id: string): Promise<Recipe | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock single recipe
    return {
      id,
      title: 'Receita Detalhada',
      description: 'Descrição completa da receita',
      category: 'Principal',
      difficulty: 'Fácil',
      prepTime: 30,
      servings: 4,
      ingredients: [
        { id: '1', name: 'Ingrediente 1', quantity: '2 xícaras', category: 'Base' },
        { id: '2', name: 'Ingrediente 2', quantity: '1 colher', category: 'Tempero' }
      ],
      instructions: [
        'Passo 1: Preparar ingredientes',
        'Passo 2: Misturar tudo',
        'Passo 3: Cozinhar por 30 minutos'
      ],
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=delicious%20main%20dish%20recipe&image_size=landscape_4_3',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },
  
  getCategories: async (): Promise<RecipeCategory[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return [
      { id: '1', name: 'Sobremesas', count: 15, color: '#FF6B6B' },
      { id: '2', name: 'Pratos Principais', count: 25, color: '#4ECDC4' },
      { id: '3', name: 'Entradas', count: 12, color: '#45B7D1' },
      { id: '4', name: 'Bebidas', count: 8, color: '#96CEB4' }
    ];
  },
  
  getDashboardStats: async (): Promise<DashboardStats> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const categories = await api.getCategories();
    
    return {
      totalRecipes: 60,
      favoriteRecipes: 12,
      recentActivity: 5,
      popularCategories: categories.slice(0, 3)
    };
  },
  
  getIngredients: async (): Promise<Ingredient[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return [
      { 
        id: '1', 
        name: 'Farinha de Trigo', 
        unit: 'g', 
        costPerUnit: 0.05,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      { 
        id: '2', 
        name: 'Açúcar', 
        unit: 'g', 
        costPerUnit: 0.08,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      { 
        id: '3', 
        name: 'Ovos', 
        unit: 'unidade', 
        costPerUnit: 0.50,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      { 
        id: '4', 
        name: 'Leite', 
        unit: 'ml', 
        costPerUnit: 0.003,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }
};

// Hook for caching recipes with filters
export function useRecipesCache(filters?: RecipeFilters) {
  const cacheKey = filters ? 
    `recipes_${JSON.stringify(filters)}` : 
    'recipes_all';
  
  return useApiCache(
    cacheKey,
    () => api.getRecipes(),
    {
      ttl: 5 * 60 * 1000, // 5 minutes
      persistToStorage: true
    }
  );
}

// Hook for caching single recipe
export function useRecipeCache(id: string) {
  return useApiCache(
    `recipe_${id}`,
    () => api.getRecipeById(id),
    {
      ttl: 10 * 60 * 1000, // 10 minutes
      persistToStorage: true
    }
  );
}

// Hook for caching categories
export function useCategoriesCache() {
  return useApiCache(
    'categories',
    api.getCategories,
    {
      ttl: 15 * 60 * 1000, // 15 minutes
      persistToStorage: true
    }
  );
}

// Hook for caching dashboard stats
export function useDashboardStatsCache() {
  return useApiCache(
    'dashboard_stats',
    api.getDashboardStats,
    {
      ttl: 2 * 60 * 1000, // 2 minutes
      persistToStorage: false // Don't persist stats
    }
  );
}

// Hook for caching ingredients
export function useIngredientsCache() {
  return useApiCache(
    'ingredients',
    api.getIngredients,
    {
      ttl: 30 * 60 * 1000, // 30 minutes
      persistToStorage: true
    }
  );
}

// Hook for UI state caching
export function useRecipeUICache() {
  // Cache for recipe form state
  const recipeForm = useUICache('recipe_form', {
    title: '',
    description: '',
    category: '',
    difficulty: 'Fácil',
    prepTime: 30,
    servings: 4,
    ingredients: [],
    instructions: []
  });
  
  // Cache for search filters
  const searchFilters = useUICache('search_filters', {
    category: '',
    difficulty: '',
    prepTime: 0,
    search: ''
  });
  
  // Cache for view preferences
  const viewPreferences = useUICache('view_preferences', {
    layout: 'grid', // 'grid' | 'list'
    sortBy: 'recent', // 'recent' | 'name' | 'difficulty'
    itemsPerPage: 12
  });
  
  return {
    recipeForm,
    searchFilters,
    viewPreferences
  };
}

// Hook for managing recipe cache invalidation
export function useRecipeCacheManager() {
  const invalidateRecipes = () => {
    // Invalidate all recipe-related cache entries
    const patterns = [
      'api_recipes',
      'api_recipe_',
      'api_categories',
      'api_dashboard_stats',
      'api_ingredients'
    ];
    
    patterns.forEach(pattern => {
      // Clear from localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.includes(pattern)) {
          localStorage.removeItem(key);
        }
      });
    });
  };
  
  const invalidateRecipe = (id: string) => {
    localStorage.removeItem(`cache_api_recipe_${id}`);
  };
  
  const invalidateCategories = () => {
    localStorage.removeItem('cache_api_categories');
  };
  
  const refreshDashboard = () => {
    localStorage.removeItem('cache_api_dashboard_stats');
  };
  
  return {
    invalidateRecipes,
    invalidateRecipe,
    invalidateCategories,
    refreshDashboard
  };
}

// Export API functions for direct use if needed
export { api as recipeApi };