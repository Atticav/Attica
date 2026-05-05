'use client'

import { useState, useEffect, useCallback } from 'react'
import { use } from 'react'
import Card from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import { ToastContainer } from '@/components/ui/Toast'
import { ArrowLeft, Plus, Edit2, Trash2, Sparkles, Copy, Paperclip, Volume2 } from 'lucide-react'
import Link from 'next/link'
import { getLanguageCode, LANG_LABELS, LANG_SPEECH_CODES, speak } from '@/lib/languageDetection'

const MAX_VIDEO_SIZE_MB = 50
const MAX_PDF_SIZE_MB = 20
const MAX_IMAGE_SIZE_MB = 10

function getMaxFileSizeMB(accept: string | undefined): number {
  if (!accept) return MAX_IMAGE_SIZE_MB
  if (accept.includes('video')) return MAX_VIDEO_SIZE_MB
  if (accept.includes('pdf')) return MAX_PDF_SIZE_MB
  return MAX_IMAGE_SIZE_MB
}

const OPTION_LABELS: Record<string, string> = {
  // Itinerary categories
  flight: 'Voo',
  hotel: 'Hotel',
  transfer: 'Transfer',
  tour: 'Passeio',
  restaurant: 'Restaurante',
  activity: 'Atividade',
  other: 'Outro',
  // Financial types
  income: 'Receita',
  expense: 'Despesa',
  // Financial categories
  food: 'Alimentação',
  shopping: 'Compras',
  insurance: 'Seguro',
  visa: 'Visto',
  // Financial / Contract status
  pending: 'Pendente',
  paid: 'Pago',
  refunded: 'Reembolsado',
  // Document types
  passport: 'Passaporte',
  ticket: 'Passagem',
  voucher: 'Voucher',
  // Packing categories
  clothing: 'Roupa',
  documents: 'Documento',
  health: 'Saúde',
  electronics: 'Eletrônico',
  toiletries: 'Higiene',
  accessories: 'Acessório',
  // Restaurant categories
  fine_dining: 'Alta Gastronomia',
  casual: 'Casual',
  street_food: 'Comida de Rua',
  cafe: 'Café',
  bar: 'Bar',
  // Gallery types
  photo: 'Foto',
  video: 'Vídeo',
  // Guide types
  youtube: 'YouTube',
  pdf: 'PDF',
  link: 'Link',
  // Contract status
  draft: 'Rascunho',
  sent: 'Enviado',
  signed: 'Assinado',
  cancelled: 'Cancelado',
}

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

function tl(value: string): string {
  return OPTION_LABELS[value] || value
}

