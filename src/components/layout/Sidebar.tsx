'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  ChevronDown,
  FileText,
  Calculator,
  Truck,
  ClipboardList,
  PieChart,
  Printer,
  X,
  ChefHat,
  Factory,
  Warehouse,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui';

const menuItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
  { href: '/insumos', label: 'Insumos', icon: Package },
  { href: '/produtos', label: 'Produtos', icon: ShoppingCart },
  { href: '/fichas-tecnicas', label: 'Fichas Técnicas', icon: FileText },
  { href: '/calculo-receita', label: 'Cálculo de Receita', icon: Calculator },
  { href: '/calculo-preco', label: 'Cálculo de Preço', icon: Calculator },
  { href: '/producao', label: 'Produção', icon: Factory },
  { href: '/estoque', label: 'Estoque', icon: Warehouse },
  { href: '/vendas', label: 'Vendas', icon: TrendingUp },
  { href: '/relatorios', label: 'Relatórios', icon: BarChart3 },
  { href: '/impressao', label: 'Impressão', icon: Printer },
]

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const pathname = usePathname()
  
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-background 
        border-r border-border 
        h-screen overflow-y-auto
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Mobile Close Button */}
        <div className="lg:hidden flex justify-end p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-text-primary rounded-xl flex items-center justify-center">
                <ChefHat className="text-white" size={20} />
              </div>
              <div>
                <h2 className="font-semibold text-text-primary text-sm">Receita Pro</h2>
                <p className="text-xs text-text-muted">Sistema de Gestão</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav 
            id="navigation"
            className="flex-1 p-4 space-y-1 overflow-y-auto"
            role="navigation"
            aria-label="Menu principal"
            tabIndex={-1}
          >
            {/* Dashboard */}
            <Link
              href="/"
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 focus:ring-offset-background ${
                pathname === '/' 
                  ? 'bg-surface text-link border border-border shadow-sm' 
                  : 'text-text-primary hover:bg-surface-hover hover:text-text-primary'
              }`}
              onClick={() => onClose?.()}
            >
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>

            {/* Produtos */}
            <div>
              <button
                onClick={() => setIsProductsOpen(!isProductsOpen)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setIsProductsOpen(!isProductsOpen)
                  }
                  if (e.key === 'ArrowRight' && !isProductsOpen) {
                    e.preventDefault()
                    setIsProductsOpen(true)
                  }
                  if (e.key === 'ArrowLeft' && isProductsOpen) {
                    e.preventDefault()
                    setIsProductsOpen(false)
                  }
                }}
                className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium text-text-primary hover:bg-surface-hover hover:text-text-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 focus:ring-offset-background"
                aria-expanded={isProductsOpen}
                aria-controls="produtos-submenu"
              >
                <div className="flex items-center space-x-3">
                  <Package className="w-5 h-5" />
                  <span>Produtos</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isProductsOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProductsOpen && (
                <div 
                  id="produtos-submenu"
                  className="ml-6 mt-2 space-y-1 animate-in slide-in-from-top-2 duration-200"
                  role="menu"
                  aria-label="Menu de produtos"
                >
                  <Link
                    href="/produtos"
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 focus:ring-offset-background ${
                      pathname === '/produtos' 
                        ? 'bg-surface text-link border border-border' 
                        : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                    }`}
                    onClick={() => onClose?.()}
                    role="menuitem"
                  >
                    <span>Produtos</span>
                  </Link>
                  <Link
                    href="/insumos"
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 focus:ring-offset-background ${
                      pathname === '/insumos' 
                        ? 'bg-surface text-link border border-border' 
                        : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                    }`}
                    onClick={() => onClose?.()}
                    role="menuitem"
                  >
                    <span>Insumos</span>
                  </Link>
                  <Link
                    href="/fichas-tecnicas"
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 focus:ring-offset-background ${
                      pathname === '/fichas-tecnicas' 
                        ? 'bg-surface text-link border border-border' 
                        : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                    }`}
                    onClick={() => onClose?.()}
                    role="menuitem"
                  >
                    <span>Fichas Técnicas</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Estoque */}
            <Link
              href="/estoque"
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 focus:ring-offset-background ${
                pathname === '/estoque' 
                  ? 'bg-surface text-link border border-border shadow-sm' 
                  : 'text-text-primary hover:bg-surface-hover hover:text-text-primary'
              }`}
              onClick={() => onClose?.()}
            >
              <Package className="w-5 h-5" />
              <span>Estoque</span>
            </Link>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <div className="bg-surface rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-xs font-medium text-text-primary">Sistema Online</span>
              </div>
              <p className="text-xs text-text-muted">Última sincronização: agora</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}


