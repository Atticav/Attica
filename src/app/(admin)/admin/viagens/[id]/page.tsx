'use client';
import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Save, Plus, Trash2, Check } from 'lucide-react';
import { destinations } from '@/lib/destinations-data';

const TABS = [
  { id: 'geral', label: 'Geral' },
  { id: 'itinerario', label: 'Itinerário' },
  { id: 'financeiro', label: 'Financeiro' },
  { id: 'checklist', label: 'Checklist' },
  { id: 'mala', label: 'Mala' },
  { id: 'restaurantes', label: 'Restaurantes' },
  { id: 'central', label: 'Central Estrat.' },
  { id: 'guia', label: 'Guia' },
  { id: 'galeria', label: 'Galeria' },
  { id: 'fotografia', label: 'Fotografia' },
  { id: 'cultura', label: 'Cultura' },
  { id: 'palavras', label: 'Vocabulário' },
  { id: 'contrato', label: 'Contrato' },
];

export default function EditTripPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;
  const [activeTab, setActiveTab] = useState('geral');
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => { fetchTrip(); }, [tripId]);

  const fetchTrip = async () => {
    const { data } = await supabase.from('trips').select('*, profiles(full_name, email)').eq('id', tripId).single();
    setTrip(data);
    setLoading(false);
  };

  const saveTrip = async (updates: any) => {
    setSaving(true);
    await supabase.from('trips').update(updates).eq('id', tripId);
    setTrip((prev: any) => ({ ...prev, ...updates }));
    setSaving(false);
  };

  if (loading) return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-10 bg-[#E5DDD5] rounded-lg w-64 skeleton" />
      <div className="h-12 bg-[#E5DDD5] rounded-lg skeleton" />
      <div className="h-64 bg-[#E5DDD5] rounded-xl skeleton" />
    </div>
  );

  if (!trip) return (
    <div className="p-6 text-center">
      <p className="font-lora text-[#9C9C9C]">Viagem não encontrada</p>
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-[#E8DDD5] transition-colors">
          <ArrowLeft size={18} strokeWidth={1.5} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-cormorant text-2xl font-semibold text-[#2D2D2D] truncate">{trip.title}</h1>
          <p className="font-lora text-sm text-[#9C9C9C]">
            {trip.profiles?.full_name || trip.profiles?.email} · {trip.destination}
          </p>
        </div>
        {saving && (
          <span className="font-inter text-xs text-[#9C9C9C] flex items-center gap-1">
            <div className="w-3 h-3 border-2 border-[#C4A97D] border-t-transparent rounded-full animate-spin" />
            Salvando...
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto -mx-4 px-4">
        <div className="flex gap-1 min-w-max pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 font-inter text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#C4A97D] text-white'
                  : 'bg-white border border-[#E5DDD5] text-[#4A4A4A] hover:bg-[#FAF6F3]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'geral' && (
        <GeralTab trip={trip} onSave={saveTrip} />
      )}
      {activeTab === 'itinerario' && <ItinerarioTab tripId={tripId} />}
      {activeTab === 'financeiro' && <FinanceiroTab tripId={tripId} />}
      {activeTab === 'checklist' && <ChecklistTab tripId={tripId} />}
      {activeTab === 'mala' && <MalaTab tripId={tripId} />}
      {activeTab === 'restaurantes' && <RestaurantesTab tripId={tripId} />}
      {activeTab === 'central' && <CentralTab tripId={tripId} />}
      {activeTab === 'guia' && <GuiaTab tripId={tripId} />}
      {activeTab === 'galeria' && <GaleriaTab tripId={tripId} />}
      {activeTab === 'fotografia' && <FotografiaTab tripId={tripId} />}
      {activeTab === 'cultura' && <CulturaTab tripId={tripId} />}
      {activeTab === 'palavras' && <PalavrasTab tripId={tripId} />}
      {activeTab === 'contrato' && <ContratoTab trip={trip} onSave={saveTrip} />}
    </div>
  );
}

function GeralTab({ trip, onSave }: { trip: any; onSave: (u: any) => void }) {
  const [form, setForm] = useState({
    title: trip.title || '',
    destination: trip.destination || '',
    destination_id: trip.destination_id || '',
    start_date: trip.start_date || '',
    end_date: trip.end_date || '',
    status: trip.status || 'planning',
    style: trip.style || '',
    notes: trip.notes || '',
    budget_link: trip.budget_link || '',
    cover_image_url: trip.cover_image_url || '',
  });

  const destOptions = destinations.map((d) => ({ value: d.id, label: `${d.flagEmoji} ${d.name}` }));

  return (
    <Card>
      <h3 className="font-cormorant text-xl font-semibold text-[#2D2D2D] mb-4">Informações Gerais</h3>
      <div className="space-y-4">
        <Input label="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <Select label="Destino" options={destOptions} value={form.destination_id}
          onChange={(e) => {
            const dest = destinations.find((d) => d.id === e.target.value);
            setForm({ ...form, destination_id: e.target.value, destination: dest?.name || '' });
          }}
          placeholder="Selecione o destino"
        />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Data início" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          <Input label="Data volta" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
        </div>
        <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
          options={[
            { value: 'planning', label: 'Planejamento' },
            { value: 'confirmed', label: 'Confirmada' },
            { value: 'ongoing', label: 'Em andamento' },
            { value: 'completed', label: 'Concluída' },
            { value: 'cancelled', label: 'Cancelada' },
          ]}
        />
        <Input label="Estilo" value={form.style} onChange={(e) => setForm({ ...form, style: e.target.value })} placeholder="Romântico, Aventura, Cultural..." />
        <Input label="Link do orçamento" type="url" value={form.budget_link} onChange={(e) => setForm({ ...form, budget_link: e.target.value })} placeholder="https://..." />
        <Textarea label="Observações" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <Button onClick={() => onSave(form)} className="w-full">
          <Save size={14} strokeWidth={1.5} />
          Salvar Alterações
        </Button>
      </div>
    </Card>
  );
}

function ItinerarioTab({ tripId }: { tripId: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ day_number: 1, type: 'Passeio', title: '', description: '', time: '', city: '', location: '', priority: 'Média', status: 'confirmed' });
  const supabase = createClient();

  useEffect(() => {
    supabase.from('itinerary_items').select('*').eq('trip_id', tripId).order('day_number').then(({ data }) => { setItems(data || []); setLoading(false); });
  }, [tripId]);

  const handleSave = async () => {
    const { data } = await supabase.from('itinerary_items').insert({ ...form, trip_id: tripId } as any).select().single();
    if (data) { setItems((p) => [...p, data]); setShowModal(false); }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('itinerary_items').delete().eq('id', id);
    setItems((p) => p.filter((i) => i.id !== id));
  };

  return (
    <Card padding="none">
      <div className="flex items-center justify-between p-4 border-b border-[#E5DDD5]">
        <h3 className="font-cormorant text-lg font-semibold text-[#2D2D2D]">Itinerário</h3>
        <Button size="sm" onClick={() => setShowModal(true)}><Plus size={12} strokeWidth={1.5} />Adicionar</Button>
      </div>
      <div className="divide-y divide-[#E5DDD5]">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 p-3 hover:bg-[#FAF6F3]">
            <span className="font-inter text-xs text-[#8B7355] font-bold w-14 flex-shrink-0">Dia {item.day_number}</span>
            <div className="flex-1 min-w-0">
              <p className="font-inter text-sm font-medium text-[#2D2D2D] truncate">{item.title}</p>
              <p className="font-lora text-xs text-[#9C9C9C]">{item.type} · {item.city || '–'}</p>
            </div>
            <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded hover:bg-red-50 text-[#9C9C9C] hover:text-[#C17B6E]">
              <Trash2 size={12} strokeWidth={1.5} />
            </button>
          </div>
        ))}
        {items.length === 0 && !loading && (
          <p className="text-center py-8 font-lora text-sm text-[#9C9C9C]">Nenhum item no itinerário</p>
        )}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Novo Item">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Dia" type="number" value={form.day_number} onChange={(e) => setForm({ ...form, day_number: parseInt(e.target.value) })} min={1} />
            <Input label="Horário" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          </div>
          <Select label="Tipo" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
            options={['Embarque','Passeio','Refeição','Transfer','Check-in','Check-out','Livre','Hotel','Voo'].map(v => ({ value: v, label: v }))} />
          <Input label="Título *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Input label="Cidade" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <Input label="Local" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <Textarea label="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Prioridade" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
              options={['Alta','Média','Baixa'].map(v => ({ value: v, label: v }))} />
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
              options={[{value:'confirmed',label:'Confirmado'},{value:'pending',label:'Pendente'},{value:'cancelled',label:'Cancelado'}]} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.title} className="flex-1">Salvar</Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

