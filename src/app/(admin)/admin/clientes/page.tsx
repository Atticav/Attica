'use client';
import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Users, Plus, Search, MapPin, Mail, Phone, Trash2, Edit } from 'lucide-react';

type Client = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  created_at: string;
};

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ email: '', full_name: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const supabase = createClient();

  useEffect(() => { fetchClients(); }, []);

  const fetchClients = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'client')
      .order('created_at', { ascending: false });
    setClients(data || []);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');

    const res = await fetch('/api/admin/create-client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Erro ao criar cliente');
      setCreating(false);
      return;
    }

    setShowModal(false);
    setForm({ email: '', full_name: '', phone: '', password: '' });
    fetchClients();
    setCreating(false);
  };

  const filtered = clients.filter((c) =>
    !search ||
    c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-cormorant text-3xl font-semibold text-[#2D2D2D]">Clientes</h1>
          <p className="font-lora text-sm text-[#9C9C9C]">{clients.length} clientes cadastrados</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={14} strokeWidth={1.5} />
          Novo Cliente
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9C9C9C]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar cliente..."
          className="w-full pl-9 pr-4 py-2.5 text-sm font-inter border border-[#E5DDD5] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C4A97D] bg-white"
        />
      </div>

      {/* Clients Table */}
      <Card padding="none">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-[#E5DDD5] rounded-xl skeleton" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Users size={40} strokeWidth={1} className="text-[#C4A97D] mx-auto mb-3" />
            <p className="font-lora text-[#9C9C9C]">Nenhum cliente encontrado</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E5DDD5]">
            {filtered.map((client) => (
              <div key={client.id} className="flex items-center gap-4 p-4 hover:bg-[#FAF6F3] transition-colors">
                <div className="w-10 h-10 rounded-full bg-[#F5EDE8] flex items-center justify-center flex-shrink-0">
                  <span className="font-cinzel text-sm font-bold text-[#C4A97D]">
                    {(client.full_name || client.email).charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-inter text-sm font-semibold text-[#2D2D2D]">{client.full_name || 'Sem nome'}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 font-lora text-xs text-[#9C9C9C]">
                      <Mail size={10} strokeWidth={1.5} />{client.email}
                    </span>
                    {client.phone && (
                      <span className="flex items-center gap-1 font-lora text-xs text-[#9C9C9C]">
                        <Phone size={10} strokeWidth={1.5} />{client.phone}
                      </span>
                    )}
                  </div>
                </div>
                <span className="font-inter text-xs text-[#9C9C9C]">
                  {new Date(client.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Create Client Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Novo Cliente">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Nome completo" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Nome do cliente" required />
          <Input label="E-mail" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com" required />
          <Input label="Telefone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+55 (11) 99999-9999" />
          <Input label="Senha inicial" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Mínimo 8 caracteres" required helperText="O cliente poderá alterar depois" />
          {error && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3"><p className="font-inter text-sm text-[#C17B6E]">{error}</p></div>}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">Cancelar</Button>
            <Button type="submit" loading={creating} className="flex-1">Criar Cliente</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
