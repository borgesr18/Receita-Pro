'use client'

import { useEffect, useCallback } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

interface ToastProps {
  id: string
  type: 'success' | 'error' | 'warning'
  message: string
  onClose: (id: string) => void
}

export default function Toast({ id, type, message, onClose }: ToastProps) {
  const handleClose = useCallback(() => {
    onClose(id)
  }, [id, onClose])

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose()
    }, 5000)

    return () => clearTimeout(timer)
  }, [handleClose])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      default:
        return <CheckCircle className="w-5 h-5 text-green-600" />
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-green-50 border-green-200'
    }
  }

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800'
      case 'error':
        return 'text-red-800'
      case 'warning':
        return 'text-yellow-800'
      default:
        return 'text-green-800'
    }
  }

  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border shadow-lg ${getBackgroundColor()} animate-slide-in`}>
      {getIcon()}
      <p className={`flex-1 text-sm font-medium ${getTextColor()}`}>
        {message}
      </p>
      <button
        onClick={handleClose}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}


