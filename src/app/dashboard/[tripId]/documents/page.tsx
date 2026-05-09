'use client'

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { useParams } from 'next/navigation'
import {
  FileText,
  ExternalLink,
  Plus,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import type { Document, DocumentType } from '@/lib/types'

type BadgeVariant = 'gold' | 'success' | 'warning' | 'error' | 'brown' | 'neutral'

const typeConfig: Record<DocumentType, { label: string; variant: BadgeVariant }> = {
  passport: { label: 'Passaporte', variant: 'gold' },
  visa: { label: 'Visto', variant: 'warning' },
  ticket: { label: 'Passagem', variant: 'success' },
  voucher: { label: 'Voucher', variant: 'brown' },
  insurance: { label: 'Seguro', variant: 'neutral' },
  other: { label: 'Outro', variant: 'neutral' },
}

const typeOptions: { value: DocumentType; label: string }[] = [
  { value: 'passport', label: 'Passaporte' },
  { value: 'visa', label: 'Visto' },
  { value: 'ticket', label: 'Passagem' },
  { value: 'voucher', label: 'Voucher' },
  { value: 'insurance', label: 'Seguro' },
  { value: 'other', label: 'Outro' },
]

export default function DocumentsPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const { t } = useLanguage()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Form state
  const [formTitle, setFormTitle] = useState('')
  const [formType, setFormType] = useState<DocumentType>('other')
  const [formDescription, setFormDescription] = useState('')
  const [formExpiry, setFormExpiry] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [formFile, setFormFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('trip_id', tripId)
      .order('order_index', { ascending: true })

    if (!error && data) setDocuments(data)
    setLoading(false)
  }, [tripId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const resetForm = () => {
    setFormTitle('')
    setFormType('other')
    setFormDescription('')
    setFormExpiry('')
    setFormNotes('')
    setFormFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSaveError(null)
  }

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim()) return

    setSaving(true)
    setSaveError(null)
    const supabase = createClient()

    let fileUrl: string | null = null
    if (formFile) {
      const timestamp = Date.now()
      const safeName = formFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const path = `${tripId}/${timestamp}-${safeName}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(path, formFile)
      if (uploadError) {
        setSaveError(`Erro ao enviar arquivo: ${uploadError.message || 'tente novamente'}`)
        setSaving(false)
        return
      }
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(uploadData.path)
      fileUrl = urlData.publicUrl
    }

    const maxOrder = documents.length > 0
      ? Math.max(...documents.map((d) => d.order_index))
      : -1

    const { error } = await supabase.from('documents').insert({
      trip_id: tripId,
      title: formTitle.trim(),
      type: formType,
      description: formDescription.trim() || null,
      expiry_date: formExpiry || null,
      notes: formNotes.trim() || null,
      file_url: fileUrl,
      order_index: maxOrder + 1,
    })

    setSaving(false)
    if (error) {
      setSaveError(`Erro ao salvar documento: ${error.message || 'tente novamente'}`)
    } else {
      setModalOpen(false)
      resetForm()
      await loadData()
    }
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
          <p className="font-inter text-sm text-brand-muted">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="font-cormorant text-3xl font-semibold text-brand-title">
            Central de Reservas
          </h1>
          <p className="font-outfit text-sm text-brand-muted">
            {documents.length} {documents.length === 1 ? 'documento' : 'documentos'}
          </p>
        </div>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus size={16} strokeWidth={1.5} />
          Adicionar
        </Button>
      </div>

      {/* Table or empty state */}
      {documents.length === 0 ? (
        <Card className="text-center py-16">
          <FileText size={40} strokeWidth={1.5} className="text-brand-muted mx-auto mb-3" />
          <p className="font-cormorant text-xl text-brand-title mb-1">Nenhum documento</p>
          <p className="font-outfit text-sm text-brand-muted">
            Os documentos da sua viagem aparecerão aqui.
          </p>
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-brand-border">
                  <th className="px-6 py-3 font-inter text-xs font-semibold text-brand-muted uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 font-inter text-xs font-semibold text-brand-muted uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 font-inter text-xs font-semibold text-brand-muted uppercase tracking-wider">
                    Validade
                  </th>
                  <th className="px-6 py-3 font-inter text-xs font-semibold text-brand-muted uppercase tracking-wider">
                    Notas
                  </th>
                  <th className="px-6 py-3 font-inter text-xs font-semibold text-brand-muted uppercase tracking-wider">
                    Arquivo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {documents.map((doc) => {
                  const config = typeConfig[doc.type]
                  const isExpired =
                    doc.expiry_date && new Date(doc.expiry_date) < new Date()

                  return (
                    <tr key={doc.id} className="hover:bg-brand-hover/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-inter text-sm font-medium text-brand-title">
                          {doc.title}
                        </span>
                        {doc.description && (
                          <p className="font-outfit text-xs text-brand-muted mt-0.5">
                            {doc.description}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={config.variant}>{config.label}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        {doc.expiry_date ? (
                          <span className={`font-inter text-sm ${isExpired ? 'text-brand-error font-medium' : 'text-brand-text'}`}>
                            {formatDate(doc.expiry_date)}
                            {isExpired && (
                              <Badge variant="error" className="ml-2">Expirado</Badge>
                            )}
                          </span>
                        ) : (
                          <span className="font-inter text-sm text-brand-muted">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-outfit text-sm text-brand-text">
                          {doc.notes || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {doc.file_url ? (
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button size="sm" variant="secondary">
                              <ExternalLink size={14} strokeWidth={1.5} />
                              Ver arquivo
                            </Button>
                          </a>
                        ) : (
                          <span className="font-inter text-sm text-brand-muted">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Document Modal */}
      <Modal isOpen={modalOpen} onClose={handleCloseModal} title="Adicionar Documento" size="md">
        <form onSubmit={handleAdd} className="space-y-4">
          <Input
            label="Título"
            placeholder="Ex: Passaporte João"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="doc-type" className="font-inter text-sm font-medium text-brand-text">
              Tipo
            </label>
            <select
              id="doc-type"
              value={formType}
              onChange={(e) => setFormType(e.target.value as DocumentType)}
              className="w-full rounded-lg border border-brand-border font-outfit text-sm text-brand-text bg-brand-bg px-4 py-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
            >
              {typeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="doc-description" className="font-inter text-sm font-medium text-brand-text">
              Descrição
            </label>
            <textarea
              id="doc-description"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Detalhes opcionais"
              rows={2}
              className="w-full rounded-lg border border-brand-border font-outfit text-sm text-brand-text bg-brand-bg px-4 py-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent resize-none"
            />
          </div>

          <Input
            label="Data de validade"
            type="date"
            value={formExpiry}
            onChange={(e) => setFormExpiry(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="doc-file" className="font-inter text-sm font-medium text-brand-text">
              Arquivo <span className="font-normal text-brand-muted">(opcional)</span>
            </label>
            <input
              id="doc-file"
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={(e) => setFormFile(e.target.files?.[0] ?? null)}
              className="w-full rounded-lg border border-brand-border font-outfit text-sm text-brand-text bg-brand-bg px-4 py-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-brand-gold/10 file:text-brand-gold hover:file:bg-brand-gold/20 cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="doc-notes" className="font-inter text-sm font-medium text-brand-text">
              Notas
            </label>
            <textarea
              id="doc-notes"
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="Observações adicionais"
              rows={2}
              className="w-full rounded-lg border border-brand-border font-outfit text-sm text-brand-text bg-brand-bg px-4 py-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            {saveError && (
              <p className="flex-1 font-outfit text-sm text-red-600 self-center">{saveError}</p>
            )}
            <Button type="button" variant="ghost" size="sm" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" loading={saving} disabled={!formTitle.trim()}>
              Salvar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
