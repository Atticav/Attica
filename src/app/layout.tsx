import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Attica Studio de Viagens',
  description: 'Plataforma de concierge de viagens premium',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-[#FAF6F3] text-[#4A4A4A] antialiased">
        {children}
      </body>
    </html>
  );
}
