'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Plane,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import Logo from './Logo'

const navItems = [
  { href: '/admin', label: 'Painel', icon: <LayoutDashboard size={18} strokeWidth={1.5} /> },
  { href: '/admin/clients', label: 'Clientes', icon: <Users size={18} strokeWidth={1.5} /> },
  { href: '/admin/trips', label: 'Viagens', icon: <Plane size={18} strokeWidth={1.5} /> },
  { href: '/admin/settings', label: 'Configurações', icon: <Settings size={18} strokeWidth={1.5} /> },
]

interface AdminSidebarProps {
  userEmail?: string
}

export default function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-brand-border">
        <Logo size="md" />
        <div className="mt-2">
          <span className="font-cinzel text-[10px] text-brand-gold tracking-widest uppercase">
            Painel Administrativo
          </span>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                'font-inter text-sm transition-all duration-150',
                isActive
                  ? 'bg-brand-hover text-brand-gold-dark font-medium border-l-2 border-brand-gold'
                  : 'text-brand-text hover:bg-brand-bg hover:text-brand-title'
              )}
            >
              <span className={cn(isActive ? 'text-brand-gold' : 'text-brand-muted')}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Rodapé */}
      <div className="px-4 py-4 border-t border-brand-border">
        {userEmail && (
          <p className="font-inter text-xs text-brand-muted truncate mb-3">
            {userEmail}
          </p>
        )}
        <button
          onClick={handleLogout}
          className="
            flex items-center gap-2 w-full px-3 py-2
            font-inter text-sm text-brand-muted
            hover:text-brand-error hover:bg-red-50
            rounded-lg transition-all
          "
        >
          <LogOut size={16} strokeWidth={1.5} />
          Sair
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white border-r border-brand-border fixed left-0 top-0 bottom-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile: botão hamburguer */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2.5 bg-white rounded-lg shadow-soft border border-brand-border text-brand-text"
        >
          {mobileOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
        </button>
      </div>

      {/* Mobile: drawer */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-brand-title/30 backdrop-blur-sm z-40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-brand-border z-50 flex flex-col shadow-card">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  )
}