function FinanceiroTab({ tripId }: { tripId: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [items, setItems] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ category: '', description: '', amount: 0, currency: 'BRL', amount_brl: 0, status: 'pending', payment_method: '' });
  const supabase = createClient();

  useEffect(() => {
    supabase.from('financial_items').select('*').eq('trip_id', tripId).then(({ data }) => setItems(data || []));
  }, [tripId]);

  const handleSave = async () => {
    const { data } = await supabase.from('financial_items').insert({ ...form, trip_id: tripId } as any).select().single();
    if (data) { setItems((p) => [...p, data]); setShowModal(false); }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('financial_items').delete().eq('id', id);
    setItems((p) => p.filter((i) => i.id !== id));
  };

  return (
    <Card padding="none">
      <div className="flex items-center justify-between p-4 border-b border-[#E5DDD5]">
        <h3 className="font-cormorant text-lg font-semibold text-[#2D2D2D]">Financeiro</h3>
        <Button size="sm" onClick={() => setShowModal(true)}><Plus size={12} strokeWidth={1.5} />Adicionar</Button>
      </div>
      <div className="divide-y divide-[#E5DDD5]">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 p-3 hover:bg-[#FAF6F3]">
            <div className="flex-1 min-w-0">
              <p className="font-inter text-sm font-medium text-[#2D2D2D]">{item.description}</p>
              <p className="font-lora text-xs text-[#9C9C9C]">{item.category}</p>
            </div>
            <span className="font-inter text-sm font-semibold text-[#2D2D2D]">
              {(item.amount_brl || item.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
            <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded hover:bg-red-50 text-[#9C9C9C] hover:text-[#C17B6E]">
              <Trash2 size={12} strokeWidth={1.5} />
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="text-center py-8 font-lora text-sm text-[#9C9C9C]">Nenhum item financeiro</p>}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Novo Item Financeiro">
        <div className="space-y-3">
          <Input label="Categoria" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Ex: Voo, Hotel, Passeio..." />
          <Input label="Descrição *" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Valor" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) })} />
            <Input label="Moeda" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
          </div>
          <Input label="Valor em R$" type="number" value={form.amount_brl} onChange={(e) => setForm({ ...form, amount_brl: parseFloat(e.target.value) })} />
          <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
            options={[{value:'paid',label:'Pago'},{value:'pending',label:'Pendente'},{value:'overdue',label:'Vencido'}]} />
          <Input label="Método de pagamento" value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} />
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.description} className="flex-1">Salvar</Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

function ChecklistTab({ tripId }: { tripId: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [items, setItems] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ category: '', task: '', due_days_before: '', notes: '' });
  const supabase = createClient();

  useEffect(() => {
    supabase.from('checklist_items').select('*').eq('trip_id', tripId).order('category').then(({ data }) => setItems(data || []));
  }, [tripId]);

  const handleSave = async () => {
    const { data } = await supabase.from('checklist_items').insert({
      ...form,
      trip_id: tripId,
      is_completed: false,
      due_days_before: form.due_days_before ? parseInt(form.due_days_before) : null,
    } as any).select().single();
    if (data) { setItems((p) => [...p, data]); setShowModal(false); setForm({ category: '', task: '', due_days_before: '', notes: '' }); }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('checklist_items').delete().eq('id', id);
    setItems((p) => p.filter((i) => i.id !== id));
  };

  return (
    <Card padding="none">
      <div className="flex items-center justify-between p-4 border-b border-[#E5DDD5]">
        <h3 className="font-cormorant text-lg font-semibold text-[#2D2D2D]">Checklist</h3>
        <Button size="sm" onClick={() => setShowModal(true)}><Plus size={12} strokeWidth={1.5} />Adicionar</Button>
      </div>
      <div className="divide-y divide-[#E5DDD5]">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 p-3 hover:bg-[#FAF6F3]">
            <div className="flex-1"><p className="font-inter text-sm text-[#2D2D2D]">{item.task}</p><p className="font-lora text-xs text-[#9C9C9C]">{item.category}</p></div>
            <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded hover:bg-red-50 text-[#9C9C9C] hover:text-[#C17B6E]"><Trash2 size={12} strokeWidth={1.5} /></button>
          </div>
        ))}
        {items.length === 0 && <p className="text-center py-8 font-lora text-sm text-[#9C9C9C]">Nenhum item no checklist</p>}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nova Tarefa">
        <div className="space-y-3">
          <Input label="Categoria" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Ex: Documentação, Saúde..." />
          <Input label="Tarefa *" value={form.task} onChange={(e) => setForm({ ...form, task: e.target.value })} required />
          <Input label="Dias antes da viagem" type="number" value={form.due_days_before} onChange={(e) => setForm({ ...form, due_days_before: e.target.value })} placeholder="Ex: 30" />
          <Textarea label="Notas" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.task} className="flex-1">Salvar</Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

function MalaTab({ tripId }: { tripId: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [items, setItems] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ category: '', item_name: '', quantity: 1, is_essential: false, notes: '' });
  const supabase = createClient();

  useEffect(() => {
    supabase.from('packing_items').select('*').eq('trip_id', tripId).order('category').then(({ data }) => setItems(data || []));
  }, [tripId]);

  const handleSave = async () => {
    const { data } = await supabase.from('packing_items').insert({ ...form, trip_id: tripId, is_packed: false } as any).select().single();
    if (data) { setItems((p) => [...p, data]); setShowModal(false); setForm({ category: '', item_name: '', quantity: 1, is_essential: false, notes: '' }); }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('packing_items').delete().eq('id', id);
    setItems((p) => p.filter((i) => i.id !== id));
  };

  return (
    <Card padding="none">
      <div className="flex items-center justify-between p-4 border-b border-[#E5DDD5]">
        <h3 className="font-cormorant text-lg font-semibold text-[#2D2D2D]">Lista de Mala</h3>
        <Button size="sm" onClick={() => setShowModal(true)}><Plus size={12} strokeWidth={1.5} />Adicionar</Button>
      </div>
      <div className="divide-y divide-[#E5DDD5]">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 p-3 hover:bg-[#FAF6F3]">
            <div className="flex-1">
              <p className="font-inter text-sm text-[#2D2D2D]">{item.item_name} {item.quantity > 1 && <span className="text-[#9C9C9C]">×{item.quantity}</span>}</p>
              <p className="font-lora text-xs text-[#9C9C9C]">{item.category}{item.is_essential && ' · Essencial'}</p>
            </div>
            <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded hover:bg-red-50 text-[#9C9C9C] hover:text-[#C17B6E]"><Trash2 size={12} strokeWidth={1.5} /></button>
          </div>
        ))}
        {items.length === 0 && <p className="text-center py-8 font-lora text-sm text-[#9C9C9C]">Nenhum item na mala</p>}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Novo Item">
        <div className="space-y-3">
          <Input label="Categoria" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Ex: Roupas, Higiene..." />
          <Input label="Item *" value={form.item_name} onChange={(e) => setForm({ ...form, item_name: e.target.value })} required />
          <Input label="Quantidade" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) })} min={1} />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_essential} onChange={(e) => setForm({ ...form, is_essential: e.target.checked })} className="rounded border-[#E5DDD5]" />
            <span className="font-inter text-sm text-[#4A4A4A]">Item essencial</span>
          </label>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.item_name} className="flex-1">Salvar</Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

