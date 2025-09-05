'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, TrendingUp, FileText, Package, Users, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  category: 'receitas' | 'produtos' | 'clientes' | 'vendas' | 'estoque' | 'outros';
  href: string;
  icon?: React.ReactNode;
}

interface GlobalSearchProps {
  placeholder?: string;
  className?: string;
  onResultClick?: (result: SearchResult) => void;
}

const categoryIcons = {
  receitas: <FileText className="w-4 h-4" />,
  produtos: <Package className="w-4 h-4" />,
  clientes: <Users className="w-4 h-4" />,
  vendas: <ShoppingCart className="w-4 h-4" />,
  estoque: <Package className="w-4 h-4" />,
  outros: <Search className="w-4 h-4" />
};

const categoryLabels = {
  receitas: 'Receitas',
  produtos: 'Produtos',
  clientes: 'Clientes',
  vendas: 'Vendas',
  estoque: 'Estoque',
  outros: 'Outros'
};

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ 
  placeholder = "Buscar...", 
  className = '',
  onResultClick 
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock data - em produção, isso viria de uma API
  const mockResults: SearchResult[] = [
    {
      id: '1',
      title: 'Pão Francês',
      description: 'Receita tradicional de pão francês',
      category: 'receitas',
      href: '/receitas/1'
    },
    {
      id: '2',
      title: 'Bolo de Chocolate',
      description: 'Receita de bolo de chocolate com cobertura',
      category: 'receitas',
      href: '/receitas/2'
    },
    {
      id: '3',
      title: 'João Silva',
      description: 'Cliente desde 2023',
      category: 'clientes',
      href: '/clientes/1'
    },
    {
      id: '4',
      title: 'Farinha de Trigo',
      description: 'Estoque: 50kg disponível',
      category: 'estoque',
      href: '/estoque/1'
    }
  ];

  // Simular busca
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const filteredResults = mockResults.filter(result => 
      result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setResults(filteredResults);
    setIsLoading(false);
  };

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // Carregar buscas recentes do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navegação por teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleResultClick(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleResultClick = (result: SearchResult) => {
    // Adicionar às buscas recentes
    const newRecentSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(newRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
    
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(-1);
    onResultClick?.(result);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleRecentSearchClick = (recentQuery: string) => {
    setQuery(recentQuery);
    inputRef.current?.focus();
  };

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <div 
      ref={searchRef} 
      id="search"
      className={`relative ${className}`} 
      role="search"
      aria-label="Busca global"
    >
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-border rounded-lg bg-background text-text-primary placeholder-text-muted focus:ring-2 focus:ring-focus-ring focus:border-transparent transition-all"
          aria-label="Campo de busca global"
          aria-describedby="search-instructions"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={isOpen ? 'search-results' : undefined}
          aria-activedescendant={selectedIndex >= 0 ? `search-result-${selectedIndex}` : undefined}
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 focus:ring-offset-background rounded"
            aria-label="Limpar busca"
            type="button"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>
      
      {/* Screen reader instructions */}
      <div id="search-instructions" className="sr-only">
        Use as setas para navegar pelos resultados, Enter para selecionar, Escape para fechar.
      </div>

      {isOpen && (
        <div 
          id="search-results"
          className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          role="listbox"
          aria-label="Resultados da busca"
        >
          {isLoading ? (
            <div className="p-4 text-center text-text-muted" role="status" aria-live="polite">
              <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" aria-hidden="true"></div>
              Buscando...
            </div>
          ) : query && results.length === 0 ? (
            <div className="p-4 text-center text-text-muted" role="status" aria-live="polite">
              Nenhum resultado encontrado para &quot;{query}&quot;
            </div>
          ) : query && results.length > 0 ? (
            <div className="py-2">
              {Object.entries(groupedResults).map(([category, categoryResults]) => (
                <div key={category}>
                  <div 
                    className="px-4 py-2 text-xs font-semibold text-text-muted uppercase tracking-wide border-b border-border"
                    role="group"
                    aria-label={`Categoria: ${categoryLabels[category as keyof typeof categoryLabels]}`}
                  >
                    <span aria-hidden="true">{categoryIcons[category as keyof typeof categoryIcons]}</span>
                    <span className="ml-2">{categoryLabels[category as keyof typeof categoryLabels]}</span>
                  </div>
                  {categoryResults.map((result, index) => {
                    const globalIndex = results.indexOf(result);
                    return (
                      <Link
                        key={result.id}
                        href={result.href}
                        onClick={() => handleResultClick(result)}
                        className={`block px-4 py-3 hover:bg-surface-hover transition-colors focus:outline-none focus:bg-surface-hover ${
                          selectedIndex === globalIndex ? 'bg-surface-hover' : ''
                        }`}
                        role="option"
                        aria-selected={selectedIndex === globalIndex}
                        id={`search-result-${globalIndex}`}
                        aria-label={`${result.title}${result.description ? `, ${result.description}` : ''}, categoria ${categoryLabels[result.category]}`}
                      >
                        <div className="flex items-center space-x-3">
                          {result.icon || categoryIcons[result.category]}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-text-primary truncate">
                              {result.title}
                            </div>
                            {result.description && (
                              <div className="text-xs text-text-muted truncate">
                                {result.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-2">
              {recentSearches.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-text-muted uppercase tracking-wide border-b border-border">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Buscas Recentes
                  </div>
                  {recentSearches.map((recentQuery) => (
                    <button
                      key={index}
                      onClick={() => handleRecentSearchClick(recentQuery)}
                      className="w-full text-left px-4 py-3 hover:bg-surface-hover transition-colors focus:outline-none focus:bg-surface-hover focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 focus:ring-offset-background"
                    >
                      <div className="flex items-center space-x-3">
                        <Clock className="w-4 h-4 text-text-muted" />
                        <span className="text-sm text-text-primary">{recentQuery}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              <div className="px-4 py-2 text-xs font-semibold text-text-muted uppercase tracking-wide border-b border-border">
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Sugestões
              </div>
              <div className="px-4 py-3 text-sm text-text-muted">
                Digite para buscar receitas, produtos, clientes...
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}