function getDisplayFields(section: string, item: Record<string, unknown>): { label: string; value: string }[] {
  const fields: { label: string; value: string }[] = []

  switch (section) {
    case 'itinerary':
      if (item.day_number) fields.push({ label: 'Dia', value: String(item.day_number) })
      if (item.title) fields.push({ label: 'Título', value: String(item.title) })
      if (item.category) fields.push({ label: 'Categoria', value: tl(String(item.category)) })
      if (item.time) fields.push({ label: 'Horário', value: String(item.time) })
      break
    case 'financial':
      if (item.description) fields.push({ label: 'Descrição', value: String(item.description) })
      if (item.amount) fields.push({ label: 'Valor', value: `${item.currency || ''} ${item.amount}` })
      if (item.status) fields.push({ label: 'Status', value: tl(String(item.status)) })
      break
    case 'documents':
      if (item.title) fields.push({ label: 'Título', value: String(item.title) })
      if (item.type) fields.push({ label: 'Tipo', value: tl(String(item.type)) })
      if (item.expiry_date) fields.push({ label: 'Validade', value: new Date(String(item.expiry_date)).toLocaleDateString('pt-BR') })
      break
    case 'packing':
      if (item.item_name) fields.push({ label: 'Item', value: String(item.item_name) })
      if (item.category) fields.push({ label: 'Categoria', value: tl(String(item.category)) })
      if (item.quantity) fields.push({ label: 'Qtd', value: String(item.quantity) })
      break
    case 'checklist':
      if (item.title) fields.push({ label: 'Tarefa', value: String(item.title) })
      if (item.section) fields.push({ label: 'Seção', value: String(item.section) })
      if (item.deadline) fields.push({ label: 'Prazo', value: new Date(String(item.deadline)).toLocaleDateString('pt-BR') })
      break
    case 'strategic':
      if (item.title) fields.push({ label: 'Título', value: String(item.title) })
      if (item.content) fields.push({ label: 'Conteúdo', value: String(item.content).length > 80 ? String(item.content).slice(0, 80) + '...' : String(item.content) })
      break
    case 'guide':
      if (item.title) fields.push({ label: 'Título', value: String(item.title) })
      if (item.type) fields.push({ label: 'Tipo', value: tl(String(item.type)) })
      if (item.url) fields.push({ label: 'URL', value: String(item.url).length > 40 ? String(item.url).slice(0, 40) + '...' : String(item.url) })
      break
    case 'gallery':
      if (item.title) fields.push({ label: 'Título', value: String(item.title || '—') })
      if (item.type) fields.push({ label: 'Tipo', value: tl(String(item.type)) })
      if (item.location) fields.push({ label: 'Local', value: String(item.location) })
      break
    case 'restaurants':
      if (item.name) fields.push({ label: 'Nome', value: String(item.name) })
      if (item.category) fields.push({ label: 'Categoria', value: tl(String(item.category)) })
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
      if (item.status) fields.push({ label: 'Status', value: tl(String(item.status)) })
      break
    default:
      Object.entries(item).forEach(([key, value]) => {
        if (!['id', 'trip_id', 'created_at', 'updated_at', 'order_index'].includes(key) && value !== null && value !== undefined) {
          fields.push({ label: key, value: String(value).length > 50 ? String(value).slice(0, 50) + '...' : String(value) })
        }
      })
  }
  return fields
}

