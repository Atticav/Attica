'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  FileText,
  ExternalLink,
  CalendarClock,
  Stamp,
  Ticket,
  FileCheck,
  Shield,
  File,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import type { Document, DocumentType } from '@/lib/types'

const typeConfig: Record<
  DocumentType,
  { icon: typeof FileText; label: string; variant: 'gold' | 'success' | 'warning' | 'error' | 'brown' | 'neutral' }
> = {
  passport: { icon: Stamp, label: 'Passaporte', variant: 'gold' },
  visa: { icon: FileCheck, label: 'Visto', variant: 'brown' },
  ticket: { icon: Ticket, label: 'Passagem', variant: 'success' },
  voucher: { icon: FileText, label: 'Voucher', variant: 'warning' },
  insurance: { icon: Shield, label: 'Seguro', variant: 'neutral' },
  other: { icon: File, label: 'Outro', variant: 'neutral' },
}

export default function DocumentsPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const { t } = useLanguage()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

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

  if (documents.length === 0) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="font-cormorant text-3xl font-semibold text-brand-title">Documentos</h1>
          <p className="font-outfit text-sm text-brand-muted">Documentos da sua viagem</p>
        </div>
        <Card className="text-center py-16">
          <FileText size={40} strokeWidth={1.5} className="text-brand-muted mx-auto mb-3" />
          <p className="font-cormorant text-xl text-brand-title mb-1">Nenhum documento</p>
          <p className="font-outfit text-sm text-brand-muted">
            Os documentos da sua viagem aparecerão aqui.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-cormorant text-3xl font-semibold text-brand-title">Documentos</h1>
        <p className="font-outfit text-sm text-brand-muted">
          {documents.length} {documents.length === 1 ? 'documento' : 'documentos'}
        </p>
      </div>

      <div className="grid gap-4">
        {documents.map((doc) => {
          const config = typeConfig[doc.type]
          const Icon = config.icon
          const isExpired =
            doc.expiry_date && new Date(doc.expiry_date) < new Date()

          return (
            <Card key={doc.id} padding="md">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-2.5 bg-brand-bg-secondary rounded-lg">
                  <Icon size={22} strokeWidth={1.5} className="text-brand-gold" />
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <h3 className="font-inter text-sm font-medium text-brand-title">
                      {doc.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant={config.variant}>{config.label}</Badge>
                      {isExpired && <Badge variant="error">Expirado</Badge>}
                    </div>
                  </div>
                  {doc.description && (
                    <p className="font-outfit text-sm text-brand-text">{doc.description}</p>
                  )}
                  {doc.expiry_date && (
                    <div className="flex items-center gap-1.5 text-brand-muted">
                      <CalendarClock size={13} strokeWidth={1.5} />
                      <span className="font-inter text-xs">
                        Validade:{' '}
                        {new Date(doc.expiry_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}
                  {doc.notes && (
                    <p className="font-outfit text-xs text-brand-muted italic">{doc.notes}</p>
                  )}
                  {doc.file_url && (
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-inter text-xs font-medium text-brand-gold hover:text-brand-gold-dark transition-colors"
                    >
                      <ExternalLink size={13} strokeWidth={1.5} />
                      Abrir documento
                    </a>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
