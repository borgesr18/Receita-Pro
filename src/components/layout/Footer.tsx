'use client';

import React from 'react';
import { Heart } from 'lucide-react';

interface FooterProps {
  className?: string;
}

export default function Footer({ className = '' }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      id="footer"
      className={`bg-background border-t border-border py-6 px-4 lg:px-6 ${className}`}
      role="contentinfo"
      aria-label="Rodapé do site"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Logo e Descrição */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">RP</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Receita Pro</h3>
              <p className="text-xs text-text-muted">Sistema de Gestão para Panificação</p>
            </div>
          </div>

          {/* Links Úteis */}
          <nav className="flex flex-wrap justify-center gap-6" aria-label="Links do rodapé">
            <a 
              href="/ajuda" 
              className="text-sm text-text-secondary hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 focus:ring-offset-background"
            >
              Ajuda
            </a>
            <a 
              href="/suporte" 
              className="text-sm text-text-secondary hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 focus:ring-offset-background"
            >
              Suporte
            </a>
            <a 
              href="/privacidade" 
              className="text-sm text-text-secondary hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 focus:ring-offset-background"
            >
              Privacidade
            </a>
            <a 
              href="/termos" 
              className="text-sm text-text-secondary hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 focus:ring-offset-background"
            >
              Termos
            </a>
          </nav>

          {/* Copyright */}
          <div className="flex items-center space-x-1 text-xs text-text-muted">
            <span>© {currentYear} Receita Pro. Feito com</span>
            <Heart className="w-3 h-3 text-red-500 fill-current" aria-label="amor" />
            <span>para panificadores.</span>
          </div>
        </div>

        {/* Informações de Acessibilidade */}
        <div className="mt-4 pt-4 border-t border-border text-center">
          <p className="text-xs text-text-muted">
            Este site foi desenvolvido seguindo as diretrizes de acessibilidade WCAG 2.1 AA.
            <br />
            Use Tab para navegar, Enter para selecionar e Esc para fechar modais.
          </p>
        </div>
      </div>
    </footer>
  );
}