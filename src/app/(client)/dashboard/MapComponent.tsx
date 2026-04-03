'use client';
import React, { useEffect, useRef } from 'react';

interface MapComponentProps {
  destination: string;
  latitude?: number;
  longitude?: number;
}

export default function MapComponent({ destination, latitude = 0, longitude = 0 }: MapComponentProps) {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: any = null;

    const initMap = async () => {
      if (!containerRef.current) return;

      // Dynamically inject leaflet CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      const L = (await import('leaflet')).default;

      // Fix default marker icon
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const lat = latitude || 0;
      const lng = longitude || 0;

      map = L.map(containerRef.current).setView([lat, lng], lat === 0 ? 2 : 6);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      if (lat !== 0 || lng !== 0) {
        L.marker([lat, lng])
          .addTo(map)
          .bindPopup(`<strong>${destination}</strong>`)
          .openPopup();
      }
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [destination, latitude, longitude]);

  return <div ref={containerRef} className="w-full h-full" />;
}
