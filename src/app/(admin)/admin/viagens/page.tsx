import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MapPin, Plus, Edit } from 'lucide-react';

export default async function ViagensPage() {
  const supabase = await createClient();

  const { data: trips } = await supabase
    .from('trips')
    .select('*, profiles(full_name, email)')
    .order('created_at', { ascending: false });

  const statusBadge: Record<string, 'warning' | 'success' | 'blue' | 'default' | 'error'> = {
    planning: 'warning',
    confirmed: 'success',
    ongoing: 'blue',
    completed: 'default',
    cancelled: 'error',
  };

  const statusLabel: Record<string, string> = {
    planning: 'Planejamento',
    confirmed: 'Confirmada',
    ongoing: 'Em andamento',
    completed: 'Concluída',
    cancelled: 'Cancelada',
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-cormorant text-3xl font-semibold text-[#2D2D2D]">Viagens</h1>
          <p className="font-lora text-sm text-[#9C9C9C]">{trips?.length || 0} viagens no sistema</p>
        </div>
        <Link
          href="/admin/viagens/nova"
          className="flex items-center gap-2 bg-[#C4A97D] text-white px-4 py-2.5 rounded-lg font-inter text-sm hover:bg-[#8B7355] transition-colors"
        >
          <Plus size={14} strokeWidth={1.5} />
          Nova Viagem
        </Link>
      </div>

      <Card padding="none">
        {!trips || trips.length === 0 ? (
          <div className="text-center py-12">
            <MapPin size={40} strokeWidth={1} className="text-[#C4A97D] mx-auto mb-3" />
            <p className="font-lora text-[#9C9C9C]">Nenhuma viagem criada</p>
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full">
              <thead className="bg-[#FAF6F3] border-b border-[#E5DDD5]">
                <tr>
                  {['Título', 'Cliente', 'Destino', 'Datas', 'Status', 'Ações'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-inter text-xs font-semibold text-[#9C9C9C] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DDD5]">
                {trips.map((trip: any) => (
                  <tr key={trip.id} className="hover:bg-[#FAF6F3] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-inter text-sm font-semibold text-[#2D2D2D]">{trip.title}</p>
                    </td>
                    <td className="px-4 py-3 font-lora text-sm text-[#4A4A4A]">
                      {trip.profiles?.full_name || trip.profiles?.email || '–'}
                    </td>
                    <td className="px-4 py-3 font-lora text-sm text-[#4A4A4A]">{trip.destination}</td>
                    <td className="px-4 py-3 font-inter text-xs text-[#9C9C9C]">
                      {trip.start_date ? new Date(trip.start_date + 'T00:00:00').toLocaleDateString('pt-BR') : '–'}
                      {' → '}
                      {trip.end_date ? new Date(trip.end_date + 'T00:00:00').toLocaleDateString('pt-BR') : '–'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusBadge[trip.status]}>{statusLabel[trip.status]}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/viagens/${trip.id}`}
                        className="flex items-center gap-1.5 font-inter text-xs text-[#8B7355] bg-[#FAF6F3] border border-[#E5DDD5] px-3 py-1.5 rounded-lg hover:bg-[#F5EDE8] hover:border-[#C4A97D] transition-colors"
                      >
                        <Edit size={11} strokeWidth={1.5} />
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
