'use client';
import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ShoppingBag, CheckSquare, AlertTriangle } from 'lucide-react';

type PackingItem = {
  id: string;
  category: string;
  item_name: string;
  quantity: number;
  is_packed: boolean;
  is_essential: boolean;
  notes: string | null;
};

const PROHIBITED_ITEMS = [
  { category: 'Líquidos', items: ['Mais de 100ml no carry-on', 'Bebidas alcoólicas acima de 70%', 'Tintas e vernizes'] },
  { category: 'Objetos Cortantes', items: ['Facas e tesouras com lâmina > 6cm', 'Navalhas', 'Ferramentas pontiagudas'] },
  { category: 'Eletrônicos', items: ['Baterias danificadas', 'Power banks acima de 160Wh no porão', 'Drones sem autorização'] },
  { category: 'Alimentos/Natureza', items: ['Frutas e vegetais frescos (alguns países)', 'Carnes sem certificação', 'Sementes sem declaração'] },
  { category: 'Outros', items: ['Armas e réplicas', 'Explosivos e fogos de artifício', 'Materiais radioativos'] },
];

export default function MalaPage() {
  const [items, setItems] = useState<PackingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'lista' | 'proibidos'>('lista');
  const supabase = createClient();

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    const tripId = localStorage.getItem('attica_current_trip');
    if (!tripId) { setLoading(false); return; }
    const { data } = await supabase.from('packing_items').select('*').eq('trip_id', tripId).order('category').order('is_essential', { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  const togglePacked = async (item: PackingItem) => {
    await supabase.from('packing_items').update({ is_packed: !item.is_packed }).eq('id', item.id);
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, is_packed: !i.is_packed } : i));
  };

  const packed = items.filter((i) => i.is_packed).length;
  const progress = items.length ? Math.round((packed / items.length) * 100) : 0;

  const grouped = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, PackingItem[]>);

  if (loading) return (
    <div className="p-6 space-y-4">
      {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-[#E5DDD5] rounded-xl skeleton" />)}
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-cormorant text-3xl font-semibold text-[#2D2D2D]">Mala Inteligente</h1>
        <p className="font-lora text-sm text-[#9C9C9C]">Organize sua bagagem com inteligência</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#E5DDD5]">
        {(['lista', 'proibidos'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 font-inter text-sm transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-[#C4A97D] text-[#8B7355] font-semibold'
                : 'border-transparent text-[#9C9C9C] hover:text-[#4A4A4A]'
            }`}
          >
            {tab === 'lista' ? 'Lista de Itens' : 'Itens Proibidos'}
          </button>
        ))}
      </div>

      {activeTab === 'lista' ? (
        <>
          {/* Progress */}
          {items.length > 0 && (
            <Card>
              <div className="flex items-center justify-between mb-2">
                <span className="font-inter text-sm font-medium text-[#2D2D2D]">Progresso da Mala</span>
                <span className="font-cormorant text-2xl font-semibold text-[#C4A97D]">{progress}%</span>
              </div>
              <div className="w-full h-3 bg-[#F5EDE8] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#C4A97D] to-[#8B7355] rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="font-lora text-xs text-[#9C9C9C] mt-2">{packed} de {items.length} itens embalados</p>
            </Card>
          )}

          {items.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag size={48} strokeWidth={1} className="text-[#C4A97D] mx-auto mb-4" />
              <p className="font-cormorant text-xl text-[#9C9C9C]">Lista de mala não disponível</p>
            </div>
          ) : (
            Object.entries(grouped).map(([category, catItems]) => (
              <Card key={category}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-cormorant text-lg font-semibold text-[#2D2D2D]">{category}</h3>
                  <span className="font-inter text-xs text-[#9C9C9C]">
                    {catItems.filter((i) => i.is_packed).length}/{catItems.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {catItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => togglePacked(item)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        item.is_packed ? 'bg-green-50' : 'bg-[#FAF6F3] hover:bg-[#F5EDE8]'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                        item.is_packed ? 'bg-[#7B9E6B] border-[#7B9E6B]' : 'border-[#E5DDD5]'
                      }`}>
                        {item.is_packed && <CheckSquare size={12} className="text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`font-inter text-sm ${item.is_packed ? 'line-through text-[#9C9C9C]' : 'text-[#2D2D2D]'}`}>
                          {item.item_name}
                          {item.quantity > 1 && <span className="text-[#9C9C9C] ml-1">×{item.quantity}</span>}
                        </span>
                        {item.notes && <p className="font-lora text-xs text-[#9C9C9C]">{item.notes}</p>}
                      </div>
                      {item.is_essential && <Badge variant="warning">Essencial</Badge>}
                    </div>
                  ))}
                </div>
              </Card>
            ))
          )}
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
            <AlertTriangle size={20} strokeWidth={1.5} className="text-[#C17B6E] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-inter text-sm font-semibold text-[#C17B6E]">Atenção</p>
              <p className="font-lora text-sm text-[#4A4A4A] mt-1">
                Itens proibidos em aeronaves podem resultar em confisco, multa ou impedimento de embarque.
                Verifique as regras específicas da sua companhia aérea e país de destino.
              </p>
            </div>
          </div>
          {PROHIBITED_ITEMS.map((group) => (
            <Card key={group.category}>
              <h3 className="font-cormorant text-lg font-semibold text-[#2D2D2D] mb-3">{group.category}</h3>
              <ul className="space-y-2">
                {group.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 font-lora text-sm text-[#4A4A4A]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C17B6E] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
