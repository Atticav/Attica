'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { DollarSign, Receipt } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import type { FinancialItem, FinancialItemStatus } from '@/lib/types'

const statusConfig: Record<
  FinancialItemStatus,
  { label: string; variant: 'gold' | 'success' | 'warning' | 'error' | 'brown' | 'neutral' }
> = {
  pending: { label: 'Pendente', variant: 'warning' },
  paid: { label: 'Pago', variant: 'success' },
  refunded: { label: 'Reembolsado', variant: 'error' },
}

function formatCurrency(value: number, currency: string = 'BRL') {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value)
}

export default function FinancialPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const { t } = useLanguage()
  const [items, setItems] = useState<FinancialItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('financial_items')
      .select('*')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: true })

    if (!error && data) setItems(data)
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

  const totalEstimado = items.reduce((sum, item) => sum + item.amount, 0)
  const totalReal = items.reduce((sum, item) => sum + (item.amount_brl ?? 0), 0)

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="font-cormorant text-3xl font-semibold text-brand-title">Financeiro</h1>
          <p className="font-outfit text-sm text-brand-muted">Controle financeiro da sua viagem</p>
        </div>
        <Card className="text-center py-16">
          <DollarSign size={40} strokeWidth={1.5} className="text-brand-muted mx-auto mb-3" />
          <p className="font-cormorant text-xl text-brand-title mb-1">Nenhum item financeiro</p>
          <p className="font-outfit text-sm text-brand-muted">
            Os itens financeiros da sua viagem aparecerão aqui.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-cormorant text-3xl font-semibold text-brand-title">Financeiro</h1>
        <p className="font-outfit text-sm text-brand-muted">
          {items.length} {items.length === 1 ? 'item' : 'itens'}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card padding="md">
          <p className="font-inter text-xs text-brand-muted uppercase tracking-wider mb-1">
            Total Estimado
          </p>
          <p className="font-cormorant text-2xl font-semibold text-brand-title">
            {formatCurrency(totalEstimado, items[0]?.currency || 'BRL')}
          </p>
        </Card>
        <Card padding="md">
          <p className="font-inter text-xs text-brand-muted uppercase tracking-wider mb-1">
            Total Real (BRL)
          </p>
          <p className="font-cormorant text-2xl font-semibold text-brand-title">
            {formatCurrency(totalReal, 'BRL')}
          </p>
        </Card>
      </div>

      {/* Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-border">
                <th className="text-left px-5 py-3 font-inter text-xs font-medium text-brand-muted uppercase tracking-wider">
                  Descrição
                </th>
                <th className="text-right px-5 py-3 font-inter text-xs font-medium text-brand-muted uppercase tracking-wider">
                  Valor Estimado
                </th>
                <th className="text-right px-5 py-3 font-inter text-xs font-medium text-brand-muted uppercase tracking-wider">
                  Valor Real
                </th>
                <th className="text-center px-5 py-3 font-inter text-xs font-medium text-brand-muted uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {items.map((item) => {
                const status = statusConfig[item.status]
                return (
                  <tr key={item.id} className="hover:bg-brand-hover/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 p-1.5 bg-brand-bg-secondary rounded-lg">
                          <Receipt size={16} strokeWidth={1.5} className="text-brand-gold" />
                        </div>
                        <div>
                          <p className="font-inter text-sm font-medium text-brand-title">
                            {item.description}
                          </p>
                          {item.notes && (
                            <p className="font-outfit text-xs text-brand-muted mt-0.5">
                              {item.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="font-inter text-sm text-brand-text">
                        {formatCurrency(item.amount, item.currency)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="font-inter text-sm text-brand-text">
                        {item.amount_brl !== null
                          ? formatCurrency(item.amount_brl, 'BRL')
                          : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-brand-border bg-brand-bg-secondary/50">
                <td className="px-5 py-4">
                  <span className="font-inter text-sm font-semibold text-brand-title">Total</span>
                </td>
                <td className="px-5 py-4 text-right">
                  <span className="font-inter text-sm font-semibold text-brand-title">
                    {formatCurrency(totalEstimado, items[0]?.currency || 'BRL')}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <span className="font-inter text-sm font-semibold text-brand-title">
                    {formatCurrency(totalReal, 'BRL')}
                  </span>
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  )
}
