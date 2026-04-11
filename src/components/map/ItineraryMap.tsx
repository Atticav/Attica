'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { ChevronDown, MapPin, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ItineraryItem, ItineraryItemCategory } from '@/lib/types'

// Fix Leaflet default icon issue with webpack/Next.js
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const CATEGORY_COLORS: Record<ItineraryItemCategory, string> = {
  flight: '#8B5CF6',     // purple
  hotel: '#C4A97D',      // brand-gold
  transfer: '#9CA3AF',   // gray
  tour: '#3B82F6',       // blue
  restaurant: '#F97316', // orange
  activity: '#22C55E',   // green
  other: '#4B5563',      // dark gray
}

const CATEGORY_LABELS: Record<ItineraryItemCategory, string> = {
  flight: 'Voo',
  hotel: 'Hotel',
  transfer: 'Transfer',
  tour: 'Passeio',
  restaurant: 'Restaurante',
  activity: 'Atividade',
  other: 'Outro',
}

function createCategoryIcon(category: ItineraryItemCategory): L.DivIcon {
  const color = CATEGORY_COLORS[category] || '#4B5563'
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 28px;
      height: 28px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  })
}

interface GeocodedItem extends ItineraryItem {
  lat: number | null
  lng: number | null
  geocoded: boolean
}

interface ItineraryMapProps {
  items: ItineraryItem[]
  destination: string
  country: string
  tripId: string
}

// Component to fly to a specific location
function FlyToLocation({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo([lat, lng], 15, { duration: 1 })
  }, [map, lat, lng])
  return null
}

