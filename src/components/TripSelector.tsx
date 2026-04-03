'use client';
import React from 'react';
import { ChevronDown, MapPin } from 'lucide-react';

interface Trip {
  id: string;
  title: string;
  destination: string;
  status: string;
}

interface TripSelectorProps {
  trips: Trip[];
  currentTripId: string;
  onSelect: (tripId: string) => void;
}

export function TripSelector({ trips, currentTripId, onSelect }: TripSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const currentTrip = trips.find((t) => t.id === currentTripId) || trips[0];

  if (trips.length <= 1) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-white border border-[#E5DDD5] rounded-lg px-4 py-2.5 text-sm font-inter text-[#4A4A4A] hover:border-[#C4A97D] transition-colors"
      >
        <MapPin size={14} strokeWidth={1.5} className="text-[#C4A97D]" />
        <span className="font-medium">{currentTrip?.title || 'Selecionar viagem'}</span>
        <ChevronDown size={14} strokeWidth={1.5} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 bg-white rounded-xl shadow-lg border border-[#E5DDD5] min-w-[220px] z-50 py-1">
          {trips.map((trip) => (
            <button
              key={trip.id}
              onClick={() => { onSelect(trip.id); setOpen(false); }}
              className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-[#FAF6F3] transition-colors ${
                trip.id === currentTripId ? 'bg-[#F5EDE8]' : ''
              }`}
            >
              <MapPin size={14} strokeWidth={1.5} className="text-[#C4A97D] mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-inter text-sm font-medium text-[#2D2D2D]">{trip.title}</p>
                <p className="font-lora text-xs text-[#9C9C9C]">{trip.destination}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
