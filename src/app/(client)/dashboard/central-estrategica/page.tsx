'use client';
import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { Compass, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

type StrategicSection = {
  id: string;
  title: string;
  icon: string | null;
  content: string | null;
  links: Array<{ label: string; url: string }> | null;
  order_index: number;
};

export default function CentralEstrategicaPage() {
  const [sections, setSections] = useState<StrategicSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const supabase = createClient();

  useEffect(() => { fetchSections(); }, []);

  const fetchSections = async () => {
    const tripId = localStorage.getItem('attica_current_trip');
    if (!tripId) { setLoading(false); return; }
    const { data } = await supabase
      .from('strategic_sections')
      .select('*')
      .eq('trip_id', tripId)
      .order('order_index');
    setSections(data || []);
    if (data && data.length > 0) setOpenSections(new Set([data[0].id]));
    setLoading(false);
  };

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (loading) return (
    <div className="p-6 space-y-3">
      {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-[#E5DDD5] rounded-xl skeleton" />)}
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-cormorant text-3xl font-semibold text-[#2D2D2D]">Central Estratégica</h1>
        <p className="font-lora text-sm text-[#9C9C9C]">Informações essenciais para sua viagem</p>
      </div>

      {sections.length === 0 ? (
        <div className="text-center py-16">
          <Compass size={48} strokeWidth={1} className="text-[#C4A97D] mx-auto mb-4" />
          <p className="font-cormorant text-xl text-[#9C9C9C]">Conteúdo em preparação</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((section) => {
            const isOpen = openSections.has(section.id);
            const links = Array.isArray(section.links) ? section.links : [];
            return (
              <div key={section.id} className="bg-white rounded-xl border border-[#E5DDD5] overflow-hidden">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-[#FAF6F3] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {section.icon && (
                      <span className="text-2xl">{section.icon}</span>
                    )}
                    <span className="font-cormorant text-lg font-semibold text-[#2D2D2D]">{section.title}</span>
                  </div>
                  {isOpen
                    ? <ChevronUp size={16} strokeWidth={1.5} className="text-[#C4A97D] flex-shrink-0" />
                    : <ChevronDown size={16} strokeWidth={1.5} className="text-[#9C9C9C] flex-shrink-0" />
                  }
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 border-t border-[#E5DDD5]">
                    {section.content && (
                      <p className="font-lora text-sm text-[#4A4A4A] mt-4 leading-relaxed whitespace-pre-wrap">{section.content}</p>
                    )}
                    {links.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="font-inter text-xs font-semibold text-[#9C9C9C] uppercase tracking-wide">Links Úteis</p>
                        <div className="flex flex-wrap gap-2">
                          {links.map((link, i) => (
                            <a
                              key={i}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs font-inter text-[#8B7355] bg-[#FAF6F3] border border-[#E5DDD5] px-3 py-1.5 rounded-lg hover:bg-[#F5EDE8] hover:border-[#C4A97D] transition-colors"
                            >
                              <ExternalLink size={11} strokeWidth={1.5} />
                              {link.label}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
