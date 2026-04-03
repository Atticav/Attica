'use client';
import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Image as ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';

type Photo = {
  id: string;
  title: string | null;
  description: string | null;
  file_url: string;
  thumbnail_url: string | null;
  category: string | null;
  order_index: number;
};

export default function GaleriaPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState('');
  const supabase = createClient();

  useEffect(() => { fetchPhotos(); }, []);

  const fetchPhotos = async () => {
    const tripId = localStorage.getItem('attica_current_trip');
    if (!tripId) { setLoading(false); return; }
    const { data } = await supabase.from('gallery_photos').select('*').eq('trip_id', tripId).order('order_index');
    setPhotos(data || []);
    setLoading(false);
  };

  const categories = [...new Set(photos.map((p) => p.category).filter(Boolean))];
  const filtered = filterCategory ? photos.filter((p) => p.category === filterCategory) : photos;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (lightbox === null) return;
    if (e.key === 'ArrowRight') setLightbox((prev) => (prev === null ? null : Math.min(prev + 1, filtered.length - 1)));
    if (e.key === 'ArrowLeft') setLightbox((prev) => (prev === null ? null : Math.max(prev - 1, 0)));
    if (e.key === 'Escape') setLightbox(null);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox, filtered.length]);

  if (loading) return (
    <div className="p-6 columns-2 md:columns-3 gap-4 space-y-4">
      {[...Array(8)].map((_, i) => <div key={i} className={`h-${[40, 56, 48, 64][i % 4]} bg-[#E5DDD5] rounded-xl skeleton mb-4 break-inside-avoid`} />)}
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-cormorant text-3xl font-semibold text-[#2D2D2D]">Galeria</h1>
          <p className="font-lora text-sm text-[#9C9C9C]">{photos.length} fotos do destino</p>
        </div>
        {categories.length > 0 && (
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-sm font-inter border border-[#E5DDD5] rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#C4A97D] bg-white"
          >
            <option value="">Todas as categorias</option>
            {categories.map((c) => <option key={c as string} value={c as string}>{c}</option>)}
          </select>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <ImageIcon size={48} strokeWidth={1} className="text-[#C4A97D] mx-auto mb-4" />
          <p className="font-cormorant text-xl text-[#9C9C9C]">Nenhuma foto disponível</p>
        </div>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
          {filtered.map((photo, idx) => (
            <div
              key={photo.id}
              onClick={() => setLightbox(idx)}
              className="break-inside-avoid cursor-pointer rounded-xl overflow-hidden group relative"
            >
              <img
                src={photo.thumbnail_url || photo.file_url}
                alt={photo.title || 'Foto'}
                className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {photo.title && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <p className="font-lora text-xs text-white">{photo.title}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white p-2" onClick={() => setLightbox(null)}>
            <X size={24} strokeWidth={1.5} />
          </button>
          {lightbox > 0 && (
            <button
              className="absolute left-4 text-white/70 hover:text-white p-2"
              onClick={(e) => { e.stopPropagation(); setLightbox((l) => Math.max((l || 0) - 1, 0)); }}
            >
              <ChevronLeft size={32} strokeWidth={1.5} />
            </button>
          )}
          <img
            src={filtered[lightbox].file_url}
            alt={filtered[lightbox].title || ''}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {lightbox < filtered.length - 1 && (
            <button
              className="absolute right-4 text-white/70 hover:text-white p-2"
              onClick={(e) => { e.stopPropagation(); setLightbox((l) => Math.min((l || 0) + 1, filtered.length - 1)); }}
            >
              <ChevronRight size={32} strokeWidth={1.5} />
            </button>
          )}
          {filtered[lightbox].title && (
            <div className="absolute bottom-4 text-center text-white/80 font-lora text-sm px-4">
              {filtered[lightbox].title}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
