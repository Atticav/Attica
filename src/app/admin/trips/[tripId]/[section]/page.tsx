'use client'

import { useState, useEffect, useCallback } from 'react'
import { use } from 'react'
import Card from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import { ToastContainer } from '@/components/ui/Toast'
import { ArrowLeft, Plus, Edit2, Trash2 } from 'lucide-react'
import Link from 'next/link'

const SECTION_LABELS: Record<string, string> = {
  itinerary: 'Roteiro',
  financial: 'Financeiro',
  documents: 'Documentos',
  packing: 'Mala Inteligente',
  checklist: 'Checklist',
  strategic: 'Central Estratégica',
  guide: 'Guia Attica',
  gallery: 'Galeria',
  restaurants: 'Restaurantes',
  photography: 'Fotografia',
  culture: 'Cultura',
  vocabulary: 'Vocabulário',
  contract: 'Contrato',
}

function getDisplayFields(section: string, item: Record<string, unknown>): { label: string; value: string }[] {
  const fields: { label: string; value: string }[] = []

  switch (section) {
    case 'itinerary':
      if (item.day_number) fields.push({ label: 'Dia', value: String(item.day_number) })
      if (item.title) fields.push({ label: 'Título', value: String(item.title) })
      if (item.category) fields.push({ label: 'Categoria', value: String(item.category) })
      if (item.time) fields.push({ label: 'Horário', value: String(item.time) })
      break
    case 'financial':
      if (item.description) fields.push({ label: 'Descrição', value: String(item.description) })
      if (item.amount) fields.push({ label: 'Valor', value: `${item.currency || ''} ${item.amount}` })
      if (item.status) fields.push({ label: 'Status', value: String(item.status) })
      break
    case 'documents':
      if (item.title) fields.push({ label: 'Título', value: String(item.title) })
      if (item.type) fields.push({ label: 'Tipo', value: String(item.type) })
      if (item.expiry_date) fields.push({ label: 'Validade', value: new Date(String(item.expiry_date)).toLocaleDateString('pt-BR') })
      break
    case 'packing':
      if (item.item_name) fields.push({ label: 'Item', value: String(item.item_name) })
      if (item.category) fields.push({ label: 'Categoria', value: String(item.category) })
      if (item.quantity) fields.push({ label: 'Qtd', value: String(item.quantity) })
      break
    case 'checklist':
      if (item.title) fields.push({ label: 'Tarefa', value: String(item.title) })
      if (item.section) fields.push({ label: 'Seção', value: String(item.section) })
      if (item.deadline) fields.push({ label: 'Prazo', value: new Date(String(item.deadline)).toLocaleDateString('pt-BR') })
      break
    case 'strategic':
      if (item.title) fields.push({ label: 'Título', value: String(item.title) })
      if (item.content) fields.push({ label: 'Conteúdo', value: String(item.content).slice(0, 80) + '...' })
      break
    case 'guide':
      if (item.title) fields.push({ label: 'Título', value: String(item.title) })
      if (item.type) fields.push({ label: 'Tipo', value: String(item.type) })
      if (item.url) fields.push({ label: 'URL', value: String(item.url).slice(0, 40) + '...' })
      break
    case 'gallery':
      if (item.title) fields.push({ label: 'Título', value: String(item.title || '—') })
      if (item.type) fields.push({ label: 'Tipo', value: String(item.type) })
      if (item.location) fields.push({ label: 'Local', value: String(item.location) })
      break
    case 'restaurants':
      if (item.name) fields.push({ label: 'Nome', value: String(item.name) })
      if (item.category) fields.push({ label: 'Categoria', value: String(item.category) })
      if (item.cuisine) fields.push({ label: 'Cozinha', value: String(item.cuisine) })
      break
    case 'photography':
      if (item.title) fields.push({ label: 'Título', value: String(item.title) })
      if (item.location) fields.push({ label: 'Local', value: String(item.location || '—') })
      if (item.best_time) fields.push({ label: 'Melhor horário', value: String(item.best_time) })
      break
    case 'culture':
      if (item.title) fields.push({ label: 'Título', value: String(item.title) })
      if (item.category) fields.push({ label: 'Categoria', value: String(item.category) })
      break
    case 'vocabulary':
      if (item.portuguese) fields.push({ label: 'Português', value: String(item.portuguese) })
      if (item.local_language) fields.push({ label: 'Idioma local', value: String(item.local_language) })
      if (item.pronunciation) fields.push({ label: 'Pronúncia', value: String(item.pronunciation) })
      break
    case 'contract':
      if (item.title) fields.push({ label: 'Título', value: String(item.title) })
      if (item.status) fields.push({ label: 'Status', value: String(item.status) })
      break
    default:
      Object.entries(item).forEach(([key, value]) => {
        if (!['id', 'trip_id', 'created_at', 'updated_at', 'order_index'].includes(key) && value !== null && value !== undefined) {
          fields.push({ label: key, value: String(value).slice(0, 50) })
        }
      })
  }
  return fields
}

