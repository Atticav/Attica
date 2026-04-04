import { createClient } from '@/lib/supabase/server'
import Card from '@/components/ui/Card'
import { Users, Plane, TrendingUp, Clock } from 'lucide-react'

export default async function AdminPage() {
  const supabase = await createClient()

  const [{ count: clientsCount }, { count: tripsCount }] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client'),
    supabase.from('trips').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    {
      icon: Users,
      label: 'Clientes',
      value: clientsCount ?? 0,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      icon: Plane,
      label: 'Viagens',
      value: tripsCount ?? 0,
      color: 'text-brand-gold',
      bg: 'bg-brand-bg-secondary',
    },
    {
      icon: TrendingUp,
      label: 'Em andamento',
      value: '—',
      color: 'text-brand-success',
      bg: 'bg-green-50',
    },
    {
      icon: Clock,
      label: 'Planejamento',
      value: '—',
      color: 'text-brand-warning',
      bg: 'bg-amber-50',
    },
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-cormorant text-4xl font-semibold text-brand-title">
          Painel Administrativo
        </h1>
        <p className="font-outfit text-brand-muted mt-1">
          Attica Studio de Viagens
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ icon: Icon, label, value, color, bg }) => (
          <Card key={label} padding="md">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={20} strokeWidth={1.5} className={color} />
              </div>
              <div>
                <p className="font-inter text-2xl font-semibold text-brand-title leading-none">
                  {value}
                </p>
                <p className="font-inter text-xs text-brand-muted mt-0.5">{label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Ações rápidas */}
      <div>
        <h2 className="font-cormorant text-2xl font-semibold text-brand-title mb-4">
          Ações rápidas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card
            padding="md"
            className="hover:shadow-card hover:border-brand-gold/30 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-bg-secondary rounded-lg flex items-center justify-center">
                <Users size={24} strokeWidth={1.5} className="text-brand-gold" />
              </div>
              <div>
                <h3 className="font-inter text-sm font-semibold text-brand-title">Gerenciar Clientes</h3>
                <p className="font-outfit text-xs text-brand-muted mt-0.5">Ver e editar perfis de clientes</p>
              </div>
            </div>
          </Card>
          <Card
            padding="md"
            className="hover:shadow-card hover:border-brand-gold/30 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-bg-secondary rounded-lg flex items-center justify-center">
                <Plane size={24} strokeWidth={1.5} className="text-brand-gold" />
              </div>
              <div>
                <h3 className="font-inter text-sm font-semibold text-brand-title">Gerenciar Viagens</h3>
                <p className="font-outfit text-xs text-brand-muted mt-0.5">Criar e editar itinerários</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
