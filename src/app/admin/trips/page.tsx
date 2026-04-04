'use client'

import { useState, useEffect, useCallback } from 'react'
import Card from '@/components/ui/Card'
import { ToastContainer } from '@/components/ui/Toast'
import { Plane, Plus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Trip {
  id: string
  title: string
  destination: string
  status: string
  start_date: string | null
  end_date: string | null
  client_id: string
  profile?: { id: string; full_name: string | null; email: string } | null
}

export default function AdminTripsPage() {
  const router = useRouter()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([])

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type }])
  }

  const loadTrips = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/trips')
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setTrips(data)
    } catch {
      addToast('Erro ao carregar viagens', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadTrips() }, [loadTrips])

  const filteredTrips = statusFilter ? trips.filter(t => t.status === statusFilter) : trips

  const statusLabels: Record<string, string> = {
    planning: 'Planejamento',
    confirmed: 'Confirmada',
    in_progress: 'Em andamento',
    completed: 'Concluída',
    cancelled: 'Cancelada',
  }

  const statusColors: Record<string, string> = {
    planning: 'bg-amber-50 text-amber-700',
    confirmed: 'bg-brand-bg-secondary text-brand-gold-dark',
    in_progress: 'bg-green-50 text-green-700',
    completed: 'bg-gray-100 text-gray-600',
    cancelled: 'bg-red-50 text-red-600',
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-cormorant text-4xl font-semibold text-brand-title">Viagens</h1>
          <p className="font-outfit text-brand-muted mt-1">Todas as viagens dos clientes</p>
        </div>
        <Link
          href="/admin/clients"
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-gold text-white rounded-lg font-inter text-sm font-medium hover:bg-brand-gold-dark transition-colors"
        >
          <Plus size={16} strokeWidth={1.5} />
          Nova Viagem
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-3 flex-wrap">
        {['', 'planning', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-full font-inter text-xs transition-all ${
              statusFilter === status
                ? 'bg-brand-gold text-white'
                : 'bg-white border border-brand-border text-brand-muted hover:text-brand-gold hover:border-brand-gold/50'
            }`}
          >
            {status === '' ? 'Todas' : statusLabels[status]}
          </button>
        ))}
      </div>

      <Card padding="none">
        {loading ? (
          <div className="p-8 text-center font-outfit text-brand-muted">Carregando...</div>
        ) : filteredTrips.length === 0 ? (
          <div className="p-8 text-center">
            <Plane size={40} strokeWidth={1.3} className="text-brand-gold mx-auto mb-3" />
            <p className="font-cormorant text-xl text-brand-title">Nenhuma viagem encontrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-brand-border">
                  <th className="text-left px-6 py-3 font-inter text-xs text-brand-muted uppercase tracking-wider">Título</th>
                  <th className="text-left px-6 py-3 font-inter text-xs text-brand-muted uppercase tracking-wider hidden md:table-cell">Destino</th>
                  <th className="text-left px-6 py-3 font-inter text-xs text-brand-muted uppercase tracking-wider hidden lg:table-cell">Cliente</th>
                  <th className="text-left px-6 py-3 font-inter text-xs text-brand-muted uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 font-inter text-xs text-brand-muted uppercase tracking-wider hidden xl:table-cell">Datas</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrips.map((trip) => (
                  <tr
                    key={trip.id}
                    className="border-b border-brand-border last:border-0 hover:bg-brand-bg transition-colors cursor-pointer"
                    onClick={() => router.push(`/admin/trips/${trip.id}`)}
                  >
                    <td className="px-6 py-4 font-inter text-sm text-brand-title">{trip.title}</td>
                    <td className="px-6 py-4 font-outfit text-sm text-brand-muted hidden md:table-cell">{trip.destination}</td>
                    <td className="px-6 py-4 font-outfit text-sm text-brand-muted hidden lg:table-cell">
                      {trip.profile?.full_name || trip.profile?.email || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full font-inter text-xs ${statusColors[trip.status] || 'bg-gray-100 text-gray-600'}`}>
                        {statusLabels[trip.status] || trip.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-inter text-xs text-brand-muted hidden xl:table-cell">
                      {trip.start_date ? new Date(trip.start_date).toLocaleDateString('pt-BR') : '—'}
                      {trip.end_date ? ` — ${new Date(trip.end_date).toLocaleDateString('pt-BR')}` : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ToastContainer toasts={toasts} onRemove={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
    </div>
  )
}
