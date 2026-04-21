'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { DollarSign, Receipt, Plus, Pencil } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import type {
  FinancialItem,
  FinancialItemCategory,
  FinancialItemStatus,
  FinancialItemType,
} from '@/lib/types'

const statusConfig: Record<
  FinancialItemStatus,
  { label: string; variant: 'gold' | 'success' | 'warning' | 'error' | 'brown' | 'neutral' }
> = {
  pending: { label: 'Pendente', variant: 'warning' },
  paid: { label: 'Pago', variant: 'success' },
  refunded: { label: 'Reembolsado', variant: 'error' },
}

const fallbackStatus = { label: 'Pendente', variant: 'neutral' as const }

const categoryOptions: { value: FinancialItemCategory; label: string }[] = [
  { value: 'flight', label: 'Voo' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'tour', label: 'Passeio' },
  { value: 'food', label: 'Alimentação' },
  { value: 'shopping', label: 'Compras' },
  { value: 'insurance', label: 'Seguro' },
  { value: 'visa', label: 'Visto' },
  { value: 'other', label: 'Outro' },
]

const currencyOptions: { value: string; label: string }[] = [
  { value: 'BRL', label: 'BRL — Real Brasileiro' },
  { value: 'USD', label: 'USD — Dólar Americano' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — Libra Esterlina' },
  { value: 'ARS', label: 'ARS — Peso Argentino' },
  { value: 'UYU', label: 'UYU — Peso Uruguaio' },
]

const selectClass =
  'w-full rounded-lg border border-brand-border font-outfit text-sm text-brand-text bg-brand-bg px-4 py-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent'

function safeCurrency(currency: string | null | undefined): string {
  if (!currency || currency.trim().length !== 3) return 'BRL'
  return currency.trim().toUpperCase()
}

function formatCurrency(value: number, currency: string | null | undefined): string {
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: safeCurrency(currency),
      minimumFractionDigits: 2,
    }).format(value ?? 0)
  } catch {
    return `${safeCurrency(currency)} ${(value ?? 0).toFixed(2)}`
  }
}

const emptyForm = {
  description: '',
  type: 'expense' as FinancialItemType,
  category: 'other' as FinancialItemCategory,
  amount: '',
  currency: 'BRL',
  amount_brl: '',
  status: 'pending' as FinancialItemStatus,
  due_date: '',
  notes: '',
}

