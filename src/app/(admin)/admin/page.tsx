import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { Users, MapPin, CheckSquare, TrendingUp, Plus } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: clientCount },
    { count: tripCount },
    { count: activeTrips },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client'),
    supabase.from('trips').select('*', { count: 'exact', head: true }),
    supabase.from('trips').select('*', { count: 'exact', head: true }).in('status', ['planning', 'confirmed', 'ongoing']),
  ]);

  const { data: recentTrips } = await supabase
    .from('trips')
    .select('id, title, destination, status, created_at, profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(5);

  const statusLabel: Record<string, string> = {
    planning: 'Planejamento',
    confirmed: 'Confirmada',
    ongoing: 'Em andamento',
    completed: 'Concluída',
    cancelled: 'Cancelada',
  };

  const statusColors: Record<string, string> = {
    planning: 'bg-amber-50 text-amber-700',
    confirmed: 'bg-green-50 text-green-700',
    ongoing: 'bg-blue-50 text-blue-700',
    completed: 'bg-gray-50 text-gray-600',
    cancelled: 'bg-red-50 text-red-700',
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-cormorant text-3xl font-semibold text-[#2D2D2D]">Painel Admin</h1>
          <p className="font-lora text-sm text-[#9C9C9C]">Gerencie clientes e viagens</p>
        </div>
        <Link
          href="/admin/viagens/nova"
          className="flex items-center gap-2 bg-[#C4A97D] text-white px-4 py-2.5 rounded-lg font-inter text-sm hover:bg-[#8B7355] transition-colors"
        >
          <Plus size={14} strokeWidth={1.5} />
          Nova Viagem
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total de Clientes', value: clientCount || 0, icon: Users, href: '/admin/clientes' },
          { label: 'Total de Viagens', value: tripCount || 0, icon: MapPin, href: '/admin/viagens' },
          { label: 'Viagens Ativas', value: activeTrips || 0, icon: TrendingUp, href: '/admin/viagens' },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer flex items-center gap-4">
              <div className="bg-[#F5EDE8] p-3 rounded-xl">
                <stat.icon size={20} strokeWidth={1.5} className="text-[#C4A97D]" />
              </div>
              <div>
                <p className="font-inter text-xs text-[#9C9C9C]">{stat.label}</p>
                <p className="font-cormorant text-3xl font-semibold text-[#2D2D2D]">{stat.value}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Trips */}
      <Card padding="none">
        <div className="p-4 border-b border-[#E5DDD5] flex items-center justify-between">
          <h3 className="font-cormorant text-lg font-semibold text-[#2D2D2D]">Viagens Recentes</h3>
          <Link href="/admin/viagens" className="font-inter text-xs text-[#C4A97D] hover:text-[#8B7355]">Ver todas</Link>
        </div>
        {!recentTrips || recentTrips.length === 0 ? (
          <div className="text-center py-8">
            <MapPin size={32} strokeWidth={1} className="text-[#C4A97D] mx-auto mb-2" />
            <p className="font-lora text-[#9C9C9C] text-sm">Nenhuma viagem criada ainda</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E5DDD5]">
            {recentTrips.map((trip: any) => (
              <div key={trip.id} className="flex items-center gap-4 p-4 hover:bg-[#FAF6F3] transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-inter text-sm font-semibold text-[#2D2D2D] truncate">{trip.title}</p>
                  <p className="font-lora text-xs text-[#9C9C9C]">
                    {trip.destination} · {(trip as any).profiles?.full_name || 'Cliente'}
                  </p>
                </div>
                <span className={`font-inter text-xs px-2.5 py-1 rounded-full ${statusColors[trip.status]}`}>
                  {statusLabel[trip.status]}
                </span>
                <Link
                  href={`/admin/viagens/${trip.id}`}
                  className="font-inter text-xs text-[#C4A97D] hover:text-[#8B7355] border border-[#E5DDD5] px-3 py-1.5 rounded-lg hover:border-[#C4A97D] transition-colors"
                >
                  Editar
                </Link>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
