'use client';
import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { CheckSquare } from 'lucide-react';

type ChecklistItem = {
  id: string;
  category: string;
  task: string;
  is_completed: boolean;
  due_days_before: number | null;
  notes: string | null;
};

export default function ChecklistPage() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    const tripId = localStorage.getItem('attica_current_trip');
    if (!tripId) { setLoading(false); return; }
    const { data } = await supabase.from('checklist_items').select('*').eq('trip_id', tripId).order('category').order('due_days_before', { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  const toggleItem = async (item: ChecklistItem) => {
    await supabase.from('checklist_items').update({ is_completed: !item.is_completed }).eq('id', item.id);
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, is_completed: !i.is_completed } : i));
  };

  const completed = items.filter((i) => i.is_completed).length;
  const progress = items.length ? Math.round((completed / items.length) * 100) : 0;

  const grouped = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  if (loading) return (
    <div className="p-6 space-y-4">
      {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-[#E5DDD5] rounded-xl skeleton" />)}
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-cormorant text-3xl font-semibold text-[#2D2D2D]">Checklist Pré-viagem</h1>
        <p className="font-lora text-sm text-[#9C9C9C]">Tudo que você precisa fazer antes de partir</p>
      </div>

      {items.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-2">
            <span className="font-inter text-sm font-medium text-[#2D2D2D]">Progresso Geral</span>
            <span className="font-cormorant text-2xl font-semibold text-[#C4A97D]">{progress}%</span>
          </div>
          <div className="w-full h-3 bg-[#F5EDE8] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#C4A97D] to-[#7B9E6B] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="font-lora text-xs text-[#9C9C9C] mt-2">{completed} de {items.length} tarefas concluídas</p>
        </Card>
      )}

      {items.length === 0 ? (
        <div className="text-center py-16">
          <CheckSquare size={48} strokeWidth={1} className="text-[#C4A97D] mx-auto mb-4" />
          <p className="font-cormorant text-xl text-[#9C9C9C]">Checklist não disponível</p>
        </div>
      ) : (
        Object.entries(grouped).map(([category, catItems]) => {
          const catCompleted = catItems.filter((i) => i.is_completed).length;
          const catProgress = Math.round((catCompleted / catItems.length) * 100);

          return (
            <Card key={category}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-cormorant text-lg font-semibold text-[#2D2D2D]">{category}</h3>
                <div className="flex items-center gap-3">
                  <span className="font-inter text-xs text-[#9C9C9C]">{catCompleted}/{catItems.length}</span>
                  <div className="w-16 h-2 bg-[#F5EDE8] rounded-full overflow-hidden">
                    <div className="h-full bg-[#C4A97D] rounded-full transition-all" style={{ width: `${catProgress}%` }} />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {catItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(item)}
                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      item.is_completed ? 'bg-green-50' : 'bg-[#FAF6F3] hover:bg-[#F5EDE8]'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      item.is_completed ? 'bg-[#7B9E6B] border-[#7B9E6B]' : 'border-[#E5DDD5]'
                    }`}>
                      {item.is_completed && (
                        <svg viewBox="0 0 10 8" className="w-3 h-3 fill-white">
                          <path d="M1 4l3 3L9 1" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <span className={`font-inter text-sm ${item.is_completed ? 'line-through text-[#9C9C9C]' : 'text-[#2D2D2D]'}`}>
                        {item.task}
                      </span>
                      {item.notes && <p className="font-lora text-xs text-[#9C9C9C] mt-0.5">{item.notes}</p>}
                      {item.due_days_before && !item.is_completed && (
                        <p className="font-inter text-xs text-[#D4A853] mt-0.5">
                          Fazer até {item.due_days_before} dias antes da viagem
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
}
