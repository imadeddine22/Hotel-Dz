'use client';

import { useEffect, useRef, useState } from 'react';
import { Crosshair, MapPin } from 'lucide-react';
import { loadLeaflet, markerIcon, ALGERIA_CENTER } from '@/lib/leaflet';

/**
 * Interactive location picker. Click the map (or drag the pin, or use "Ma
 * position") to set coordinates. Also exposes manual lat/lng number inputs.
 *
 * Props: value = { lat, lng } | null, onChange(lat, lng), height, accent.
 */
export default function MapPicker({ value, onChange, height = 280, accent = '#3b82f6' }) {
  const elRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const [ready, setReady] = useState(false);
  const [geoMsg, setGeoMsg] = useState('');

  onChangeRef.current = onChange;

  const hasCoords =
    value?.lat != null && value?.lng != null &&
    !Number.isNaN(Number(value.lat)) && !Number.isNaN(Number(value.lng));

  // Init the map once.
  useEffect(() => {
    let cancelled = false;
    loadLeaflet().then((L) => {
      if (cancelled || !L || !elRef.current || mapRef.current) return;
      const start = hasCoords ? [Number(value.lat), Number(value.lng)] : [ALGERIA_CENTER.lat, ALGERIA_CENTER.lng];
      const map = L.map(elRef.current).setView(start, hasCoords ? 13 : 5);
      mapRef.current = map;
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      map.on('click', (e) => onChangeRef.current(+e.latlng.lat.toFixed(6), +e.latlng.lng.toFixed(6)));
      setTimeout(() => map.invalidateSize(), 120);
      setReady(true);
    });
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync the marker whenever the value changes.
  useEffect(() => {
    if (!ready || !mapRef.current || !window.L) return;
    const L = window.L;
    if (!hasCoords) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      return;
    }
    const pos = [Number(value.lat), Number(value.lng)];
    if (markerRef.current) {
      markerRef.current.setLatLng(pos);
    } else {
      const marker = L.marker(pos, { icon: markerIcon(L), draggable: true }).addTo(mapRef.current);
      marker.on('dragend', () => {
        const ll = marker.getLatLng();
        onChangeRef.current(+ll.lat.toFixed(6), +ll.lng.toFixed(6));
      });
      markerRef.current = marker;
    }
  }, [value, ready, hasCoords]);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoMsg("La géolocalisation n'est pas disponible");
      return;
    }
    setGeoMsg('Localisation…');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = +pos.coords.latitude.toFixed(6);
        const lng = +pos.coords.longitude.toFixed(6);
        onChangeRef.current(lat, lng);
        if (mapRef.current) mapRef.current.setView([lat, lng], 14);
        setGeoMsg('');
      },
      () => setGeoMsg('Localisation refusée'),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const setField = (key) => (e) => {
    const v = e.target.value;
    const next = { lat: value?.lat ?? '', lng: value?.lng ?? '', [key]: v };
    onChange(next.lat === '' ? null : Number(next.lat), next.lng === '' ? null : Number(next.lng));
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
        <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 5 }}>
          <MapPin size={13} /> Cliquez sur la carte pour placer le repère
        </p>
        <button
          type="button"
          onClick={useMyLocation}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600,
            color: accent, background: `${accent}14`, border: 'none', borderRadius: 8,
            padding: '6px 12px', cursor: 'pointer',
          }}
        >
          <Crosshair size={14} /> Ma position
        </button>
      </div>

      <div
        ref={elRef}
        style={{ height, width: '100%', borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0', zIndex: 0 }}
      />

      {geoMsg && <p style={{ fontSize: 12, color: '#64748b', margin: '6px 0 0' }}>{geoMsg}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
        <input
          type="number" step="any" placeholder="Latitude"
          value={value?.lat ?? ''} onChange={setField('lat')}
          style={miniInput}
        />
        <input
          type="number" step="any" placeholder="Longitude"
          value={value?.lng ?? ''} onChange={setField('lng')}
          style={miniInput}
        />
      </div>
    </div>
  );
}

const miniInput = {
  width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid #e2e8f0',
  fontSize: 13, color: '#1e293b', outline: 'none', background: '#f8fafc', boxSizing: 'border-box',
};
