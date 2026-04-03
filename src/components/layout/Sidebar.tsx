'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Calendar, DollarSign, FileText, ShoppingBag,
  CheckSquare, Compass, Play, Image, UtensilsCrossed,
  Camera, BookOpen, Languages, FileSignature, LogOut, Menu, X
} from 'lucide-react';
import { AtticaLogo } from '@/components/AtticaLogo';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Painel Principal' },
  { href: '/dashboard/itinerario', icon: Calendar, label: 'Itinerário' },
  { href: '/dashboard/financeiro', icon: DollarSign, label: 'Financeiro' },
  { href: '/dashboard/documentos', icon: FileText, label: 'Documentos' },
  { href: '/dashboard/mala', icon: ShoppingBag, label: 'Mala Inteligente' },
  { href: '/dashboard/checklist', icon: CheckSquare, label: 'Checklist' },
  { href: '/dashboard/central-estrategica', icon: Compass, label: 'Central Estratégica' },
  { href: '/dashboard/guia', icon: Play, label: 'Guia em Vídeo' },
  { href: '/dashboard/galeria', icon: Image, label: 'Galeria' },
  { href: '/dashboard/restaurantes', icon: UtensilsCrossed, label: 'Restaurantes' },
  { href: '/dashboard/dicas-fotografia', icon: Camera, label: 'Dicas de Fotografia' },
  { href: '/dashboard/cultura', icon: BookOpen, label: 'Cultura Local' },
  { href: '/dashboard/palavras', icon: Languages, label: 'Palavras Essenciais' },
  { href: '/dashboard/contrato', icon: FileSignature, label: 'Contrato' },
];

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobile = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <aside className={`flex flex-col h-full bg-white border-r border-[#E5DDD5] ${mobile ? 'w-72' : 'w-64'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-[#E5DDD5]">
        <AtticaLogo size="sm" />
        {mobile && onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#E8DDD5] transition-colors">
            <X size={18} strokeWidth={1.5} className="text-[#4A4A4A]" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-[#F5EDE8] text-[#8B7355]'
                      : 'text-[#4A4A4A] hover:bg-[#FAF6F3] hover:text-[#8B7355]'
                  }`}
                >
                  <item.icon
                    size={16}
                    strokeWidth={1.5}
                    className={`flex-shrink-0 ${isActive ? 'text-[#C4A97D]' : 'text-[#9C9C9C] group-hover:text-[#C4A97D]'}`}
                  />
                  <span className="font-inter text-sm font-medium">{item.label}</span>
                  {isActive && <div className="ml-auto w-1 h-4 bg-[#C4A97D] rounded-full" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-[#E5DDD5]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[#4A4A4A] hover:bg-[#FAF6F3] hover:text-[#C17B6E] transition-colors"
        >
          <LogOut size={16} strokeWidth={1.5} />
          <span className="font-inter text-sm">Sair</span>
        </button>
      </div>
    </aside>
  );
}
