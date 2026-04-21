'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Plane,
  Hotel,
  Car,
  Map,
  UtensilsCrossed,
  Activity,
  MoreHorizontal,
  List,
  AlignLeft,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import type { ItineraryItem, ItineraryItemCategory } from '@/lib/types'

type ViewMode = 'list' | 'timeline' | 'calendar'

const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]
const WEEKDAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function getItemEffectiveDate(item: ItineraryItem, tripStartDate: string | null): string | null {
  if (item.date) return item.date
  if (tripStartDate) {
    const start = new Date(tripStartDate + 'T00:00:00')
    start.setDate(start.getDate() + item.day_number - 1)
    return start.toISOString().split('T')[0]
  }
  return null
}

function getCalendarDateStr(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${year}-${m}-${d}`
}

const categoryConfig: Record<
  ItineraryItemCategory,
  { icon: typeof Plane; label: string; variant: 'gold' | 'success' | 'warning' | 'error' | 'brown' | 'neutral' }
> = {
  flight: { icon: Plane, label: 'Voo', variant: 'gold' },
  hotel: { icon: Hotel, label: 'Hotel', variant: 'brown' },
  transfer: { icon: Car, label: 'Transfer', variant: 'neutral' },
  tour: { icon: Map, label: 'Passeio', variant: 'success' },
  restaurant: { icon: UtensilsCrossed, label: 'Restaurante', variant: 'warning' },
  activity: { icon: Activity, label: 'Atividade', variant: 'gold' },
  other: { icon: MoreHorizontal, label: 'Outro', variant: 'neutral' },
}

export default function ItineraryPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const { t } = useLanguage()
  const [items, setItems] = useState<ItineraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear())
  const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth())
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<string | null>(null)
  const [tripStartDate, setTripStartDate] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const [{ data: itemsData, error: itemsError }, { data: tripData }] = await Promise.all([
      supabase
        .from('itinerary_items')
        .select('*')
        .eq('trip_id', tripId)
        .order('day_number', { ascending: true })
        .order('order_index', { ascending: true }),
      supabase
        .from('trips')
        .select('start_date')
        .eq('id', tripId)
        .single(),
    ])

    if (!itemsError && itemsData) {
      setItems(itemsData)
      const firstItemDate = itemsData.find((i) => i.date)?.date
      const refDate = firstItemDate ?? tripData?.start_date ?? null
      if (refDate) {
        const d = new Date(refDate + 'T00:00:00')
        setCalendarYear(d.getFullYear())
        setCalendarMonth(d.getMonth())
      }
    }
    if (tripData?.start_date) setTripStartDate(tripData.start_date)
    setLoading(false)
  }, [tripId])

  const prevMonth = useCallback(() => {
    setSelectedCalendarDay(null)
    setCalendarMonth((m) => {
      if (m === 0) {
        setCalendarYear((y) => y - 1)
        return 11
      }
      return m - 1
    })
  }, [])

  const nextMonth = useCallback(() => {
    setSelectedCalendarDay(null)
    setCalendarMonth((m) => {
      if (m === 11) {
        setCalendarYear((y) => y + 1)
        return 0
      }
      return m + 1
    })
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Calendar derived values
  const dateItemsMap = items.reduce<Record<string, ItineraryItem[]>>((acc, item) => {
    const date = getItemEffectiveDate(item, tripStartDate)
    if (date) {
      if (!acc[date]) acc[date] = []
      acc[date].push(item)
    }
    return acc
  }, {})
  const hasAnyDates = items.some((i) => i.date) || !!tripStartDate
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1).getDay()
  const totalCalendarCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7

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

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="font-cormorant text-3xl font-semibold text-brand-title">Roteiro</h1>
          <p className="font-outfit text-sm text-brand-muted">Seu itinerário dia a dia</p>
        </div>
        <Card className="text-center py-16">
          <Calendar size={40} strokeWidth={1.5} className="text-brand-muted mx-auto mb-3" />
          <p className="font-cormorant text-xl text-brand-title mb-1">Nenhum item no roteiro</p>
          <p className="font-outfit text-sm text-brand-muted">
            O roteiro da sua viagem aparecerá aqui quando for adicionado.
          </p>
        </Card>
      </div>
    )
  }

  const grouped = items.reduce<Record<number, ItineraryItem[]>>((acc, item) => {
    const day = item.day_number
    if (!acc[day]) acc[day] = []
    acc[day].push(item)
    return acc
  }, {})

  const sortedDays = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => a - b)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-cormorant text-3xl font-semibold text-brand-title">Roteiro</h1>
          <p className="font-outfit text-sm text-brand-muted">
            {items.length} {items.length === 1 ? 'atividade' : 'atividades'} em {sortedDays.length}{' '}
            {sortedDays.length === 1 ? 'dia' : 'dias'}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-brand-bg-secondary rounded-lg p-1">
          <Button
            variant={viewMode === 'list' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List size={16} strokeWidth={1.5} />
          </Button>
          <Button
            variant={viewMode === 'timeline' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('timeline')}
          >
            <AlignLeft size={16} strokeWidth={1.5} />
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('calendar')}
          >
            <CalendarDays size={16} strokeWidth={1.5} />
          </Button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="space-y-4">
          {!hasAnyDates ? (
            <Card className="text-center py-12">
              <CalendarDays size={32} strokeWidth={1.5} className="text-brand-muted mx-auto mb-3" />
              <p className="font-cormorant text-xl text-brand-title mb-1">Datas não definidas</p>
              <p className="font-outfit text-sm text-brand-muted">
                As atividades do roteiro ainda não têm datas definidas.
              </p>
            </Card>
          ) : (
            <Card padding="none">
              {/* Month navigation header */}
              <div className="flex items-center justify-between px-6 py-4 bg-brand-bg-secondary border-b border-brand-border rounded-t-lg">
                <button
                  onClick={prevMonth}
                  className="p-1 hover:bg-brand-hover rounded-lg transition-colors"
                  aria-label="Mês anterior"
                >
                  <ChevronLeft size={18} strokeWidth={1.5} className="text-brand-muted" />
                </button>
                <h2 className="font-cormorant text-xl font-semibold text-brand-title">
                  {MONTHS_PT[calendarMonth]} {calendarYear}
                </h2>
                <button
                  onClick={nextMonth}
                  className="p-1 hover:bg-brand-hover rounded-lg transition-colors"
                  aria-label="Próximo mês"
                >
                  <ChevronRight size={18} strokeWidth={1.5} className="text-brand-muted" />
                </button>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 border-b border-brand-border">
                {WEEKDAYS_PT.map((wd) => (
                  <div
                    key={wd}
                    className="py-2 text-center font-inter text-xs font-semibold text-brand-muted uppercase tracking-wider bg-brand-bg-secondary"
                  >
                    {wd}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7">
                {Array.from({ length: totalCalendarCells }).map((_, idx) => {
                  const dayNum = idx - firstDayOfMonth + 1
                  const isCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth
                  const dateStr = isCurrentMonth
                    ? getCalendarDateStr(calendarYear, calendarMonth, dayNum)
                    : null
                  const dayItems = dateStr ? (dateItemsMap[dateStr] ?? []) : []
                  const isSelected = dateStr !== null && dateStr === selectedCalendarDay
                  const hasItems = dayItems.length > 0

                  return (
                    <div
                      key={idx}
                      className={[
                        'min-h-[80px] p-1.5 border-b border-r border-brand-border',
                        idx % 7 === 6 ? 'border-r-0' : '',
                        !isCurrentMonth ? 'opacity-30 bg-brand-bg-secondary/50' : '',
                        hasItems ? 'cursor-pointer hover:bg-brand-hover/40 transition-colors' : '',
                      ].join(' ')}
                      onClick={() => {
                        if (hasItems && dateStr) {
                          setSelectedCalendarDay(isSelected ? null : dateStr)
                        }
                      }}
                    >
                      {isCurrentMonth && (
                        <>
                          <div
                            className={[
                              'flex items-center justify-center w-7 h-7 rounded-full font-inter text-sm font-medium mx-auto mb-1',
                              hasItems ? 'bg-brand-gold text-white' : 'text-brand-muted',
                              isSelected ? 'ring-2 ring-offset-1 ring-brand-gold' : '',
                            ].join(' ')}
                          >
                            {dayNum}
                          </div>
                          {hasItems && (
                            <div className="flex flex-col gap-0.5">
                              {dayItems.slice(0, 3).map((item) => {
                                const config = categoryConfig[item.category]
                                return (
                                  <Badge
                                    key={item.id}
                                    variant={config.variant}
                                    className="text-[10px] py-0 px-1 truncate w-full block text-center"
                                  >
                                    {config.label}
                                  </Badge>
                                )
                              })}
                              {dayItems.length > 3 && (
                                <span className="font-inter text-[10px] text-brand-muted text-center">
                                  +{dayItems.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </Card>
          )}

          {/* Selected day panel */}
          {selectedCalendarDay && dateItemsMap[selectedCalendarDay] && (
            <div className="space-y-3">
              <h3 className="font-cormorant text-xl font-semibold text-brand-title">
                {new Date(selectedCalendarDay + 'T00:00:00').toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </h3>
              <div className="grid gap-3">
                {dateItemsMap[selectedCalendarDay].map((item) => {
                  const config = categoryConfig[item.category]
                  const Icon = config.icon
                  return (
                    <Card key={item.id} padding="md">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-0.5 p-2 bg-brand-bg-secondary rounded-lg">
                          <Icon size={20} strokeWidth={1.5} className="text-brand-gold" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-inter text-sm font-medium text-brand-title">
                              {item.title}
                            </h3>
                            <Badge variant={config.variant}>{config.label}</Badge>
                          </div>
                          {item.time && (
                            <div className="flex items-center gap-1.5 text-brand-muted">
                              <Clock size={13} strokeWidth={1.5} />
                              <span className="font-inter text-xs">{item.time}</span>
                            </div>
                          )}
                          {item.description && (
                            <p className="font-outfit text-sm text-brand-text">{item.description}</p>
                          )}
                          {item.location && (
                            <div className="flex items-center gap-1.5 text-brand-muted">
                              <MapPin size={13} strokeWidth={1.5} />
                              <span className="font-outfit text-xs">{item.location}</span>
                            </div>
                          )}
                          {item.confirmation_code && (
                            <p className="font-inter text-xs text-brand-muted">
                              Código: <span className="font-medium text-brand-text">{item.confirmation_code}</span>
                            </p>
                          )}
                          {item.notes && (
                            <p className="font-outfit text-xs text-brand-muted italic">{item.notes}</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      ) : sortedDays.map((day) => (
        <div key={day} className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-gold text-white font-inter text-sm font-semibold">
              {day}
            </div>
            <div>
              <h2 className="font-cormorant text-xl font-semibold text-brand-title">
                Dia {day}
              </h2>
              {grouped[day][0]?.date && (
                <p className="font-outfit text-xs text-brand-muted">
                  {new Date(grouped[day][0].date + 'T00:00:00').toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </p>
              )}
            </div>
          </div>

          {viewMode === 'list' ? (
            <div className="grid gap-3">
              {grouped[day].map((item) => {
                const config = categoryConfig[item.category]
                const Icon = config.icon
                return (
                  <Card key={item.id} padding="md">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-0.5 p-2 bg-brand-bg-secondary rounded-lg">
                        <Icon size={20} strokeWidth={1.5} className="text-brand-gold" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-inter text-sm font-medium text-brand-title">
                            {item.title}
                          </h3>
                          <Badge variant={config.variant}>{config.label}</Badge>
                        </div>
                        {item.time && (
                          <div className="flex items-center gap-1.5 text-brand-muted">
                            <Clock size={13} strokeWidth={1.5} />
                            <span className="font-inter text-xs">{item.time}</span>
                          </div>
                        )}
                        {item.description && (
                          <p className="font-outfit text-sm text-brand-text">{item.description}</p>
                        )}
                        {item.location && (
                          <div className="flex items-center gap-1.5 text-brand-muted">
                            <MapPin size={13} strokeWidth={1.5} />
                            <span className="font-outfit text-xs">{item.location}</span>
                          </div>
                        )}
                        {item.confirmation_code && (
                          <p className="font-inter text-xs text-brand-muted">
                            Código: <span className="font-medium text-brand-text">{item.confirmation_code}</span>
                          </p>
                        )}
                        {item.notes && (
                          <p className="font-outfit text-xs text-brand-muted italic">{item.notes}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="relative pl-8 border-l-2 border-brand-border ml-5 space-y-4">
              {grouped[day].map((item) => {
                const config = categoryConfig[item.category]
                const Icon = config.icon
                return (
                  <div key={item.id} className="relative">
                    <div className="absolute -left-[25px] top-1 w-4 h-4 rounded-full bg-brand-gold border-2 border-white" />
                    <Card padding="md">
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Icon size={16} strokeWidth={1.5} className="text-brand-gold" />
                            <h3 className="font-inter text-sm font-medium text-brand-title">
                              {item.title}
                            </h3>
                          </div>
                          <Badge variant={config.variant}>{config.label}</Badge>
                        </div>
                        {item.time && (
                          <div className="flex items-center gap-1.5 text-brand-muted">
                            <Clock size={13} strokeWidth={1.5} />
                            <span className="font-inter text-xs">{item.time}</span>
                          </div>
                        )}
                        {item.description && (
                          <p className="font-outfit text-sm text-brand-text">{item.description}</p>
                        )}
                        {item.location && (
                          <div className="flex items-center gap-1.5 text-brand-muted">
                            <MapPin size={13} strokeWidth={1.5} />
                            <span className="font-outfit text-xs">{item.location}</span>
                          </div>
                        )}
                        {item.confirmation_code && (
                          <p className="font-inter text-xs text-brand-muted">
                            Código: <span className="font-medium text-brand-text">{item.confirmation_code}</span>
                          </p>
                        )}
                        {item.notes && (
                          <p className="font-outfit text-xs text-brand-muted italic">{item.notes}</p>
                        )}
                      </div>
                    </Card>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
