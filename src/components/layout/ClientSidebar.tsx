'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Map,
  DollarSign,
  FileText,
  Luggage,
  CheckSquare,
  Compass,
  PlayCircle,
  ImageIcon,
  UtensilsCrossed,
  Camera,
  Globe,
  BookOpen,
  ScrollText,
  ChevronDown,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import Logo from './Logo'
import type { Trip } from '@/lib/types'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

function buildNavItems(tripId: string): NavItem[] {
  const base = `/dashboard/${tripId}`
  return [
    { href: `/dashboard`, label: 'Início', icon: <LayoutDashboard size={18} /> },
    { href: `${base}/itinerary`, label: 'Roteiro', icon: <Map size={18} /> },
    { href: `${base}/financial`, label: 'Financeiro', icon: <DollarSign size={18} /> },
    { href: `${base}/documents`, label: 'Documentos', icon: <FileText size={18} /> },
    { href: `${base}/packing`, label: 'Mala Inteligente', icon: <Luggage size={18} /> },
    { href: `${base}/checklist`, label: 'Checklist', icon: <CheckSquare size={18} /> },
    { href: `${base}/strategic`, label: 'Central Estratégica', icon: <Compass size={18} /> },
    { href: `${base}/guide`, label: 'Guia Attica', icon: <PlayCircle size={18} /> },
    { href: `${base}/gallery`, label: 'Galeria', icon: <ImageIcon size={18} /> },
    { href: `${base}/restaurants`, label: 'Restaurantes', icon: <UtensilsCrossed size={18} /> },
    { href: `${base}/photography`, label: 'Fotografia', icon: <Camera size={18} /> },
    { href: `${base}/culture`, label: 'Cultura', icon: <Globe size={18} /> },
    { href: `${base}/vocabulary`, label: 'Vocabulário', icon: <BookOpen size={18} /> },
    { href: `${base}/contract`, label: 'Contrato', icon: <ScrollText size={18} /> },
  ]
}

const dashboardOnlyNav: NavItem[] = [
  { href: `/dashboard`, label: 'Início', icon: <LayoutDashboard size={18} /> },
]

interface ClientSidebarProps {
  trips: Trip[]
  currentTripId?: string
  userEmail?: string
}

export default function ClientSidebar({
  trips,
  currentTripId,
  userEmail,
}: ClientSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [tripDropdownOpen, setTripDropdownOpen] = useState(false)

  // Auto-detect tripId from URL when not provided as prop
  const pathSegments = pathname.split('/')
  const effectiveTripId = currentTripId || (pathSegments.length >= 3 && pathSegments[2] ? pathSegments[2] : undefined)

  const currentTrip = trips.find((t) => t.id === effectiveTripId)
  const navItems = effectiveTripId ? buildNavItems(effectiveTripId) : dashboardOnlyNav

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
      </div>

      {/* Seletor de viagem */}
      {trips.length > 0 && (
        <div className="px-4 py-4 border-b border-brand-border">
          <button
            onClick={() => setTripDropdownOpen(!tripDropdownOpen)}
            className="
              w-full flex items-center justify-between
              px-3 py-2.5 rounded-lg
              bg-brand-bg-secondary border border-brand-border
              hover:border-brand-gold transition-all
            "
          >
            <div className="text-left min-w-0">
              <p className="font-inter text-xs text-brand-muted mb-0.5">Viagem atual</p>
              <p className="font-lora text-sm text-brand-title font-medium truncate">
                {currentTrip?.title ?? 'Selecione uma viagem'}
              </p>
            </div>
            <ChevronDown
              size={16}
              className={cn(
                'text-brand-muted flex-shrink-0 ml-2 transition-transform',
                tripDropdownOpen && 'rotate-180'
              )}
            />
          </button>

          {tripDropdownOpen && (
            <div className="mt-2 bg-white border border-brand-border rounded-lg shadow-soft overflow-hidden">
              {trips.map((trip) => (
                <button
                  key={trip.id}
                  onClick={() => {
                    router.push(`/dashboard/${trip.id}/itinerary`)
                    setTripDropdownOpen(false)
                    setMobileOpen(false)
                  }}
                  className={cn(
                    'w-full text-left px-4 py-2.5 font-lora text-sm transition-colors',
                    trip.id === effectiveTripId
                      ? 'bg-brand-hover text-brand-gold-dark font-medium'
                      : 'text-brand-text hover:bg-brand-bg'
                  )}
                >
                  {trip.title}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Navegação */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
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
              <span
                className={cn(
                  isActive ? 'text-brand-gold' : 'text-brand-muted'
                )}
              >
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
          <LogOut size={16} />
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
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
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
