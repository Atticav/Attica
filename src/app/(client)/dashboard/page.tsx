'use client';
import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  Calendar, DollarSign, FileText, ShoppingBag, CheckSquare,
  Compass, Play, Image, UtensilsCrossed, Camera, BookOpen,
  Languages, FileSignature, MapPin, Zap, Globe, Clock,
  Thermometer, Plane, Sun
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { TripSelector } from '@/components/TripSelector';
import { Badge } from '@/components/ui/Badge';

const MapComponent = dynamic(() => import('./MapComponent'), { ssr: false });

const quickLinks = [
  { href: '/dashboard/itinerario', icon: Calendar, label: 'Itinerário', color: 'bg-blue-50 text-blue-600', desc: 'Sua programação completa' },
  { href: '/dashboard/financeiro', icon: DollarSign, label: 'Financeiro', color: 'bg-green-50 text-green-600', desc: 'Custos e pagamentos' },
  { href: '/dashboard/documentos', icon: FileText, label: 'Documentos', color: 'bg-amber-50 text-amber-600', desc: 'Seus documentos' },
  { href: '/dashboard/mala', icon: ShoppingBag, label: 'Mala', color: 'bg-purple-50 text-purple-600', desc: 'Lista de bagagem' },
  { href: '/dashboard/checklist', icon: CheckSquare, label: 'Checklist', color: 'bg-teal-50 text-teal-600', desc: 'Tarefas pré-viagem' },
  { href: '/dashboard/central-estrategica', icon: Compass, label: 'Central', color: 'bg-orange-50 text-orange-600', desc: 'Informações práticas' },
  { href: '/dashboard/guia', icon: Play, label: 'Guia em Vídeo', color: 'bg-red-50 text-red-600', desc: 'Vídeos preparatórios' },
  { href: '/dashboard/galeria', icon: Image, label: 'Galeria', color: 'bg-pink-50 text-pink-600', desc: 'Fotos do destino' },
  { href: '/dashboard/restaurantes', icon: UtensilsCrossed, label: 'Restaurantes', color: 'bg-yellow-50 text-yellow-600', desc: 'Indicações gastronômicas' },
  { href: '/dashboard/dicas-fotografia', icon: Camera, label: 'Fotografia', color: 'bg-indigo-50 text-indigo-600', desc: 'Dicas para suas fotos' },
  { href: '/dashboard/cultura', icon: BookOpen, label: 'Cultura', color: 'bg-lime-50 text-lime-600', desc: 'Costumes locais' },
  { href: '/dashboard/palavras', icon: Languages, label: 'Vocabulário', color: 'bg-cyan-50 text-cyan-600', desc: 'Palavras essenciais' },
  { href: '/dashboard/contrato', icon: FileSignature, label: 'Contrato', color: 'bg-[#F5EDE8] text-[#8B7355]', desc: 'Seu contrato de serviço' },
];

