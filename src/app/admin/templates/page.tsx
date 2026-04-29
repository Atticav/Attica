'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Card from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import { ToastContainer } from '@/components/ui/Toast'
import { Plus, Edit2, Trash2, Luggage, CheckSquare, Link2, Clapperboard, Camera, BookOpen, Paperclip } from 'lucide-react'
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

interface FieldConfig {
  name: string
  label: string
  type?: string
  required?: boolean
  options?: string[]
  default?: unknown
  accept?: string
  bucket?: string
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
      { name: 'url', label: 'Link (URL)' },
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
      { name: 'video_file_url', label: 'Arquivo (vídeo/PDF)', type: 'file', accept: 'video/*,application/pdf', bucket: 'gallery' },
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
      { name: 'title', label: 'Título' },
      { name: 'tip_text', label: 'Dica', required: true },
      { name: 'video_file_url', label: 'Arquivo (vídeo/imagem)', type: 'file', accept: 'video/*,image/*', bucket: 'gallery' },
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
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type }])
  }

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

  async function handleFileUpload(field: FieldConfig, file: File) {
    if (!field.bucket) return
    const maxMB = 200
    if (file.size > maxMB * 1024 * 1024) {
      addToast(`Arquivo muito grande. Máximo: ${maxMB}MB`, 'error')
      return
    }
    setUploadingFields(p => ({ ...p, [field.name]: true }))
    try {
      const supabase = createClient()
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const path = `templates/${Date.now()}-${safeName}`
      const { data, error } = await supabase.storage
        .from(field.bucket)
        .upload(path, file, { upsert: true })
      if (error) throw error
      const { data: urlData } = supabase.storage.from(field.bucket).getPublicUrl(data.path)
      setFormData(p => ({ ...p, [field.name]: urlData.publicUrl }))
      addToast('Arquivo enviado!', 'success')
    } catch (err: unknown) {
      console.error('Upload error:', err)
      addToast(err instanceof Error ? err.message : 'Erro ao enviar arquivo', 'error')
    } finally {
      setUploadingFields(p => ({ ...p, [field.name]: false }))
    }
  }

  function openCreate() {
    if (!activeSection) return
    setEditItem(null)
    const initial: Record<string, string> = {}
    activeSection.fields.forEach(f => { initial[f.name] = '' })
    setFormData(initial)
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
    setModalOpen(true)
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
        if (f.type === 'file') {
          payload[f.name] = formData[f.name] || null
          return
        }
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

  function getDisplayFields(item: Record<string, unknown>): { label: string; value: string }[] {
    if (!activeSection) return []
    return activeSection.fields
      .filter(f => f.type !== 'file' && item[f.name] !== null && item[f.name] !== undefined && item[f.name] !== '')
      .map(f => {
        let value = String(item[f.name])
        if (f.type === 'checkbox') value = item[f.name] ? 'Sim' : 'Não'
        else if (f.options) value = OPTION_LABELS[value] || value
        else if (value.length > 60) value = value.slice(0, 60) + '...'
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
              // File upload field
              if (field.type === 'file') {
                const isUploading = uploadingFields[field.name]
                const uploadedUrl = formData[field.name]
                const uploadedName = uploadedUrl
                  ? decodeURIComponent(uploadedUrl.split('/').pop() || 'arquivo')
                  : null
                return (
                  <div key={field.name} className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="font-inter text-sm font-medium text-brand-text">
                      {field.label}
                      <span className="font-outfit text-xs text-brand-muted ml-1">(opcional)</span>
                    </label>
                    <div
                      className="w-full rounded-lg border border-dashed border-brand-border bg-brand-bg px-4 py-3 flex items-center gap-3 cursor-pointer hover:border-brand-gold transition-colors"
                      onClick={() => !isUploading && fileInputRefs.current[field.name]?.click()}
                    >
                      <Paperclip size={16} strokeWidth={1.5} className="text-brand-muted flex-shrink-0" />
                      <span className="font-outfit text-sm text-brand-muted truncate">
                        {isUploading ? 'Enviando...' : uploadedName ?? 'Escolher arquivo'}
                      </span>
                      {isUploading && (
                        <div className="ml-auto w-4 h-4 border-2 border-brand-gold border-t-transparent rounded-full animate-spin flex-shrink-0" />
                      )}
                    </div>
                    {uploadedUrl && !isUploading && (
                      <a href={uploadedUrl} target="_blank" rel="noopener noreferrer" className="font-outfit text-xs text-brand-gold underline truncate">
                        {uploadedUrl}
                      </a>
                    )}
                    <input
                      ref={el => { fileInputRefs.current[field.name] = el }}
                      type="file"
                      accept={field.accept}
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(field, file)
                        e.target.value = ''
                      }}
                    />
                  </div>
                )
              }

              // Textarea field
              if (field.type === 'textarea') {
                return (
                  <div key={field.name} className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="font-inter text-sm font-medium text-brand-text">
                      {field.label}{field.required && ' *'}
                    </label>
                    <textarea
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData(p => ({ ...p, [field.name]: e.target.value }))}
                      placeholder={field.label}
                      rows={4}
                      className="w-full rounded-lg border border-brand-border font-outfit text-sm text-brand-text bg-brand-bg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent resize-none"
                    />
                  </div>
                )
              }

              // Select field
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

              // Checkbox field
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

              // Default: text/number input
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