function getFormFields(section: string): { name: string; label: string; type?: string; required?: boolean; options?: string[]; bucket?: string; accept?: string; uploadTarget?: string; virtual?: boolean }[] {
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
        { name: 'status', label: 'Status', options: ['pending', 'paid', 'refunded'] },
        { name: 'notes', label: 'Notas' },
      ]
    case 'documents':
      return [
        { name: 'title', label: 'Título', required: true },
        { name: 'type', label: 'Tipo', options: ['passport', 'visa', 'ticket', 'voucher', 'insurance', 'other'] },
        { name: 'description', label: 'Descrição' },
        { name: 'file_url_upload', label: 'Upload de arquivo (PDF, imagem)', type: 'file', bucket: 'documents', accept: '.pdf,image/jpeg,image/png,image/webp', uploadTarget: 'file_url', virtual: true },
        { name: 'file_url', label: 'URL do arquivo (opcional, para links externos)' },
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
        { name: 'section', label: 'Seção', required: true, options: ['Documentos', 'Saúde', 'Bagagem', 'Transporte', 'Hospedagem', 'Financeiro', 'Tecnologia', 'Outros'] },
        { name: 'description', label: 'Descrição' },
        { name: 'deadline', label: 'Prazo', type: 'date' },
        { name: 'order_index', label: 'Ordem', type: 'number' },
      ]
    case 'strategic':
      return [
        { name: 'title', label: 'Título', required: true },
        { name: 'content', label: 'Conteúdo' },
        { name: 'image_url_upload', label: 'Imagem ilustrativa (JPG, PNG, WebP)', type: 'file', bucket: 'strategic-images', accept: 'image/jpeg,image/png,image/webp', uploadTarget: 'image_url', virtual: true },
        { name: 'image_url', label: 'URL da imagem (opcional)' },
        { name: 'order_index', label: 'Ordem', type: 'number' },
      ]
    case 'guide':
      return [
        { name: 'title', label: 'Título', required: true },
        { name: 'type', label: 'Tipo', options: ['video', 'youtube', 'pdf', 'link'], required: true },
        { name: 'description', label: 'Descrição' },
        { name: 'order_index', label: 'Ordem', type: 'number' },
        { name: 'url_upload', label: 'Upload de vídeo (MP4, MOV, WebM)', type: 'file', bucket: 'guide-videos', accept: 'video/mp4,video/quicktime,video/webm', uploadTarget: 'url', virtual: true },
        { name: 'url', label: 'URL (YouTube / PDF / Link)' },
      ]
    case 'gallery':
      return [
        { name: 'file_url_upload', label: 'Upload de arquivo (foto ou vídeo)', type: 'file', bucket: 'gallery', accept: 'image/jpeg,image/png,image/webp,video/mp4,video/quicktime', uploadTarget: 'file_url', virtual: true },
        { name: 'file_url', label: 'URL do arquivo (alternativa ao upload)' },
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
        { name: 'opening_hours', label: 'Horário de funcionamento' },
        { name: 'address', label: 'Endereço' },
        { name: 'google_maps_url', label: 'Google Maps URL' },
        { name: 'website_url', label: 'Website' },
        { name: 'attica_notes', label: 'Notas Attica' },
        { name: 'price_range', label: 'Faixa de preço (1-4)', type: 'number' },
        { name: 'rating', label: 'Avaliação', type: 'number' },
        { name: 'is_recommended', label: 'Recomendado', type: 'checkbox' },
        { name: 'photo_url_upload', label: 'Foto do restaurante (JPG, PNG, WebP)', type: 'file', bucket: 'restaurants-photos', accept: 'image/jpeg,image/png,image/webp', uploadTarget: 'photo_url', virtual: true },
        { name: 'photo_url', label: 'URL da foto (opcional)' },
        { name: 'order_index', label: 'Ordem', type: 'number' },
      ]
    case 'photography':
      return [
        { name: 'title', label: 'Título', required: true },
        { name: 'tip_text', label: 'Dica', required: true },
        { name: 'description', label: 'Descrição' },
        { name: 'location', label: 'Local' },
        { name: 'best_time', label: 'Melhor horário' },
        { name: 'image_url_upload', label: 'Foto (JPG, PNG, WebP)', type: 'file', bucket: 'photography-images', accept: 'image/jpeg,image/png,image/webp', uploadTarget: 'image_url', virtual: true },
        { name: 'image_url', label: 'URL da imagem (opcional)' },
        { name: 'video_url_upload', label: 'Upload de vídeo (MP4)', type: 'file', bucket: 'photography-videos', accept: 'video/mp4', uploadTarget: 'video_url', virtual: true },
        { name: 'video_url', label: 'URL do YouTube (opcional)' },
        { name: 'order_index', label: 'Ordem', type: 'number' },
      ]
    case 'culture':
      return [
        { name: 'title', label: 'Título', required: true },
        { name: 'category', label: 'Categoria', options: ['Costumes', 'Gastronomia', 'Religião', 'Etiqueta', 'História', 'Transporte', 'Segurança', 'Clima', 'Moeda', 'Outros'], required: true },
        { name: 'content', label: 'Conteúdo', type: 'textarea', required: true },
        { name: 'is_important', label: 'Importante', type: 'checkbox' },
        { name: 'image_url_upload', label: 'Imagem ilustrativa (JPG, PNG, WebP)', type: 'file', bucket: 'culture-images', accept: 'image/jpeg,image/png,image/webp', uploadTarget: 'image_url', virtual: true },
        { name: 'image_url', label: 'URL da imagem (opcional)' },
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

const TEMPLATE_SECTIONS = ['packing', 'checklist', 'strategic', 'guide', 'photography', 'vocabulary']

// Required fields missing from template tables that must be added on insert
const TEMPLATE_SECTION_DEFAULTS: Record<string, Record<string, unknown>> = {
  packing: { is_packed: false },
  checklist: { is_completed: false },
}

function getTableName(section: string): string {
  const tableMap: Record<string, string> = {
    itinerary: 'itinerary_items',
    financial: 'financial_items',
    documents: 'documents',
    packing: 'packing_items',
    checklist: 'checklist_items',
    strategic: 'strategic_sections',
    guide: 'tutorials',
    gallery: 'gallery_items',
    restaurants: 'restaurants',
    photography: 'photography_tips',
    culture: 'cultural_info',
    vocabulary: 'vocabulary',
    contract: 'contracts',
  }
  return tableMap[section] || section
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
  const [uploadingFields, setUploadingFields] = useState<Record<string, boolean>>({})
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiTravelStyle, setAiTravelStyle] = useState('')
  const [aiNotes, setAiNotes] = useState('')
  const [tripData, setTripData] = useState<{ destination: string; country: string; start_date: string; end_date: string } | null>(null)
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type }])
  }

  async function handleFileUpload(fieldName: string, bucket: string, file: File, targetField?: string, maxSizeMB = 50) {
    const storeField = targetField || fieldName
    if (file.size > maxSizeMB * 1024 * 1024) {
      addToast(`Arquivo muito grande. Máximo: ${maxSizeMB}MB`, 'error')
      return
    }
    setUploadingFields(p => ({ ...p, [fieldName]: true }))
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const path = `${tripId}/${Date.now()}-${safeName}`
      const fd = new FormData()
      fd.append('file', file)
      fd.append('bucket', bucket)
      fd.append('path', path)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erro ao enviar arquivo')
      }
      const { publicUrl } = await res.json()
      setFormData(p => ({ ...p, [storeField]: publicUrl }))
      addToast('Arquivo enviado!', 'success')
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Erro ao enviar arquivo', 'error')
    } finally {
      setUploadingFields(p => ({ ...p, [fieldName]: false }))
    }
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

  // Load trip data for AI generation and vocabulary section
  useEffect(() => {
    if (section === 'itinerary' || section === 'vocabulary') {
      fetch(`/api/admin/trips/${tripId}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) setTripData({ destination: data.destination, country: data.country, start_date: data.start_date, end_date: data.end_date })
        })
        .catch(() => {})
    }
  }, [tripId, section])

  // Auto-translate Portuguese → local language in vocabulary modal (debounced)
  const portugueseValue = formData['portuguese']
  useEffect(() => {
    if (section !== 'vocabulary' || !tripData || !modalOpen) return
    if (!portugueseValue) return
    const langCode = getLanguageCode(tripData.destination, tripData.country)
    if (langCode === 'pt') return
    if (!(langCode in LANG_SPEECH_CODES)) return

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/admin/translate?q=${encodeURIComponent(portugueseValue)}&target=${encodeURIComponent(langCode)}&source=pt`
        )
        if (!res.ok) return
        const data = await res.json()
        const translation: unknown = data?.translated
        if (translation && typeof translation === 'string') {
          setFormData(p => p['local_language'] ? p : { ...p, local_language: translation })
        }
      } catch {
        // silently ignore translation errors
      }
    }, 600)

    return () => clearTimeout(timer)
  }, [portugueseValue, section, tripData, modalOpen])

  async function handleAiGenerate() {
    if (!tripData?.destination || !tripData?.start_date || !tripData?.end_date) {
      addToast('A viagem precisa ter destino, data de início e fim para gerar o roteiro', 'error')
      return
    }
    setAiGenerating(true)
    try {
      const res = await fetch('/api/admin/ai/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId,
          destination: tripData.destination,
          country: tripData.country,
          start_date: tripData.start_date,
          end_date: tripData.end_date,
          travel_style: aiTravelStyle || undefined,
          notes: aiNotes || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar roteiro')
      addToast(`✨ ${data.count} itens criados com sucesso!`, 'success')
      setAiModalOpen(false)
      setAiTravelStyle('')
      setAiNotes('')
      loadItems()
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : 'Erro ao gerar roteiro com IA', 'error')
    } finally {
      setAiGenerating(false)
    }
  }

  const formFields = getFormFields(section)

  async function applyTemplate() {
    const templateTable = `template_${section}`
    const supabase = (await import('@/lib/supabase/client')).createClient()

    const { data: templateItems, error: fetchError } = await supabase
      .from(templateTable)
      .select('*')
      .order('order_index', { ascending: true })

    if (fetchError || !templateItems || templateItems.length === 0) {
      addToast('Nenhum template encontrado para esta seção', 'info')
      return
    }

    // Section-specific defaults for fields not present in templates
    const sectionTable = getTableName(section)
    const defaults = TEMPLATE_SECTION_DEFAULTS[section] || {}
    const itemsToInsert = templateItems.map(({ id: _id, created_at: _ca, updated_at: _ua, ...rest }) => {
      return { ...rest, ...defaults, trip_id: tripId }
    })

    const { error: insertError } = await supabase.from(sectionTable).insert(itemsToInsert)

    if (insertError) {
      console.error('Template insert error:', insertError)
      addToast('Erro ao aplicar template', 'error')
    } else {
      addToast(`✅ ${itemsToInsert.length} itens do template aplicados!`, 'success')
      loadItems()
    }
  }

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
    // Section-specific validation for fields that can be satisfied by either upload or URL
    if (section === 'guide' && !formData['url']) {
      addToast('Informe uma URL ou faça upload de um arquivo', 'error')
      return
    }
    if (section === 'gallery' && !formData['file_url']) {
      addToast('Informe uma URL ou faça upload de um arquivo', 'error')
      return
    }
    setSaving(true)
    try {
      const payload: Record<string, unknown> = {}
      formFields.forEach(f => {
        if (f.virtual) return // skip virtual upload fields
        const val = formData[f.name]
        if (val === '' || val === undefined) {
          // For number and checkbox fields, omit from payload so the DB default is used
          // instead of sending null which would violate NOT NULL constraints
          if (f.type === 'number' || f.type === 'checkbox') return
          payload[f.name] = null
          return
        }
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
          <div className="flex items-center gap-2">
            {section === 'itinerary' && (
              <button
                onClick={() => setAiModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 border border-brand-gold text-brand-gold rounded-lg font-inter text-sm font-medium hover:bg-brand-gold hover:text-white transition-colors"
              >
                <Sparkles size={16} strokeWidth={1.5} />
                Gerar com IA
              </button>
            )}
            {TEMPLATE_SECTIONS.includes(section) && (
              <button
                onClick={applyTemplate}
                className="flex items-center gap-2 px-4 py-2.5 border border-brand-gold text-brand-gold rounded-lg font-inter text-sm font-medium hover:bg-brand-gold hover:text-white transition-colors"
              >
                <Copy size={16} strokeWidth={1.5} />
                Aplicar Template
              </button>
            )}
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-gold text-white rounded-lg font-inter text-sm font-medium hover:bg-brand-gold-dark transition-colors"
            >
              <Plus size={16} strokeWidth={1.5} />
              Adicionar
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center font-outfit text-brand-muted">Carregando...</div>
      ) : items.length === 0 ? (
        <Card padding="lg" className="text-center">
          <p className="font-cormorant text-xl text-brand-title mb-2">Nenhum item em {sectionLabel}</p>
          <p className="font-outfit text-sm text-brand-muted">Clique em &quot;Adicionar&quot; para criar o primeiro item</p>
        </Card>
      ) : section === 'financial' ? (
        /* Financial Table View */
        <Card padding="none" className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-border bg-brand-bg">
                <th className="text-left px-4 py-3 font-inter text-xs font-medium text-brand-muted uppercase tracking-wider">Descrição</th>
                <th className="text-right px-4 py-3 font-inter text-xs font-medium text-brand-muted uppercase tracking-wider">Valor Estimado</th>
                <th className="text-right px-4 py-3 font-inter text-xs font-medium text-brand-muted uppercase tracking-wider">Valor Real</th>
                <th className="text-center px-4 py-3 font-inter text-xs font-medium text-brand-muted uppercase tracking-wider">Pago</th>
                <th className="text-right px-4 py-3 font-inter text-xs font-medium text-brand-muted uppercase tracking-wider">Diferença</th>
                <th className="text-right px-4 py-3 font-inter text-xs font-medium text-brand-muted uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {items.map((item) => {
                const estimated = Number(item.amount) || 0
                const actual = Number(item.amount_brl) || 0
                const diff = actual - estimated
                const isPaid = item.status === 'paid'
                return (
                  <tr key={String(item.id)} className="hover:bg-brand-bg transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-outfit text-sm text-brand-title">{String(item.description || '—')}</p>
                      <p className="font-inter text-xs text-brand-muted">{tl(String(item.category || 'other'))}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-inter text-sm text-brand-text">
                      R$ {estimated.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right font-inter text-sm text-brand-text">
                      R$ {actual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full font-inter text-xs font-medium ${isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {isPaid ? 'Sim' : 'Não'}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-right font-inter text-sm font-medium ${diff > 0 ? 'text-red-600' : diff < 0 ? 'text-green-600' : 'text-brand-muted'}`}>
                      {diff !== 0 ? `${diff > 0 ? '+' : ''}R$ ${diff.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(item)} className="p-1.5 text-brand-muted hover:text-brand-gold hover:bg-brand-bg-secondary rounded-lg transition-all" title="Editar">
                          <Edit2 size={14} strokeWidth={1.5} />
                        </button>
                        <button onClick={() => setDeleteItemId(String(item.id))} className="p-1.5 text-brand-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Excluir">
                          <Trash2 size={14} strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-brand-border bg-brand-bg">
                <td className="px-4 py-3 font-inter text-sm font-semibold text-brand-title">TOTAL</td>
                <td className="px-4 py-3 text-right font-inter text-sm font-semibold text-brand-title">
                  R$ {items.reduce((s, i) => s + (Number(i.amount) || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 text-right font-inter text-sm font-semibold text-brand-title">
                  R$ {items.reduce((s, i) => s + (Number(i.amount_brl) || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3" />
                <td className="px-4 py-3 text-right font-inter text-sm font-semibold text-brand-title">
                  {(() => {
                    const totalDiff = items.reduce((s, i) => s + ((Number(i.amount_brl) || 0) - (Number(i.amount) || 0)), 0)
                    return totalDiff !== 0
                      ? <span className={totalDiff > 0 ? 'text-red-600' : 'text-green-600'}>
                          {totalDiff > 0 ? '+' : ''}R$ {totalDiff.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      : '—'
                  })()}
                </td>
                <td className="px-4 py-3" />
              </tr>
            </tfoot>
          </table>
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
          {section === 'vocabulary' && tripData && (() => {
            const langCode = getLanguageCode(tripData.destination, tripData.country)
            return (
              <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-brand-gold/10 border border-brand-gold/30">
                <span className="font-inter text-sm text-brand-text">
                  Idioma do destino: <strong className="text-brand-title">{LANG_LABELS[langCode] || langCode}</strong>
                </span>
              </div>
            )
          })()}
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
                      {field.options.map(opt => <option key={opt} value={opt}>{OPTION_LABELS[opt] || opt}</option>)}
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
              if (field.type === 'file') {
                const targetField = field.uploadTarget || field.name
                const isUploading = uploadingFields[field.name] || false
                const uploadedUrl = formData[targetField]
                return (
                  <div key={field.name} className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="font-inter text-sm font-medium text-brand-text">{field.label}</label>
                    <label className={`flex items-center gap-3 px-4 py-3 rounded-lg border border-dashed border-brand-border bg-brand-bg cursor-pointer hover:border-brand-gold/50 transition-colors ${isUploading ? 'opacity-60 cursor-not-allowed' : ''}`}>
                      <input
                        type="file"
                        accept={field.accept}
                        className="hidden"
                        disabled={isUploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file && field.bucket) {
                            handleFileUpload(field.name, field.bucket, file, field.uploadTarget, getMaxFileSizeMB(field.accept))
                          }
                        }}
                      />
                      <Paperclip size={16} strokeWidth={1.5} className="text-brand-muted flex-shrink-0" />
                      <span className="font-outfit text-sm text-brand-muted">
                        {isUploading ? 'Enviando...' : uploadedUrl ? 'Arquivo enviado — clique para trocar' : 'Escolher arquivo'}
                      </span>
                    </label>
                    {uploadedUrl && !isUploading && (
                      <p className="font-outfit text-xs text-brand-muted truncate pl-1">{uploadedUrl}</p>
                    )}
                  </div>
                )
              }
              if (field.type === 'textarea') {
                return (
                  <div key={field.name} className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="font-inter text-sm font-medium text-brand-text">{field.label}{field.required && ' *'}</label>
                    <textarea
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData(p => ({ ...p, [field.name]: e.target.value }))}
                      rows={6}
                      placeholder={field.label}
                      className="w-full rounded-lg border border-brand-border font-outfit text-sm text-brand-text bg-brand-bg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all resize-y"
                    />
                  </div>
                )
              }
              if (section === 'vocabulary' && field.name === 'local_language' && tripData) {
                const langCode = getLanguageCode(tripData.destination, tripData.country)
                return (
                  <div key={field.name} className="flex flex-col gap-1.5">
                    <label className="font-inter text-sm font-medium text-brand-text">{field.label}{field.required && ' *'}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={formData[field.name] || ''}
                        onChange={(e) => setFormData(p => ({ ...p, [field.name]: e.target.value }))}
                        placeholder={field.label}
                        className="flex-1 rounded-lg border border-brand-border font-outfit text-sm text-brand-text bg-brand-bg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        title="Ouvir pronúncia"
                        disabled={!formData[field.name]}
                        onClick={() => {
                          const text = formData[field.name]
                          if (text) speak(text, langCode)
                        }}
                        className="p-2.5 rounded-lg border border-brand-border text-brand-muted hover:text-brand-gold hover:border-brand-gold/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Volume2 size={16} strokeWidth={1.5} />
                      </button>
                    </div>
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
            <button onClick={handleSave} disabled={saving || Object.values(uploadingFields).some(Boolean)} className="flex-1 px-4 py-2.5 bg-brand-gold text-white rounded-lg font-inter text-sm font-medium hover:bg-brand-gold-dark transition-colors disabled:opacity-60">{saving ? 'Salvando...' : 'Salvar'}</button>
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

      {/* AI Generation Modal */}
      <Modal isOpen={aiModalOpen} onClose={() => !aiGenerating && setAiModalOpen(false)} title="✨ Gerar Roteiro com IA" size="lg">
        <div className="space-y-4">
          {items.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="font-inter text-sm text-amber-800">
                Já existem {items.length} itens no roteiro. A IA irá adicionar novos itens sem apagar os existentes.
              </p>
            </div>
          )}
          {!tripData?.destination || !tripData?.start_date || !tripData?.end_date ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="font-inter text-sm text-red-700">
                A viagem precisa ter destino, data de início e data de fim configurados para gerar o roteiro com IA.
              </p>
            </div>
          ) : (
            <div className="bg-brand-bg-secondary rounded-lg p-3">
              <p className="font-inter text-sm text-brand-text">
                <span className="font-medium">Destino:</span> {tripData.destination}, {tripData.country}
              </p>
              <p className="font-inter text-sm text-brand-text">
                <span className="font-medium">Período:</span>{' '}
                {new Date(tripData.start_date + 'T12:00:00').toLocaleDateString('pt-BR')} — {new Date(tripData.end_date + 'T12:00:00').toLocaleDateString('pt-BR')}
              </p>
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <label className="font-inter text-sm font-medium text-brand-text">Estilo de viagem</label>
            <select
              value={aiTravelStyle}
              onChange={(e) => setAiTravelStyle(e.target.value)}
              className="w-full rounded-lg border border-brand-border font-outfit text-sm text-brand-text bg-brand-bg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all"
            >
              <option value="">Selecione (opcional)...</option>
              <option value="Cultural">Cultural</option>
              <option value="Aventura">Aventura</option>
              <option value="Gastronômico">Gastronômico</option>
              <option value="Relaxamento">Relaxamento</option>
              <option value="Família">Família</option>
              <option value="Romântico">Romântico</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-inter text-sm font-medium text-brand-text">
              Observações <span className="text-brand-muted font-normal">(opcional)</span>
            </label>
            <textarea
              value={aiNotes}
              onChange={(e) => setAiNotes(e.target.value)}
              rows={3}
              placeholder="Ex: O cliente prefere experiências exclusivas, tem restrição alimentar..."
              className="w-full rounded-lg border border-brand-border font-outfit text-sm text-brand-text bg-brand-bg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent placeholder:text-brand-muted resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => { setAiModalOpen(false); setAiTravelStyle(''); setAiNotes('') }}
              disabled={aiGenerating}
              className="flex-1 px-4 py-2.5 border border-brand-border text-brand-text rounded-lg font-inter text-sm hover:bg-brand-bg transition-colors disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              onClick={handleAiGenerate}
              disabled={aiGenerating || !tripData?.destination || !tripData?.start_date || !tripData?.end_date}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-gold text-white rounded-lg font-inter text-sm font-medium hover:bg-brand-gold-dark transition-colors disabled:opacity-60"
            >
              {aiGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Gerando roteiro...
                </>
              ) : (
                <>
                  <Sparkles size={16} strokeWidth={1.5} />
                  Gerar Roteiro
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onRemove={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
    </div>
  )
}
