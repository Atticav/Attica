import { createClient } from '@/lib/supabase/server'
import Card from '@/components/ui/Card'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
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
  ChevronDown,
  Languages,
  Coins,
  Zap,
  Clock,
  Sun,
  Plane as PlaneIcon,
} from 'lucide-react'
import { getDestinationInfo } from '@/lib/destination-data'

const sections = [
  { icon: Map, label: 'Roteiro', desc: 'Dia a dia da sua viagem', slug: 'itinerary' },
  { icon: DollarSign, label: 'Financeiro', desc: 'Controle de gastos e pagamentos', slug: 'financial' },
  { icon: FileText, label: 'Documentos', desc: 'Passaportes, vistos e mais', slug: 'documents' },
  { icon: Luggage, label: 'Mala Inteligente', desc: 'Lista de itens para empacotar', slug: 'packing' },
  { icon: CheckSquare, label: 'Checklist', desc: 'Tarefas antes da viagem', slug: 'checklist' },
  { icon: Compass, label: 'Central Estratégica', desc: 'Links e informações essenciais', slug: 'strategic' },
  { icon: PlayCircle, label: 'Guia Attica', desc: 'Vídeos e tutoriais exclusivos', slug: 'guide' },
  { icon: ImageIcon, label: 'Galeria', desc: 'Fotos e vídeos do destino', slug: 'gallery' },
  { icon: UtensilsCrossed, label: 'Restaurantes', desc: 'Indicações gastronômicas', slug: 'restaurants' },
  { icon: Camera, label: 'Fotografia', desc: 'Dicas para fotos incríveis', slug: 'photography' },
  { icon: Globe, label: 'Cultura', desc: 'Costumes e informações locais', slug: 'culture' },
  { icon: BookOpen, label: 'Vocabulário', desc: 'Palavras e frases essenciais', slug: 'vocabulary' },
  { icon: ScrollText, label: 'Contrato', desc: 'Documentos e acordos', slug: 'contract' },
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

  const activeTrip = trips?.[0] ?? null
  const destinationInfo = activeTrip
    ? getDestinationInfo(activeTrip.destination, activeTrip.country)
    : null
  const daysUntilTrip = activeTrip?.start_date
    ? Math.ceil((new Date(activeTrip.start_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <Image
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80"
          alt="Mountain landscape"
          fill
          className="object-cover"
          priority
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/65 z-10" />

        {/* Bottom fade to brand-bg */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#FAF6F3] to-transparent z-20" />

        {/* Content */}
        <div className="relative z-30 text-center flex flex-col items-center justify-center px-4">
          <p className="font-cinzel text-white/90 text-sm tracking-[0.35em] uppercase mb-1">
            ATTICA
          </p>
          <p className="font-cormorant italic text-white/70 text-sm tracking-wider mb-12">
            Studio de Viagens
          </p>

          <h1 className="font-cinzel text-white text-4xl md:text-5xl lg:text-6xl font-semibold tracking-wide mb-4">
            BEM VINDO(A)
          </h1>
          <p className="font-outfit italic text-white/50 text-sm max-w-md leading-relaxed mb-16">
            Planejamento exclusivo para uma experiência leve, organizada e memorável.
          </p>

          {/* Animated scroll arrow */}
          <a
            href="#dashboard-content"
            className="animate-bounce-slow text-white/60 hover:text-white transition-colors"
            aria-label="Scroll to content"
          >
            <ChevronDown size={32} strokeWidth={1.5} />
          </a>
        </div>
      </section>

      {/* Dashboard Content */}
      <div id="dashboard-content" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 scroll-mt-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-cormorant text-4xl font-semibold text-brand-title">
            Olá, {firstName}
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
                <Link key={trip.id} href={`/dashboard/${trip.id}/itinerary`}>
                  <Card padding="md" className="hover:shadow-card hover:border-brand-gold/30 transition-all cursor-pointer">
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
                </Link>
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

        {/* Informações do Destino */}
        {activeTrip && destinationInfo && (
          <div className="mb-10">
            <h2 className="font-cormorant text-2xl font-semibold text-brand-title mb-4">
              Informações do destino
            </h2>

            {/* Countdown + Destination header */}
            <Card padding="md" className="mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-cormorant text-xl font-semibold text-brand-title">
                    {activeTrip.destination}
                  </h3>
                  {daysUntilTrip !== null && daysUntilTrip > 0 && (
                    <p className="font-outfit text-sm text-brand-muted mt-1">
                      Faltam <span className="text-brand-gold font-medium">{daysUntilTrip} dias</span> ✈
                    </p>
                  )}
                </div>
                {destinationInfo.travelStyle && (
                  <span className="font-inter text-xs bg-brand-bg-secondary text-brand-gold-dark px-3 py-1 rounded-full">
                    {destinationInfo.travelStyle}
                  </span>
                )}
              </div>
            </Card>

            {/* Info grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[
                { icon: Globe, label: 'Destino', value: destinationInfo.country },
                { icon: Languages, label: 'Idioma', value: destinationInfo.language },
                { icon: Coins, label: 'Moeda', value: destinationInfo.currency },
                { icon: Zap, label: 'Voltagem', value: destinationInfo.voltage },
                { icon: Clock, label: 'Fuso horário', value: destinationInfo.timezoneOffset },
                { icon: Sun, label: 'Melhor época', value: destinationInfo.bestSeason },
              ]
                .filter(item => item.value)
                .map(({ icon: InfoIcon, label, value }) => (
                  <Card key={label} padding="sm">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                        <InfoIcon size={16} strokeWidth={1.3} className="text-brand-gold" />
                      </div>
                      <div>
                        <p className="font-inter text-xs text-brand-muted">{label}</p>
                        <p className="font-outfit text-sm text-brand-title font-medium">{value}</p>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>

            {/* Trip dates if available */}
            {activeTrip.start_date && (
              <Card padding="sm" className="mt-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-bg-secondary flex items-center justify-center flex-shrink-0">
                    <PlaneIcon size={16} strokeWidth={1.3} className="text-brand-gold" />
                  </div>
                  <div>
                    <p className="font-inter text-xs text-brand-muted">Data</p>
                    <p className="font-outfit text-sm text-brand-title font-medium">
                      {new Date(activeTrip.start_date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      {activeTrip.end_date && (
                        <>
                          {' · '}
                          {Math.ceil((new Date(activeTrip.end_date).getTime() - new Date(activeTrip.start_date).getTime()) / (1000 * 60 * 60 * 24))} dias
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Grade de seções */}
        <div>
          <h2 className="font-cormorant text-2xl font-semibold text-brand-title mb-4">
            Seu caderno de viagem
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {sections.map(({ icon: Icon, label, desc, slug }) => {
              const href = activeTrip ? `/dashboard/${activeTrip.id}/${slug}` : null

              const cardContent = (
                <Card
                  padding="sm"
                  className={cn(
                    "flex flex-col items-center text-center transition-all",
                    href
                      ? "hover:shadow-card hover:border-brand-gold/30 cursor-pointer"
                      : "opacity-60 cursor-not-allowed"
                  )}
                >
                  <div className="w-12 h-12 rounded-full bg-brand-bg-secondary flex items-center justify-center mb-3 mt-1">
                    <Icon size={22} strokeWidth={1.3} className="text-brand-gold" />
                  </div>
                  <p className="font-inter text-sm font-medium text-brand-title">{label}</p>
                  <p className="font-outfit text-xs text-brand-muted mt-1 leading-tight">{desc}</p>
                </Card>
              )

              if (href) {
                return <Link key={label} href={href}>{cardContent}</Link>
              }
              return <div key={label}>{cardContent}</div>
            })}
          </div>
        </div>
      </div>
    </>
  )
}