'use client';
import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

type CulturalInfo = {
  id: string;
  category: string;
  title: string;
  content: string;
  icon: string | null;
  order_index: number;
};

export default function CulturaPage() {
  const [items, setItems] = useState<CulturalInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const supabase = createClient();

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    const tripId = localStorage.getItem('attica_current_trip');
    if (!tripId) { setLoading(false); return; }
    const { data } = await supabase.from('cultural_info').select('*').eq('trip_id', tripId).order('order_index');
    setItems(data || []);
    if (data && data.length > 0) setOpenItems(new Set([data[0].id]));
    setLoading(false);
  };

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const grouped = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, CulturalInfo[]>);

  if (loading) return (
    <div className="p-6 space-y-3">
      {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-[#E5DDD5] rounded-xl skeleton" />)}
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-cormorant text-3xl font-semibold text-[#2D2D2D]">Cultura Local</h1>
        <p className="font-lora text-sm text-[#9C9C9C]">Costumes, etiqueta e informações culturais</p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen size={48} strokeWidth={1} className="text-[#C4A97D] mx-auto mb-4" />
          <p className="font-cormorant text-xl text-[#9C9C9C]">Conteúdo cultural em preparação</p>
        </div>
      ) : (
        Object.entries(grouped).map(([category, catItems]) => (
          <div key={category}>
            <p className="font-inter text-xs font-semibold text-[#9C9C9C] uppercase tracking-widest mb-3">{category}</p>
            <div className="space-y-2">
              {catItems.map((item) => {
                const isOpen = openItems.has(item.id);
                return (
                  <div key={item.id} className="bg-white rounded-xl border border-[#E5DDD5] overflow-hidden">
                    <button
                      onClick={() => toggleItem(item.id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-[#FAF6F3] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {item.icon && <span className="text-xl">{item.icon}</span>}
                        <span className="font-inter text-sm font-semibold text-[#2D2D2D]">{item.title}</span>
                      </div>
                      {isOpen
                        ? <ChevronUp size={14} strokeWidth={1.5} className="text-[#C4A97D] flex-shrink-0" />
                        : <ChevronDown size={14} strokeWidth={1.5} className="text-[#9C9C9C] flex-shrink-0" />
                      }
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 border-t border-[#E5DDD5]">
                        <p className="font-lora text-sm text-[#4A4A4A] mt-3 leading-relaxed whitespace-pre-wrap">{item.content}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