export default function FinancialPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const [items, setItems] = useState<FinancialItem[]>([])
  const [loading, setLoading] = useState(true)

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<FinancialItem | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [form, setForm] = useState(emptyForm)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('financial_items')
        .select('*')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: true })

      if (!error && data) setItems(data)
    } catch {
      // silently ignore load errors – page shows empty state
    } finally {
      setLoading(false)
    }
  }, [tripId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const resetForm = () => setForm(emptyForm)

  const openAdd = () => {
    setEditingItem(null)
    resetForm()
    setModalOpen(true)
  }

  const openEdit = (item: FinancialItem) => {
    setEditingItem(item)
    setForm({
      description: item.description,
      type: item.type,
      category: item.category,
      amount: item.amount != null ? String(item.amount) : '',
      currency: item.currency ?? 'BRL',
      amount_brl: item.amount_brl != null ? String(item.amount_brl) : '',
      status: item.status,
      due_date: item.due_date ?? '',
      notes: item.notes ?? '',
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingItem(null)
    resetForm()
  }

  const handleSave = async () => {
    if (!form.description.trim()) return
    setSaving(true)
    const supabase = createClient()

    const payload = {
      trip_id: tripId,
      description: form.description.trim(),
      type: form.type,
      category: form.category,
      amount: form.amount !== '' ? parseFloat(form.amount) : 0,
      currency: safeCurrency(form.currency),
      amount_brl: form.amount_brl !== '' ? parseFloat(form.amount_brl) : null,
      status: form.status,
      due_date: form.due_date || null,
      notes: form.notes.trim() || null,
    }

    let error
    if (editingItem) {
      ;({ error } = await supabase
        .from('financial_items')
        .update(payload)
        .eq('id', editingItem.id))
    } else {
      ;({ error } = await supabase.from('financial_items').insert(payload))
    }

    setSaving(false)
    if (!error) {
      closeModal()
      await loadData()
    }
  }

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

  const totalEstimado = items.reduce((sum, item) => sum + (item.amount ?? 0), 0)
  const totalReal = items.reduce((sum, item) => sum + (item.amount_brl ?? 0), 0)
  const displayCurrency = safeCurrency(items[0]?.currency)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="font-cormorant text-3xl font-semibold text-brand-title">Financeiro</h1>
          <p className="font-outfit text-sm text-brand-muted">
            {items.length === 0
              ? 'Controle financeiro da sua viagem'
              : `${items.length} ${items.length === 1 ? 'item' : 'itens'}`}
          </p>
        </div>
        <Button size="sm" onClick={openAdd}>
          <Plus size={16} strokeWidth={1.5} />
          Adicionar
        </Button>
      </div>

      {items.length === 0 ? (
        <Card className="text-center py-16">
          <DollarSign size={40} strokeWidth={1.5} className="text-brand-muted mx-auto mb-3" />
          <p className="font-cormorant text-xl text-brand-title mb-1">Nenhum item financeiro</p>
          <p className="font-outfit text-sm text-brand-muted">
            Clique em &quot;Adicionar&quot; para registrar o primeiro item.
          </p>
        </Card>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card padding="md">
              <p className="font-inter text-xs text-brand-muted uppercase tracking-wider mb-1">
                Total Estimado
              </p>
              <p className="font-cormorant text-2xl font-semibold text-brand-title">
                {formatCurrency(totalEstimado, displayCurrency)}
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
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {items.map((item) => {
                    const status = statusConfig[item.status] ?? fallbackStatus
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
                            {formatCurrency(item.amount ?? 0, item.currency)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="font-inter text-sm text-brand-text">
                            {item.amount_brl != null
                              ? formatCurrency(item.amount_brl, 'BRL')
                              : '—'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => openEdit(item)}
                            className="p-1.5 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-hover transition-all"
                            title="Editar"
                          >
                            <Pencil size={15} strokeWidth={1.5} />
                          </button>
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
                        {formatCurrency(totalEstimado, displayCurrency)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="font-inter text-sm font-semibold text-brand-title">
                        {formatCurrency(totalReal, 'BRL')}
                      </span>
                    </td>
                    <td />
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingItem ? 'Editar Item Financeiro' : 'Adicionar Item Financeiro'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Descrição *"
            placeholder="Ex: Passagem aérea"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-inter text-sm font-medium text-brand-text">Tipo</label>
              <select
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as FinancialItemType }))}
                className={selectClass}
              >
                <option value="expense">Despesa</option>
                <option value="income">Receita</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-inter text-sm font-medium text-brand-text">Categoria</label>
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as FinancialItemCategory }))}
                className={selectClass}
              >
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Valor Estimado"
              type="number"
              min="0"
              step="0.01"
              placeholder="0,00"
              value={form.amount}
              onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
            />

            <div className="flex flex-col gap-1.5">
              <label className="font-inter text-sm font-medium text-brand-text">Moeda</label>
              <select
                value={form.currency}
                onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))}
                className={selectClass}
              >
                {currencyOptions.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Valor Real (BRL)"
              type="number"
              min="0"
              step="0.01"
              placeholder="0,00 (opcional)"
              value={form.amount_brl}
              onChange={(e) => setForm((p) => ({ ...p, amount_brl: e.target.value }))}
            />

            <div className="flex flex-col gap-1.5">
              <label className="font-inter text-sm font-medium text-brand-text">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as FinancialItemStatus }))}
                className={selectClass}
              >
                <option value="pending">Pendente</option>
                <option value="paid">Pago</option>
                <option value="refunded">Reembolsado</option>
              </select>
            </div>
          </div>

          <Input
            label="Data de vencimento"
            type="date"
            value={form.due_date}
            onChange={(e) => setForm((p) => ({ ...p, due_date: e.target.value }))}
          />

          <div className="flex flex-col gap-1.5">
            <label className="font-inter text-sm font-medium text-brand-text">
              Notas <span className="font-normal text-brand-muted">(opcional)</span>
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Observações adicionais"
              rows={2}
              className="w-full rounded-lg border border-brand-border font-outfit text-sm text-brand-text bg-brand-bg px-4 py-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={closeModal}>
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              loading={saving}
              disabled={!form.description.trim()}
              onClick={handleSave}
            >
              Salvar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}