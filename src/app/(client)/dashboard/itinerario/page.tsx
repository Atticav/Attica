'use client';
import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Calendar, Clock, MapPin, Filter, LayoutList, AlignLeft } from 'lucide-react';

type ItineraryItem = {
  id: string;
  trip_id: string;
  day_number: number;
  date: string | null;
  time: string | null;
  type: string;
  title: string;
  description: string | null;
  location: string | null;
  city: string | null;
  priority: string;
  status: string;
  confirmation_code: string | null;
  price: number | null;
  currency: string | null;
  notes: string | null;
};

const typeColors: Record<string, 'blue' | 'success' | 'orange' | 'purple' | 'brown' | 'gray' | 'default'> = {
  Embarque: 'blue',
  Passeio: 'success',
  'Refeição': 'orange',
  Transfer: 'purple',
  'Check-in': 'brown',
  'Check-out': 'brown',
  Livre: 'gray',
  Hotel: 'brown',
  Voo: 'blue',
};

const priorityColors: Record<string, 'error' | 'warning' | 'olive'> = {
  Alta: 'error',
  'Média': 'warning',
  Baixa: 'olive',
};

export default function ItinerarioPage() {
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDay, setFilterDay] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('timeline');
  const supabase = createClient();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const tripId = localStorage.getItem('attica_current_trip');
    if (!tripId) { setLoading(false); return; }

    const { data } = await supabase
      .from('itinerary_items')
      .select('*')
      .eq('trip_id', tripId)
      .order('day_number', { ascending: true })
      .order('time', { ascending: true });

    setItems(data || []);
    setLoading(false);
  };

  const filtered = items.filter((item) => {
    if (filterDay && item.day_number !== parseInt(filterDay)) return false;
    if (filterType && item.type !== filterType) return false;
    if (filterCity && item.city?.toLowerCase() !== filterCity.toLowerCase()) return false;
    if (filterStatus && item.status !== filterStatus) return false;
    return true;
  });

  const days = [...new Set(items.map((i) => i.day_number))].sort((a, b) => a - b);
  const types = [...new Set(items.map((i) => i.type))];
  const cities = [...new Set(items.map((i) => i.city).filter(Boolean))];

  const groupedByDay = filtered.reduce((acc, item) => {
    if (!acc[item.day_number]) acc[item.day_number] = [];
    acc[item.day_number].push(item);
    return acc;
  }, {} as Record<number, ItineraryItem[]>);

  if (loading) return (
    <div className="p-6 space-y-4">
      {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-[#E5DDD5] rounded-xl skeleton" />)}
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-cormorant text-3xl font-semibold text-[#2D2D2D]">Itinerário</h1>
          <p className="font-lora text-sm text-[#9C9C9C]">{items.length} atividades programadas</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('timeline')}
            className={`p-2 rounded-lg border transition-colors ${viewMode === 'timeline' ? 'bg-[#F5EDE8] border-[#C4A97D] text-[#8B7355]' : 'border-[#E5DDD5] text-[#9C9C9C] hover:bg-[#FAF6F3]'}`}
          >
            <AlignLeft size={16} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg border transition-colors ${viewMode === 'table' ? 'bg-[#F5EDE8] border-[#C4A97D] text-[#8B7355]' : 'border-[#E5DDD5] text-[#9C9C9C] hover:bg-[#FAF6F3]'}`}
          >
            <LayoutList size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-wrap gap-3 items-center">
          <Filter size={14} strokeWidth={1.5} className="text-[#C4A97D]" />
          <select
            value={filterDay}
            onChange={(e) => setFilterDay(e.target.value)}
            className="text-sm font-inter border border-[#E5DDD5] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#C4A97D] bg-white"
          >
            <option value="">Todos os dias</option>
            {days.map((d) => <option key={d} value={d}>Dia {d}</option>)}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-sm font-inter border border-[#E5DDD5] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#C4A97D] bg-white"
          >
            <option value="">Todos os tipos</option>
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          {cities.length > 0 && (
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="text-sm font-inter border border-[#E5DDD5] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#C4A97D] bg-white"
            >
              <option value="">Todas as cidades</option>
              {cities.map((c) => <option key={c as string} value={c as string}>{c}</option>)}
            </select>
          )}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-sm font-inter border border-[#E5DDD5] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#C4A97D] bg-white"
          >
            <option value="">Todos os status</option>
            <option value="confirmed">Confirmado</option>
            <option value="pending">Pendente</option>
            <option value="cancelled">Cancelado</option>
          </select>
          {(filterDay || filterType || filterCity || filterStatus) && (
            <button
              onClick={() => { setFilterDay(''); setFilterType(''); setFilterCity(''); setFilterStatus(''); }}
              className="text-xs font-inter text-[#C17B6E] hover:underline"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </Card>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Calendar size={48} strokeWidth={1} className="text-[#C4A97D] mx-auto mb-4" />
          <p className="font-cormorant text-xl text-[#9C9C9C]">Nenhuma atividade encontrada</p>
        </div>
      ) : viewMode === 'timeline' ? (
        <div className="space-y-6">
          {Object.entries(groupedByDay).map(([day, dayItems]) => (
            <div key={day}>
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-[#C4A97D] text-white text-xs font-inter font-bold px-3 py-1.5 rounded-full">
                  Dia {day}
                </div>
                {dayItems[0]?.date && (
                  <span className="font-lora text-sm text-[#9C9C9C]">
                    {new Date(dayItems[0].date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </span>
                )}
              </div>
              <div className="space-y-2 pl-4 border-l-2 border-[#E5DDD5]">
                {dayItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl border border-[#E5DDD5] p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {item.time && (
                          <div className="flex items-center gap-1 text-[#9C9C9C] flex-shrink-0 mt-0.5">
                            <Clock size={12} strokeWidth={1.5} />
                            <span className="font-inter text-xs">{item.time.slice(0, 5)}</span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-inter text-sm font-semibold text-[#2D2D2D]">{item.title}</p>
                          {item.description && <p className="font-lora text-xs text-[#9C9C9C] mt-0.5">{item.description}</p>}
                          {item.location && (
                            <div className="flex items-center gap-1 mt-1">
                              <MapPin size={11} strokeWidth={1.5} className="text-[#C4A97D]" />
                              <span className="font-inter text-xs text-[#9C9C9C]">{item.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant={typeColors[item.type] || 'default'}>{item.type}</Badge>
                        <Badge variant={priorityColors[item.priority] || 'default'}>{item.priority}</Badge>
                        {item.status === 'confirmed' && <Badge variant="success">Confirmado</Badge>}
                        {item.status === 'pending' && <Badge variant="warning">Pendente</Badge>}
                        {item.status === 'cancelled' && <Badge variant="error">Cancelado</Badge>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card padding="none" className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#FAF6F3] border-b border-[#E5DDD5]">
              <tr>
                {['Dia', 'Horário', 'Tipo', 'Atividade', 'Local', 'Prioridade', 'Status'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-inter text-xs font-semibold text-[#9C9C9C] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DDD5]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#FAF6F3] transition-colors">
                  <td className="px-4 py-3 font-inter text-sm font-medium text-[#8B7355]">Dia {item.day_number}</td>
                  <td className="px-4 py-3 font-inter text-xs text-[#9C9C9C]">{item.time ? item.time.slice(0, 5) : '–'}</td>
                  <td className="px-4 py-3"><Badge variant={typeColors[item.type] || 'default'}>{item.type}</Badge></td>
                  <td className="px-4 py-3">
                    <p className="font-inter text-sm font-medium text-[#2D2D2D]">{item.title}</p>
                    {item.description && <p className="font-lora text-xs text-[#9C9C9C] mt-0.5">{item.description}</p>}
                  </td>
                  <td className="px-4 py-3 font-lora text-xs text-[#9C9C9C]">{item.location || '–'}</td>
                  <td className="px-4 py-3"><Badge variant={priorityColors[item.priority] || 'default'}>{item.priority}</Badge></td>
                  <td className="px-4 py-3">
                    {item.status === 'confirmed' && <Badge variant="success">Confirmado</Badge>}
                    {item.status === 'pending' && <Badge variant="warning">Pendente</Badge>}
                    {item.status === 'cancelled' && <Badge variant="error">Cancelado</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