function getFormFields(section: string): { name: string; label: string; type?: string; required?: boolean; options?: string[] }[] {
  switch (section) {
    case 'itinerary':
      return [
        { name: 'day_number', label: 'Número do dia', type: 'number', required: true },
        { name: 'title', label: 'Título', required: true },
        { name: 'category', label: 'Categoria', options: ['flight', 'hotel', 'transfer', 'tour', 'restaurant', 'activity', 'other'] },
        { name: 'date', label: 'Data', type: 'date' },
        { name: 'time', label: 'Horário', type: 'time' },
        { name: 'location', label: 'Local' },
        { name: 'description', label: 'Descrição' },
        { name: 'confirmation_code', label: 'Código de confirmação' },
        { name: 'notes', label: 'Notas' },
        { name: 'order_index', label: 'Ordem', type: 'number' },
      ]
    case 'financial':
      return [
        { name: 'description', label: 'Descrição', required: true },
        { name: 'type', label: 'Tipo', options: ['income', 'expense'], required: true },
        { name: 'category', label: 'Categoria', options: ['flight', 'hotel', 'transfer', 'tour', 'food', 'shopping', 'insurance', 'visa', 'other'] },
        { name: 'amount', label: 'Valor', type: 'number', required: true },
        { name: 'currency', label: 'Moeda' },
        { name: 'amount_brl', label: 'Valor em BRL', type: 'number' },
        { name: 'status', label: 'Status', options: ['pending', 'paid', 'refunded'] },
        { name: 'due_date', label: 'Data de vencimento', type: 'date' },
        { name: 'notes', label: 'Notas' },
      ]
    case 'documents':
      return [
        { name: 'title', label: 'Título', required: true },
        { name: 'type', label: 'Tipo', options: ['passport', 'visa', 'ticket', 'voucher', 'insurance', 'other'] },
        { name: 'description', label: 'Descrição' },
        { name: 'file_url', label: 'URL do arquivo' },
        { name: 'expiry_date', label: 'Data de validade', type: 'date' },
        { name: 'notes', label: 'Notas' },
        { name: 'order_index', label: 'Ordem', type: 'number' },
      ]
    case 'packing':
      return [
        { name: 'item_name', label: 'Item', required: true },
        { name: 'category', label: 'Categoria', options: ['clothing', 'documents', 'health', 'electronics', 'toiletries', 'accessories', 'other'] },
        { name: 'quantity', label: 'Quantidade', type: 'number' },
        { name: 'is_essential', label: 'Essencial', type: 'checkbox' },
        { name: 'notes', label: 'Notas' },
        { name: 'order_index', label: 'Ordem', type: 'number' },
      ]
    case 'checklist':
      return [
        { name: 'title', label: 'Tarefa', required: true },
        { name: 'section', label: 'Seção', required: true },
        { name: 'description', label: 'Descrição' },
        { name: 'deadline', label: 'Prazo', type: 'date' },
        { name: 'order_index', label: 'Ordem', type: 'number' },
      ]
    case 'strategic':
      return [
        { name: 'title', label: 'Título', required: true },
        { name: 'content', label: 'Conteúdo' },
        { name: 'order_index', label: 'Ordem', type: 'number' },
      ]
    case 'guide':
      return [
        { name: 'title', label: 'Título', required: true },
        { name: 'type', label: 'Tipo', options: ['video', 'youtube', 'pdf', 'link'], required: true },
        { name: 'url', label: 'URL', required: true },
        { name: 'description', label: 'Descrição' },
        { name: 'thumbnail_url', label: 'URL da miniatura' },
        { name: 'duration_minutes', label: 'Duração (min)', type: 'number' },
        { name: 'order_index', label: 'Ordem', type: 'number' },
      ]
    case 'gallery':
      return [
        { name: 'file_url', label: 'URL do arquivo', required: true },
        { name: 'type', label: 'Tipo', options: ['photo', 'video'], required: true },
        { name: 'title', label: 'Título' },
        { name: 'description', label: 'Descrição' },
        { name: 'location', label: 'Local' },
        { name: 'thumbnail_url', label: 'URL da miniatura' },
        { name: 'order_index', label: 'Ordem', type: 'number' },
      ]
    case 'restaurants':
      return [
        { name: 'name', label: 'Nome', required: true },
        { name: 'category', label: 'Categoria', options: ['fine_dining', 'casual', 'street_food', 'cafe', 'bar', 'other'] },
        { name: 'cuisine', label: 'Cozinha' },
        { name: 'address', label: 'Endereço' },
        { name: 'google_maps_url', label: 'Google Maps URL' },
        { name: 'website_url', label: 'Website' },
        { name: 'attica_notes', label: 'Notas Attica' },
        { name: 'price_range', label: 'Faixa de preço (1-4)', type: 'number' },
        { name: 'rating', label: 'Avaliação', type: 'number' },
        { name: 'is_recommended', label: 'Recomendado', type: 'checkbox' },
        { name: 'order_index', label: 'Ordem', type: 'number' },
      ]
    case 'photography':
      return [
        { name: 'title', label: 'Título', required: true },
        { name: 'tip_text', label: 'Dica', required: true },
        { name: 'description', label: 'Descrição' },
        { name: 'location', label: 'Local' },
        { name: 'best_time', label: 'Melhor horário' },
        { name: 'image_url', label: 'URL da imagem' },
        { name: 'order_index', label: 'Ordem', type: 'number' },
      ]
    case 'culture':
      return [
        { name: 'title', label: 'Título', required: true },
        { name: 'category', label: 'Categoria', required: true },
        { name: 'content', label: 'Conteúdo', required: true },
        { name: 'is_important', label: 'Importante', type: 'checkbox' },
        { name: 'order_index', label: 'Ordem', type: 'number' },
      ]
    case 'vocabulary':
      return [
        { name: 'portuguese', label: 'Português', required: true },
        { name: 'local_language', label: 'Idioma local', required: true },
        { name: 'pronunciation', label: 'Pronúncia' },
        { name: 'category', label: 'Categoria' },
        { name: 'order_index', label: 'Ordem', type: 'number' },
      ]
    case 'contract':
      return [
        { name: 'title', label: 'Título', required: true },
        { name: 'status', label: 'Status', options: ['draft', 'sent', 'signed', 'cancelled'] },
        { name: 'content', label: 'Conteúdo' },
        { name: 'file_url', label: 'URL do arquivo' },
        { name: 'notes', label: 'Notas' },
      ]
    default:
      return [{ name: 'title', label: 'Título', required: true }]
  }
}

