'use client'

import { useState, useEffect, useCallback } from 'react'
import { use } from 'react'
import Card from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import { ToastContainer } from '@/components/ui/Toast'
import { ArrowLeft, Plus, Edit2, Plane } from 'lucide-react'
import Link from 'next/link'

interface Client {
  id: string
  full_name: string | null
  email: string
  phone: string | null
  created_at: string
}

interface Trip {
  id: string
  title: string
  destination: string
  status: string
  start_date: string | null
  end_date: string | null
  client_id: string
}

export default function ClientDetailPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = use(params)
  const [client, setClient] = useState<Client | null>(null)
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [tripModalOpen, setTripModalOpen] = useState(false)
  const [tripForm, setTripForm] = useState({ title: '', destination: '', country: '', start_date: '', end_date: '', status: 'planning' })
  const [saving, setSaving] = useState(false)
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([])

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type }])
  }

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [clientRes, tripsRes] = await Promise.all([
        fetch(`/api/admin/clients/${clientId}`),
        fetch(`/api/admin/trips`),
      ])
      if (clientRes.ok) setClient(await clientRes.json())
      if (tripsRes.ok) {
        const allTrips = await tripsRes.json()
        setTrips(allTrips.filter((t: Trip) => t.client_id === clientId))
      }
    } catch {
      addToast('Erro ao carregar dados', 'error')
    } finally {
      setLoading(false)
    }
  }, [clientId])

  useEffect(() => { loadData() }, [loadData])

  async function handleCreateTrip() {
    if (!tripForm.title || !tripForm.destination) {
      addToast('Título e destino são obrigatórios', 'error')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...tripForm, client_id: clientId }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erro ao criar viagem')
      }
      addToast('Viagem criada!', 'success')
      setTripModalOpen(false)
      setTripForm({ title: '', destination: '', country: '', start_date: '', end_date: '', status: 'planning' })
      loadData()
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : 'Erro ao criar viagem', 'error')
    } finally {
      setSaving(false)
    }
  }

  const statusLabels: Record<string, string> = {
    planning: 'Planejamento',
    confirmed: 'Confirmada',
    in_progress: 'Em andamento',
    completed: 'Concluída',
    cancelled: 'Cancelada',
  }

  if (loading) {
    return <div className="p-8 text-center font-outfit text-brand-muted">Carregando...</div>
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/clients" className="flex items-center gap-2 text-brand-muted hover:text-brand-gold font-inter text-sm mb-4 transition-colors">
          <ArrowLeft size={16} strokeWidth={1.5} />
          Voltar para Clientes
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-cormorant text-4xl font-semibold text-brand-title">{client?.full_name || 'Cliente'}</h1>
            <p className="font-outfit text-brand-muted mt-1">{client?.email}</p>
            {client?.phone && <p className="font-outfit text-sm text-brand-muted">{client.phone}</p>}
          </div>
          <button
            onClick={() => setTripModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-gold text-white rounded-lg font-inter text-sm font-medium hover:bg-brand-gold-dark transition-colors"
          >
            <Plus size={16} strokeWidth={1.5} />
            Nova Viagem
          </button>
        </div>
      </div>

      <div>
        <h2 className="font-cormorant text-2xl font-semibold text-brand-title mb-4">Viagens</h2>
        {trips.length === 0 ? (
          <Card padding="lg" className="text-center">
            <Plane size={40} strokeWidth={1.3} className="text-brand-gold mx-auto mb-3" />
            <p className="font-cormorant text-xl text-brand-title">Nenhuma viagem</p>
            <p className="font-outfit text-sm text-brand-muted mt-1">Crie a primeira viagem deste cliente</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips.map((trip) => (
              <Link key={trip.id} href={`/admin/trips/${trip.id}`}>
                <Card padding="md" className="hover:shadow-card hover:border-brand-gold/30 transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-cormorant text-xl font-semibold text-brand-title">{trip.title}</h3>
                    <span className="font-inter text-xs bg-brand-bg-secondary text-brand-gold-dark px-2 py-1 rounded-full">
                      {statusLabels[trip.status] || trip.status}
                    </span>
                  </div>
                  <p className="font-outfit text-sm text-brand-muted">{trip.destination}</p>
                  {trip.start_date && (
                    <p className="font-inter text-xs text-brand-muted mt-2">
                      {new Date(trip.start_date).toLocaleDateString('pt-BR')}
                      {trip.end_date && ` — ${new Date(trip.end_date).toLocaleDateString('pt-BR')}`}
                    </p>
                  )}
                  <div className="flex items-center gap-1 mt-3 text-brand-gold">
                    <Edit2 size={14} strokeWidth={1.5} />
                    <span className="font-inter text-xs">Editar viagem</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={tripModalOpen} onClose={() => setTripModalOpen(false)} title="Nova Viagem">
        <div className="space-y-4">
          <Input label="Título" value={tripForm.title} onChange={(e) => setTripForm(p => ({ ...p, title: e.target.value }))} placeholder="Ex: Lua de mel em Paris" required />
          <Input label="Destino" value={tripForm.destination} onChange={(e) => setTripForm(p => ({ ...p, destination: e.target.value }))} placeholder="Ex: Paris" required />
          <Input label="País" value={tripForm.country} onChange={(e) => setTripForm(p => ({ ...p, country: e.target.value }))} placeholder="Ex: França" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Data de início" type="date" value={tripForm.start_date} onChange={(e) => setTripForm(p => ({ ...p, start_date: e.target.value }))} />
            <Input label="Data de fim" type="date" value={tripForm.end_date} onChange={(e) => setTripForm(p => ({ ...p, end_date: e.target.value }))} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-inter text-sm font-medium text-brand-text">Status</label>
            <select
              value={tripForm.status}
              onChange={(e) => setTripForm(p => ({ ...p, status: e.target.value }))}
              className="w-full rounded-lg border border-brand-border font-outfit text-sm text-brand-text bg-brand-bg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all"
            >
              <option value="planning">Planejamento</option>
              <option value="confirmed">Confirmada</option>
              <option value="in_progress">Em andamento</option>
              <option value="completed">Concluída</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setTripModalOpen(false)} className="flex-1 px-4 py-2.5 border border-brand-border text-brand-text rounded-lg font-inter text-sm hover:bg-brand-bg transition-colors">Cancelar</button>
            <button onClick={handleCreateTrip} disabled={saving} className="flex-1 px-4 py-2.5 bg-brand-gold text-white rounded-lg font-inter text-sm font-medium hover:bg-brand-gold-dark transition-colors disabled:opacity-60">{saving ? 'Criando...' : 'Criar Viagem'}</button>
          </div>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onRemove={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
    </div>
  )
}
