'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  Calendar,
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

type ViewMode = 'list' | 'timeline'

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

  const loadData = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('itinerary_items')
      .select('*')
      .eq('trip_id', tripId)
      .order('day_number', { ascending: true })
      .order('order_index', { ascending: true })

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
        </div>
      </div>

      {sortedDays.map((day) => (
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
