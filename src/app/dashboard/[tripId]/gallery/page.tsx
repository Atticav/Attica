'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Image as ImageIcon, Play, X, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import Card from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'
import type { GalleryItem } from '@/lib/types'

export default function GalleryPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const { t } = useLanguage()
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('gallery_items')
      .select('*')
      .eq('trip_id', tripId)
      .order('order_index', { ascending: true })

    if (!error && data) setItems(data)
    setLoading(false)
  }, [tripId])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (lightboxIndex === null) return
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowRight') setLightboxIndex((prev) => (prev !== null && prev < items.length - 1 ? prev + 1 : prev))
      if (e.key === 'ArrowLeft') setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev))
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxIndex, items.length])

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
          <h1 className="font-cormorant text-3xl font-semibold text-brand-title">Galeria</h1>
          <p className="font-outfit text-sm text-brand-muted">Fotos e vídeos da sua viagem</p>
        </div>
        <Card className="text-center py-16">
          <ImageIcon size={40} strokeWidth={1.5} className="text-brand-muted mx-auto mb-3" />
          <p className="font-cormorant text-xl text-brand-title mb-1">Nenhum item na galeria</p>
          <p className="font-outfit text-sm text-brand-muted">
            As fotos e vídeos da sua viagem aparecerão aqui.
          </p>
        </Card>
      </div>
    )
  }

  const currentItem = lightboxIndex !== null ? items[lightboxIndex] : null

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-cormorant text-3xl font-semibold text-brand-title">Galeria</h1>
        <p className="font-outfit text-sm text-brand-muted">
          {items.length} {items.length === 1 ? 'item' : 'itens'}
        </p>
      </div>

      {/* Masonry grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="break-inside-avoid group relative overflow-hidden rounded-brand border border-brand-border cursor-pointer"
            onClick={() => item.type === 'photo' && setLightboxIndex(index)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.thumbnail_url || item.file_url}
              alt={item.title || 'Gallery item'}
              className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            {item.type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity group-hover:bg-black/40">
                <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-card">
                  <Play size={24} strokeWidth={1.5} className="text-brand-title ml-1" />
                </div>
              </div>
            )}
            {(item.title || item.location) && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8">
                {item.title && (
                  <p className="font-inter text-sm font-medium text-white">{item.title}</p>
                )}
                {item.location && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin size={11} strokeWidth={1.5} className="text-white/80" />
                    <p className="font-outfit text-xs text-white/80">{item.location}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {currentItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-title/90 backdrop-blur-sm">
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-10"
          >
            <X size={24} strokeWidth={1.5} />
          </button>

          {lightboxIndex !== null && lightboxIndex > 0 && (
            <button
              onClick={() => setLightboxIndex(lightboxIndex - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-10"
            >
              <ChevronLeft size={28} strokeWidth={1.5} />
            </button>
          )}

          {lightboxIndex !== null && lightboxIndex < items.length - 1 && (
            <button
              onClick={() => setLightboxIndex(lightboxIndex + 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-10"
            >
              <ChevronRight size={28} strokeWidth={1.5} />
            </button>
          )}

          <div className="max-w-5xl max-h-[90vh] w-full px-4">
            {currentItem.type === 'photo' ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={currentItem.file_url}
                alt={currentItem.title || 'Gallery photo'}
                className="w-full h-auto max-h-[85vh] object-contain rounded-brand"
              />
            ) : (
              <video
                src={currentItem.file_url}
                controls
                autoPlay
                className="w-full max-h-[85vh] object-contain rounded-brand"
              />
            )}
            {(currentItem.title || currentItem.description) && (
              <div className="text-center mt-4">
                {currentItem.title && (
                  <p className="font-cormorant text-xl text-white">{currentItem.title}</p>
                )}
                {currentItem.description && (
                  <p className="font-outfit text-sm text-white/70 mt-1">
                    {currentItem.description}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
