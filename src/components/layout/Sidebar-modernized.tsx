'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Settings, 
  Package, 
  ShoppingCart, 
  FileText, 
  Calculator, 
  DollarSign, 
  Factory, 
  Warehouse, 
  TrendingUp, 
  BarChart3, 
  Printer,
  ChefHat
} from 'lucide-react'

const menuItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
  { href: '/insumos', label: 'Insumos', icon: Package },
  { href: '/produtos', label: 'Produtos', icon: ShoppingCart },
  { href: '/fichas-tecnicas', label: 'Fichas Técnicas', icon: FileText },
  { href: '/calculo-receita', label: 'Cálculo de Receita', icon: Calculator },
  { href: '/calculo-preco', label: 'Cálculo de Preço', icon: DollarSign },
  { href: '/producao', label: 'Produção', icon: Factory },
  { href: '/estoque', label: 'Estoque', icon: Warehouse },
  { href: '/vendas', label: 'Vendas', icon: TrendingUp },
  { href: '/relatorios', label: 'Relatórios', icon: BarChart3 },
  { href: '/impressao', label: 'Impressão', icon: Printer },
]

export default function Sidebar() {
  const pathname = usePathname()
  
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white/80 backdrop-blur-md border-r border-white/20 z-40 shadow-2xl">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <ChefHat className="text-white" size={20} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Receita Pro</h2>
              <p className="text-xs text-gray-500">Sistema de Gestão</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25' 
                    : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon 
                    size={18} 
                    className={`transition-all duration-300 ${
                      isActive 
                        ? 'text-white' 
                        : 'text-gray-400 group-hover:text-blue-600 group-hover:scale-110'
                    }`}
                  />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                {isActive && (
                  <div className="absolute right-0 w-1 h-8 bg-white rounded-l-full shadow-lg"></div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/20">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200/50">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700">Sistema Online</span>
            </div>
            <p className="text-xs text-green-600">Última sincronização: agora</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

