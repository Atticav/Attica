'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'
import type { ItineraryItem, Trip } from '@/lib/types'

const ItineraryMap = dynamic(() => import('@/components/map/ItineraryMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
        <p className="font-inter text-sm text-brand-muted">Carregando mapa...</p>
      </div>
    </div>
  ),
})

export default function MapPage() {
  const params = useParams()
  const tripId = params.tripId as string
  const [items, setItems] = useState<ItineraryItem[]>([])
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    const [tripRes, itemsRes] = await Promise.all([
      supabase.from('trips').select('*').eq('id', tripId).single(),
      supabase
        .from('itinerary_items')
        .select('*')
        .eq('trip_id', tripId)
        .order('day_number', { ascending: true })
        .order('order_index', { ascending: true }),
    ])

    if (tripRes.data) setTrip(tripRes.data)
    if (itemsRes.data) setItems(itemsRes.data)
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

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-cormorant text-3xl font-semibold text-brand-title">
          Mapa do Roteiro
        </h1>
        {trip && (
          <p className="font-outfit text-sm text-brand-muted mt-1">
            {trip.destination}, {trip.country}
          </p>
        )}
      </div>

      <ItineraryMap
        items={items}
        destination={trip?.destination || ''}
        country={trip?.country || ''}
        tripId={tripId}
      />
    </div>
  )
}
