'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  
  if (pathname === '/login') {
    return <>{children}</>
  }
  
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  )
}
