'use client';
import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { Languages, Volume2, ExternalLink, Search } from 'lucide-react';

type VocabItem = {
  id: string;
  language: string;
  portuguese: string;
  translation: string;
  pronunciation: string | null;
  category: string | null;
  forvo_url: string | null;
  youglish_url: string | null;
};

export default function PalavrasPage() {
  const [items, setItems] = useState<VocabItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('');
  const supabase = createClient();

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    const tripId = localStorage.getItem('attica_current_trip');
    if (!tripId) { setLoading(false); return; }
    const { data } = await supabase
      .from('vocabulary_items')
      .select('*')
      .eq('trip_id', tripId)
      .order('category')
      .order('portuguese');
    setItems(data || []);
    setLoading(false);
  };

  const categories = [...new Set(items.map((i) => i.category).filter(Boolean))];
  const languages = [...new Set(items.map((i) => i.language))];

  const filtered = items.filter((item) => {
    const q = search.toLowerCase();
    if (q && !item.portuguese.toLowerCase().includes(q) && !item.translation.toLowerCase().includes(q)) return false;
    if (filterCategory && item.category !== filterCategory) return false;
    if (filterLanguage && item.language !== filterLanguage) return false;
    return true;
  });

  const grouped = filtered.reduce((acc, item) => {
    const cat = item.category || 'Geral';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, VocabItem[]>);

  if (loading) return (
    <div className="p-6 space-y-4">
      {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-[#E5DDD5] rounded-xl skeleton" />)}
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-cormorant text-3xl font-semibold text-[#2D2D2D]">Palavras Essenciais</h1>
        <p className="font-lora text-sm text-[#9C9C9C]">{items.length} expressões para facilitar sua viagem</p>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9C9C9C]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar palavra..."
              className="w-full pl-9 pr-4 py-2 text-sm font-inter border border-[#E5DDD5] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C4A97D] bg-white"
            />
          </div>
          {languages.length > 1 && (
            <select
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
              className="text-sm font-inter border border-[#E5DDD5] rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#C4A97D] bg-white"
            >
              <option value="">Todos os idiomas</option>
              {languages.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          )}
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
      </Card>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Languages size={48} strokeWidth={1} className="text-[#C4A97D] mx-auto mb-4" />
          <p className="font-cormorant text-xl text-[#9C9C9C]">{items.length === 0 ? 'Vocabulário em preparação' : 'Nenhuma palavra encontrada'}</p>
        </div>
      ) : (
        Object.entries(grouped).map(([category, catItems]) => (
          <Card key={category} padding="none">
            <div className="p-4 border-b border-[#E5DDD5] bg-[#FAF6F3]">
              <h3 className="font-cormorant text-lg font-semibold text-[#2D2D2D]">{category}</h3>
            </div>
            <div className="overflow-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5DDD5]">
                    {['Português', 'Tradução', 'Pronúncia', 'Idioma', 'Ouvir'].map((h) => (
                      <th key={h} className="text-left px-4 py-2.5 font-inter text-xs text-[#9C9C9C] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DDD5]">
                  {catItems.map((item) => (
                    <tr key={item.id} className="hover:bg-[#FAF6F3] transition-colors">
                      <td className="px-4 py-3 font-inter text-sm font-medium text-[#2D2D2D]">{item.portuguese}</td>
                      <td className="px-4 py-3 font-lora text-sm text-[#4A4A4A] italic">{item.translation}</td>
                      <td className="px-4 py-3 font-lora text-sm text-[#9C9C9C]">{item.pronunciation || '–'}</td>
                      <td className="px-4 py-3">
                        <span className="font-inter text-xs bg-[#F5EDE8] text-[#8B7355] px-2 py-0.5 rounded-full">{item.language}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {item.forvo_url && (
                            <a href={item.forvo_url} target="_blank" rel="noopener noreferrer"
                              title="Ouvir no Forvo"
                              className="p-1.5 rounded-lg hover:bg-[#E8DDD5] text-[#9C9C9C] hover:text-[#8B7355] transition-colors">
                              <Volume2 size={13} strokeWidth={1.5} />
                            </a>
                          )}
                          {item.youglish_url && (
                            <a href={item.youglish_url} target="_blank" rel="noopener noreferrer"
                              title="Ver no YouGlish"
                              className="p-1.5 rounded-lg hover:bg-[#E8DDD5] text-[#9C9C9C] hover:text-[#8B7355] transition-colors">
                              <ExternalLink size={13} strokeWidth={1.5} />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
