'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { FileSignature, ExternalLink, CalendarCheck, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import type { Contract, ContractStatus } from '@/lib/types'

const statusConfig: Record<
  ContractStatus,
  { label: string; variant: 'gold' | 'success' | 'warning' | 'error' | 'brown' | 'neutral' }
> = {
  draft: { label: 'Rascunho', variant: 'neutral' },
  sent: { label: 'Enviado', variant: 'warning' },
  signed: { label: 'Assinado', variant: 'success' },
  cancelled: { label: 'Cancelado', variant: 'error' },
}

export default function ContractPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const { t } = useLanguage()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false })

    if (!error && data) setContracts(data)
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

  if (contracts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="font-cormorant text-3xl font-semibold text-brand-title">Contratos</h1>
          <p className="font-outfit text-sm text-brand-muted">Contratos da sua viagem</p>
        </div>
        <Card className="text-center py-16">
          <FileSignature size={40} strokeWidth={1.5} className="text-brand-muted mx-auto mb-3" />
          <p className="font-cormorant text-xl text-brand-title mb-1">Nenhum contrato</p>
          <p className="font-outfit text-sm text-brand-muted">
            Os contratos da sua viagem aparecerão aqui.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-cormorant text-3xl font-semibold text-brand-title">Contratos</h1>
        <p className="font-outfit text-sm text-brand-muted">
          {contracts.length} {contracts.length === 1 ? 'contrato' : 'contratos'}
        </p>
      </div>

      <div className="grid gap-4">
        {contracts.map((contract) => {
          const status = statusConfig[contract.status]
          return (
            <Card key={contract.id} padding="md">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 p-2.5 bg-brand-bg-secondary rounded-lg">
                      <FileSignature size={22} strokeWidth={1.5} className="text-brand-gold" />
                    </div>
                    <h3 className="font-inter text-sm font-medium text-brand-title">
                      {contract.title}
                    </h3>
                  </div>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>

                {contract.content && (
                  <p className="font-outfit text-sm text-brand-text line-clamp-3">
                    {contract.content}
                  </p>
                )}

                <div className="flex flex-wrap gap-4">
                  {contract.sent_at && (
                    <div className="flex items-center gap-1.5 text-brand-muted">
                      <Send size={13} strokeWidth={1.5} />
                      <span className="font-inter text-xs">
                        Enviado em{' '}
                        {new Date(contract.sent_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}
                  {contract.signed_at && (
                    <div className="flex items-center gap-1.5 text-brand-success">
                      <CalendarCheck size={13} strokeWidth={1.5} />
                      <span className="font-inter text-xs">
                        Assinado em{' '}
                        {new Date(contract.signed_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}
                </div>

                {contract.notes && (
                  <p className="font-outfit text-xs text-brand-muted italic">{contract.notes}</p>
                )}

                {contract.file_url && (
                  <a
                    href={contract.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-inter text-xs font-medium text-brand-gold hover:text-brand-gold-dark transition-colors"
                  >
                    <ExternalLink size={13} strokeWidth={1.5} />
                    Abrir contrato
                  </a>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