export default function ItineraryMap({ items, destination, country, tripId }: ItineraryMapProps) {
  const [geocodedItems, setGeocodedItems] = useState<GeocodedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([1]))
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number } | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const geocodeCache = useRef<Map<string, { lat: number; lng: number } | null>>(new Map())

  const geocode = useCallback(async (location: string): Promise<{ lat: number; lng: number } | null> => {
    const cacheKey = `${location}_${destination}_${country}`
    if (geocodeCache.current.has(cacheKey)) {
      return geocodeCache.current.get(cacheKey) || null
    }

    try {
      const query = encodeURIComponent(`${location}, ${destination}, ${country}`)
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
        { headers: { 'User-Agent': 'AtticaViagens/1.0 (travel-platform)' } }
      )
      const data = await res.json()
      if (data && data.length > 0) {
        const result = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
        geocodeCache.current.set(cacheKey, result)
        return result
      }
    } catch (err) {
      console.warn('Geocoding failed for:', location, err)
    }

    geocodeCache.current.set(cacheKey, null)
    return null
  }, [destination, country])

  // Save coordinates to the database
  const saveCoordinates = useCallback(async (itemId: string, lat: number, lng: number) => {
    try {
      await fetch(`/api/admin/trips/${tripId}/itinerary/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lng }),
      })
    } catch (err) {
      console.warn('Failed to save coordinates:', err)
    }
  }, [tripId])

  useEffect(() => {
    let cancelled = false

    async function geocodeAll() {
      setLoading(true)
      const results: GeocodedItem[] = []

      for (const item of items) {
        if (cancelled) break

        // Use cached coordinates if available
        if (item.latitude != null && item.longitude != null) {
          results.push({
            ...item,
            lat: item.latitude,
            lng: item.longitude,
            geocoded: true,
          })
          continue
        }

        if (!item.location) {
          results.push({ ...item, lat: null, lng: null, geocoded: false })
          continue
        }

        // Geocode with rate limiting (respect Nominatim 1 req/sec policy)
        await new Promise(resolve => setTimeout(resolve, 1000))
        if (cancelled) break

        const coords = await geocode(item.location)
        results.push({
          ...item,
          lat: coords?.lat ?? null,
          lng: coords?.lng ?? null,
          geocoded: !!coords,
        })

        // Save coordinates to DB for caching
        if (coords) {
          saveCoordinates(item.id, coords.lat, coords.lng)
        }
      }

      if (!cancelled) {
        setGeocodedItems(results)
        setLoading(false)
      }
    }

    geocodeAll()
    return () => { cancelled = true }
  }, [items, geocode, saveCoordinates])

  const mappableItems = useMemo(() => geocodedItems.filter(i => i.lat !== null && i.lng !== null), [geocodedItems])

  const polylinePositions = useMemo(
    () => mappableItems.map(i => [i.lat!, i.lng!] as [number, number]),
    [mappableItems]
  )

  const center = useMemo(() => {
    if (mappableItems.length > 0) {
      const avgLat = mappableItems.reduce((s, i) => s + i.lat!, 0) / mappableItems.length
      const avgLng = mappableItems.reduce((s, i) => s + i.lng!, 0) / mappableItems.length
      return [avgLat, avgLng] as [number, number]
    }
    return [0, 0] as [number, number]
  }, [mappableItems])

  const dayGroups = useMemo(() => {
    const groups = new Map<number, GeocodedItem[]>()
    for (const item of geocodedItems) {
      const day = item.day_number
      if (!groups.has(day)) groups.set(day, [])
      groups.get(day)!.push(item)
    }
    return Array.from(groups.entries()).sort(([a], [b]) => a - b)
  }, [geocodedItems])

  function toggleDay(day: number) {
    setExpandedDays(prev => {
      const next = new Set(prev)
      if (next.has(day)) next.delete(day)
      else next.add(day)
      return next
    })
  }

  function focusItem(item: GeocodedItem) {
    if (item.lat !== null && item.lng !== null) {
      setFlyTo({ lat: item.lat, lng: item.lng })
      // Open popup
      const marker = markersRef.current.get(item.id)
      if (marker) {
        setTimeout(() => marker.openPopup(), 500)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
          <p className="font-inter text-sm text-brand-muted">Carregando pontos do mapa...</p>
        </div>
      </div>
    )
  }

  if (geocodedItems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-center px-4">
          <MapPin size={40} strokeWidth={1.5} className="text-brand-muted" />
          <p className="font-cormorant text-xl text-brand-title">Nenhum item no roteiro</p>
          <p className="font-outfit text-sm text-brand-muted">Adicione itens ao roteiro para visualizá-los no mapa.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-0 h-[calc(100vh-8rem)] rounded-lg overflow-hidden border border-brand-border shadow-card">
      {/* Sidebar - Day list */}
      <div className="lg:w-80 w-full lg:h-full h-64 overflow-y-auto bg-white border-b lg:border-b-0 lg:border-r border-brand-border flex-shrink-0">
        <div className="p-4 border-b border-brand-border bg-brand-bg-secondary">
          <h2 className="font-cormorant text-lg font-semibold text-brand-title">Roteiro</h2>
          <p className="font-inter text-xs text-brand-muted mt-0.5">
            {mappableItems.length} de {geocodedItems.length} locais no mapa
          </p>
        </div>
        <div className="divide-y divide-brand-border">
          {dayGroups.map(([day, dayItems]) => (
            <div key={day}>
              <button
                onClick={() => toggleDay(day)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-brand-bg transition-colors"
              >
                <span className="font-outfit text-sm font-medium text-brand-title">
                  Dia {day}
                  {dayItems[0]?.date && (
                    <span className="font-inter text-xs text-brand-muted ml-2">
                      {new Date(dayItems[0].date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </span>
                  )}
                </span>
                <ChevronDown
                  size={16}
                  strokeWidth={1.5}
                  className={cn('text-brand-muted transition-transform', expandedDays.has(day) && 'rotate-180')}
                />
              </button>
              {expandedDays.has(day) && (
                <div className="pb-2">
                  {dayItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => focusItem(item)}
                      className={cn(
                        'w-full text-left px-4 py-2 hover:bg-brand-bg transition-colors flex items-start gap-2.5',
                        item.lat === null && 'opacity-60'
                      )}
                    >
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0 mt-1 border border-white shadow-sm"
                        style={{ backgroundColor: CATEGORY_COLORS[item.category] }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-outfit text-sm text-brand-title truncate">{item.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {item.time && (
                            <span className="font-inter text-xs text-brand-muted">{item.time}</span>
                          )}
                          <span className="font-inter text-xs text-brand-muted">
                            {CATEGORY_LABELS[item.category]}
                          </span>
                        </div>
                        {item.lat === null && item.location && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <AlertCircle size={10} className="text-amber-500" />
                            <span className="font-inter text-xs text-amber-600">Sem coordenadas</span>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative min-h-[300px]">
        {mappableItems.length === 0 ? (
          <div className="flex items-center justify-center h-full bg-brand-bg">
            <div className="text-center px-4">
              <MapPin size={40} strokeWidth={1.5} className="text-brand-muted mx-auto mb-3" />
              <p className="font-cormorant text-xl text-brand-title mb-1">Sem localizações</p>
              <p className="font-outfit text-sm text-brand-muted">
                Nenhum item do roteiro teve a localização encontrada no mapa.
              </p>
            </div>
          </div>
        ) : (
          <MapContainer
            center={center}
            zoom={13}
            className="h-full w-full z-0"
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {flyTo && <FlyToLocation lat={flyTo.lat} lng={flyTo.lng} />}

            {polylinePositions.length > 1 && (
              <Polyline
                positions={polylinePositions}
                pathOptions={{ color: '#C4A97D', weight: 3, opacity: 0.6, dashArray: '8, 8' }}
              />
            )}

            {mappableItems.map((item) => (
              <Marker
                key={item.id}
                position={[item.lat!, item.lng!]}
                icon={createCategoryIcon(item.category)}
                ref={(ref) => {
                  if (ref) markersRef.current.set(item.id, ref)
                }}
              >
                <Popup>
                  <div className="min-w-[200px] max-w-[280px]">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[item.category] }}
                      />
                      <span className="text-xs text-gray-500">
                        Dia {item.day_number}{item.time ? ` • ${item.time}` : ''}
                      </span>
                    </div>
                    <p className="font-semibold text-sm text-gray-900 mb-1">{item.title}</p>
                    {item.description && (
                      <p className="text-xs text-gray-600 mb-1">
                        {item.description.length > 100 ? item.description.slice(0, 100) + '...' : item.description}
                      </p>
                    )}
                    {item.location && (
                      <p className="text-xs text-gray-400 italic">{item.location}</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 z-[1000]">
          <p className="font-inter text-xs font-medium text-gray-700 mb-2">Categorias</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
              <div key={cat} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-gray-600">{CATEGORY_LABELS[cat as ItineraryItemCategory]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
