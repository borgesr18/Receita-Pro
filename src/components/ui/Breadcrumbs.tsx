'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav 
      className={`flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 ${className}`}
      aria-label="Breadcrumb"
    >
      {/* Home link */}
      <Link 
        href="/dashboard" 
        className="flex items-center hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        aria-label="Início"
      >
        <Home className="w-4 h-4" />
      </Link>
      
      {items.length > 0 && (
        <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
      )}
      
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <React.Fragment key={index}>
            {item.href && !isLast ? (
              <Link 
                href={item.href}
                className="flex items-center space-x-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                {item.icon && (
                  <span className="w-4 h-4">{item.icon}</span>
                )}
                <span>{item.label}</span>
              </Link>
            ) : (
              <span 
                className={`flex items-center space-x-1 ${
                  isLast 
                    ? 'text-gray-900 dark:text-gray-100 font-medium' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.icon && (
                  <span className="w-4 h-4">{item.icon}</span>
                )}
                <span>{item.label}</span>
              </span>
            )}
            
            {!isLast && (
              <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

// Hook para gerar breadcrumbs automaticamente baseado na rota
export function useBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  
  const breadcrumbs: BreadcrumbItem[] = [];
  
  segments.forEach((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    
    // Mapear segmentos para labels mais amigáveis
    const labelMap: Record<string, string> = {
      'dashboard': 'Dashboard',
      'receitas': 'Receitas',
      'producao': 'Produção',
      'estoque': 'Estoque',
      'vendas': 'Vendas',
      'relatorios': 'Relatórios',
      'configuracoes': 'Configurações',
      'usuarios': 'Usuários',
      'ingredientes': 'Ingredientes',
      'produtos': 'Produtos',
      'clientes': 'Clientes',
      'fornecedores': 'Fornecedores',
      'financeiro': 'Financeiro',
      'novo': 'Novo',
      'editar': 'Editar',
      'detalhes': 'Detalhes'
    };
    
    const label = labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    
    breadcrumbs.push({
      label,
      href: index === segments.length - 1 ? undefined : href
    });
  });
  
  return breadcrumbs;
}