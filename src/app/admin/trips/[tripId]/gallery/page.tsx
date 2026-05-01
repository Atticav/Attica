'use client'

import { useState, useEffect, useCallback } from 'react'
import { use } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Plus, Edit2, Trash2, Eye, EyeOff, Image as ImageIcon,
  Play, X, ChevronLeft, ChevronRight, Paperclip, FolderOpen
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import { ToastContainer } from '@/components/ui/Toast'
import type { GalleryAlbum, GalleryItem } from '@/lib/types'

const DEFAULT_ALBUMS = [
  'Fotos da Viagem',
  'Paisagens',
  'Gastronomia',
  'Cultura & Pontos Turísticos',
  'Momentos Especiais',
  'Documentos Visuais',
]

const MAX_FILE_SIZE_MB = 100

export default function AdminGalleryPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = use(params)
  const [albums, setAlbums] = useState<GalleryAlbum[]>([])
  const [albumItemCounts, setAlbumItemCounts] = useState<Record<string, number>>({})
  const [albumThumbnails, setAlbumThumbnails] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [activeAlbum, setActiveAlbum] = useState<GalleryAlbum | null>(null)
  const [albumItems, setAlbumItems] = useState<GalleryItem[]>([])
  const [loadingItems, setLoadingItems] = useState(false)

  // Album modals
  const [newAlbumOpen, setNewAlbumOpen] = useState(false)
  const [newAlbumName, setNewAlbumName] = useState('')
  const [savingAlbum, setSavingAlbum] = useState(false)
  const [renameAlbum, setRenameAlbum] = useState<GalleryAlbum | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleteAlbumId, setDeleteAlbumId] = useState<string | null>(null)

  // Item modals
  const [addItemOpen, setAddItemOpen] = useState(false)
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [savingItem, setSavingItem] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [itemForm, setItemForm] = useState({
    file_url: '',
    type: 'photo' as 'photo' | 'video',
    title: '',
    description: '',
    location: '',
  })

  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([])
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type }])
  }

  const loadAlbums = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    try {
      const { data: albumData, error } = await supabase
        .from('gallery_albums')
        .select('*')
        .eq('trip_id', tripId)
        .order('order_index', { ascending: true })

      if (error) throw error

      let list: GalleryAlbum[] = albumData ?? []

      // If no albums exist, create the default ones
      if (list.length === 0) {
        const defaultInserts = DEFAULT_ALBUMS.map((name, i) => ({
          trip_id: tripId,
          name,
          visible: true,
          order_index: i,
        }))
        const { data: created, error: insertError } = await supabase
          .from('gallery_albums')
          .insert(defaultInserts)
          .select()
        if (!insertError && created) list = created
      }

      setAlbums(list)

      // Load item counts and thumbnails for each album
      if (list.length > 0) {
        const counts: Record<string, number> = {}
        const thumbs: Record<string, string> = {}
        for (const album of list) {
          const { data: items } = await supabase
            .from('gallery_items')
            .select('id, file_url, thumbnail_url')
            .eq('album_id', album.id)
            .eq('trip_id', tripId)
            .order('order_index', { ascending: true })
          counts[album.id] = items?.length ?? 0
          const firstItem = items?.[0]
          if (firstItem) {
            thumbs[album.id] = firstItem.thumbnail_url || firstItem.file_url
          }
        }
        setAlbumItemCounts(counts)
        setAlbumThumbnails(thumbs)
      }
    } catch (e) {
      console.error('Error loading albums:', e)
      addToast('Erro ao carregar álbuns', 'error')
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
      if (error) throw error
      setAlbumItems(data ?? [])
    } catch (e) {
      console.error('Error loading album items:', e)
      addToast('Erro ao carregar itens do álbum', 'error')
    } finally {
      setLoadingItems(false)
    }
  }, [tripId])

  useEffect(() => {
    if (activeAlbum) loadAlbumItems(activeAlbum)
  }, [activeAlbum, loadAlbumItems])

  // Keyboard navigation for lightbox
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (lightboxIndex === null) return
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowRight') setLightboxIndex(p => (p !== null && p < albumItems.length - 1 ? p + 1 : p))
      if (e.key === 'ArrowLeft') setLightboxIndex(p => (p !== null && p > 0 ? p - 1 : p))
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxIndex, albumItems.length])

  async function handleToggleVisibility(album: GalleryAlbum) {
    const supabase = createClient()
    const { error } = await supabase
      .from('gallery_albums')
      .update({ visible: !album.visible })
      .eq('id', album.id)
    if (error) {
      addToast('Erro ao atualizar visibilidade', 'error')
    } else {
      setAlbums(prev => prev.map(a => a.id === album.id ? { ...a, visible: !a.visible } : a))
    }
  }

  async function handleCreateAlbum() {
    if (!newAlbumName.trim()) return
    setSavingAlbum(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('gallery_albums')
      .insert({ trip_id: tripId, name: newAlbumName.trim(), visible: true, order_index: albums.length })
      .select()
      .single()
    if (error) {
      addToast('Erro ao criar álbum', 'error')
    } else if (data) {
      setAlbums(prev => [...prev, data])
      setAlbumItemCounts(prev => ({ ...prev, [data.id]: 0 }))
      setNewAlbumName('')
      setNewAlbumOpen(false)
      addToast('Álbum criado!', 'success')
    }
    setSavingAlbum(false)
  }

  async function handleRenameAlbum() {
    if (!renameAlbum || !renameValue.trim()) return
    setSavingAlbum(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('gallery_albums')
      .update({ name: renameValue.trim() })
      .eq('id', renameAlbum.id)
    if (error) {
      addToast('Erro ao renomear álbum', 'error')
    } else {
      setAlbums(prev => prev.map(a => a.id === renameAlbum.id ? { ...a, name: renameValue.trim() } : a))
      if (activeAlbum?.id === renameAlbum.id) {
        setActiveAlbum(prev => prev ? { ...prev, name: renameValue.trim() } : prev)
      }
      setRenameAlbum(null)
      addToast('Álbum renomeado!', 'success')
    }
    setSavingAlbum(false)
  }

  async function handleDeleteAlbum(albumId: string) {
    const supabase = createClient()
    const { error } = await supabase.from('gallery_albums').delete().eq('id', albumId)
    if (error) {
      addToast('Erro ao excluir álbum', 'error')
    } else {
      setAlbums(prev => prev.filter(a => a.id !== albumId))
      setDeleteAlbumId(null)
      addToast('Álbum excluído', 'success')
    }
  }

  async function handleFileUpload(file: File) {
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      addToast(`Arquivo muito grande. Máximo: ${MAX_FILE_SIZE_MB}MB`, 'error')
      return
    }
    setUploadingFile(true)
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const path = `${tripId}/${Date.now()}-${safeName}`
      const fd = new FormData()
      fd.append('file', file)
      fd.append('bucket', 'gallery')
      fd.append('path', path)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      if (!res.ok) {
        addToast('Erro ao enviar arquivo', 'error')
        setUploadingFile(false)
        return
      }
      const { publicUrl } = await res.json()
      const isVideo = file.type.startsWith('video/')
      setItemForm(prev => ({ ...prev, file_url: publicUrl, type: isVideo ? 'video' : 'photo' }))
      setUploadingFile(false)
      addToast('Arquivo enviado!', 'success')
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Erro ao enviar arquivo', 'error')
      setUploadingFile(false)
    }
  }

  async function handleAddItem() {
    if (!activeAlbum || !itemForm.file_url) {
      addToast('Informe uma URL ou faça upload de um arquivo', 'error')
      return
    }
    setSavingItem(true)
    const supabase = createClient()
    const { error } = await supabase.from('gallery_items').insert({
      trip_id: tripId,
      album_id: activeAlbum.id,
      file_url: itemForm.file_url,
      type: itemForm.type,
      title: itemForm.title.trim() || null,
      description: itemForm.description.trim() || null,
      location: itemForm.location.trim() || null,
      order_index: albumItems.length,
    })
    if (error) {
      addToast('Erro ao adicionar item', 'error')
    } else {
      addToast('Item adicionado!', 'success')
      setAddItemOpen(false)
      setItemForm({ file_url: '', type: 'photo', title: '', description: '', location: '' })
      loadAlbumItems(activeAlbum)
      setAlbumItemCounts(prev => ({ ...prev, [activeAlbum.id]: (prev[activeAlbum.id] || 0) + 1 }))
    }
    setSavingItem(false)
  }

  async function handleDeleteItem(itemId: string) {
    if (!activeAlbum) return
    const supabase = createClient()
    const { error } = await supabase.from('gallery_items').delete().eq('id', itemId)
    if (error) {
      addToast('Erro ao excluir item', 'error')
    } else {
      setDeleteItemId(null)
      addToast('Item excluído', 'success')
      loadAlbumItems(activeAlbum)
      setAlbumItemCounts(prev => ({ ...prev, [activeAlbum.id]: Math.max(0, (prev[activeAlbum.id] || 1) - 1) }))
    }
  }

  const currentLightboxItem = lightboxIndex !== null ? albumItems[lightboxIndex] : null

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/admin/trips/${tripId}`}
          className="flex items-center gap-2 text-brand-muted hover:text-brand-gold font-inter text-sm mb-4 transition-colors"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Voltar para a viagem
        </Link>
        <div className="flex items-center justify-between">
          {activeAlbum ? (
            <>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setActiveAlbum(null); setAlbumItems([]) }}
                  className="flex items-center gap-2 text-brand-muted hover:text-brand-gold font-inter text-sm transition-colors"
                >
                  <ChevronLeft size={18} strokeWidth={1.5} />
                  Álbuns
                </button>
                <span className="text-brand-border">/</span>
                <h1 className="font-cormorant text-3xl font-semibold text-brand-title">{activeAlbum.name}</h1>
              </div>
              <button
                onClick={() => { setItemForm({ file_url: '', type: 'photo', title: '', description: '', location: '' }); setAddItemOpen(true) }}
                className="flex items-center gap-2 px-4 py-2.5 bg-brand-gold text-white rounded-lg font-inter text-sm font-medium hover:bg-brand-gold-dark transition-colors"
              >
                <Plus size={16} strokeWidth={1.5} />
                Adicionar
              </button>
            </>
          ) : (
            <>
              <h1 className="font-cormorant text-4xl font-semibold text-brand-title">Galeria</h1>
              <button
                onClick={() => { setNewAlbumName(''); setNewAlbumOpen(true) }}
                className="flex items-center gap-2 px-4 py-2.5 bg-brand-gold text-white rounded-lg font-inter text-sm font-medium hover:bg-brand-gold-dark transition-colors"
              >
                <Plus size={16} strokeWidth={1.5} />
                Novo Álbum
              </button>
            </>
          )}
        </div>
      </div>

      {/* Albums grid */}
      {!activeAlbum && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {albums.map(album => (
            <Card key={album.id} padding="none" className="overflow-hidden hover:shadow-card transition-shadow group">
              {/* Thumbnail */}
              <button
                className="w-full text-left"
                onClick={() => setActiveAlbum(album)}
              >
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
              </button>

              {/* Album info */}
              <div className="p-4 flex items-center justify-between gap-3">
                <button className="flex-1 text-left min-w-0" onClick={() => setActiveAlbum(album)}>
                  <p className="font-inter text-sm font-semibold text-brand-title truncate">{album.name}</p>
                  <p className="font-outfit text-xs text-brand-muted mt-0.5">
                    {albumItemCounts[album.id] ?? 0} {(albumItemCounts[album.id] ?? 0) === 1 ? 'foto' : 'fotos'}
                  </p>
                </button>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleToggleVisibility(album)}
                    className={`p-1.5 rounded-lg transition-all ${album.visible ? 'text-brand-gold hover:bg-brand-gold/10' : 'text-brand-muted hover:bg-brand-bg-secondary'}`}
                    title={album.visible ? 'Visível para o cliente' : 'Oculto para o cliente'}
                  >
                    {album.visible ? <Eye size={14} strokeWidth={1.5} /> : <EyeOff size={14} strokeWidth={1.5} />}
                  </button>
                  <button
                    onClick={() => { setRenameAlbum(album); setRenameValue(album.name) }}
                    className="p-1.5 text-brand-muted hover:text-brand-gold hover:bg-brand-bg-secondary rounded-lg transition-all"
                    title="Renomear"
                  >
                    <Edit2 size={14} strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => setDeleteAlbumId(album.id)}
                    className="p-1.5 text-brand-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Excluir"
                  >
                    <Trash2 size={14} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Album items grid */}
      {activeAlbum && (
        <>
          {loadingItems ? (
            <div className="flex items-center justify-center min-h-40">
              <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
            </div>
          ) : albumItems.length === 0 ? (
            <Card padding="lg" className="text-center">
              <ImageIcon size={40} strokeWidth={1.5} className="text-brand-muted mx-auto mb-3" />
              <p className="font-cormorant text-xl text-brand-title mb-1">Álbum vazio</p>
              <p className="font-outfit text-sm text-brand-muted">Clique em &quot;Adicionar&quot; para adicionar fotos e vídeos</p>
            </Card>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
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
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-card">
                        <Play size={20} strokeWidth={1.5} className="text-brand-title ml-0.5" />
                      </div>
                    </div>
                  )}
                  {(item.title || item.location) && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8">
                      {item.title && <p className="font-inter text-sm font-medium text-white">{item.title}</p>}
                    </div>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteItemId(item.id) }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    title="Excluir"
                  >
                    <Trash2 size={12} strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* New Album Modal */}
      <Modal isOpen={newAlbumOpen} onClose={() => setNewAlbumOpen(false)} title="Novo Álbum" size="sm">
        <div className="space-y-4">
          <Input
            label="Nome do álbum *"
            value={newAlbumName}
            onChange={(e) => setNewAlbumName(e.target.value)}
            placeholder="Ex: Praias, Monumentos..."
          />
          <div className="flex gap-3">
            <button
              onClick={() => setNewAlbumOpen(false)}
              className="flex-1 px-4 py-2.5 border border-brand-border text-brand-text rounded-lg font-inter text-sm hover:bg-brand-bg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateAlbum}
              disabled={savingAlbum || !newAlbumName.trim()}
              className="flex-1 px-4 py-2.5 bg-brand-gold text-white rounded-lg font-inter text-sm font-medium hover:bg-brand-gold-dark transition-colors disabled:opacity-60"
            >
              {savingAlbum ? 'Criando...' : 'Criar'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Rename Album Modal */}
      <Modal isOpen={!!renameAlbum} onClose={() => setRenameAlbum(null)} title="Renomear Álbum" size="sm">
        <div className="space-y-4">
          <Input
            label="Nome do álbum *"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            placeholder="Nome do álbum"
          />
          <div className="flex gap-3">
            <button
              onClick={() => setRenameAlbum(null)}
              className="flex-1 px-4 py-2.5 border border-brand-border text-brand-text rounded-lg font-inter text-sm hover:bg-brand-bg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleRenameAlbum}
              disabled={savingAlbum || !renameValue.trim()}
              className="flex-1 px-4 py-2.5 bg-brand-gold text-white rounded-lg font-inter text-sm font-medium hover:bg-brand-gold-dark transition-colors disabled:opacity-60"
            >
              {savingAlbum ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Album Confirmation */}
      <Modal isOpen={!!deleteAlbumId} onClose={() => setDeleteAlbumId(null)} title="Excluir álbum" size="sm">
        <p className="font-outfit text-brand-text mb-2">Tem certeza que deseja excluir este álbum?</p>
        <p className="font-outfit text-sm text-brand-muted mb-6">As fotos do álbum não serão excluídas, apenas a associação com o álbum.</p>
        <div className="flex gap-3">
          <button
            onClick={() => setDeleteAlbumId(null)}
            className="flex-1 px-4 py-2.5 border border-brand-border text-brand-text rounded-lg font-inter text-sm hover:bg-brand-bg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => deleteAlbumId && handleDeleteAlbum(deleteAlbumId)}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-inter text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Excluir
          </button>
        </div>
      </Modal>

      {/* Add Item Modal */}
      <Modal isOpen={addItemOpen} onClose={() => setAddItemOpen(false)} title="Adicionar ao Álbum" size="lg">
        <div className="space-y-4">
          {/* File upload */}
          <div className="flex flex-col gap-1.5">
            <label className="font-inter text-sm font-medium text-brand-text">Upload de arquivo</label>
            <label className={`flex items-center gap-3 px-4 py-3 rounded-lg border border-dashed border-brand-border bg-brand-bg cursor-pointer hover:border-brand-gold/50 transition-colors ${uploadingFile ? 'opacity-60 cursor-not-allowed' : ''}`}>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
                className="hidden"
                disabled={uploadingFile}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file)
                }}
              />
              <Paperclip size={16} strokeWidth={1.5} className="text-brand-muted flex-shrink-0" />
              <span className="font-outfit text-sm text-brand-muted">
                {uploadingFile ? 'Enviando...' : itemForm.file_url ? 'Arquivo enviado — clique para trocar' : 'Escolher arquivo (JPG, PNG, WebP, MP4, MOV)'}
              </span>
            </label>
            {itemForm.file_url && !uploadingFile && (
              <p className="font-outfit text-xs text-brand-muted truncate pl-1">{itemForm.file_url}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-inter text-sm font-medium text-brand-text">Ou URL externa</label>
            <Input
              value={itemForm.file_url}
              onChange={(e) => setItemForm(prev => ({ ...prev, file_url: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-inter text-sm font-medium text-brand-text">Tipo</label>
              <select
                value={itemForm.type}
                onChange={(e) => setItemForm(prev => ({ ...prev, type: e.target.value as 'photo' | 'video' }))}
                className="w-full rounded-lg border border-brand-border font-outfit text-sm text-brand-text bg-brand-bg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all"
              >
                <option value="photo">Foto</option>
                <option value="video">Vídeo</option>
              </select>
            </div>
            <Input
              label="Título (opcional)"
              value={itemForm.title}
              onChange={(e) => setItemForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Título"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Descrição (opcional)"
              value={itemForm.description}
              onChange={(e) => setItemForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição"
            />
            <Input
              label="Local (opcional)"
              value={itemForm.location}
              onChange={(e) => setItemForm(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Local"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setAddItemOpen(false)}
              className="flex-1 px-4 py-2.5 border border-brand-border text-brand-text rounded-lg font-inter text-sm hover:bg-brand-bg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleAddItem}
              disabled={savingItem || uploadingFile || !itemForm.file_url}
              className="flex-1 px-4 py-2.5 bg-brand-gold text-white rounded-lg font-inter text-sm font-medium hover:bg-brand-gold-dark transition-colors disabled:opacity-60"
            >
              {savingItem ? 'Salvando...' : 'Adicionar'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Item Confirmation */}
      <Modal isOpen={!!deleteItemId} onClose={() => setDeleteItemId(null)} title="Excluir item" size="sm">
        <p className="font-outfit text-brand-text mb-6">Tem certeza que deseja excluir este item?</p>
        <div className="flex gap-3">
          <button
            onClick={() => setDeleteItemId(null)}
            className="flex-1 px-4 py-2.5 border border-brand-border text-brand-text rounded-lg font-inter text-sm hover:bg-brand-bg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => deleteItemId && handleDeleteItem(deleteItemId)}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-inter text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Excluir
          </button>
        </div>
      </Modal>

      {/* Lightbox */}
      {currentLightboxItem && (
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
            {currentLightboxItem.type === 'photo' ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={currentLightboxItem.file_url}
                alt={currentLightboxItem.title || 'Gallery photo'}
                className="w-full h-auto max-h-[85vh] object-contain rounded-brand"
              />
            ) : (
              <video
                src={currentLightboxItem.file_url}
                controls
                autoPlay
                className="w-full max-h-[85vh] object-contain rounded-brand"
              />
            )}
            {(currentLightboxItem.title || currentLightboxItem.description) && (
              <div className="text-center mt-4">
                {currentLightboxItem.title && (
                  <p className="font-cormorant text-xl text-white">{currentLightboxItem.title}</p>
                )}
                {currentLightboxItem.description && (
                  <p className="font-outfit text-sm text-white/70 mt-1">{currentLightboxItem.description}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
    </div>
  )
}
