import { createClient } from '@/lib/supabase/server'
import Card from '@/components/ui/Card'
import Link from 'next/link'
import { Users, Plane, TrendingUp, Clock, DollarSign, BarChart2 } from 'lucide-react'

export default async function AdminPage() {
  const supabase = await createClient()

  const [
    { count: clientsCount },
    { count: tripsCount },
    { count: inProgressCount },
    { count: planningCount },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client'),
    supabase.from('trips').select('*', { count: 'exact', head: true }),
    supabase.from('trips').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
    supabase.from('trips').select('*', { count: 'exact', head: true }).eq('status', 'planning'),
  ])

  // Try to get pending payments sum (may fail if table doesn't exist yet)
  let pendingAmount = 0
  try {
    const { data: pendingPayments } = await supabase
      .from('client_payments')
      .select('amount')
      .in('status', ['pending', 'overdue'])
    if (pendingPayments) {
      pendingAmount = pendingPayments.reduce((sum, p) => sum + Number(p.amount), 0)
    }
  } catch { /* table may not exist yet */ }

  const formatBRL = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)
  }

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
      value: inProgressCount ?? 0,
      color: 'text-brand-success',
      bg: 'bg-green-50',
    },
    {
      icon: Clock,
      label: 'Planejamento',
      value: planningCount ?? 0,
      color: 'text-brand-warning',
      bg: 'bg-amber-50',
    },
    {
      icon: DollarSign,
      label: 'A receber',
      value: formatBRL(pendingAmount),
      color: 'text-orange-500',
      bg: 'bg-orange-50',
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
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
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
          <Link href="/admin/clients">
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
          </Link>
          <Link href="/admin/trips">
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
          </Link>
          <Link href="/admin/operations">
            <Card
              padding="md"
              className="hover:shadow-card hover:border-brand-gold/30 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-bg-secondary rounded-lg flex items-center justify-center">
                  <BarChart2 size={24} strokeWidth={1.5} className="text-brand-gold" />
                </div>
                <div>
                  <h3 className="font-inter text-sm font-semibold text-brand-title">Controle Operacional</h3>
                  <p className="font-outfit text-xs text-brand-muted mt-0.5">Finanças, pagamentos e planner</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
