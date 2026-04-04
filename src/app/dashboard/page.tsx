import { createClient } from '@/lib/supabase/server'
import Card from '@/components/ui/Card'
import {
  Map,
  DollarSign,
  FileText,
  Luggage,
  CheckSquare,
  Compass,
  PlayCircle,
  ImageIcon,
  UtensilsCrossed,
  Camera,
  Globe,
  BookOpen,
  ScrollText,
} from 'lucide-react'

const sections = [
  { icon: Map, label: 'Roteiro', desc: 'Dia a dia da sua viagem', color: 'text-sky-500', bg: 'bg-sky-50' },
  { icon: DollarSign, label: 'Financeiro', desc: 'Controle de gastos e pagamentos', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { icon: FileText, label: 'Documentos', desc: 'Passaportes, vistos e mais', color: 'text-amber-600', bg: 'bg-amber-50' },
  { icon: Luggage, label: 'Mala Inteligente', desc: 'Lista de itens para empacotar', color: 'text-violet-500', bg: 'bg-violet-50' },
  { icon: CheckSquare, label: 'Checklist', desc: 'Tarefas antes da viagem', color: 'text-green-600', bg: 'bg-green-50' },
  { icon: Compass, label: 'Central Estratégica', desc: 'Links e informações essenciais', color: 'text-brand-gold-dark', bg: 'bg-brand-bg-secondary' },
  { icon: PlayCircle, label: 'Guia Attica', desc: 'Vídeos e tutoriais exclusivos', color: 'text-rose-500', bg: 'bg-rose-50' },
  { icon: ImageIcon, label: 'Galeria', desc: 'Fotos e vídeos do destino', color: 'text-pink-500', bg: 'bg-pink-50' },
  { icon: UtensilsCrossed, label: 'Restaurantes', desc: 'Indicações gastronômicas', color: 'text-orange-500', bg: 'bg-orange-50' },
  { icon: Camera, label: 'Fotografia', desc: 'Dicas para fotos incríveis', color: 'text-teal-500', bg: 'bg-teal-50' },
  { icon: Globe, label: 'Cultura', desc: 'Costumes e informações locais', color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { icon: BookOpen, label: 'Vocabulário', desc: 'Palavras e frases essenciais', color: 'text-cyan-500', bg: 'bg-cyan-50' },
  { icon: ScrollText, label: 'Contrato', desc: 'Documentos e acordos', color: 'text-gray-500', bg: 'bg-gray-100' },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user!.id)
    .single()

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Viajante'

  const { data: trips } = await supabase
    .from('trips')
    .select('*')
    .eq('client_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-cormorant text-4xl font-semibold text-brand-title">
          Olá, {firstName} ✨
        </h1>
        <p className="font-outfit text-brand-muted mt-1">
          Bem-vindo(a) ao seu Caderno de Viagem
        </p>
      </div>

      {/* Viagens ativas */}
      {trips && trips.length > 0 ? (
        <div className="mb-10">
          <h2 className="font-cormorant text-2xl font-semibold text-brand-title mb-4">
            Suas viagens
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips.map((trip) => (
              <Card key={trip.id} padding="md" className="hover:shadow-card transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-cormorant text-xl font-semibold text-brand-title">
                    {trip.title}
                  </h3>
                </div>
                <p className="font-outfit text-sm text-brand-muted">{trip.destination}</p>
                {trip.start_date && (
                  <p className="font-inter text-xs text-brand-muted mt-2">
                    {new Date(trip.start_date).toLocaleDateString('pt-BR')}
                    {trip.end_date && ` — ${new Date(trip.end_date).toLocaleDateString('pt-BR')}`}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card padding="lg" className="mb-10 text-center">
          <div className="py-8">
            <div className="w-16 h-16 bg-brand-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Map className="text-brand-gold" size={32} strokeWidth={1.5} />
            </div>
            <h3 className="font-cormorant text-2xl font-semibold text-brand-title mb-2">
              Nenhuma viagem ainda
            </h3>
            <p className="font-outfit text-brand-muted text-sm">
              Em breve sua consultora Attica irá preparar seu caderno de viagem personalizado.
            </p>
          </div>
        </Card>
      )}

      {/* Grade de seções */}
      <div>
        <h2 className="font-cormorant text-2xl font-semibold text-brand-title mb-4">
          Seu caderno de viagem
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {sections.map(({ icon: Icon, label, desc, color, bg }) => (
            <Card
              key={label}
              padding="sm"
              className="flex flex-col items-center text-center hover:shadow-card hover:border-brand-gold/30 transition-all cursor-default"
            >
              <div className={`w-12 h-12 rounded-full ${bg} flex items-center justify-center mb-3 mt-1`}>
                <Icon size={24} strokeWidth={1.5} className={color} />
              </div>
              <p className="font-inter text-sm font-medium text-brand-title">{label}</p>
              <p className="font-outfit text-xs text-brand-muted mt-1 leading-tight">{desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
