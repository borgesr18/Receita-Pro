'use client';

import { Search, Bell, User, Settings, LogOut, Sun, Moon, Menu } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui';
import { useAuth } from '@/components/AuthProvider';
import { GlobalSearch } from '@/components/ui';

interface HeaderProps {
  onMenuClick?: () => void;
  isMobileMenuOpen?: boolean;
}

export default function Header({ onMenuClick, isMobileMenuOpen }: HeaderProps) {
  const { user, signOut } = useAuth()
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  // supabase já está disponível do import
  const { theme, toggleTheme, mounted } = useTheme();

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  // Handle escape key to close dropdown
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isProfileOpen) {
        setIsProfileOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (isProfileOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isProfileOpen]);
  
  return (
    <header className="bg-background border-b border-border px-4 lg:px-6 py-4 transition-colors">
      <div className="flex items-center justify-between">
        {/* Mobile Menu Button + Logo */}
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden p-2"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">RP</span>
            </div>
            <h1 className="hidden sm:block text-xl font-bold text-text-primary">Receita Pro</h1>
          </div>
        </div>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex flex-1 max-w-lg mx-8">
          <GlobalSearch className="w-full" />
        </div>
        
        {/* Ações do Usuário */}
        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Theme Toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2 hidden sm:flex"
              aria-label={`Mudar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </Button>
          )}
          
          {/* Notificações */}
          <Button
            variant="ghost"
            size="sm"
            className="relative p-2 hidden sm:flex"
            aria-label="Notificações"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>

          {/* Menu do Usuário */}
          <div className="relative" ref={dropdownRef}>
            <Button
              ref={buttonRef}
              variant="ghost"
              size="sm"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 p-2 focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 focus:ring-offset-background"
              aria-label="Menu do usuário"
              aria-expanded={isProfileOpen}
              aria-haspopup="true"
            >
              <User className="w-5 h-5" />
              <span className="hidden lg:block text-sm font-medium">Admin</span>
            </Button>

            {isProfileOpen && (
              <div 
                className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg z-50 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu-button"
              >
                <div className="py-1">
                  {/* Theme Toggle Mobile */}
                  {mounted && (
                    <button 
                      onClick={toggleTheme}
                      className="flex items-center w-full px-4 py-2 text-sm text-text-primary hover:bg-surface-hover sm:hidden focus:outline-none focus:bg-surface-hover"
                      role="menuitem"
                    >
                      {theme === 'light' ? (
                        <Moon className="w-4 h-4 mr-3" />
                      ) : (
                        <Sun className="w-4 h-4 mr-3" />
                      )}
                      Tema {theme === 'light' ? 'Escuro' : 'Claro'}
                    </button>
                  )}
                  
                  <button 
                    className="flex items-center w-full px-4 py-2 text-sm text-text-primary hover:bg-surface-hover focus:outline-none focus:bg-surface-hover"
                    role="menuitem"
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Configurações
                  </button>
                  
                  <button 
                    onClick={signOut}
                    className="flex items-center w-full px-4 py-2 text-sm text-error hover:bg-error-bg focus:outline-none focus:bg-error-bg"
                    role="menuitem"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sair
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


