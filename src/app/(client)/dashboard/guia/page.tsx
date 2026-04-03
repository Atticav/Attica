'use client';
import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { Play, Video } from 'lucide-react';

type GuideVideo = {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  file_url: string | null;
  thumbnail_url: string | null;
  platform: 'youtube' | 'vimeo' | 'upload' | null;
  category: string | null;
  order_index: number;
};

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
  return match ? match[1] : null;
}

function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? match[1] : null;
}

function VideoCard({ video }: { video: GuideVideo }) {
  const [playing, setPlaying] = useState(false);

  const getEmbedUrl = () => {
    if (!video.url) return null;
    if (video.platform === 'youtube') {
      const id = getYouTubeId(video.url);
      return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : null;
    }
    if (video.platform === 'vimeo') {
      const id = getVimeoId(video.url);
      return id ? `https://player.vimeo.com/video/${id}?autoplay=1` : null;
    }
    return null;
  };

  const getThumbnail = () => {
    if (video.thumbnail_url) return video.thumbnail_url;
    if (video.platform === 'youtube' && video.url) {
      const id = getYouTubeId(video.url);
      return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
    }
    return null;
  };

  const embedUrl = getEmbedUrl();
  const thumbnail = getThumbnail();

  return (
    <Card padding="none" className="overflow-hidden">
      {playing && embedUrl ? (
        <iframe
          src={embedUrl}
          className="w-full aspect-video"
          allow="autoplay; fullscreen"
          allowFullScreen
          title={video.title}
        />
      ) : video.file_url && video.platform === 'upload' ? (
        <video src={video.file_url} controls className="w-full aspect-video bg-black" />
      ) : (
        <div
          className="relative aspect-video bg-[#2D2D2D] cursor-pointer group"
          onClick={() => setPlaying(true)}
        >
          {thumbnail && (
            <img src={thumbnail} alt={video.title} className="w-full h-full object-cover opacity-70" />
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-[#C4A97D]/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <Play size={20} className="text-white ml-1" />
            </div>
          </div>
          {video.platform && (
            <div className="absolute top-2 right-2">
              <span className="text-xs font-inter bg-black/60 text-white px-2 py-0.5 rounded-full">
                {video.platform === 'youtube' ? 'YouTube' : video.platform === 'vimeo' ? 'Vimeo' : 'Vídeo'}
              </span>
            </div>
          )}
        </div>
      )}
      <div className="p-4">
        {video.category && (
          <p className="font-inter text-xs text-[#C4A97D] font-medium uppercase tracking-wide mb-1">{video.category}</p>
        )}
        <h3 className="font-cormorant text-lg font-semibold text-[#2D2D2D]">{video.title}</h3>
        {video.description && (
          <p className="font-lora text-sm text-[#9C9C9C] mt-1">{video.description}</p>
        )}
      </div>
    </Card>
  );
}

export default function GuiaPage() {
  const [videos, setVideos] = useState<GuideVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('');
  const supabase = createClient();

  useEffect(() => { fetchVideos(); }, []);

  const fetchVideos = async () => {
    const tripId = localStorage.getItem('attica_current_trip');
    if (!tripId) { setLoading(false); return; }
    const { data } = await supabase.from('guide_videos').select('*').eq('trip_id', tripId).order('order_index');
    setVideos(data || []);
    setLoading(false);
  };

  const categories = [...new Set(videos.map((v) => v.category).filter(Boolean))];
  const filtered = filterCategory ? videos.filter((v) => v.category === filterCategory) : videos;

  if (loading) return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => <div key={i} className="h-48 bg-[#E5DDD5] rounded-xl skeleton" />)}
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-cormorant text-3xl font-semibold text-[#2D2D2D]">Guia em Vídeo</h1>
          <p className="font-lora text-sm text-[#9C9C9C]">{videos.length} vídeos preparatórios</p>
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
          <Video size={48} strokeWidth={1} className="text-[#C4A97D] mx-auto mb-4" />
          <p className="font-cormorant text-xl text-[#9C9C9C]">Nenhum vídeo disponível ainda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((video) => <VideoCard key={video.id} video={video} />)}
        </div>
      )}
    </div>
  );
}
