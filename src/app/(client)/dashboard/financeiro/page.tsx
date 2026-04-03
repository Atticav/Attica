'use client';
import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DollarSign, TrendingUp, ExternalLink } from 'lucide-react';

type FinancialItem = {
  id: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  amount_brl: number | null;
  payment_date: string | null;
  due_date: string | null;
  status: 'paid' | 'pending' | 'overdue';
  payment_method: string | null;
  notes: string | null;
};

const COLORS = ['#C4A97D', '#8B7355', '#6B5B45', '#7B9E6B', '#D4A853', '#C17B6E', '#9C9C9C', '#4A4A4A'];

export default function FinanceiroPage() {
  const [items, setItems] = useState<FinancialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [budgetLink, setBudgetLink] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const tripId = localStorage.getItem('attica_current_trip');
    if (!tripId) { setLoading(false); return; }

    const [{ data: finData }, { data: tripData }] = await Promise.all([
      supabase.from('financial_items').select('*').eq('trip_id', tripId).order('category'),
      supabase.from('trips').select('budget_link').eq('id', tripId).single(),
    ]);

    setItems(finData || []);
    setBudgetLink(tripData?.budget_link || null);
    setLoading(false);
  };

  const total = items.reduce((sum, i) => sum + (i.amount_brl || i.amount), 0);
  const paid = items.filter((i) => i.status === 'paid').reduce((sum, i) => sum + (i.amount_brl || i.amount), 0);
  const pending = items.filter((i) => i.status === 'pending' || i.status === 'overdue').reduce((sum, i) => sum + (i.amount_brl || i.amount), 0);

  const byCategory = Object.entries(
    items.reduce((acc, i) => {
      const cat = i.category || 'Outros';
      acc[cat] = (acc[cat] || 0) + (i.amount_brl || i.amount);
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const fmt = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (loading) return (
    <div className="p-6 space-y-4">
      {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-[#E5DDD5] rounded-xl skeleton" />)}
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-cormorant text-3xl font-semibold text-[#2D2D2D]">Financeiro</h1>
          <p className="font-lora text-sm text-[#9C9C9C]">Resumo de gastos e pagamentos</p>
        </div>
        {budgetLink && (
          <a href={budgetLink} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#C4A97D] text-white px-4 py-2 rounded-lg font-inter text-sm hover:bg-[#8B7355] transition-colors">
            <ExternalLink size={14} strokeWidth={1.5} />
            Ver planilha completa
          </a>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Geral', value: fmt(total), icon: DollarSign, color: 'text-[#2D2D2D]' },
          { label: 'Pago', value: fmt(paid), icon: TrendingUp, color: 'text-[#7B9E6B]' },
          { label: 'Pendente', value: fmt(pending), icon: DollarSign, color: 'text-[#D4A853]' },
        ].map((s) => (
          <Card key={s.label} className="flex items-center gap-4">
            <div className="bg-[#FAF6F3] p-3 rounded-xl">
              <s.icon size={20} strokeWidth={1.5} className="text-[#C4A97D]" />
            </div>
            <div>
              <p className="font-inter text-xs text-[#9C9C9C]">{s.label}</p>
              <p className={`font-cormorant text-2xl font-semibold ${s.color}`}>{s.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      {byCategory.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <h3 className="font-cormorant text-lg font-semibold text-[#2D2D2D] mb-4">Por Categoria</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={byCategory} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                  {byCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => fmt(Number(value))} />
                <Legend formatter={(value) => <span className="font-inter text-xs">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h3 className="font-cormorant text-lg font-semibold text-[#2D2D2D] mb-4">Valores por Categoria</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byCategory} margin={{ left: -20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: 'Inter' }} />
                <YAxis tick={{ fontSize: 10, fontFamily: 'Inter' }} />
                <Tooltip formatter={(value: any) => fmt(Number(value))} />
                <Bar dataKey="value" fill="#C4A97D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* Table */}
      <Card padding="none" className="overflow-auto">
        <div className="p-4 border-b border-[#E5DDD5]">
          <h3 className="font-cormorant text-lg font-semibold text-[#2D2D2D]">Detalhamento</h3>
        </div>
        {items.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign size={40} strokeWidth={1} className="text-[#C4A97D] mx-auto mb-3" />
            <p className="font-lora text-[#9C9C9C]">Nenhum item financeiro registrado</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#FAF6F3] border-b border-[#E5DDD5]">
              <tr>
                {['Categoria', 'Descrição', 'Valor', 'Moeda', 'Método', 'Vencimento', 'Status'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-inter text-xs font-semibold text-[#9C9C9C] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DDD5]">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-[#FAF6F3] transition-colors">
                  <td className="px-4 py-3 font-inter text-xs text-[#8B7355] font-medium">{item.category}</td>
                  <td className="px-4 py-3 font-lora text-sm text-[#2D2D2D]">{item.description}</td>
                  <td className="px-4 py-3 font-inter text-sm font-semibold text-[#2D2D2D]">
                    {item.amount_brl ? fmt(item.amount_brl) : item.amount.toLocaleString('pt-BR', { style: 'currency', currency: item.currency })}
                  </td>
                  <td className="px-4 py-3 font-inter text-xs text-[#9C9C9C]">{item.currency}</td>
                  <td className="px-4 py-3 font-inter text-xs text-[#9C9C9C]">{item.payment_method || '–'}</td>
                  <td className="px-4 py-3 font-inter text-xs text-[#9C9C9C]">
                    {item.due_date ? new Date(item.due_date + 'T00:00:00').toLocaleDateString('pt-BR') : '–'}
                  </td>
                  <td className="px-4 py-3">
                    {item.status === 'paid' && <Badge variant="success">Pago</Badge>}
                    {item.status === 'pending' && <Badge variant="warning">Pendente</Badge>}
                    {item.status === 'overdue' && <Badge variant="error">Vencido</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