function SkeletonDashboard() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-10 bg-[#E5DDD5] rounded-lg w-64 skeleton" />
      <div className="h-48 bg-[#E5DDD5] rounded-2xl skeleton" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => <div key={i} className="h-20 bg-[#E5DDD5] rounded-xl skeleton" />)}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [currentTripId, setCurrentTripId] = useState<string>('');
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const savedTrip = localStorage.getItem('attica_current_trip');
    fetchTrips(savedTrip);
  }, []);

  const fetchTrips = async (savedTripId?: string | null) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('trips')
      .select('*')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false });

    if (data && data.length > 0) {
      setTrips(data);
      const targetId = savedTripId && data.find((t: any) => t.id === savedTripId)
        ? savedTripId
        : data[0].id;
      setCurrentTripId(targetId);
      setTrip(data.find((t: any) => t.id === targetId) || data[0]);
    }
    setLoading(false);
  };

  const handleTripSelect = (id: string) => {
    setCurrentTripId(id);
    const t = trips.find((t) => t.id === id);
    setTrip(t);
    localStorage.setItem('attica_current_trip', id);
  };

  const getDuration = () => {
    if (!trip?.start_date || !trip?.end_date) return '–';
    const start = new Date(trip.start_date);
    const end = new Date(trip.end_date);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return `${days} dias`;
  };

  const formatDate = (d: string | null) => {
    if (!d) return '–';
    return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const statusLabel: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'blue' | 'error' }> = {
    planning: { label: 'Planejamento', variant: 'warning' },
    confirmed: { label: 'Confirmada', variant: 'success' },
    ongoing: { label: 'Em andamento', variant: 'blue' },
    completed: { label: 'Concluída', variant: 'default' },
    cancelled: { label: 'Cancelada', variant: 'error' },
  };

  if (loading) return <SkeletonDashboard />;

  if (!trip) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <MapPin size={48} strokeWidth={1} className="text-[#C4A97D] mx-auto mb-4" />
          <h2 className="font-cormorant text-2xl text-[#2D2D2D] mb-2">Nenhuma viagem encontrada</h2>
          <p className="font-lora text-sm text-[#9C9C9C]">Aguarde seu consultor criar sua viagem personalizada.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-cormorant text-3xl md:text-4xl font-semibold text-[#2D2D2D]">
            Meu Painel
          </h1>
          <p className="font-lora text-sm text-[#9C9C9C] mt-0.5">Sua viagem personalizada Attica</p>
        </div>
        <TripSelector trips={trips} currentTripId={currentTripId} onSelect={handleTripSelect} />
      </div>

      {/* Hero Card */}
      <Card className="overflow-hidden" padding="none">
        <div className="relative bg-gradient-to-br from-[#6B5B45] to-[#C4A97D] p-8 text-white">
          <div className="absolute top-4 right-4">
            {statusLabel[trip.status] && (
              <span className={`text-xs font-inter px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white`}>
                {statusLabel[trip.status].label}
              </span>
            )}
          </div>
          <p className="font-cinzel text-xs uppercase tracking-widest text-white/70 mb-2">Destino</p>
          <h2 className="font-cormorant text-4xl md:text-5xl font-bold mb-2">{trip.destination}</h2>
          <p className="font-lora text-white/80 text-lg italic">{trip.title}</p>

          <div className="flex flex-wrap gap-6 mt-6">
            <div className="flex items-center gap-2">
              <Plane size={16} strokeWidth={1.5} className="text-white/70" />
              <span className="font-inter text-sm text-white/90">
                {formatDate(trip.start_date)} → {formatDate(trip.end_date)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} strokeWidth={1.5} className="text-white/70" />
              <span className="font-inter text-sm text-white/90">{getDuration()}</span>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-y divide-[#E5DDD5]">
          {[
            { icon: Globe, label: 'Destino', value: trip.destination },
            { icon: Zap, label: 'Voltagem', value: '–' },
            { icon: Languages, label: 'Idioma', value: '–' },
            { icon: DollarSign, label: 'Moeda', value: '–' },
            { icon: Sun, label: 'Melhor Época', value: '–' },
            { icon: Clock, label: 'Fuso Horário', value: '–' },
            { icon: Compass, label: 'Estilo', value: trip.style || '–' },
            { icon: Thermometer, label: 'Duração', value: getDuration() },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 p-4">
              <item.icon size={16} strokeWidth={1.5} className="text-[#C4A97D] flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-inter text-xs text-[#9C9C9C]">{item.label}</p>
                <p className="font-lora text-sm text-[#2D2D2D] font-medium truncate">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Map */}
      <Card padding="none" className="overflow-hidden">
        <div className="p-4 border-b border-[#E5DDD5] flex items-center gap-2">
          <MapPin size={16} strokeWidth={1.5} className="text-[#C4A97D]" />
          <h3 className="font-cormorant text-lg font-semibold text-[#2D2D2D]">Localização</h3>
        </div>
        <div className="h-64 md:h-80">
          <MapComponent destination={trip.destination} />
        </div>
      </Card>

      {/* Weather & Currency Row */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card padding="none" className="overflow-hidden">
          <div className="p-4 border-b border-[#E5DDD5] flex items-center gap-2">
            <Thermometer size={16} strokeWidth={1.5} className="text-[#C4A97D]" />
            <h3 className="font-cormorant text-lg font-semibold text-[#2D2D2D]">Clima</h3>
          </div>
          <div className="h-48 overflow-hidden">
            <iframe
              src={`https://forecast7.com/en/pt/${encodeURIComponent(trip.destination)}/`}
              frameBorder="0"
              className="w-full h-full"
              title="Previsão do tempo"
            />
          </div>
        </Card>

        <Card padding="none" className="overflow-hidden">
          <div className="p-4 border-b border-[#E5DDD5] flex items-center gap-2">
            <DollarSign size={16} strokeWidth={1.5} className="text-[#C4A97D]" />
            <h3 className="font-cormorant text-lg font-semibold text-[#2D2D2D]">Conversor de Moedas</h3>
          </div>
          <div className="h-48 overflow-hidden">
            <iframe
              src="https://wise.com/widget/currency-converter"
              frameBorder="0"
              className="w-full h-full"
              title="Conversor de moedas"
            />
          </div>
        </Card>
      </div>

      {/* Quick Links Grid */}
      <div>
        <h3 className="font-cormorant text-2xl font-semibold text-[#2D2D2D] mb-4">Acesso Rápido</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group bg-white rounded-xl border border-[#E5DDD5] p-4 hover:shadow-md hover:border-[#C4A97D] transition-all duration-200"
            >
              <div className={`inline-flex p-2 rounded-lg mb-3 ${link.color}`}>
                <link.icon size={18} strokeWidth={1.5} />
              </div>
              <p className="font-inter text-sm font-semibold text-[#2D2D2D] group-hover:text-[#8B7355] transition-colors">
                {link.label}
              </p>
              <p className="font-lora text-xs text-[#9C9C9C] mt-0.5 leading-tight">{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
