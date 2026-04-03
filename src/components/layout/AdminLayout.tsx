'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AtticaLogo } from '@/components/AtticaLogo';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, MapPin, LogOut, Menu, X, Settings
} from 'lucide-react';

const adminNavItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/clientes', icon: Users, label: 'Clientes' },
  { href: '/admin/viagens', icon: MapPin, label: 'Viagens' },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const SidebarContent = () => (
    <aside className="flex flex-col h-full bg-white border-r border-[#E5DDD5] w-64">
      <div className="flex items-center justify-between p-5 border-b border-[#E5DDD5]">
        <AtticaLogo size="sm" />
        <span className="text-xs font-inter bg-[#F5EDE8] text-[#8B7355] px-2 py-0.5 rounded-full">Admin</span>
      </div>
      <nav className="flex-1 py-4 px-3">
        <ul className="space-y-0.5">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    isActive ? 'bg-[#F5EDE8] text-[#8B7355]' : 'text-[#4A4A4A] hover:bg-[#FAF6F3] hover:text-[#8B7355]'
                  }`}
                >
                  <item.icon size={16} strokeWidth={1.5} className={isActive ? 'text-[#C4A97D]' : 'text-[#9C9C9C]'} />
                  <span className="font-inter text-sm font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
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

  return (
    <div className="flex h-screen bg-[#FAF6F3] overflow-hidden">
      <div className="hidden lg:flex flex-shrink-0"><SidebarContent /></div>
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-50 h-full"><SidebarContent /></div>
        </div>
      )}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-[#E5DDD5]">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-[#E8DDD5]">
            <Menu size={20} strokeWidth={1.5} />
          </button>
          <span className="font-cinzel text-base font-bold text-[#2D2D2D] tracking-widest">ATTICA Admin</span>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
