import React from 'react'
import { AlertCircle } from 'lucide-react'

interface ErrorMessageProps {
  message: string
  className?: string
}

export function ErrorMessage({ message, className = '' }: ErrorMessageProps) {
  return (
    <div className={`flex items-center space-x-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 ${className}`}>
      <AlertCircle size={16} />
      <span className="text-sm">{message}</span>
    </div>
  )
}
