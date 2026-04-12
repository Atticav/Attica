'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  UtensilsCrossed,
  MapPin,
  Globe,
  Star,
  Award,
  ExternalLink,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import type { Restaurant, RestaurantCategory } from '@/lib/types'

const categoryConfig: Record<
  RestaurantCategory,
  { label: string; variant: 'gold' | 'success' | 'warning' | 'error' | 'brown' | 'neutral' }
> = {
  fine_dining: { label: 'Fine Dining', variant: 'gold' },
  casual: { label: 'Casual', variant: 'neutral' },
  street_food: { label: 'Street Food', variant: 'warning' },
  cafe: { label: 'Café', variant: 'brown' },
  bar: { label: 'Bar', variant: 'neutral' },
  other: { label: 'Outro', variant: 'neutral' },
}

function PriceRange({ range }: { range: number | null }) {
  if (!range) return null
  return (
    <span className="font-inter text-sm text-brand-gold font-medium">
      {'$'.repeat(range)}
      <span className="text-brand-muted/40">{'$'.repeat(4 - range)}</span>
    </span>
  )
}

function StarRating({ rating }: { rating: number | null }) {
  if (!rating) return null
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={14}
          strokeWidth={1.5}
          className={i < rating ? 'text-brand-gold fill-brand-gold' : 'text-brand-muted/30'}
        />
      ))}
    </div>
  )
}

export default function RestaurantsPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const { t } = useLanguage()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('trip_id', tripId)
      .order('order_index', { ascending: true })

    if (!error && data) setRestaurants(data)
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

  if (restaurants.length === 0) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="font-cormorant text-3xl font-semibold text-brand-title">Restaurantes</h1>
          <p className="font-outfit text-sm text-brand-muted">Restaurantes recomendados</p>
        </div>
        <Card className="text-center py-16">
          <UtensilsCrossed size={40} strokeWidth={1.5} className="text-brand-muted mx-auto mb-3" />
          <p className="font-cormorant text-xl text-brand-title mb-1">Nenhum restaurante</p>
          <p className="font-outfit text-sm text-brand-muted">
            Os restaurantes recomendados aparecerão aqui.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-cormorant text-3xl font-semibold text-brand-title">Restaurantes</h1>
        <p className="font-outfit text-sm text-brand-muted">
          {restaurants.length} {restaurants.length === 1 ? 'restaurante' : 'restaurantes'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {restaurants.map((restaurant) => {
          const config = categoryConfig[restaurant.category]
          return (
            <Card key={restaurant.id} padding="md">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0 p-2 bg-brand-bg-secondary rounded-lg">
                      <UtensilsCrossed size={18} strokeWidth={1.5} className="text-brand-gold" />
                    </div>
                    <div>
                      <h3 className="font-inter text-sm font-medium text-brand-title">
                        {restaurant.name}
                      </h3>
                      {restaurant.cuisine && (
                        <p className="font-outfit text-xs text-brand-muted">{restaurant.cuisine}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Badge variant={config.variant}>{config.label}</Badge>
                    {restaurant.is_recommended && (
                      <Badge variant="gold">
                        <Award size={11} strokeWidth={1.5} className="mr-0.5" />
                        Recomendado
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                  <PriceRange range={restaurant.price_range} />
                  <StarRating rating={restaurant.rating} />
                  {restaurant.reservation_required && (
                    <span className="font-inter text-xs text-brand-muted">Reserva obrigatória</span>
                  )}
                </div>

                {restaurant.address && (
                  <div className="flex items-start gap-1.5 text-brand-muted">
                    <MapPin size={13} strokeWidth={1.5} className="mt-0.5 flex-shrink-0" />
                    <span className="font-outfit text-xs">{restaurant.address}</span>
                  </div>
                )}

                {restaurant.attica_notes && (
                  <p className="font-outfit text-sm text-brand-text bg-brand-bg-secondary rounded-lg px-3 py-2">
                    {restaurant.attica_notes}
                  </p>
                )}

                <div className="flex items-center gap-3 pt-1">
                  {restaurant.google_maps_url && (
                    <a
                      href={restaurant.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-inter text-xs font-medium text-brand-gold hover:text-brand-gold-dark transition-colors"
                    >
                      <MapPin size={13} strokeWidth={1.5} />
                      Google Maps
                    </a>
                  )}
                  {restaurant.website_url && (
                    <a
                      href={restaurant.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-inter text-xs font-medium text-brand-gold hover:text-brand-gold-dark transition-colors"
                    >
                      <Globe size={13} strokeWidth={1.5} />
                      Website
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
