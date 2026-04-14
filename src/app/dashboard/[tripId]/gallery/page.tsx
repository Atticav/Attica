'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Image as ImageIcon, Play, X, MapPin, ChevronLeft, ChevronRight, Plus, Paperclip, FolderOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import Card from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'
import type { GalleryAlbum, GalleryItem } from '@/lib/types'

export default function GalleryPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const { t } = useLanguage()
  const [albums, setAlbums] = useState<GalleryAlbum[]>([])
  const [albumThumbnails, setAlbumThumbnails] = useState<Record<string, string>>({})
  const [albumItemCounts, setAlbumItemCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [activeAlbum, setActiveAlbum] = useState<GalleryAlbum | null>(null)
  const [albumItems, setAlbumItems] = useState<GalleryItem[]>([])
  const [loadingItems, setLoadingItems] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  // Upload modal
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadUrl, setUploadUrl] = useState('')
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploading, setUploading] = useState(false)

  const loadAlbums = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    try {
      const { data, error } = await supabase
        .from('gallery_albums')
        .select('*')
        .eq('trip_id', tripId)
        .eq('visible', true)
        .order('order_index', { ascending: true })

      if (error || !data) {
        setLoading(false)
        return
      }

      setAlbums(data)

      // Load thumbnails and counts
      const thumbs: Record<string, string> = {}
      const counts: Record<string, number> = {}
      for (const album of data) {
        const { data: items } = await supabase
          .from('gallery_items')
          .select('id, file_url, thumbnail_url')
          .eq('album_id', album.id)
          .eq('trip_id', tripId)
          .order('order_index', { ascending: true })
        counts[album.id] = items?.length ?? 0
        const first = items?.[0]
        if (first) thumbs[album.id] = first.thumbnail_url || first.file_url
      }
      setAlbumThumbnails(thumbs)
      setAlbumItemCounts(counts)
    } catch (e) {
      console.error('Error loading gallery albums:', e)
    } finally {
      setLoading(false)
    }
  }, [tripId])

  useEffect(() => { loadAlbums() }, [loadAlbums])

  const loadAlbumItems = useCallback(async (album: GalleryAlbum) => {
    setLoadingItems(true)
    const supabase = createClient()
    try {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .eq('album_id', album.id)
        .eq('trip_id', tripId)
        .order('order_index', { ascending: true })
      if (!error && data) setAlbumItems(data)
    } catch (e) {
      console.error('Error loading album items:', e)
    } finally {
      setLoadingItems(false)
    }
  }, [tripId])

  useEffect(() => {
    if (activeAlbum) loadAlbumItems(activeAlbum)
  }, [activeAlbum, loadAlbumItems])

  // Keyboard navigation for lightbox
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (lightboxIndex === null) return
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowRight') setLightboxIndex(prev => (prev !== null && prev < albumItems.length - 1 ? prev + 1 : prev))
      if (e.key === 'ArrowLeft') setLightboxIndex(prev => (prev !== null && prev > 0 ? prev - 1 : prev))
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxIndex, albumItems.length])

  async function handleUpload() {
    if (!activeAlbum) return
    if (!uploadFile && !uploadUrl.trim()) return

    setUploading(true)
    const supabase = createClient()
    let fileUrl = uploadUrl.trim()
    let type: 'photo' | 'video' = 'photo'

    if (uploadFile) {
      const path = `${tripId}/${Date.now()}-${uploadFile.name}`
      const { data, error } = await supabase.storage.from('gallery').upload(path, uploadFile, { upsert: true })
      if (error) {
        setUploading(false)
        return
      }
      const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(data.path)
      fileUrl = urlData.publicUrl
      type = uploadFile.type.startsWith('video/') ? 'video' : 'photo'
    }

    const { error: insertError } = await supabase.from('gallery_items').insert({
      trip_id: tripId,
      album_id: activeAlbum.id,
      file_url: fileUrl,
      type,
      title: uploadTitle.trim() || null,
      order_index: albumItems.length,
    })

    if (!insertError) {
      setUploadOpen(false)
      setUploadFile(null)
      setUploadUrl('')
      setUploadTitle('')
      loadAlbumItems(activeAlbum)
      setAlbumItemCounts(prev => ({ ...prev, [activeAlbum.id]: (prev[activeAlbum.id] || 0) + 1 }))
    }
    setUploading(false)
  }

  const currentItem = lightboxIndex !== null ? albumItems[lightboxIndex] : null

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
      <div className="flex items-center justify-between gap-4">
        {activeAlbum ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setActiveAlbum(null); setAlbumItems([]) }}
              className="flex items-center gap-2 text-brand-muted hover:text-brand-gold font-inter text-sm transition-colors"
            >
              <ChevronLeft size={18} strokeWidth={1.5} />
              Galeria
            </button>
            <span className="text-brand-border">/</span>
            <div>
              <h1 className="font-cormorant text-3xl font-semibold text-brand-title">{activeAlbum.name}</h1>
              <p className="font-outfit text-sm text-brand-muted">
                {albumItems.length} {albumItems.length === 1 ? 'item' : 'itens'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <h1 className="font-cormorant text-3xl font-semibold text-brand-title">Galeria</h1>
            <p className="font-outfit text-sm text-brand-muted">Fotos e vídeos da sua viagem</p>
          </div>
        )}

        {activeAlbum && (
          <button
            onClick={() => { setUploadFile(null); setUploadUrl(''); setUploadTitle(''); setUploadOpen(true) }}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-gold text-white rounded-lg font-inter text-sm font-medium hover:bg-brand-gold-dark transition-colors flex-shrink-0"
          >
            <Plus size={16} strokeWidth={1.5} />
            Adicionar minhas fotos
          </button>
        )}
      </div>

      {/* Albums grid */}
      {!activeAlbum && (
        <>
          {albums.length === 0 ? (
            <Card className="text-center py-16">
              <ImageIcon size={40} strokeWidth={1.5} className="text-brand-muted mx-auto mb-3" />
              <p className="font-cormorant text-xl text-brand-title mb-1">Nenhum álbum disponível</p>
              <p className="font-outfit text-sm text-brand-muted">
                As fotos e vídeos da sua viagem aparecerão aqui.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {albums.map(album => (
                <button
                  key={album.id}
                  className="text-left group"
                  onClick={() => setActiveAlbum(album)}
                >
                  <Card padding="none" className="overflow-hidden hover:shadow-card transition-shadow">
                    <div className="h-40 bg-brand-bg-secondary flex items-center justify-center overflow-hidden">
                      {albumThumbnails[album.id] ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={albumThumbnails[album.id]}
                          alt={album.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <FolderOpen size={40} strokeWidth={1.5} className="text-brand-muted" />
                      )}
                    </div>
                    <div className="p-4">
                      <p className="font-inter text-sm font-semibold text-brand-title group-hover:text-brand-gold transition-colors">{album.name}</p>
                      <p className="font-outfit text-xs text-brand-muted mt-0.5">
                        {albumItemCounts[album.id] ?? 0} {(albumItemCounts[album.id] ?? 0) === 1 ? 'foto' : 'fotos'}
                      </p>
                    </div>
                  </Card>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Album items (masonry) */}
      {activeAlbum && (
        <>
          {loadingItems ? (
            <div className="flex items-center justify-center min-h-40">
              <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
            </div>
          ) : albumItems.length === 0 ? (
            <Card className="text-center py-16">
              <ImageIcon size={40} strokeWidth={1.5} className="text-brand-muted mx-auto mb-3" />
              <p className="font-cormorant text-xl text-brand-title mb-1">Álbum vazio</p>
              <p className="font-outfit text-sm text-brand-muted">Seja o primeiro a adicionar fotos a este álbum.</p>
            </Card>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-4 gap-4 space-y-4">
              {albumItems.map((item, index) => (
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
          )}
        </>
      )}

      {/* Upload Modal */}
      <Modal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} title="Adicionar minhas fotos" size="md">
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-inter text-sm font-medium text-brand-text">Arquivo</label>
            <label className={`flex items-center gap-3 px-4 py-3 rounded-lg border border-dashed border-brand-border bg-brand-bg cursor-pointer hover:border-brand-gold/50 transition-colors ${uploading ? 'opacity-60 cursor-not-allowed' : ''}`}>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) setUploadFile(file)
                }}
              />
              <Paperclip size={16} strokeWidth={1.5} className="text-brand-muted flex-shrink-0" />
              <span className="font-outfit text-sm text-brand-muted">
                {uploadFile ? uploadFile.name : 'Escolher arquivo (JPG, PNG, WebP, MP4, MOV)'}
              </span>
            </label>
          </div>

          {!uploadFile && (
            <div className="flex flex-col gap-1.5">
              <label className="font-inter text-sm font-medium text-brand-text">Ou URL</label>
              <input
                type="url"
                value={uploadUrl}
                onChange={(e) => setUploadUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-brand-border font-outfit text-sm text-brand-text bg-brand-bg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all placeholder:text-brand-muted"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="font-inter text-sm font-medium text-brand-text">Título (opcional)</label>
            <input
              type="text"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              placeholder="Ex: Pôr do sol em Paris"
              className="w-full rounded-lg border border-brand-border font-outfit text-sm text-brand-text bg-brand-bg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all placeholder:text-brand-muted"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setUploadOpen(false)}
              className="flex-1 px-4 py-2.5 border border-brand-border text-brand-text rounded-lg font-inter text-sm hover:bg-brand-bg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading || (!uploadFile && !uploadUrl.trim())}
              className="flex-1 px-4 py-2.5 bg-brand-gold text-white rounded-lg font-inter text-sm font-medium hover:bg-brand-gold-dark transition-colors disabled:opacity-60"
            >
              {uploading ? 'Enviando...' : 'Adicionar'}
            </button>
          </div>
        </div>
      </Modal>

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
          {lightboxIndex !== null && lightboxIndex < albumItems.length - 1 && (
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
                  <p className="font-outfit text-sm text-white/70 mt-1">{currentItem.description}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

