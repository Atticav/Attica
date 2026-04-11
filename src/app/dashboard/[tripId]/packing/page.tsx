'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { Plus, AlertTriangle, Luggage } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import ProgressBar from '@/components/ui/ProgressBar'
import Tabs from '@/components/ui/Tabs'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import type { PackingItem, PackingItemCategory } from '@/lib/types'

const CATEGORY_BADGE: Record<PackingItemCategory, string> = {
  clothing: 'bg-purple-100 text-purple-700',
  documents: 'bg-yellow-100 text-yellow-700',
  health: 'bg-green-100 text-green-700',
  electronics: 'bg-blue-100 text-blue-700',
  toiletries: 'bg-pink-100 text-pink-700',
  accessories: 'bg-orange-100 text-orange-700',
  other: 'bg-gray-100 text-gray-700',
}

const CATEGORY_KEYS: PackingItemCategory[] = [
  'clothing', 'documents', 'health', 'electronics', 'toiletries', 'accessories', 'other',
]

interface NewItemForm {
  item_name: string
  category: PackingItemCategory
  quantity: number
  notes: string
}

const DEFAULT_FORM: NewItemForm = {
  item_name: '',
  category: 'clothing',
  quantity: 1,
  notes: '',
}

export default function PackingPage() {
  const params = useParams()
  const tripId = params.tripId as string
  const { t } = useLanguage()

  const CATEGORY_LABELS: Record<PackingItemCategory, string> = t.packing.categories

  const FILTER_OPTIONS: { value: PackingItemCategory | 'all'; label: string }[] = [
    { value: 'all', label: t.packing.allCategories },
    ...CATEGORY_KEYS.map((key) => ({ value: key, label: CATEGORY_LABELS[key] })),
  ]

  const [items, setItems] = useState<PackingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('packing')
  const [activeFilter, setActiveFilter] = useState<PackingItemCategory | 'all'>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<NewItemForm>(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadItems = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('packing_items')
      .select('*')
      .eq('trip_id', tripId)
      .order('order_index', { ascending: true })

    if (!error && data) setItems(data)
    setLoading(false)
  }, [tripId])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  async function togglePacked(item: PackingItem) {
    const supabase = createClient()
    const { error } = await supabase
      .from('packing_items')
      .update({ is_packed: !item.is_packed, updated_at: new Date().toISOString() })
      .eq('id', item.id)

    if (!error) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_packed: !item.is_packed } : i))
      )
    }
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault()
    if (!form.item_name.trim()) return
    setSaving(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.from('packing_items').insert({
      trip_id: tripId,
      item_name: form.item_name.trim(),
      category: form.category,
      quantity: form.quantity,
      notes: form.notes.trim() || null,
      is_packed: false,
      is_essential: false,
      order_index: items.length,
    })

    if (error) {
      setError(t.common.error)
    } else {
      setModalOpen(false)
      setForm(DEFAULT_FORM)
      await loadItems()
    }
    setSaving(false)
  }

  const filteredItems = useMemo(
    () =>
      items
        .filter((i) => activeFilter === 'all' || i.category === activeFilter)
        .sort((a, b) => Number(a.is_packed) - Number(b.is_packed)),
    [items, activeFilter]
  )

  const packedCount = useMemo(() => items.filter((i) => i.is_packed).length, [items])
  const totalCount = items.length
  const progressValue = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0

  const tabs = [
    { id: 'packing', label: t.packing.bag, count: totalCount },
    { id: 'restricted', label: t.packing.restricted },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
          <p className="font-inter text-sm text-brand-muted">{t.common.loading}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-cormorant text-3xl font-semibold text-brand-title">
            {t.packing.title}
          </h1>
          {totalCount > 0 && (
            <p className="font-outfit text-sm text-brand-muted">
              {packedCount} {t.common.of} {totalCount} {t.packing.itemsReady} ({progressValue}%)
            </p>
          )}
        </div>
        <Button onClick={() => setModalOpen(true)} size="sm">
          <Plus size={16} strokeWidth={1.5} />
          {t.packing.addItem}
        </Button>
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <ProgressBar
          value={progressValue}
          label={`${packedCount} ${t.common.of} ${totalCount} ${t.packing.itemsReady}`}
          showPercentage
        />
      )}

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab: Mala */}
      {activeTab === 'packing' && (
        <div className="space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setActiveFilter(opt.value)}
                className={cn(
                  'px-3 py-1.5 rounded-full font-inter text-xs transition-all',
                  activeFilter === opt.value
                    ? 'bg-brand-gold text-white shadow-gold'
                    : 'border border-brand-border text-brand-text hover:bg-brand-hover'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Items List */}
          {filteredItems.length === 0 ? (
            <Card className="text-center py-16">
              <Luggage size={40} strokeWidth={1.5} className="text-brand-muted mx-auto mb-3" />
              <p className="font-cormorant text-xl text-brand-title mb-1">
                {t.packing.noItems}
              </p>
              <p className="font-outfit text-sm text-brand-muted">
                {t.packing.noItems}
              </p>
            </Card>
          ) : (
            <Card padding="none">
              <ul className="divide-y divide-brand-border">
                {filteredItems.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-brand-bg transition-colors"
                  >
                    <button
                      onClick={() => togglePacked(item)}
                      className={cn(
                        'flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
                        item.is_packed
                          ? 'bg-brand-gold border-brand-gold'
                          : 'border-brand-border hover:border-brand-gold'
                      )}
                      aria-label={item.is_packed ? t.packing.packed : t.packing.notPacked}
                    >
                      {item.is_packed && (
                        <svg viewBox="0 0 12 10" className="w-3 h-3 fill-none stroke-white stroke-2">
                          <polyline points="1,5 4,9 11,1" />
                        </svg>
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={cn(
                            'font-outfit text-sm text-brand-title',
                            item.is_packed && 'line-through opacity-50'
                          )}
                        >
                          {item.item_name}
                          {item.quantity > 1 && (
                            <span className="font-inter text-xs text-brand-muted ml-1">
                              (x{item.quantity})
                            </span>
                          )}
                        </span>
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full font-inter text-xs',
                            CATEGORY_BADGE[item.category]
                          )}
                        >
                          {CATEGORY_LABELS[item.category]}
                        </span>
                      </div>
                      {item.notes && (
                        <p className="font-inter text-xs text-brand-muted mt-0.5 truncate">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      {/* Tab: O Que Não Levar */}
      {activeTab === 'restricted' && (
        <Card className="border border-brand-error/30">
          <div className="flex flex-col items-center text-center py-10 gap-4">
            <div className="p-3 bg-brand-error/10 rounded-full">
              <AlertTriangle size={28} strokeWidth={1.5} className="text-brand-error" />
            </div>
            <div>
              <p className="font-cormorant text-xl text-brand-title mb-1">
                {t.packing.noRestrictions}
              </p>
              <p className="font-outfit text-sm text-brand-muted">
                {t.packing.noRestrictionsDesc}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Add Item Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setForm(DEFAULT_FORM); setError(null) }}
        title={t.packing.addItemModal}
        size="md"
      >
        <form onSubmit={handleAddItem} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-inter text-sm font-medium text-brand-text">
              {t.packing.itemName} <span className="text-brand-error">{t.common.required}</span>
            </label>
            <input
              type="text"
              value={form.item_name}
              onChange={(e) => setForm((f) => ({ ...f, item_name: e.target.value }))}
              placeholder="Ex: Passaporte, Carregador..."
              required
              className="w-full rounded-lg border border-brand-border font-outfit text-sm text-brand-text bg-brand-bg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent placeholder:text-brand-muted"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-inter text-sm font-medium text-brand-text">{t.packing.category}</label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as PackingItemCategory }))}
              className="w-full rounded-lg border border-brand-border font-outfit text-sm text-brand-text bg-brand-bg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
            >
              {(Object.keys(CATEGORY_LABELS) as PackingItemCategory[]).map((cat) => (
                <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-inter text-sm font-medium text-brand-text">{t.packing.quantity}</label>
            <input
              type="number"
              min={1}
              value={form.quantity}
              onChange={(e) => setForm((f) => ({ ...f, quantity: parseInt(e.target.value) || 1 }))}
              className="w-full rounded-lg border border-brand-border font-outfit text-sm text-brand-text bg-brand-bg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-inter text-sm font-medium text-brand-text">
              {t.packing.notes} <span className="text-brand-muted font-normal">({t.common.optional})</span>
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
              placeholder="Observações adicionais..."
              className="w-full rounded-lg border border-brand-border font-outfit text-sm text-brand-text bg-brand-bg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent placeholder:text-brand-muted resize-none"
            />
          </div>

          {error && (
            <p className="font-inter text-xs text-brand-error">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => { setModalOpen(false); setForm(DEFAULT_FORM) }}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" loading={saving}>
              {t.packing.addItem}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
