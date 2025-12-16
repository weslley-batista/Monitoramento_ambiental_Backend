import type { Metadata } from 'next'
import './globals.css'
import Toaster from '@/components/Toaster'
import QueryProvider from '@/components/QueryProvider'

export const metadata: Metadata = {
  title: 'Monitoramento Ambiental',
  description: 'Sistema de Monitoramento Ambiental em Tempo Real',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  )
}

