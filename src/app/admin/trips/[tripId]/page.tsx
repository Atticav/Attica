'use client'

import { useState, useEffect, useCallback } from 'react'
import { use } from 'react'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import { ToastContainer } from '@/components/ui/Toast'
import {
  ArrowLeft, Save, Trash2,
  Map, DollarSign, FileText, Luggage, CheckSquare, Compass,
  PlayCircle, ImageIcon, UtensilsCrossed, Camera, Globe, BookOpen, ScrollText
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Trip {
  id: string
  title: string
  destination: string
  country: string
  start_date: string | null
  end_date: string | null
  status: string
  notes: string | null
  cover_image_url: string | null
  client_id: string
  profile?: { id: string; full_name: string | null; email: string } | null
}

const sections = [
  { icon: Map, label: 'Roteiro', slug: 'itinerary' },
  { icon: DollarSign, label: 'Financeiro', slug: 'financial' },
  { icon: FileText, label: 'Documentos', slug: 'documents' },
  { icon: Luggage, label: 'Mala Inteligente', slug: 'packing' },
  { icon: CheckSquare, label: 'Checklist', slug: 'checklist' },
  { icon: Compass, label: 'Central Estratégica', slug: 'strategic' },
  { icon: PlayCircle, label: 'Guia Attica', slug: 'guide' },
  { icon: ImageIcon, label: 'Galeria', slug: 'gallery' },
  { icon: UtensilsCrossed, label: 'Restaurantes', slug: 'restaurants' },
  { icon: Camera, label: 'Fotografia', slug: 'photography' },
  { icon: Globe, label: 'Cultura', slug: 'culture' },
  { icon: BookOpen, label: 'Vocabulário', slug: 'vocabulary' },
  { icon: ScrollText, label: 'Contrato', slug: 'contract' },
]

export default function TripDetailPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = use(params)
  const router = useRouter()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [form, setForm] = useState({
    title: '', destination: '', country: '', start_date: '', end_date: '',
    status: 'planning', notes: '', cover_image_url: ''
  })
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([])

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type }])
  }

  const loadTrip = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/trips/${tripId}`)
      if (!res.ok) throw new Error('Trip not found')
      const data = await res.json()
      setTrip(data)
      setForm({
        title: data.title || '',
        destination: data.destination || '',
        country: data.country || '',
        start_date: data.start_date || '',
        end_date: data.end_date || '',
        status: data.status || 'planning',
        notes: data.notes || '',
        cover_image_url: data.cover_image_url || '',
      })
    } catch {
      addToast('Erro ao carregar viagem', 'error')
    } finally {
      setLoading(false)
    }
  }, [tripId])

  useEffect(() => { loadTrip() }, [loadTrip])

  async function handleSave() {
    if (!form.title || !form.destination) {
      addToast('Título e destino são obrigatórios', 'error')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/trips/${tripId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          start_date: form.start_date || null,
          end_date: form.end_date || null,
          notes: form.notes || null,
          cover_image_url: form.cover_image_url || null,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erro ao salvar')
      }
      addToast('Viagem salva!', 'success')
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : 'Erro ao salvar', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    try {
      const res = await fetch(`/api/admin/trips/${tripId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erro ao excluir')
      router.push('/admin/trips')
    } catch {
      addToast('Erro ao excluir viagem', 'error')
      setDeleteModalOpen(false)
    }
  }

  if (loading) return <div className="p-8 text-center font-outfit text-brand-muted">Carregando...</div>

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/trips" className="flex items-center gap-2 text-brand-muted hover:text-brand-gold font-inter text-sm mb-4 transition-colors">
          <ArrowLeft size={16} strokeWidth={1.5} />
          Voltar para Viagens
        </Link>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-cormorant text-4xl font-semibold text-brand-title">{trip?.title}</h1>
            {trip?.profile && (
              <p className="font-outfit text-brand-muted mt-1">
                Cliente:{' '}
                <Link href={`/admin/clients/${trip.profile.id}`} className="text-brand-gold hover:underline">
                  {trip.profile.full_name || trip.profile.email}
                </Link>
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 rounded-lg font-inter text-sm hover:bg-red-50 transition-colors"
            >
              <Trash2 size={16} strokeWidth={1.5} />
              Excluir
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-gold text-white rounded-lg font-inter text-sm font-medium hover:bg-brand-gold-dark transition-colors disabled:opacity-60"
            >
              <Save size={16} strokeWidth={1.5} />
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <Card padding="md" className="mb-8">
        <h2 className="font-cormorant text-xl font-semibold text-brand-title mb-4">Dados da viagem</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Título" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Título da viagem" required />
          <Input label="Destino" value={form.destination} onChange={(e) => setForm(p => ({ ...p, destination: e.target.value }))} placeholder="Ex: Paris" required />
          <Input label="País" value={form.country} onChange={(e) => setForm(p => ({ ...p, country: e.target.value }))} placeholder="Ex: França" />
          <div className="flex flex-col gap-1.5">
            <label className="font-inter text-sm font-medium text-brand-text">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm(p => ({ ...p, status: e.target.value }))}
              className="w-full rounded-lg border border-brand-border font-outfit text-sm text-brand-text bg-brand-bg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all"
            >
              <option value="planning">Planejamento</option>
              <option value="confirmed">Confirmada</option>
              <option value="in_progress">Em andamento</option>
              <option value="completed">Concluída</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>
          <Input label="Data de início" type="date" value={form.start_date} onChange={(e) => setForm(p => ({ ...p, start_date: e.target.value }))} />
          <Input label="Data de fim" type="date" value={form.end_date} onChange={(e) => setForm(p => ({ ...p, end_date: e.target.value }))} />
          <Input label="URL da imagem de capa" value={form.cover_image_url} onChange={(e) => setForm(p => ({ ...p, cover_image_url: e.target.value }))} placeholder="https://..." className="md:col-span-2" />
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="font-inter text-sm font-medium text-brand-text">Notas</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="Notas internas sobre esta viagem..."
              rows={3}
              className="w-full rounded-lg border border-brand-border font-outfit text-sm text-brand-text bg-brand-bg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all resize-none"
            />
          </div>
        </div>
      </Card>

      {/* Sections grid */}
      <div>
        <h2 className="font-cormorant text-2xl font-semibold text-brand-title mb-4">Conteúdo da viagem</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {sections.map(({ icon: Icon, label, slug }) => (
            <Link key={slug} href={`/admin/trips/${tripId}/${slug}`}>
              <Card
                padding="sm"
                className="flex flex-col items-center text-center hover:shadow-card hover:border-brand-gold/30 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-brand-bg-secondary flex items-center justify-center mb-3 mt-1">
                  <Icon size={22} strokeWidth={1.3} className="text-brand-gold" />
                </div>
                <p className="font-inter text-sm font-medium text-brand-title">{label}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Excluir viagem">
        <p className="font-outfit text-brand-text mb-6">
          Tem certeza que deseja excluir a viagem <strong>{trip?.title}</strong>? Esta ação não pode ser desfeita.
        </p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteModalOpen(false)} className="flex-1 px-4 py-2.5 border border-brand-border text-brand-text rounded-lg font-inter text-sm hover:bg-brand-bg transition-colors">Cancelar</button>
          <button onClick={handleDelete} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-inter text-sm font-medium hover:bg-red-700 transition-colors">Excluir</button>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onRemove={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
    </div>
  )
}
