'use client';
import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { destinations } from '@/lib/destinations-data';
import { ArrowLeft, ArrowRight, Check, MapPin } from 'lucide-react';

export default function NovaViagemPage() {
  const [step, setStep] = useState(1);
  const [clients, setClients] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    client_id: '',
    title: '',
    destination: '',
    destination_id: '',
    start_date: '',
    end_date: '',
    status: 'planning',
    style: '',
    notes: '',
    budget_link: '',
  });
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => { fetchClients(); }, []);

  const fetchClients = async () => {
    const { data } = await supabase.from('profiles').select('id, full_name, email').eq('role', 'client').order('full_name');
    setClients((data || []).map((c) => ({ value: c.id, label: c.full_name || c.email })));
  };

  const destOptions = destinations.map((d) => ({ value: d.id, label: `${d.flagEmoji} ${d.name}` }));

  const handleDestinationChange = (id: string) => {
    const dest = destinations.find((d) => d.id === id);
    setForm((prev) => ({
      ...prev,
      destination_id: id,
      destination: dest?.name || '',
      title: dest ? `Viagem para ${dest.name}` : prev.title,
    }));
  };

  const handleSubmit = async () => {
    if (!form.client_id || !form.destination) return;
    setLoading(true);

    const { data, error } = await supabase.from('trips').insert({
      client_id: form.client_id,
      title: form.title,
      destination: form.destination,
      destination_id: form.destination_id || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      status: form.status as any,
      style: form.style || null,
      notes: form.notes || null,
      budget_link: form.budget_link || null,
    }).select().single();

    setLoading(false);
    if (!error && data) {
      router.push(`/admin/viagens/${data.id}`);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => step > 1 ? setStep(step - 1) : router.back()}
          className="p-2 rounded-lg hover:bg-[#E8DDD5] transition-colors"
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
        </button>
        <div>
          <h1 className="font-cormorant text-3xl font-semibold text-[#2D2D2D]">Nova Viagem</h1>
          <p className="font-lora text-sm text-[#9C9C9C]">Passo {step} de 2</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-2">
        {[1, 2].map((s) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? 'bg-[#C4A97D]' : 'bg-[#E5DDD5]'}`} />
        ))}
      </div>

      {step === 1 && (
        <Card>
          <h2 className="font-cormorant text-2xl font-semibold text-[#2D2D2D] mb-6">Destino e Cliente</h2>
          <div className="space-y-4">
            <Select
              label="Cliente *"
              options={clients}
              value={form.client_id}
              onChange={(e) => setForm({ ...form, client_id: e.target.value })}
              placeholder="Selecione um cliente"
            />
            <Select
              label="Destino *"
              options={destOptions}
              value={form.destination_id}
              onChange={(e) => handleDestinationChange(e.target.value)}
              placeholder="Selecione o destino"
            />
            {form.destination && (
              <div className="bg-[#FAF6F3] rounded-xl p-4 flex items-center gap-3">
                <MapPin size={16} strokeWidth={1.5} className="text-[#C4A97D]" />
                <div>
                  <p className="font-inter text-sm font-medium text-[#2D2D2D]">{form.destination}</p>
                  {destinations.find(d => d.id === form.destination_id) && (
                    <p className="font-lora text-xs text-[#9C9C9C]">
                      {destinations.find(d => d.id === form.destination_id)?.currency} · {destinations.find(d => d.id === form.destination_id)?.language}
                    </p>
                  )}
                </div>
              </div>
            )}
            <Button
              onClick={() => setStep(2)}
              disabled={!form.client_id || !form.destination}
              className="w-full"
              size="lg"
            >
              Próximo
              <ArrowRight size={14} strokeWidth={1.5} />
            </Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <h2 className="font-cormorant text-2xl font-semibold text-[#2D2D2D] mb-6">Detalhes da Viagem</h2>
          <div className="space-y-4">
            <Input
              label="Título da viagem"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ex: Lua de mel em Paris"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Data de início"
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              />
              <Input
                label="Data de volta"
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              />
            </div>
            <Select
              label="Status"
              options={[
                { value: 'planning', label: 'Planejamento' },
                { value: 'confirmed', label: 'Confirmada' },
                { value: 'ongoing', label: 'Em andamento' },
                { value: 'completed', label: 'Concluída' },
                { value: 'cancelled', label: 'Cancelada' },
              ]}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            />
            <Input
              label="Estilo de viagem"
              value={form.style}
              onChange={(e) => setForm({ ...form, style: e.target.value })}
              placeholder="Ex: Romântico, Aventura, Cultural..."
            />
            <Input
              label="Link da planilha de orçamento"
              type="url"
              value={form.budget_link}
              onChange={(e) => setForm({ ...form, budget_link: e.target.value })}
              placeholder="https://..."
            />
            <Textarea
              label="Observações"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Notas internas sobre a viagem..."
            />
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Voltar</Button>
              <Button onClick={handleSubmit} loading={loading} className="flex-1" size="lg">
                <Check size={14} strokeWidth={1.5} />
                Criar Viagem
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
