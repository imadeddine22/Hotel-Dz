'use client';

import { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { loadLeaflet, markerIcon } from '@/lib/leaflet';

/**
 * Read-only map showing a single marker at {lat, lng}. Renders a placeholder
 * when no coordinates are available. Uses Leaflet + OpenStreetMap (no API key).
 */
export default function LocationMap({ lat, lng, zoom = 14, height = 320, label, accent = '#3b82f6' }) {
  const elRef = useRef(null);
  const mapRef = useRef(null);

  const hasCoords = lat != null && lng != null && !Number.isNaN(Number(lat)) && !Number.isNaN(Number(lng));

  useEffect(() => {
    if (!hasCoords) return;
    let cancelled = false;

    loadLeaflet().then((L) => {
      if (cancelled || !L || !elRef.current) return;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      const map = L.map(elRef.current, { scrollWheelZoom: false }).setView([Number(lat), Number(lng)], zoom);
      mapRef.current = map;
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);
      const marker = L.marker([Number(lat), Number(lng)], { icon: markerIcon(L) }).addTo(map);
      if (label) marker.bindPopup(label);
      // Fix sizing when the map mounts inside a freshly-shown container.
      setTimeout(() => map.invalidateSize(), 100);
    });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng, zoom, label, hasCoords]);

  if (!hasCoords) {
    return (
      <div
        style={{
          height, borderRadius: 16, background: '#f1f5f9',
          display: 'grid', placeItems: 'center', color: '#94a3b8',
          border: '1px dashed #cbd5e1',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <MapPin size={28} style={{ marginBottom: 6, opacity: 0.5 }} />
          <p style={{ fontSize: 13, margin: 0 }}>Localisation non renseignée</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', border: `1px solid ${accent}22` }}>
      <div ref={elRef} style={{ height, width: '100%' }} />
      <a
        href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px',
          fontSize: 13, fontWeight: 600, color: accent, background: '#fff',
          textDecoration: 'none', borderTop: '1px solid #f1f5f9',
        }}
      >
        <MapPin size={15} /> Ouvrir dans OpenStreetMap
      </a>
    </div>
  );
}
