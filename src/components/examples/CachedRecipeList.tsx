'use client';

import React, { useState, useMemo } from 'react';
import { VirtualList } from '@/components/ui/VirtualList';
import { useRecipesCache, useRecipeUICache } from '@/hooks/useRecipeCache';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Search, Filter, Grid, List, Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
type Recipe = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  difficulty?: string;
  prepTime?: number;
  servings?: number;
  image?: string;
};

// Recipe Card Component for Virtual List
function RecipeCard({ 
  recipe, 
  layout = 'grid' 
}: { 
  recipe: Recipe; 
  layout?: 'grid' | 'list';
}) {
  if (layout === 'list') {
    return (
      <Card className="h-full hover-lift transition-smooth">
        <div className="flex p-4 gap-4">
          <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-lg truncate">{recipe.title}</h3>
              <span className="ml-2 px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-700 flex-shrink-0">
                {recipe.category}
              </span>
            </div>
            
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
              {recipe.description}
            </p>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{recipe.prepTime} min</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{recipe.servings} porções</span>
              </div>
              <span className="px-2 py-0.5 text-xs rounded border">
                {recipe.difficulty}
              </span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full hover-lift transition-smooth">
      <div className="aspect-video rounded-t-lg overflow-hidden">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover hover-scale transition-smooth"
          loading="lazy"
        />
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold line-clamp-2">{recipe.title}</h3>
          <span className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-700 flex-shrink-0">
            {recipe.category}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {recipe.description}
        </p>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{recipe.prepTime}min</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{recipe.servings}</span>
            </div>
          </div>
          <span className="px-2 py-0.5 text-xs rounded border">
            {recipe.difficulty}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// Loading skeleton for virtual list
function RecipeListSkeleton({ layout = 'grid' }: { layout?: 'grid' | 'list' }) {
  const skeletonCount = layout === 'grid' ? 12 : 8;
  
  return (
    <div className={cn(
      'grid gap-4',
      layout === 'grid' 
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        : 'grid-cols-1'
    )}>
      {Array.from({ length: skeletonCount }).map((_, i) => (
        <SkeletonCard key={i} className={layout === 'list' ? 'h-32' : 'h-80'} />
      ))}
    </div>
  );
}

// Main Cached Recipe List Component
export function CachedRecipeList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  
  // Use UI cache for view preferences
  const { viewPreferences, searchFilters } = useRecipeUICache();
  const [layout, setLayout] = useState<'grid' | 'list'>(
    (viewPreferences.data.layout === 'list' ? 'list' : 'grid') as 'grid' | 'list'
  );
  
  // Build filters for API call
  const filters = useMemo(() => ({
    search: searchQuery,
    category: selectedCategory,
    difficulty: selectedDifficulty
  }), [searchQuery, selectedCategory, selectedDifficulty]);
  
  // Use cached recipes with filters
  const { data: recipes, isLoading, error, refetch } = useRecipesCache(filters);
  
  // Update view preferences cache
  const handleLayoutChange = (newLayout: 'grid' | 'list') => {
    setLayout(newLayout);
    viewPreferences.setData({
      ...viewPreferences.data,
      layout: newLayout
    });
  };
  
  // Filter recipes locally for instant feedback
  const filteredRecipes = useMemo(() => {
    if (!recipes) return [];
    
    return recipes.filter(recipe => {
      const matchesSearch = !searchQuery || 
        (recipe.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (recipe.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = !selectedCategory || (recipe.category || '') === selectedCategory;
      const matchesDifficulty = !selectedDifficulty || (recipe.difficulty || '') === selectedDifficulty;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [recipes, searchQuery, selectedCategory, selectedDifficulty]);
  
  // Virtual list configuration
  const itemHeight = layout === 'grid' ? 320 : 140; // Height per item
  const containerHeight = 600; // Fixed container height
  const itemsPerRow = layout === 'grid' ? 4 : 1;
  
  // Render item for virtual list
  const renderItem = (recipe: Recipe, index: number, style: React.CSSProperties) => (
    <div style={style} className={cn(
      'p-2',
      layout === 'grid' && 'w-1/4', // Grid layout
      layout === 'list' && 'w-full'  // List layout
    )}>
      <RecipeCard recipe={recipe} layout={layout} />
    </div>
  );
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-destructive mb-4">Erro ao carregar receitas</p>
        <Button onClick={() => refetch()} variant="outline">
          Tentar novamente
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header with search and filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar receitas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="">Todas as categorias</option>
            <option value="Sobremesas">Sobremesas</option>
            <option value="Pratos Principais">Pratos Principais</option>
            <option value="Entradas">Entradas</option>
            <option value="Bebidas">Bebidas</option>
          </select>
          
          {/* Difficulty filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="">Todas as dificuldades</option>
            <option value="Fácil">Fácil</option>
            <option value="Médio">Médio</option>
            <option value="Difícil">Difícil</option>
          </select>
          
          {/* Layout toggle */}
          <div className="flex border rounded-md">
            <Button
              variant={layout === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => handleLayoutChange('grid')}
              className="rounded-r-none"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={layout === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => handleLayoutChange('list')}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? 'Carregando...' : `${filteredRecipes.length} receitas encontradas`}
        </p>
        
        {(searchQuery || selectedCategory || selectedDifficulty) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('');
              setSelectedDifficulty('');
            }}
          >
            Limpar filtros
          </Button>
        )}
      </div>
      
      {/* Virtual List */}
      {isLoading ? (
        <RecipeListSkeleton layout={layout} />
      ) : filteredRecipes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Nenhuma receita encontrada</p>
          <Button variant="outline" onClick={() => refetch()}>
            Recarregar
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg">
          <VirtualList
            items={filteredRecipes as any}
            itemHeight={itemHeight}
            containerHeight={containerHeight}
            renderItem={renderItem as any}
            className="p-4"
            getItemKey={(recipe) => (recipe as any).id}
          />
        </div>
      )}
    </div>
  );
}

export default CachedRecipeList;