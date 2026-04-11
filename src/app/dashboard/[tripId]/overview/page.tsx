import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getDestinationData, formatDate } from '@/lib/utils'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Link from 'next/link'
import WeatherWidget from '@/components/widgets/WeatherWidget'
import CurrencyWidget from '@/components/widgets/CurrencyWidget'

export default async function OverviewPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch trip
  const { data: trip } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .single()

  if (!trip) redirect('/dashboard')

  // Fetch widgets
  const { data: widgets } = await supabase
    .from('trip_widgets')
    .select('*')
    .eq('trip_id', tripId)
    .maybeSingle()

  // Get destination data
  const destination = getDestinationData(trip.destination) || getDestinationData(trip.country)

  // Count checklist progress
  const { count: totalChecklist } = await supabase
    .from('checklist_items')
    .select('*', { count: 'exact', head: true })
    .eq('trip_id', tripId)

  const { count: completedChecklist } = await supabase
    .from('checklist_items')
    .select('*', { count: 'exact', head: true })
    .eq('trip_id', tripId)
    .eq('is_completed', true)

  const total = totalChecklist ?? 0
  const completed = completedChecklist ?? 0
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0

  // Days until trip
  let daysUntil: number | null = null
  if (trip.start_date) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const startDate = new Date(trip.start_date + 'T00:00:00')
    const diff = startDate.getTime() - today.getTime()
    daysUntil = Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  // Timezone label
  function getTimezoneLabel(offset: number): string {
    if (offset === 0) return 'Mesmo fuso do Brasil'
    const sign = offset > 0 ? '+' : ''
    return `${sign}${offset} horas do Brasil`
  }

  // Extract currency name from format "EUR (Euro)"
  function getCurrencyName(currency: string): string {
    const match = currency.match(/\((.+)\)/)
    return match ? match[1] : currency
  }

  const showWeather = widgets?.show_weather ?? true
  const showCurrency = widgets?.show_currency ?? true
  const showMapButton = widgets?.show_map_button ?? true

  // Travel style badge variants
  const styleVariants: Record<string, 'gold' | 'success' | 'warning' | 'error' | 'brown' | 'neutral'> = {
    'Cultural': 'gold',
    'Aventura': 'success',
    'Gastronômico': 'warning',
    'Relaxamento': 'brown',
    'Família': 'neutral',
    'Romântico': 'error',
    'Business': 'neutral',
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-cormorant text-3xl sm:text-4xl font-semibold text-brand-title">
          Visão Geral
        </h1>
        <p className="font-outfit text-brand-muted mt-1">
          {trip.destination}, {trip.country}
        </p>
      </div>

      {/* Progress indicators */}
      <div className="flex flex-wrap gap-4 mb-8">
        {daysUntil !== null && daysUntil >= 0 && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-lg border border-brand-border shadow-soft">
            <span className="text-lg">✈️</span>
            <div>
              <p className="font-inter text-sm font-semibold text-brand-title">
                {daysUntil === 0 ? 'Hoje é o dia!' : `Faltam ${daysUntil} dias`}
              </p>
              <p className="font-inter text-xs text-brand-muted">para a viagem</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-lg border border-brand-border shadow-soft">
          <span className="text-lg">📋</span>
          <div>
            <p className="font-inter text-sm font-semibold text-brand-title">
              {progressPercent}% do planejamento concluído
            </p>
            <p className="font-inter text-xs text-brand-muted">{completed} de {total} itens</p>
          </div>
        </div>
      </div>

      {/* Widgets grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Destination Info */}
        <Card padding="none" className="overflow-hidden">
          <div className="bg-gradient-to-r from-brand-gold to-amber-600 px-5 py-4 text-white">
            <p className="font-inter text-xs uppercase tracking-wider opacity-80">Informações</p>
            <h3 className="font-cormorant text-xl font-semibold">Destino</h3>
          </div>
          <div className="divide-y divide-brand-border">
            <InfoRow emoji="🌍" label="Destino" value={`${trip.destination}, ${trip.country}`} />
            <InfoRow emoji="📅" label="Data" value={formatDate(trip.start_date)} />
            {widgets?.ideal_duration && (
              <InfoRow emoji="⏱️" label="Duração ideal" value={widgets.ideal_duration} />
            )}
            {widgets?.travel_style && (
              <div className="flex items-center gap-3 px-5 py-3">
                <span className="text-base">🧳</span>
                <span className="font-inter text-sm text-brand-muted min-w-[100px]">Estilo de viagem</span>
                <Badge variant={styleVariants[widgets.travel_style] || 'neutral'}>
                  {widgets.travel_style}
                </Badge>
              </div>
            )}
            {destination?.timezone_offset !== undefined && (
              <InfoRow emoji="🕐" label="Fuso horário" value={getTimezoneLabel(destination.timezone_offset)} />
            )}
            {destination?.language && (
              <InfoRow emoji="🗣️" label="Idioma" value={destination.language} />
            )}
            {destination?.best_season && (
              <InfoRow emoji="☀️" label="Melhor época" value={destination.best_season} />
            )}
            {destination?.currency && (
              <InfoRow emoji="💰" label="Moeda" value={destination.currency} />
            )}
            {destination?.voltage && (
              <InfoRow emoji="⚡" label="Voltagem" value={destination.voltage} />
            )}
          </div>
          {widgets?.custom_notes && (
            <div className="px-5 py-3 bg-brand-bg border-t border-brand-border">
              <p className="font-inter text-xs text-brand-muted italic">{widgets.custom_notes}</p>
            </div>
          )}
        </Card>

        {/* Weather + Currency column */}
        <div className="space-y-6">
          {showWeather && destination?.latitude && destination?.longitude && (
            <WeatherWidget
              latitude={destination.latitude}
              longitude={destination.longitude}
              destinationName={trip.destination}
            />
          )}
          {showCurrency && destination?.currency && (
            <CurrencyWidget
              currencyCode={destination.currency}
              currencyName={getCurrencyName(destination.currency)}
            />
          )}
        </div>
      </div>

      {/* Map button */}
      {showMapButton && (
        <div className="bg-white rounded-lg border border-brand-border shadow-soft p-4">
          <Link
            href={`/dashboard/${tripId}/map`}
            className="flex items-center justify-center gap-2 w-full py-3 bg-brand-gold text-white rounded-lg font-inter text-sm font-medium hover:bg-brand-gold-dark transition-colors"
          >
            📍 MAPA INTERATIVO
          </Link>
        </div>
      )}
    </div>
  )
}

function InfoRow({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3">
      <span className="text-base">{emoji}</span>
      <span className="font-inter text-sm text-brand-muted min-w-[100px]">{label}</span>
      <span className="font-inter text-sm font-medium text-brand-title">{value}</span>
    </div>
  )
}
