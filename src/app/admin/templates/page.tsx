'use client'

import { useState, useEffect, useCallback } from 'react'
import Card from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import { ToastContainer } from '@/components/ui/Toast'
import { Plus, Edit2, Trash2, Luggage, CheckSquare, Link2, Clapperboard, Camera, BookOpen, Paperclip, ExternalLink, Volume2, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const OPTION_LABELS: Record<string, string> = {
  clothing: 'Roupa',
  documents: 'Documento',
  health: 'Saúde',
  electronics: 'Eletrônico',
  toiletries: 'Higiene',
  accessories: 'Acessório',
  other: 'Outro',
  video: 'Vídeo',
  youtube: 'YouTube',
  pdf: 'PDF',
  link: 'Link',
}

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'Inglês' },
  { value: 'es', label: 'Espanhol' },
  { value: 'fr', label: 'Francês' },
  { value: 'it', label: 'Italiano' },
  { value: 'de', label: 'Alemão' },
  { value: 'ja', label: 'Japonês' },
  { value: 'zh', label: 'Chinês' },
  { value: 'ar', label: 'Árabe' },
  { value: 'ko', label: 'Coreano' },
  { value: 'ru', label: 'Russo' },
]

async function translateText(text: string, targetLang: string): Promise<string> {
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=pt|${targetLang}`
    )
    if (!res.ok) {
      console.error('Translation API error:', res.status, res.statusText)
      return ''
    }
    const data = await res.json()
    return data?.responseData?.translatedText || ''
  } catch (err) {
    console.error('Translation fetch error:', err)
    return ''
  }
}

function speakWord(text: string, langCode: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  const langMap: Record<string, string> = {
    es: 'es-ES', fr: 'fr-FR', it: 'it-IT', de: 'de-DE', ja: 'ja-JP',
    en: 'en-US', zh: 'zh-CN', ar: 'ar-SA', ko: 'ko-KR', ru: 'ru-RU',
  }
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = langMap[langCode] || 'en-US'
  utterance.rate = 0.8
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)
}

interface FieldConfig {
  name: string
  label: string
  type?: string
  required?: boolean
  options?: string[]
  default?: unknown
  /** For type='file': accepted MIME types (e.g. 'video/*,application/pdf') */
  accept?: string
  /** For type='file': Supabase Storage bucket name */
  bucket?: string
  /** Only show this field when another field matches a value */
  showWhen?: { field: string; values: string[] }
}

interface SectionConfig {
  key: string
  label: string
  icon: React.ReactNode
  table: string
  fields: FieldConfig[]
}

const SECTIONS: SectionConfig[] = [
  {
    key: 'packing',
    label: 'Mala Inteligente',
    icon: <Luggage size={28} strokeWidth={1.5} />, 
    table: 'template_packing',
    fields: [
      { name: 'item_name', label: 'Item', required: true },
      { name: 'category', label: 'Categoria', options: ['clothing', 'documents', 'health', 'electronics', 'toiletries', 'accessories', 'other'] },
      { name: 'quantity', label: 'Quantidade', type: 'number', default: 1 },
      { name: 'is_essential', label: 'Essencial', type: 'checkbox' },
      { name: 'notes', label: 'Notas' },
      { name: 'order_index', label: 'Ordem', type: 'number', default: 0 },
    ],
  },
  {
    key: 'checklist',
    label: 'Checklist',
    icon: <CheckSquare size={28} strokeWidth={1.5} />, 
    table: 'template_checklist',
    fields: [
      { name: 'title', label: 'Tarefa', required: true },
      { name: 'section', label: 'Seção', required: true, options: ['Documentos', 'Saúde', 'Bagagem', 'Transporte', 'Hospedagem', 'Financeiro', 'Tecnologia', 'Outros'] },
      { name: 'description', label: 'Descrição' },
      { name: 'order_index', label: 'Ordem', type: 'number', default: 0 },
    ],
  },
  {
    key: 'strategic',
    label: 'Central Estratégica',
    icon: <Link2 size={28} strokeWidth={1.5} />, 
    table: 'template_strategic',
    fields: [
      { name: 'title', label: 'Título', required: true },
      { name: 'content', label: 'Conteúdo', type: 'textarea' },
      { name: 'url', label: 'Link (URL)', type: 'url' },
      { name: 'order_index', label: 'Ordem', type: 'number', default: 0 },
    ],
  },
  {
    key: 'guide',
    label: 'Guia Attica',
    icon: <Clapperboard size={28} strokeWidth={1.5} />, 
    table: 'template_guide',
    fields: [
      { name: 'title', label: 'Título', required: true },
      { name: 'type', label: 'Tipo', options: ['video', 'youtube', 'pdf', 'link'], required: true },
      { name: 'url', label: 'URL' },
      { name: 'video_file_url', label: 'Arquivo (vídeo/PDF)', type: 'file', accept: 'video/*,application/pdf', bucket: 'trip-files', showWhen: { field: 'type', values: ['video', 'pdf'] } },
      { name: 'description', label: 'Descrição' },
      { name: 'order_index', label: 'Ordem', type: 'number', default: 0 },
    ],
  },
  {
    key: 'photography',
    label: 'Fotografia',
    icon: <Camera size={28} strokeWidth={1.5} />, 
    table: 'template_photography',
    fields: [
      { name: 'title', label: 'Título', required: true },
      { name: 'tip_text', label: 'Dica', required: true },
      { name: 'video_file_url', label: 'Arquivo (vídeo/imagem)', type: 'file', accept: 'video/*,image/*', bucket: 'trip-files' },
      { name: 'description', label: 'Descrição' },
      { name: 'order_index', label: 'Ordem', type: 'number', default: 0 },
    ],
  },
  {
    key: 'vocabulary',
    label: 'Vocabulário',
    icon: <BookOpen size={28} strokeWidth={1.5} />, 
    table: 'template_vocabulary',
    fields: [
      { name: 'portuguese', label: 'Português', required: true },
      { name: 'language_code', label: 'Idioma alvo' },
      { name: 'local_language', label: 'Idioma local', required: true },
      { name: 'pronunciation', label: 'Pronúncia' },
      { name: 'category', label: 'Categoria' },
      { name: 'order_index', label: 'Ordem', type: 'number', default: 0 },
    ],
  },
]

export default function TemplatesPage() {
  const [activeSection, setActiveSection] = useState<SectionConfig | null>(null)
  const [items, setItems] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<Record<string, unknown> | null>(null)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null)
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([])
  const [itemCounts, setItemCounts] = useState<Record<string, number>>({})
  const [uploadingFields, setUploadingFields] = useState<Record<string, boolean>>({})
  const [translating, setTranslating] = useState(false)
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type }])
  }

  // Load item counts for all sections on mount
  useEffect(() => {
    async function loadCounts() {
      const supabase = createClient()
      const counts: Record<string, number> = {}
      for (const section of SECTIONS) {
        try {
          const { count } = await supabase
            .from(section.table)
            .select('*', { count: 'exact', head: true })
          counts[section.key] = count ?? 0
        } catch (e) {
          console.error(`Template count error for ${section.table}:`, e)
          counts[section.key] = 0
        }
      }
      setItemCounts(counts)
    }
    loadCounts()
  }, [])

  const loadItems = useCallback(async () => {
    if (!activeSection) return
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from(activeSection.table)
        .select('*')
        .order('order_index', { ascending: true })

      if (error) {
        console.error('Template load error:', error)
        setItems([])
      } else {
        setItems(data ?? [])
      }
    } catch (e) {
      console.error('Template load exception:', e)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [activeSection])

  useEffect(() => {
    if (activeSection) loadItems()
  }, [activeSection, loadItems])

  function openCreate() {
    if (!activeSection) return
    setEditItem(null)
    const initial: Record<string, string> = {}
    activeSection.fields.forEach(f => { initial[f.name] = '' })
    if (activeSection.key === 'vocabulary') initial['language_code'] = 'en'
    setFormData(initial)
    setUploadingFields({})
    setModalOpen(true)
  }

  function openEdit(item: Record<string, unknown>) {
    if (!activeSection) return
    setEditItem(item)
    const initial: Record<string, string> = {}
    activeSection.fields.forEach(f => {
      initial[f.name] = item[f.name] !== null && item[f.name] !== undefined ? String(item[f.name]) : ''
    })
    setFormData(initial)
    setUploadingFields({})
    setModalOpen(true)
  }

  async function handleFileUpload(fieldName: string, bucket: string, file: File, maxSizeMB = 100) {
    if (file.size > maxSizeMB * 1024 * 1024) {
      addToast(`Arquivo muito grande. Máximo: ${maxSizeMB}MB`, 'error')
      return
    }
    setUploadingFields(p => ({ ...p, [fieldName]: true }))
    try {
      const supabase = createClient()
      const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const path = `templates/${Date.now()}-${safeFileName}`
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true })
      if (error) throw error
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path)
      setFormData(p => ({ ...p, [fieldName]: urlData.publicUrl }))
      addToast('Arquivo enviado!', 'success')
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Erro ao enviar arquivo', 'error')
    } finally {
      setUploadingFields(p => ({ ...p, [fieldName]: false }))
    }
  }

  async function handleSave() {
    if (!activeSection) return
    const requiredFields = activeSection.fields.filter(f => f.required)
    for (const f of requiredFields) {
      if (!formData[f.name]) {
        addToast(`${f.label} é obrigatório`, 'error')
        return
      }
    }

    setSaving(true)
    try {
      const supabase = createClient()
      const payload: Record<string, unknown> = {}
      activeSection.fields.forEach(f => {
        const val = formData[f.name]
        if (val === '' || val === undefined) {
          if (f.type === 'number') {
            payload[f.name] = f.default !== undefined ? f.default : 0
          } else if (f.type === 'checkbox') {
            payload[f.name] = false
          } else {
            payload[f.name] = null
          }
          return
        }
        if (f.type === 'number') payload[f.name] = Number(val)
        else if (f.type === 'checkbox') payload[f.name] = val === 'true'
        else payload[f.name] = val
      })

      if (editItem) {
        const { error } = await supabase
          .from(activeSection.table)
          .update(payload)
          .eq('id', editItem.id)
        if (error) {
          console.error('Template update error:', error)
          throw new Error(error.message || 'Erro ao atualizar item')
        }
        addToast('Item atualizado!', 'success')
      } else {
        const { error } = await supabase
          .from(activeSection.table)
          .insert(payload)
        if (error) {
          console.error('Template insert error:', error)
          throw new Error(error.message || 'Erro ao criar item')
        }
        addToast('Item criado!', 'success')
      }

      setModalOpen(false)
      loadItems()
      // Update count
      setItemCounts(prev => ({
        ...prev,
        [activeSection.key]: editItem ? prev[activeSection.key] : (prev[activeSection.key] || 0) + 1,
      }))
    } catch (e: unknown) {
      console.error('Template save error:', e)
      addToast(e instanceof Error ? e.message : 'Erro ao salvar', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(itemId: string) {
    if (!activeSection) return
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from(activeSection.table)
        .delete()
        .eq('id', itemId)
      if (error) throw error
      addToast('Item excluído', 'success')
      setDeleteItemId(null)
      loadItems()
      setItemCounts(prev => ({
        ...prev,
        [activeSection.key]: Math.max(0, (prev[activeSection.key] || 0) - 1),
      }))
    } catch {
      addToast('Erro ao excluir item', 'error')
      setDeleteItemId(null)
    }
  }

  function getFileLabel(isUploading: boolean, currentUrl: string): string {
    if (isUploading) return 'Enviando arquivo...'
    if (currentUrl) return currentUrl.split('/').pop() || 'Arquivo enviado'
    return 'Escolher arquivo'
  }

  function getDisplayFields(item: Record<string, unknown>): { label: string; value: string; isUrl?: boolean; href?: string }[] {
    const MAX_DISPLAY_LENGTH = 60
    if (!activeSection) return []
    return activeSection.fields
      .filter(f => f.type !== 'file' && item[f.name] !== null && item[f.name] !== undefined && item[f.name] !== '')
      .map(f => {
        let value = String(item[f.name])
        if (f.type === 'checkbox') value = item[f.name] ? 'Sim' : 'Não'
        else if (f.options) value = OPTION_LABELS[value] || value
        else if (f.type === 'url') {
          const raw = value
          let safe: string | undefined
          try {
            const parsed = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`)
            if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
              safe = parsed.href
            }
          } catch {
            safe = undefined
          }
          return { label: f.label, value: raw.length > MAX_DISPLAY_LENGTH ? raw.slice(0, MAX_DISPLAY_LENGTH) + '...' : raw, isUrl: true, href: safe }
        }
        else if (value.length > MAX_DISPLAY_LENGTH) value = value.slice(0, MAX_DISPLAY_LENGTH) + '...'
        return { label: f.label, value }
      })
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-cormorant text-4xl font-semibold text-brand-title">
          Templates Padrão
        </h1>
        <p className="font-outfit text-brand-muted mt-1">
          Gerencie os templates padrão que podem ser aplicados às viagens
        </p>
      </div>

      {/* Section Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SECTIONS.map(section => (
          <button
            key={section.key}
            onClick={() => setActiveSection(section)}
            className="text-left"
          >
            <Card
              padding="md"
              className="hover:shadow-card hover:border-brand-gold/30 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-brand-bg-secondary rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-brand-gold/10 transition-colors">
                  <span className="text-brand-gold">{section.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-inter text-sm font-semibold text-brand-title group-hover:text-brand-gold transition-colors">
                    {section.label}
                  </h3>
                  <p className="font-outfit text-xs text-brand-muted mt-0.5">
                    {itemCounts[section.key] ?? '...'} itens no template
                  </p>
                </div>
              </div>
            </Card>
          </button>
        ))}
      </div>

      {/* Section Detail Modal */}
      <Modal
        isOpen={!!activeSection}
        onClose={() => { setActiveSection(null); setItems([]) }}
        title={activeSection ? `Template: ${activeSection.label}` : ''}
        size="xl"
      >
        {activeSection && (
          <div>
            {/* Add button */}
            <div className="flex items-center justify-between mb-4">
              <p className="font-outfit text-sm text-brand-muted">
                {items.length} {items.length === 1 ? 'item' : 'itens'} no template
              </p>
              <button
                onClick={openCreate}
                className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-white rounded-lg font-inter text-sm font-medium hover:bg-brand-gold-dark transition-colors"
              >
                <Plus size={16} strokeWidth={1.5} />
                Adicionar
              </button>
            </div>

            {/* Items list */}
            {loading ? (
              <div className="p-8 text-center font-outfit text-brand-muted">Carregando...</div>
            ) : items.length === 0 ? (
              <div className="p-8 text-center">
                <p className="font-cormorant text-xl text-brand-title mb-2">Nenhum item no template</p>
                <p className="font-outfit text-sm text-brand-muted">Clique em &quot;Adicionar&quot; para criar o primeiro item</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                {items.map(item => {
                  const displayFields = getDisplayFields(item)
                  return (
                    <Card key={String(item.id)} padding="sm" className="hover:shadow-card transition-shadow">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap gap-x-6 gap-y-1">
                            {displayFields.map(({ label, value, isUrl, href }) => (
                              <div key={label} className="min-w-0">
                                <span className="font-inter text-xs text-brand-muted">{label}: </span>
                                {isUrl && href ? (
                                  <a
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 font-outfit text-sm text-brand-gold hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {value}
                                    <ExternalLink size={12} strokeWidth={1.5} />
                                  </a>
                                ) : (
                                  <span className="font-outfit text-sm text-brand-text">{value}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {activeSection?.key === 'vocabulary' && !!item.local_language && (
                            <button
                              onClick={() => speakWord(String(item.local_language), String(item.language_code || 'en'))}
                              className="p-1.5 rounded-lg text-brand-muted hover:text-brand-gold hover:bg-brand-bg-secondary transition-all flex-shrink-0"
                              title="Ouvir pronúncia"
                              type="button"
                            >
                              <Volume2 size={14} strokeWidth={1.5} />
                            </button>
                          )}
                          <button
                            onClick={() => openEdit(item)}
                            className="p-1.5 text-brand-muted hover:text-brand-gold hover:bg-brand-bg-secondary rounded-lg transition-all"
                            title="Editar"
                          >
                            <Edit2 size={14} strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={() => setDeleteItemId(String(item.id))}
                            className="p-1.5 text-brand-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Excluir"
                          >
                            <Trash2 size={14} strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add/Edit Item Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Editar item' : `Adicionar em ${activeSection?.label || ''}`}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeSection?.fields.map(field => {
              // Check showWhen condition
              if (field.showWhen && !field.showWhen.values.includes(formData[field.showWhen.field] || '')) {
                return null
              }
              // Vocabulary: language_code → select with LANGUAGE_OPTIONS
              if (activeSection?.key === 'vocabulary' && field.name === 'language_code') {
                return (
                  <div key={field.name} className="flex flex-col gap-1.5">
                    <label className="font-inter text-sm font-medium text-brand-text">Idioma alvo</label>
                    <select
                      value={formData['language_code'] || 'en'}
                      onChange={(e) => setFormData(p => ({ ...p, language_code: e.target.value }))}
                      className="w-full rounded-lg border border-brand-border font-outfit text-sm text-brand-text bg-brand-bg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                    >
                      {LANGUAGE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                )
              }
              // Vocabulary: local_language → input + translate button
              if (activeSection?.key === 'vocabulary' && field.name === 'local_language') {
                return (
                  <div key={field.name} className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="font-inter text-sm font-medium text-brand-text">
                      {field.label}{field.required && ' *'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        value={formData[field.name] || ''}
                        onChange={(e) => setFormData(p => ({ ...p, [field.name]: e.target.value }))}
                        className="flex-1 rounded-lg border border-brand-border font-outfit text-sm text-brand-text bg-brand-bg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                        placeholder="Tradução automática ou manual"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          if (!formData['portuguese']?.trim()) {
                            addToast('Digite a palavra em português primeiro', 'error')
                            return
                          }
                          setTranslating(true)
                          const translated = await translateText(
                            formData['portuguese'],
                            formData['language_code'] || 'en'
                          )
                          if (translated) setFormData(p => ({ ...p, local_language: translated }))
                          else addToast('Não foi possível traduzir automaticamente', 'error')
                          setTranslating(false)
                        }}
                        disabled={translating}
                        className="px-3 py-2 bg-brand-gold text-white rounded-lg font-inter text-xs font-medium hover:bg-brand-gold-dark transition-colors disabled:opacity-60 whitespace-nowrap flex items-center gap-1.5"
                      >
                        {translating
                          ? <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin inline-block" />
                          : <Sparkles size={14} strokeWidth={1.5} />}
                        Traduzir
                      </button>
                    </div>
                  </div>
                )
              }
              if (field.options) {
                return (
                  <div key={field.name} className="flex flex-col gap-1.5">
                    <label className="font-inter text-sm font-medium text-brand-text">
                      {field.label}{field.required && ' *'}
                    </label>
                    <select
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData(p => ({ ...p, [field.name]: e.target.value }))}
                      className="w-full rounded-lg border border-brand-border font-outfit text-sm text-brand-text bg-brand-bg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                    >
                      <option value="">Selecione...</option>
                      {field.options.map(opt => (
                        <option key={opt} value={opt}>{OPTION_LABELS[opt] || opt}</option>
                      ))}
                    </select>
                  </div>
                )
              }
              if (field.type === 'checkbox') {
                return (
                  <div key={field.name} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id={`template-${field.name}`}
                      checked={formData[field.name] === 'true'}
                      onChange={(e) => setFormData(p => ({ ...p, [field.name]: String(e.target.checked) }))}
                      className="w-4 h-4 accent-brand-gold"
                    />
                    <label htmlFor={`template-${field.name}`} className="font-inter text-sm text-brand-text">
                      {field.label}
                    </label>
                  </div>
                )
              }
              if (field.type === 'file') {
                const isUploading = uploadingFields[field.name] || false
                const currentUrl = formData[field.name] || ''
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
                            handleFileUpload(field.name, field.bucket, file)
                          }
                        }}
                      />
                      <Paperclip size={16} strokeWidth={1.5} className="text-brand-muted flex-shrink-0" />
                      <span className="font-outfit text-sm text-brand-muted truncate">
                        {getFileLabel(isUploading, currentUrl)}
                      </span>
                    </label>
                    {currentUrl && !isUploading && (
                      <p className="font-outfit text-xs text-brand-muted truncate">{currentUrl}</p>
                    )}
                  </div>
                )
              }
              if (field.type === 'textarea') {
                return (
                  <div key={field.name} className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="font-inter text-sm font-medium text-brand-text">
                      {field.label}{field.required && ' *'}
                    </label>
                    <textarea
                      rows={4}
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData(p => ({ ...p, [field.name]: e.target.value }))}
                      placeholder={field.label}
                      className="w-full rounded-lg border border-brand-border font-outfit text-sm text-brand-text bg-brand-bg px-4 py-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent resize-none"
                    />
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
            <button
              onClick={() => setModalOpen(false)}
              className="flex-1 px-4 py-2.5 border border-brand-border text-brand-text rounded-lg font-inter text-sm hover:bg-brand-bg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-brand-gold text-white rounded-lg font-inter text-sm font-medium hover:bg-brand-gold-dark transition-colors disabled:opacity-60"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <Modal isOpen={!!deleteItemId} onClose={() => setDeleteItemId(null)} title="Excluir item" size="sm">
        <p className="font-outfit text-brand-text mb-6">Tem certeza que deseja excluir este item do template?</p>
        <div className="flex gap-3">
          <button
            onClick={() => setDeleteItemId(null)}
            className="flex-1 px-4 py-2.5 border border-brand-border text-brand-text rounded-lg font-inter text-sm hover:bg-brand-bg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => deleteItemId && handleDelete(deleteItemId)}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-inter text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Excluir
          </button>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onRemove={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
    </div>
  )
}