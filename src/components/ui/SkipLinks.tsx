'use client'

import React from 'react'
// import { useTheme } from '@/hooks/useTheme';

export interface SkipLinksProps {
  links?: Array<{
    href: string
    label: string
  }>
}

const defaultLinks = [
  { href: '#main-content', label: 'Pular para conteúdo principal' },
  { href: '#navigation', label: 'Pular para navegação' },
  { href: '#search', label: 'Pular para busca' },
  { href: '#footer', label: 'Pular para rodapé' }
]

export const SkipLinks: React.FC<SkipLinksProps> = ({ 
  links = defaultLinks 
}) => {
  // const { theme } = useTheme();
  
  return (
    <div className="sr-only focus-within:not-sr-only">
      <nav 
        aria-label="Links de navegação rápida"
        className="fixed top-0 left-0 z-[9999] bg-background border border-border rounded-br-lg shadow-lg"
      >
        <ul className="flex flex-col p-2 space-y-1">
          {links.map((link, index) => (
            <li key={index}>
              <a
                href={link.href}
                className="
                  block px-4 py-2 text-sm font-medium rounded-md
                  transition-colors duration-200
                  text-text-primary bg-surface hover:bg-surface-hover
                  focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 focus:ring-offset-background
                  focus:bg-focus-bg
                "
                onFocus={(e) => {
                  // Ensure the skip link is visible when focused
                  e.currentTarget.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'nearest' 
                  })
                }}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

// Hook for managing skip link targets
export const useSkipLinks = () => {
  const addSkipTarget = React.useCallback((id: string, element: HTMLElement | null) => {
    if (!element) return
    
    // Ensure the element has the correct id
    element.id = id
    
    // Make sure the element is focusable for skip links
    if (!element.hasAttribute('tabindex')) {
      element.setAttribute('tabindex', '-1')
    }
    
    // Add focus styles for skip link targets
    element.addEventListener('focus', () => {
      element.style.outline = '2px solid var(--color-focus-ring)'
      element.style.outlineOffset = '2px'
      element.style.backgroundColor = 'var(--color-focus-bg)'
    })
    
    element.addEventListener('blur', () => {
      element.style.outline = 'none'
      element.style.outlineOffset = '0'
      element.style.backgroundColor = 'transparent'
    })
  }, [])
  
  return { addSkipTarget }
}