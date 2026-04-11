'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import {
  Plus, CheckSquare, FileText, Heart, CreditCard, Briefcase, Smartphone, Home, MoreHorizontal,
  Calendar,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { formatDateShort } from '@/lib/utils'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import ProgressBar from '@/components/ui/ProgressBar'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import type { ChecklistItem } from '@/lib/types'
import type { ReactNode } from 'react'

function getSectionIcon(section: string): ReactNode {
  const lower = section.toLowerCase()
  if (lower.includes('document') || lower.includes('documenta')) return <FileText size={16} strokeWidth={1.5} />
  if (lower.includes('saúde') || lower.includes('saude') || lower.includes('health')) return <Heart size={16} strokeWidth={1.5} />
  if (lower.includes('financ') || lower.includes('financeiro')) return <CreditCard size={16} strokeWidth={1.5} />
  if (lower.includes('bagagem') || lower.includes('baggage') || lower.includes('mala')) return <Briefcase size={16} strokeWidth={1.5} />
  if (lower.includes('tecnolog') || lower.includes('tech')) return <Smartphone size={16} strokeWidth={1.5} />
  if (lower.includes('casa') || lower.includes('home')) return <Home size={16} strokeWidth={1.5} />
  return <MoreHorizontal size={16} strokeWidth={1.5} />
}

interface NewTaskForm {
  title: string
  section: string
  description: string
}

