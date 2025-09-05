import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { ConditionalLayout } from '@/components/ConditionalLayout'
import { ToastProvider } from '@/components/ui/Toast'
import { SkipLinks } from '@/components/ui/SkipLinks'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Receita Pro',
  description: 'Sistema de gestão para panificação',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.className} transition-colors`} suppressHydrationWarning>
        <SkipLinks />
        <ToastProvider>
          <AuthProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
