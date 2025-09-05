'use client'

import React, { useEffect, useRef, useCallback } from 'react'
import { X } from 'lucide-react'
// import { useTheme } from '@/hooks/useTheme';

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true
}) => {
  // const { theme } = useTheme();
  const modalRef = useRef<HTMLDivElement>(null)

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose, closeOnEscape])

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Focus trap implementation
  const focusableElementsSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  
  const getFocusableElements = useCallback(() => {
    if (!modalRef.current) return []
    return Array.from(modalRef.current.querySelectorAll(focusableElementsSelector))
      .filter(el => !el.hasAttribute('disabled') && el.getAttribute('tabindex') !== '-1')
  }, [])

  const handleTabKey = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Tab') return
    
    const focusableElements = getFocusableElements()
    if (focusableElements.length === 0) return
    
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }
  }, [getFocusableElements])

  // Focus management and keyboard navigation
  useEffect(() => {
    if (!isOpen) return
    
    const previousActiveElement = document.activeElement as HTMLElement
    
    // Focus first focusable element or modal itself
    const focusableElements = getFocusableElements()
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus()
    } else if (modalRef.current) {
      modalRef.current.focus()
    }
    
    // Add tab key listener for focus trap
    document.addEventListener('keydown', handleTabKey)
    
    return () => {
      document.removeEventListener('keydown', handleTabKey)
      // Restore focus to previous element
      if (previousActiveElement && previousActiveElement.focus) {
        previousActiveElement.focus()
      }
    }
  }, [isOpen, handleTabKey, getFocusableElements])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div
        ref={modalRef}
        className={`
          relative w-full ${sizeClasses[size]} mx-4 max-h-[90vh] overflow-hidden
          bg-background border-border
          rounded-2xl border shadow-2xl
          transform transition-all duration-300 ease-out
          animate-in fade-in-0 zoom-in-95
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        tabIndex={-1}
        onKeyDown={(e) => {
          // Additional keyboard shortcuts
          if (e.key === 'Escape' && closeOnEscape) {
            e.preventDefault()
            onClose()
          }
        }}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-border">
            {title && (
              <h2 
                id="modal-title"
                className="text-xl font-semibold text-text-primary"
              >
                {title}
              </h2>
            )}
            
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg transition-colors text-text-muted hover:text-text-primary hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 focus:ring-offset-background"
                aria-label="Fechar modal"
                autoFocus={!title} // Focus close button if no title
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-8rem)]">
          {children}
        </div>
      </div>
    </div>
  )
}

// Modal content components
export const ModalHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="p-6 border-b border-border">
      {children}
    </div>
  )
}

export const ModalBody: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="p-6">
      {children}
    </div>
  )
}

export const ModalFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
      {children}
    </div>
  )
}

// Hook for modal state management
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = React.useState(initialState)
  
  const openModal = React.useCallback(() => setIsOpen(true), [])
  const closeModal = React.useCallback(() => setIsOpen(false), [])
  const toggleModal = React.useCallback(() => setIsOpen(prev => !prev), [])
  
  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal
  }
}