export default function ChecklistPage() {
  const params = useParams()
  const tripId = params.tripId as string
  const { t } = useLanguage()

  const [items, setItems] = useState<ChecklistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<NewTaskForm>({ title: '', section: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadItems = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('checklist_items')
      .select('*')
      .eq('trip_id', tripId)
      .order('order_index', { ascending: true })

    if (!error && data) setItems(data)
    setLoading(false)
  }, [tripId])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  async function toggleCompleted(item: ChecklistItem) {
    const supabase = createClient()
    const { error } = await supabase
      .from('checklist_items')
      .update({ is_completed: !item.is_completed, updated_at: new Date().toISOString() })
      .eq('id', item.id)

    if (!error) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_completed: !item.is_completed } : i))
      )
    }
  }

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    setError(null)

    const sections = Array.from(new Set(items.map((i) => i.section)))
    const section = form.section.trim() || sections[0] || 'Outros'

    const supabase = createClient()
    const { error } = await supabase.from('checklist_items').insert({
      trip_id: tripId,
      title: form.title.trim(),
      section,
      description: form.description.trim() || null,
      is_completed: false,
      order_index: items.length,
    })

    if (error) {
      setError(t.common.error)
    } else {
      setModalOpen(false)
      setForm({ title: '', section: '', description: '' })
      await loadItems()
    }
    setSaving(false)
  }

  // Group by section, sorting completed to bottom within each section
  const { groupedItems, completedCount, totalCount } = useMemo(() => {
    const sectionNames = Array.from(new Set(items.map((i) => i.section)))
    const grouped = sectionNames.map((section) => ({
      section,
      items: items
        .filter((i) => i.section === section)
        .sort((a, b) => Number(a.is_completed) - Number(b.is_completed)),
    }))
    const completed = items.filter((i) => i.is_completed).length
    return { groupedItems: grouped, completedCount: completed, totalCount: items.length }
  }, [items])

  const progressValue = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

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
            {t.checklist.title}
          </h1>
          {totalCount > 0 && (
            <p className="font-outfit text-sm text-brand-muted">
              {completedCount} {t.common.of} {totalCount} {t.checklist.tasksCompleted} ({progressValue}%)
            </p>
          )}
        </div>
        <Button onClick={() => setModalOpen(true)} size="sm">
          <Plus size={16} strokeWidth={1.5} />
          {t.checklist.addTask}
        </Button>
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <ProgressBar
          value={progressValue}
          label={`${completedCount} ${t.common.of} ${totalCount} ${t.checklist.tasksCompleted}`}
          showPercentage
        />
      )}

      {/* Empty state */}
      {items.length === 0 && (
        <Card className="text-center py-16">
          <CheckSquare size={40} strokeWidth={1.5} className="text-brand-muted mx-auto mb-3" />
          <p className="font-cormorant text-xl text-brand-title mb-1">
            {t.checklist.noItems}
          </p>
          <p className="font-outfit text-sm text-brand-muted">
            {t.checklist.noItemsDesc}
          </p>
        </Card>
      )}

      {/* Sections */}
      <div className="space-y-4">
        {groupedItems.map(({ section, items: sectionItems }) => {
          const sectionCompleted = sectionItems.filter((i) => i.is_completed).length
          const sectionTotal = sectionItems.length
          const sectionProgress = sectionTotal > 0 ? Math.round((sectionCompleted / sectionTotal) * 100) : 0

          return (
            <Card key={section}>
              {/* Section Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-brand-gold">
                  {getSectionIcon(section)}
                  <h2 className="font-cormorant text-lg font-semibold text-brand-title">
                    {section}
                  </h2>
                </div>
                <span className="font-inter text-xs text-brand-muted">
                  {sectionCompleted}/{sectionTotal}
                </span>
              </div>

              <ProgressBar value={sectionProgress} className="mb-4" />

              {/* Items */}
              <ul className="space-y-2">
                {sectionItems.map((item) => (
                  <li
                    key={item.id}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg hover:bg-brand-bg transition-colors',
                      item.is_completed && 'opacity-50'
                    )}
                  >
                    <button
                      onClick={() => toggleCompleted(item)}
                      className={cn(
                        'flex-shrink-0 mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
                        item.is_completed
                          ? 'bg-brand-gold border-brand-gold'
                          : 'border-brand-border hover:border-brand-gold'
                      )}
                      aria-label={item.is_completed ? t.checklist.completed : t.checklist.pending}
                    >
                      {item.is_completed && (
                        <svg viewBox="0 0 12 10" className="w-3 h-3 fill-none stroke-white stroke-2">
                          <polyline points="1,5 4,9 11,1" />
                        </svg>
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'font-outfit text-sm text-brand-title',
                          item.is_completed && 'line-through'
                        )}
                      >
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="font-inter text-xs text-brand-muted mt-0.5">
                          {item.description}
                        </p>
                      )}
                      {item.deadline && (
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar size={11} strokeWidth={1.5} className="text-brand-muted" />
                          <span className="font-inter text-xs text-brand-muted">
                            {t.checklist.deadline}: {formatDateShort(item.deadline)}
                          </span>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )
        })}
      </div>

      {/* Add Task Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setForm({ title: '', section: '', description: '' }); setError(null) }}
        title={t.checklist.addTaskModal}
        size="md"
      >
        <form onSubmit={handleAddTask} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-inter text-sm font-medium text-brand-text">
              {t.checklist.taskTitle} <span className="text-brand-error">{t.common.required}</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Ex: Renovar passaporte"
              required
              className="w-full rounded-lg border border-brand-border font-outfit text-sm text-brand-text bg-brand-bg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent placeholder:text-brand-muted"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-inter text-sm font-medium text-brand-text">
              {t.checklist.section}{' '}
              <span className="text-brand-muted font-normal">
                ({t.checklist.sectionHint})
              </span>
            </label>
            <input
              type="text"
              value={form.section}
              onChange={(e) => setForm((f) => ({ ...f, section: e.target.value }))}
              placeholder={
                items.length > 0
                  ? Array.from(new Set(items.map((i) => i.section)))[0]
                  : 'Ex: Documentação'
              }
              list="section-options"
              className="w-full rounded-lg border border-brand-border font-outfit text-sm text-brand-text bg-brand-bg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent placeholder:text-brand-muted"
            />
            <datalist id="section-options">
              {Array.from(new Set(items.map((i) => i.section))).map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-inter text-sm font-medium text-brand-text">
              {t.checklist.description} <span className="text-brand-muted font-normal">({t.common.optional})</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              placeholder="Detalhes adicionais sobre esta tarefa..."
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
              onClick={() => { setModalOpen(false); setForm({ title: '', section: '', description: '' }) }}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" loading={saving}>
              {t.checklist.addTask}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
