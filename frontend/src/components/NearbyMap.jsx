'use client';

import { useEffect, useRef, useState } from 'react';
import { loadLeaflet, ALGERIA_CENTER } from '@/lib/leaflet';

export default function NearbyMap({ properties, userPos, activeId, onPropertyHover }) {
  const elRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const userMarkerRef = useRef(null);
  const [ready, setReady] = useState(false);

  // Initialize map
  useEffect(() => {
    let cancelled = false;
    loadLeaflet().then((L) => {
      if (cancelled || !L || !elRef.current || mapRef.current) return;

      const map = L.map(elRef.current, {
        zoomControl: false,
      }).setView([ALGERIA_CENTER.lat, ALGERIA_CENTER.lng], 5);

      L.control.zoom({ position: 'topright' }).addTo(map);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      setTimeout(() => map.invalidateSize(), 120);
      setReady(true);
    });
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = {};
        userMarkerRef.current = null;
      }
    };
  }, []);

  // Add/update user position marker
  useEffect(() => {
    if (!ready || !mapRef.current || !window.L || !userPos) return;
    const L = window.L;
    const map = mapRef.current;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userPos.lat, userPos.lng]);
    } else {
      const userHtml = `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-10 h-10 rounded-full bg-blue-400 opacity-25 animate-ping"></div>
          <div class="relative w-4 h-4 rounded-full bg-blue-500 border-[3px] border-white shadow-lg"></div>
        </div>
      `;
      const userIcon = L.divIcon({
        html: userHtml,
        className: 'user-location-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });
      userMarkerRef.current = L.marker([userPos.lat, userPos.lng], { icon: userIcon, zIndexOffset: 1000 })
        .addTo(map)
        .bindPopup('<div class="p-2 font-bold text-blue-600 text-sm">📍 Votre position</div>', {
          closeButton: false,
          className: 'custom-popup',
        });
    }
  }, [userPos, ready]);

  // Update property markers
  useEffect(() => {
    if (!ready || !mapRef.current || !window.L) return;
    const L = window.L;
    const map = mapRef.current;

    // Clear old markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    const bounds = L.latLngBounds();
    let hasCoords = false;

    // Add user position to bounds
    if (userPos) {
      bounds.extend([userPos.lat, userPos.lng]);
      hasCoords = true;
    }

    properties.forEach((p) => {
      if (p.coordinates?.lat && p.coordinates?.lng) {
        hasCoords = true;
        const pos = [p.coordinates.lat, p.coordinates.lng];
        bounds.extend(pos);

        const isHotel = p.kind === 'hotel';
        const color = isHotel ? '#00bcd4' : '#a855f7';

        const html = `
          <div class="map-pin flex items-center justify-center w-9 h-9 rounded-full shadow-lg border-2 transition-all duration-300 border-white" style="background: ${color};">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              ${isHotel
                ? '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>'
                : '<path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-5h6v5"></path>'
              }
            </svg>
          </div>
        `;

        const icon = L.divIcon({
          html,
          className: 'custom-pin-container',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const marker = L.marker(pos, { icon }).addTo(map);

        const distText = p.distance != null ? `<div class="mt-1 text-xs font-bold text-green-600">📍 ${p.distance < 1 ? Math.round(p.distance * 1000) + ' m' : p.distance.toFixed(1) + ' km'}</div>` : '';

        const popupHtml = `
          <div class="p-2.5 min-w-[160px]">
            <div class="text-[10px] font-bold uppercase tracking-wider mb-1" style="color: ${color};">
               ${isHotel ? '🏨 Hôtel' : '🏠 Maison'} · ${p.type || ''}
            </div>
            <h4 class="font-bold text-gray-900 text-sm">${p.name}</h4>
            <div class="text-xs text-gray-500 mt-0.5">${p.city}</div>
            <div class="mt-1.5 font-extrabold text-sm" style="color: ${color};">${p.price ? p.price.toLocaleString('fr-DZ') + ' DZD' : ''}</div>
            ${distText}
          </div>
        `;
        marker.bindPopup(popupHtml, { offset: [0, -12], closeButton: false, className: 'custom-popup' });

        marker.on('mouseover', function () {
          this.openPopup();
          if (onPropertyHover) onPropertyHover(p.id);
        });
        marker.on('mouseout', function () {
          this.closePopup();
          if (onPropertyHover) onPropertyHover(null);
        });

        markersRef.current[p.id] = marker;
      }
    });

    if (hasCoords) {
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
    } else {
      map.setView([ALGERIA_CENTER.lat, ALGERIA_CENTER.lng], 5);
    }
  }, [properties, userPos, ready]);

  // Highlight active marker
  useEffect(() => {
    if (!ready || !mapRef.current) return;

    Object.entries(markersRef.current).forEach(([id, marker]) => {
      const el = marker.getElement();
      if (!el) return;
      const pin = el.querySelector('.map-pin');
      if (pin) {
        if (id === activeId) {
          pin.style.transform = 'scale(1.3)';
          pin.style.zIndex = '999';
          pin.style.boxShadow = '0 0 0 4px rgba(0, 188, 212, 0.3), 0 4px 12px rgba(0,0,0,0.2)';
          marker.openPopup();
        } else {
          pin.style.transform = 'scale(1)';
          pin.style.zIndex = '';
          pin.style.boxShadow = '';
          marker.closePopup();
        }
      }
    });
  }, [activeId, ready]);

  return (
    <div
      ref={elRef}
      className="h-full w-full bg-gray-100 z-0"
    />
  );
}
