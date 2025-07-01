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
  { href: '/', label: 'Dashboard', icon: Home, badge: '5' },
  { href: '/configuracoes', label: 'Configurações', icon: Settings, badge: '8' },
  { href: '/insumos', label: 'Insumos', icon: Package, badge: '7' },
  { href: '/produtos', label: 'Produtos', icon: ShoppingCart, badge: '8' },
  { href: '/fichas-tecnicas', label: 'Fichas Técnicas', icon: FileText, badge: '9' },
  { href: '/calculo-receita', label: 'Cálculo de Receita', icon: Calculator, badge: '10' },
  { href: '/calculo-preco', label: 'Cálculo de Preço', icon: DollarSign, badge: '11' },
  { href: '/producao', label: 'Produção', icon: Factory, badge: '12' },
  { href: '/estoque', label: 'Estoque', icon: Warehouse, badge: '13' },
  { href: '/vendas', label: 'Vendas', icon: TrendingUp, badge: '14' },
  { href: '/relatorios', label: 'Relatórios', icon: BarChart3, badge: '15' },
  { href: '/impressao', label: 'Impressão', icon: Printer, badge: '16' },
]

export default function Sidebar() {
  const pathname = usePathname()
  
  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 z-40 shadow-sm">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
              <ChefHat className="text-white" size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">Receita Pro</h2>
              <p className="text-xs text-gray-500">Sistema de Gestão</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-gray-900 text-white shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon 
                    size={18} 
                    className={`transition-colors ${
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
                    }`}
                  />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                
                {/* Badge */}
                <span className={`inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full transition-colors ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                }`}>
                  {item.badge}
                </span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs font-medium text-gray-700">Sistema Online</span>
            </div>
            <p className="text-xs text-gray-500">
              Última sincronização: agora
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}

