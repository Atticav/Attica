import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Attica Viagens – Studio de Viagens',
  description: 'Plataforma exclusiva de concierge de viagens da Attica Viagens. Seu caderno de viagem personalizado.',
  keywords: 'viagens, concierge, planejamento de viagem, attica viagens',
  authors: [{ name: 'Attica Studio de Viagens' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Attica',
  },
  openGraph: {
    title: 'Attica Viagens – Studio de Viagens',
    description: 'Plataforma exclusiva de concierge de viagens da Attica Viagens.',
    locale: 'pt_BR',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Cinzel:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#C4A97D" />
        <link rel="apple-touch-icon" href="/icons/icon-180x180.png" />
      </head>
      <body>{children}</body>
    </html>
  )
}
