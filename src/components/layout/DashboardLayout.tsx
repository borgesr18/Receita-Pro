'use client';

import { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useSkipLinks } from '@/components/ui/SkipLinks';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { addSkipTarget } = useSkipLinks();

  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  // Setup skip link targets
  useEffect(() => {
    const mainContent = document.getElementById('main-content');
    const navigation = document.getElementById('navigation');
    const search = document.getElementById('search');
    const footer = document.getElementById('footer');
    
    addSkipTarget('main-content', mainContent);
    addSkipTarget('navigation', navigation);
    addSkipTarget('search', search);
    addSkipTarget('footer', footer);
  }, [addSkipTarget]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Sidebar 
        isOpen={isMobileMenuOpen} 
        onClose={handleMenuClose}
      />
      
      <div className="lg:ml-64 transition-all duration-300">
        <Header 
          onMenuClick={handleMenuToggle}
          isMobileMenuOpen={isMobileMenuOpen}
        />
        
        <main 
          id="main-content"
          className="p-4 lg:p-6 min-h-[calc(100vh-160px)]"
          role="main"
          aria-label="Conteúdo principal"
          tabIndex={-1}
        >
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}