function RestaurantesTab({ tripId }: { tripId: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [items, setItems] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', cuisine: '', city: '', description: '', recommendation_reason: '', rating: 4, price_range: 2, maps_url: '', booking_url: '' });
  const supabase = createClient();

  useEffect(() => {
    supabase.from('restaurants').select('*').eq('trip_id', tripId).then(({ data }) => setItems(data || []));
  }, [tripId]);

  const handleSave = async () => {
    const { data } = await supabase.from('restaurants').insert({ ...form, trip_id: tripId } as any).select().single();
    if (data) { setItems((p) => [...p, data]); setShowModal(false); }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('restaurants').delete().eq('id', id);
    setItems((p) => p.filter((i) => i.id !== id));
  };

  return (
    <Card padding="none">
      <div className="flex items-center justify-between p-4 border-b border-[#E5DDD5]">
        <h3 className="font-cormorant text-lg font-semibold text-[#2D2D2D]">Restaurantes</h3>
        <Button size="sm" onClick={() => setShowModal(true)}><Plus size={12} strokeWidth={1.5} />Adicionar</Button>
      </div>
      <div className="divide-y divide-[#E5DDD5]">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 p-3 hover:bg-[#FAF6F3]">
            <div className="flex-1"><p className="font-inter text-sm font-medium text-[#2D2D2D]">{item.name}</p><p className="font-lora text-xs text-[#9C9C9C]">{item.cuisine} · {item.city}</p></div>
            <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded hover:bg-red-50 text-[#9C9C9C] hover:text-[#C17B6E]"><Trash2 size={12} strokeWidth={1.5} /></button>
          </div>
        ))}
        {items.length === 0 && <p className="text-center py-8 font-lora text-sm text-[#9C9C9C]">Nenhum restaurante</p>}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Novo Restaurante">
        <div className="space-y-3">
          <Input label="Nome *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Culinária" value={form.cuisine} onChange={(e) => setForm({ ...form, cuisine: e.target.value })} />
            <Input label="Cidade" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <Textarea label="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Textarea label="Por que recomendar?" value={form.recommendation_reason} onChange={(e) => setForm({ ...form, recommendation_reason: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Link do mapa" value={form.maps_url} onChange={(e) => setForm({ ...form, maps_url: e.target.value })} />
            <Input label="Link reserva" value={form.booking_url} onChange={(e) => setForm({ ...form, booking_url: e.target.value })} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.name} className="flex-1">Salvar</Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

function CentralTab({ tripId }: { tripId: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [items, setItems] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', icon: '', content: '', order_index: 0 });
  const supabase = createClient();

  useEffect(() => {
    supabase.from('strategic_sections').select('*').eq('trip_id', tripId).order('order_index').then(({ data }) => setItems(data || []));
  }, [tripId]);

  const handleSave = async () => {
    const { data } = await supabase.from('strategic_sections').insert({ ...form, trip_id: tripId, links: [] } as any).select().single();
    if (data) { setItems((p) => [...p, data]); setShowModal(false); }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('strategic_sections').delete().eq('id', id);
    setItems((p) => p.filter((i) => i.id !== id));
  };

  return (
    <Card padding="none">
      <div className="flex items-center justify-between p-4 border-b border-[#E5DDD5]">
        <h3 className="font-cormorant text-lg font-semibold text-[#2D2D2D]">Central Estratégica</h3>
        <Button size="sm" onClick={() => setShowModal(true)}><Plus size={12} strokeWidth={1.5} />Adicionar</Button>
      </div>
      <div className="divide-y divide-[#E5DDD5]">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 p-3 hover:bg-[#FAF6F3]">
            {item.icon && <span className="text-lg">{item.icon}</span>}
            <div className="flex-1"><p className="font-inter text-sm font-medium text-[#2D2D2D]">{item.title}</p></div>
            <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded hover:bg-red-50 text-[#9C9C9C] hover:text-[#C17B6E]"><Trash2 size={12} strokeWidth={1.5} /></button>
          </div>
        ))}
        {items.length === 0 && <p className="text-center py-8 font-lora text-sm text-[#9C9C9C]">Nenhuma seção</p>}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nova Seção">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Ícone (emoji)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="✈️" />
            <Input label="Ordem" type="number" value={form.order_index} onChange={(e) => setForm({ ...form, order_index: parseInt(e.target.value) })} />
          </div>
          <Input label="Título *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Textarea label="Conteúdo" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.title} className="flex-1">Salvar</Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

function GuiaTab({ tripId }: { tripId: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [items, setItems] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', url: '', platform: 'youtube', category: '', order_index: 0 });
  const supabase = createClient();

  useEffect(() => {
    supabase.from('guide_videos').select('*').eq('trip_id', tripId).order('order_index').then(({ data }) => setItems(data || []));
  }, [tripId]);

  const handleSave = async () => {
    const { data } = await supabase.from('guide_videos').insert({ ...form, trip_id: tripId } as any).select().single();
    if (data) { setItems((p) => [...p, data]); setShowModal(false); }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('guide_videos').delete().eq('id', id);
    setItems((p) => p.filter((i) => i.id !== id));
  };

  return (
    <Card padding="none">
      <div className="flex items-center justify-between p-4 border-b border-[#E5DDD5]">
        <h3 className="font-cormorant text-lg font-semibold text-[#2D2D2D]">Guia em Vídeo</h3>
        <Button size="sm" onClick={() => setShowModal(true)}><Plus size={12} strokeWidth={1.5} />Adicionar</Button>
      </div>
      <div className="divide-y divide-[#E5DDD5]">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 p-3 hover:bg-[#FAF6F3]">
            <div className="flex-1"><p className="font-inter text-sm font-medium text-[#2D2D2D]">{item.title}</p><p className="font-lora text-xs text-[#9C9C9C]">{item.platform} · {item.category}</p></div>
            <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded hover:bg-red-50 text-[#9C9C9C] hover:text-[#C17B6E]"><Trash2 size={12} strokeWidth={1.5} /></button>
          </div>
        ))}
        {items.length === 0 && <p className="text-center py-8 font-lora text-sm text-[#9C9C9C]">Nenhum vídeo</p>}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Novo Vídeo">
        <div className="space-y-3">
          <Input label="Título *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Select label="Plataforma" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}
            options={[{value:'youtube',label:'YouTube'},{value:'vimeo',label:'Vimeo'},{value:'upload',label:'Upload'}]} />
          <Input label="URL" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://youtube.com/watch?v=..." />
          <Input label="Categoria" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <Textarea label="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.title} className="flex-1">Salvar</Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

function GaleriaTab({ tripId }: { tripId: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [items, setItems] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', file_url: '', category: '', order_index: 0 });
  const supabase = createClient();

  useEffect(() => {
    supabase.from('gallery_photos').select('*').eq('trip_id', tripId).order('order_index').then(({ data }) => setItems(data || []));
  }, [tripId]);

  const handleSave = async () => {
    const { data } = await supabase.from('gallery_photos').insert({ ...form, trip_id: tripId } as any).select().single();
    if (data) { setItems((p) => [...p, data]); setShowModal(false); }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('gallery_photos').delete().eq('id', id);
    setItems((p) => p.filter((i) => i.id !== id));
  };

  return (
    <Card padding="none">
      <div className="flex items-center justify-between p-4 border-b border-[#E5DDD5]">
        <h3 className="font-cormorant text-lg font-semibold text-[#2D2D2D]">Galeria</h3>
        <Button size="sm" onClick={() => setShowModal(true)}><Plus size={12} strokeWidth={1.5} />Adicionar</Button>
      </div>
      <div className="grid grid-cols-4 gap-2 p-4">
        {items.map((item) => (
          <div key={item.id} className="relative group">
            <img src={item.file_url} alt={item.title || ''} className="w-full h-16 object-cover rounded-lg" />
            <button onClick={() => handleDelete(item.id)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash2 size={10} />
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="col-span-4 text-center py-8 font-lora text-sm text-[#9C9C9C]">Nenhuma foto</p>}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nova Foto">
        <div className="space-y-3">
          <Input label="URL da imagem *" value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })} placeholder="https://..." required />
          <Input label="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input label="Categoria" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.file_url} className="flex-1">Salvar</Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

function FotografiaTab({ tripId }: { tripId: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [items, setItems] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ category: '', title: '', content: '', location: '', best_time: '', image_url: '' });
  const supabase = createClient();

  useEffect(() => {
    supabase.from('photography_tips').select('*').eq('trip_id', tripId).then(({ data }) => setItems(data || []));
  }, [tripId]);

  const handleSave = async () => {
    const { data } = await supabase.from('photography_tips').insert({ ...form, trip_id: tripId } as any).select().single();
    if (data) { setItems((p) => [...p, data]); setShowModal(false); }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('photography_tips').delete().eq('id', id);
    setItems((p) => p.filter((i) => i.id !== id));
  };

  return (
    <Card padding="none">
      <div className="flex items-center justify-between p-4 border-b border-[#E5DDD5]">
        <h3 className="font-cormorant text-lg font-semibold text-[#2D2D2D]">Dicas de Fotografia</h3>
        <Button size="sm" onClick={() => setShowModal(true)}><Plus size={12} strokeWidth={1.5} />Adicionar</Button>
      </div>
      <div className="divide-y divide-[#E5DDD5]">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 p-3 hover:bg-[#FAF6F3]">
            <div className="flex-1"><p className="font-inter text-sm font-medium text-[#2D2D2D]">{item.title}</p><p className="font-lora text-xs text-[#9C9C9C]">{item.category} · {item.location}</p></div>
            <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded hover:bg-red-50 text-[#9C9C9C] hover:text-[#C17B6E]"><Trash2 size={12} strokeWidth={1.5} /></button>
          </div>
        ))}
        {items.length === 0 && <p className="text-center py-8 font-lora text-sm text-[#9C9C9C]">Nenhuma dica</p>}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nova Dica">
        <div className="space-y-3">
          <Input label="Categoria" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Ex: Pôr do sol, Arquitetura..." />
          <Input label="Título *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Textarea label="Conteúdo *" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Local" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <Input label="Melhor horário" value={form.best_time} onChange={(e) => setForm({ ...form, best_time: e.target.value })} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.title || !form.content} className="flex-1">Salvar</Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

function CulturaTab({ tripId }: { tripId: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [items, setItems] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ category: '', title: '', content: '', icon: '', order_index: 0 });
  const supabase = createClient();

  useEffect(() => {
    supabase.from('cultural_info').select('*').eq('trip_id', tripId).order('order_index').then(({ data }) => setItems(data || []));
  }, [tripId]);

  const handleSave = async () => {
    const { data } = await supabase.from('cultural_info').insert({ ...form, trip_id: tripId } as any).select().single();
    if (data) { setItems((p) => [...p, data]); setShowModal(false); }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('cultural_info').delete().eq('id', id);
    setItems((p) => p.filter((i) => i.id !== id));
  };

  return (
    <Card padding="none">
      <div className="flex items-center justify-between p-4 border-b border-[#E5DDD5]">
        <h3 className="font-cormorant text-lg font-semibold text-[#2D2D2D]">Cultura Local</h3>
        <Button size="sm" onClick={() => setShowModal(true)}><Plus size={12} strokeWidth={1.5} />Adicionar</Button>
      </div>
      <div className="divide-y divide-[#E5DDD5]">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 p-3 hover:bg-[#FAF6F3]">
            {item.icon && <span>{item.icon}</span>}
            <div className="flex-1"><p className="font-inter text-sm font-medium text-[#2D2D2D]">{item.title}</p><p className="font-lora text-xs text-[#9C9C9C]">{item.category}</p></div>
            <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded hover:bg-red-50 text-[#9C9C9C] hover:text-[#C17B6E]"><Trash2 size={12} strokeWidth={1.5} /></button>
          </div>
        ))}
        {items.length === 0 && <p className="text-center py-8 font-lora text-sm text-[#9C9C9C]">Nenhum item cultural</p>}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nova Informação Cultural">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Categoria" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Ex: Etiqueta, Culinária..." />
            <Input label="Ícone (emoji)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="🍜" />
          </div>
          <Input label="Título *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Textarea label="Conteúdo *" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.title || !form.content} className="flex-1">Salvar</Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

function PalavrasTab({ tripId }: { tripId: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [items, setItems] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ language: '', portuguese: '', translation: '', pronunciation: '', category: '', forvo_url: '', youglish_url: '' });
  const supabase = createClient();

  useEffect(() => {
    supabase.from('vocabulary_items').select('*').eq('trip_id', tripId).order('category').then(({ data }) => setItems(data || []));
  }, [tripId]);

  const handleSave = async () => {
    const { data } = await supabase.from('vocabulary_items').insert({ ...form, trip_id: tripId } as any).select().single();
    if (data) { setItems((p) => [...p, data]); setShowModal(false); }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('vocabulary_items').delete().eq('id', id);
    setItems((p) => p.filter((i) => i.id !== id));
  };

  return (
    <Card padding="none">
      <div className="flex items-center justify-between p-4 border-b border-[#E5DDD5]">
        <h3 className="font-cormorant text-lg font-semibold text-[#2D2D2D]">Vocabulário</h3>
        <Button size="sm" onClick={() => setShowModal(true)}><Plus size={12} strokeWidth={1.5} />Adicionar</Button>
      </div>
      <div className="divide-y divide-[#E5DDD5]">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 p-3 hover:bg-[#FAF6F3]">
            <div className="flex-1">
              <p className="font-inter text-sm text-[#2D2D2D]"><span className="font-medium">{item.portuguese}</span> → <span className="italic">{item.translation}</span></p>
              <p className="font-lora text-xs text-[#9C9C9C]">{item.language} · {item.category}</p>
            </div>
            <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded hover:bg-red-50 text-[#9C9C9C] hover:text-[#C17B6E]"><Trash2 size={12} strokeWidth={1.5} /></button>
          </div>
        ))}
        {items.length === 0 && <p className="text-center py-8 font-lora text-sm text-[#9C9C9C]">Nenhuma palavra</p>}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nova Palavra">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Idioma *" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} placeholder="Ex: Japonês" required />
            <Input label="Categoria" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Ex: Saudações" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Português *" value={form.portuguese} onChange={(e) => setForm({ ...form, portuguese: e.target.value })} required />
            <Input label="Tradução *" value={form.translation} onChange={(e) => setForm({ ...form, translation: e.target.value })} required />
          </div>
          <Input label="Pronúncia" value={form.pronunciation} onChange={(e) => setForm({ ...form, pronunciation: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Link Forvo" value={form.forvo_url} onChange={(e) => setForm({ ...form, forvo_url: e.target.value })} placeholder="https://forvo.com/..." />
            <Input label="Link YouGlish" value={form.youglish_url} onChange={(e) => setForm({ ...form, youglish_url: e.target.value })} placeholder="https://youglish.com/..." />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.language || !form.portuguese || !form.translation} className="flex-1">Salvar</Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

function ContratoTab({ trip, onSave }: { trip: any; onSave: (u: any) => void }) {
  const [form, setForm] = useState({
    contract_pdf_url: trip.contract_pdf_url || '',
    contract_form_id: trip.contract_form_id || '',
  });

  return (
    <Card>
      <h3 className="font-cormorant text-xl font-semibold text-[#2D2D2D] mb-4">Contrato</h3>
      <div className="space-y-4">
        <Input label="URL do PDF do contrato" type="url" value={form.contract_pdf_url} onChange={(e) => setForm({ ...form, contract_pdf_url: e.target.value })} placeholder="https://..." />
        <Input label="ID do formulário Tally" value={form.contract_form_id} onChange={(e) => setForm({ ...form, contract_form_id: e.target.value })} placeholder="Ex: abcXYZ" helperText="ID do formulário Tally.so para assinatura digital" />
        <Button onClick={() => onSave(form)} className="w-full">
          <Save size={14} strokeWidth={1.5} />
          Salvar Contrato
        </Button>
      </div>
    </Card>
  );
}
