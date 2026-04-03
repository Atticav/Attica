'use client';
import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { Camera, Clock, MapPin } from 'lucide-react';

type PhotoTip = {
  id: string;
  category: string;
  title: string;
  content: string;
  location: string | null;
  best_time: string | null;
  image_url: string | null;
};

export default function DicasFotografiaPage() {
  const [tips, setTips] = useState<PhotoTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('');
  const supabase = createClient();

  useEffect(() => { fetchTips(); }, []);

  const fetchTips = async () => {
    const tripId = localStorage.getItem('attica_current_trip');
    if (!tripId) { setLoading(false); return; }
    const { data } = await supabase.from('photography_tips').select('*').eq('trip_id', tripId).order('category');
    setTips(data || []);
    setLoading(false);
  };

  const categories = [...new Set(tips.map((t) => t.category))];
  const filtered = filterCategory ? tips.filter((t) => t.category === filterCategory) : tips;

  if (loading) return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => <div key={i} className="h-48 bg-[#E5DDD5] rounded-xl skeleton" />)}
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-cormorant text-3xl font-semibold text-[#2D2D2D]">Dicas de Fotografia</h1>
          <p className="font-lora text-sm text-[#9C9C9C]">Capture os melhores momentos do seu destino</p>
        </div>
        {categories.length > 0 && (
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-sm font-inter border border-[#E5DDD5] rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#C4A97D] bg-white"
          >
            <option value="">Todas as categorias</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Camera size={48} strokeWidth={1} className="text-[#C4A97D] mx-auto mb-4" />
          <p className="font-cormorant text-xl text-[#9C9C9C]">Nenhuma dica disponível ainda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((tip) => (
            <Card key={tip.id} padding="none" className="overflow-hidden">
              {tip.image_url && (
                <img src={tip.image_url} alt={tip.title} className="w-full h-44 object-cover" />
              )}
              <div className="p-5">
                <p className="font-inter text-xs font-semibold text-[#C4A97D] uppercase tracking-wide mb-1">{tip.category}</p>
                <h3 className="font-cormorant text-xl font-semibold text-[#2D2D2D] mb-2">{tip.title}</h3>
                <p className="font-lora text-sm text-[#4A4A4A] leading-relaxed">{tip.content}</p>
                <div className="flex flex-wrap gap-3 mt-3">
                  {tip.location && (
                    <span className="flex items-center gap-1 font-inter text-xs text-[#9C9C9C]">
                      <MapPin size={11} strokeWidth={1.5} className="text-[#C4A97D]" />{tip.location}
                    </span>
                  )}
                  {tip.best_time && (
                    <span className="flex items-center gap-1 font-inter text-xs text-[#9C9C9C]">
                      <Clock size={11} strokeWidth={1.5} className="text-[#C4A97D]" />{tip.best_time}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
