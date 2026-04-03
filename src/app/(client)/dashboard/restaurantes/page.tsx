'use client';
import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { UtensilsCrossed, Star, MapPin, ExternalLink, Filter } from 'lucide-react';

type Restaurant = {
  id: string;
  name: string;
  cuisine: string | null;
  city: string | null;
  address: string | null;
  price_range: number | null;
  rating: number | null;
  description: string | null;
  recommendation_reason: string | null;
  booking_url: string | null;
  maps_url: string | null;
  image_url: string | null;
  tags: string[] | null;
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={12}
          className={s <= rating ? 'text-[#D4A853] fill-[#D4A853]' : 'text-[#E5DDD5]'}
        />
      ))}
    </div>
  );
}

function PriceRange({ range }: { range: number }) {
  return (
    <span className="font-inter text-xs text-[#8B7355]">
      {'$'.repeat(range)}
      <span className="text-[#E5DDD5]">{'$'.repeat(4 - range)}</span>
    </span>
  );
}

export default function RestaurantesPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCuisine, setFilterCuisine] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const supabase = createClient();

  useEffect(() => { fetchRestaurants(); }, []);

  const fetchRestaurants = async () => {
    const tripId = localStorage.getItem('attica_current_trip');
    if (!tripId) { setLoading(false); return; }
    const { data } = await supabase
      .from('restaurants')
      .select('*')
      .eq('trip_id', tripId)
      .order('rating', { ascending: false });
    setRestaurants(data || []);
    setLoading(false);
  };

  const cuisines = [...new Set(restaurants.map((r) => r.cuisine).filter(Boolean))];
  const cities = [...new Set(restaurants.map((r) => r.city).filter(Boolean))];

  const filtered = restaurants.filter((r) => {
    if (filterCuisine && r.cuisine !== filterCuisine) return false;
    if (filterCity && r.city !== filterCity) return false;
    return true;
  });

  if (loading) return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => <div key={i} className="h-48 bg-[#E5DDD5] rounded-xl skeleton" />)}
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="font-cormorant text-3xl font-semibold text-[#2D2D2D]">Restaurantes</h1>
        <p className="font-lora text-sm text-[#9C9C9C]">Indicações gastronômicas selecionadas</p>
      </div>

      {/* Filters */}
      {(cuisines.length > 0 || cities.length > 0) && (
        <div className="flex flex-wrap gap-3 items-center">
          <Filter size={14} strokeWidth={1.5} className="text-[#C4A97D]" />
          {cuisines.length > 0 && (
            <select
              value={filterCuisine}
              onChange={(e) => setFilterCuisine(e.target.value)}
              className="text-sm font-inter border border-[#E5DDD5] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#C4A97D] bg-white"
            >
              <option value="">Todas as culinárias</option>
              {cuisines.map((c) => <option key={c as string} value={c as string}>{c}</option>)}
            </select>
          )}
          {cities.length > 0 && (
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="text-sm font-inter border border-[#E5DDD5] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#C4A97D] bg-white"
            >
              <option value="">Todas as cidades</option>
              {cities.map((c) => <option key={c as string} value={c as string}>{c}</option>)}
            </select>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <UtensilsCrossed size={48} strokeWidth={1} className="text-[#C4A97D] mx-auto mb-4" />
          <p className="font-cormorant text-xl text-[#9C9C9C]">Nenhum restaurante indicado ainda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((r) => (
            <Card key={r.id} padding="none" className="overflow-hidden hover:shadow-md transition-shadow">
              {r.image_url && (
                <img src={r.image_url} alt={r.name} className="w-full h-44 object-cover" />
              )}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-cormorant text-xl font-semibold text-[#2D2D2D]">{r.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {r.cuisine && <span className="font-inter text-xs text-[#8B7355]">{r.cuisine}</span>}
                      {r.city && (
                        <span className="flex items-center gap-0.5 font-inter text-xs text-[#9C9C9C]">
                          <MapPin size={10} strokeWidth={1.5} />{r.city}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {r.rating && <StarRating rating={r.rating} />}
                    {r.price_range && <div className="mt-0.5"><PriceRange range={r.price_range} /></div>}
                  </div>
                </div>

                {r.description && (
                  <p className="font-lora text-sm text-[#4A4A4A] mt-3 leading-relaxed">{r.description}</p>
                )}
                {r.recommendation_reason && (
                  <div className="mt-3 bg-[#FAF6F3] rounded-lg p-3">
                    <p className="font-inter text-xs font-semibold text-[#C4A97D] mb-1">Por que ir?</p>
                    <p className="font-lora text-xs text-[#4A4A4A]">{r.recommendation_reason}</p>
                  </div>
                )}

                {r.tags && r.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {r.tags.map((tag) => (
                      <span key={tag} className="font-inter text-xs bg-[#F5EDE8] text-[#8B7355] px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  {r.maps_url && (
                    <a href={r.maps_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 font-inter text-xs text-[#8B7355] bg-[#FAF6F3] border border-[#E5DDD5] px-3 py-1.5 rounded-lg hover:bg-[#F5EDE8] transition-colors">
                      <MapPin size={11} strokeWidth={1.5} />Ver no mapa
                    </a>
                  )}
                  {r.booking_url && (
                    <a href={r.booking_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 font-inter text-xs text-white bg-[#C4A97D] px-3 py-1.5 rounded-lg hover:bg-[#8B7355] transition-colors">
                      <ExternalLink size={11} strokeWidth={1.5} />Reservar
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