export default function SectionPage({ params }: { params: Promise<{ tripId: string; section: string }> }) {
  const { tripId, section } = use(params)
  const [items, setItems] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<Record<string, unknown> | null>(null)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null)
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([])

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type }])
  }

  const loadItems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/trips/${tripId}/${section}`)
      if (!res.ok) throw new Error('Failed')
      setItems(await res.json())
    } catch {
      addToast('Erro ao carregar itens', 'error')
    } finally {
      setLoading(false)
    }
  }, [tripId, section])

  useEffect(() => { loadItems() }, [loadItems])

  const formFields = getFormFields(section)

  function openCreate() {
    setEditItem(null)
    const initial: Record<string, string> = {}
    formFields.forEach(f => { initial[f.name] = '' })
    setFormData(initial)
    setModalOpen(true)
  }

  function openEdit(item: Record<string, unknown>) {
    setEditItem(item)
    const initial: Record<string, string> = {}
    formFields.forEach(f => { initial[f.name] = item[f.name] !== null && item[f.name] !== undefined ? String(item[f.name]) : '' })
    setFormData(initial)
    setModalOpen(true)
  }

  async function handleSave() {
    const requiredFields = formFields.filter(f => f.required)
    for (const f of requiredFields) {
      if (!formData[f.name]) {
        addToast(`${f.label} é obrigatório`, 'error')
        return
      }
    }
    setSaving(true)
    try {
      const payload: Record<string, unknown> = {}
      formFields.forEach(f => {
        const val = formData[f.name]
        if (val === '' || val === undefined) { payload[f.name] = null; return }
        if (f.type === 'number') payload[f.name] = Number(val)
        else if (f.type === 'checkbox') payload[f.name] = val === 'true'
        else payload[f.name] = val
      })

      let res
      if (editItem) {
        res = await fetch(`/api/admin/trips/${tripId}/${section}/${editItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch(`/api/admin/trips/${tripId}/${section}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erro ao salvar')
      }
      addToast(editItem ? 'Item atualizado!' : 'Item criado!', 'success')
      setModalOpen(false)
      loadItems()
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : 'Erro ao salvar', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(itemId: string) {
    try {
      const res = await fetch(`/api/admin/trips/${tripId}/${section}/${itemId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erro ao excluir')
      addToast('Item excluído', 'success')
      setDeleteItemId(null)
      loadItems()
    } catch {
      addToast('Erro ao excluir item', 'error')
      setDeleteItemId(null)
    }
  }

  const sectionLabel = SECTION_LABELS[section] || section

  return (
    <div>
      <div className="mb-6">
        <Link href={`/admin/trips/${tripId}`} className="flex items-center gap-2 text-brand-muted hover:text-brand-gold font-inter text-sm mb-4 transition-colors">
          <ArrowLeft size={16} strokeWidth={1.5} />
          Voltar para a viagem
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="font-cormorant text-4xl font-semibold text-brand-title">{sectionLabel}</h1>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-gold text-white rounded-lg font-inter text-sm font-medium hover:bg-brand-gold-dark transition-colors"
          >
            <Plus size={16} strokeWidth={1.5} />
            Adicionar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center font-outfit text-brand-muted">Carregando...</div>
      ) : items.length === 0 ? (
        <Card padding="lg" className="text-center">
          <p className="font-cormorant text-xl text-brand-title mb-2">Nenhum item em {sectionLabel}</p>
          <p className="font-outfit text-sm text-brand-muted">Clique em &quot;Adicionar&quot; para criar o primeiro item</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const displayFields = getDisplayFields(section, item)
            return (
              <Card key={String(item.id)} padding="md" className="hover:shadow-card transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-x-6 gap-y-1">
                      {displayFields.map(({ label, value }) => (
                        <div key={label} className="min-w-0">
                          <span className="font-inter text-xs text-brand-muted">{label}: </span>
                          <span className="font-outfit text-sm text-brand-text">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => openEdit(item)}
                      className="p-1.5 text-brand-muted hover:text-brand-gold hover:bg-brand-bg-secondary rounded-lg transition-all"
                      title="Editar"
                    >
                      <Edit2 size={16} strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => setDeleteItemId(String(item.id))}
                      className="p-1.5 text-brand-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Excluir"
                    >
                      <Trash2 size={16} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Editar item' : `Adicionar em ${sectionLabel}`} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {formFields.map((field) => {
              if (field.options) {
                return (
                  <div key={field.name} className="flex flex-col gap-1.5">
                    <label className="font-inter text-sm font-medium text-brand-text">{field.label}{field.required && ' *'}</label>
                    <select
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData(p => ({ ...p, [field.name]: e.target.value }))}
                      className="w-full rounded-lg border border-brand-border font-outfit text-sm text-brand-text bg-brand-bg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all"
                    >
                      <option value="">Selecione...</option>
                      {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                )
              }
              if (field.type === 'checkbox') {
                return (
                  <div key={field.name} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id={field.name}
                      checked={formData[field.name] === 'true'}
                      onChange={(e) => setFormData(p => ({ ...p, [field.name]: String(e.target.checked) }))}
                      className="w-4 h-4 accent-brand-gold"
                    />
                    <label htmlFor={field.name} className="font-inter text-sm text-brand-text">{field.label}</label>
                  </div>
                )
              }
              return (
                <Input
                  key={field.name}
                  label={`${field.label}${field.required ? ' *' : ''}`}
                  type={field.type || 'text'}
                  value={formData[field.name] || ''}
                  onChange={(e) => setFormData(p => ({ ...p, [field.name]: e.target.value }))}
                  placeholder={field.label}
                />
              )
            })}
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2.5 border border-brand-border text-brand-text rounded-lg font-inter text-sm hover:bg-brand-bg transition-colors">Cancelar</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2.5 bg-brand-gold text-white rounded-lg font-inter text-sm font-medium hover:bg-brand-gold-dark transition-colors disabled:opacity-60">{saving ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <Modal isOpen={!!deleteItemId} onClose={() => setDeleteItemId(null)} title="Excluir item" size="sm">
        <p className="font-outfit text-brand-text mb-6">Tem certeza que deseja excluir este item?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteItemId(null)} className="flex-1 px-4 py-2.5 border border-brand-border text-brand-text rounded-lg font-inter text-sm hover:bg-brand-bg transition-colors">Cancelar</button>
          <button onClick={() => deleteItemId && handleDelete(deleteItemId)} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-inter text-sm font-medium hover:bg-red-700 transition-colors">Excluir</button>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onRemove={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
    </div>
  )
}
