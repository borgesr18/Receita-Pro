'use client'
import React, { useState } from 'react'
import { Bell, User, Settings, LogOut, Search, ChevronDown } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'

export default function Header() {
  const { user, signOut } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-white/20 z-50 shadow-lg">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left Section */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">RP</span>
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Receita Pro
              </h1>
            </div>
          </div>
          
          <div className="hidden md:block text-sm text-gray-600 border-l border-gray-200 pl-6">
            Sistema de Gestão para Panificação
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="hidden lg:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Buscar receitas, insumos, produtos..."
              className="w-full pl-10 pr-4 py-2 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all shadow-sm"
            />
          </div>
        </div>
        
        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 group">
            <Bell size={18} className="group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center shadow-lg animate-pulse">
              3
            </span>
          </button>

          {/* Settings */}
          <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 group">
            <Settings size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>

          {/* User Menu */}
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-xl transition-all duration-200"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <User size={16} className="text-white" />
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-gray-900">
                  {user?.email?.split('@')[0] || 'teste'}
                </div>
                <div className="text-xs text-gray-500">Administrador</div>
              </div>
              <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.email?.split('@')[0] || 'teste'}
                  </div>
                  <div className="text-xs text-gray-500">{user?.email || 'teste@receitas.com'}</div>
                </div>
                
                <button className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group">
                  <User size={16} className="text-gray-500 group-hover:text-blue-600" />
                  <span>Perfil</span>
                </button>
                
                <button className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group">
                  <Settings size={16} className="text-gray-500 group-hover:text-blue-600" />
                  <span>Configurações</span>
                </button>
                
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button 
                    onClick={signOut}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-200 group"
                  >
                    <LogOut size={16} className="group-hover:scale-110 transition-transform" />
                    <span>Sair</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

