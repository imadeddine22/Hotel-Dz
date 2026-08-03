'use client';

import { useEffect, useRef, useState } from 'react';
import { loadLeaflet, ALGERIA_CENTER } from '@/lib/leaflet';
import { renderToString } from 'react-dom/server';

export default function HotelsMap({ hotels, activeHotelId, onHotelHover }) {
  const elRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const [ready, setReady] = useState(false);

  // Initialize map
  useEffect(() => {
    let cancelled = false;
    loadLeaflet().then((L) => {
      if (cancelled || !L || !elRef.current || mapRef.current) return;
      
      const map = L.map(elRef.current, {
        zoomControl: false // We can add it back in a specific position if needed
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
      }
    };
  }, []);

  // Update markers
  useEffect(() => {
    if (!ready || !mapRef.current || !window.L) return;
    const L = window.L;
    const map = mapRef.current;

    // Clear old markers
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    const bounds = L.latLngBounds();
    let hasCoords = false;

    hotels.forEach(hotel => {
      if (hotel.coordinates?.lat && hotel.coordinates?.lng) {
        hasCoords = true;
        const pos = [hotel.coordinates.lat, hotel.coordinates.lng];
        bounds.extend(pos);

        const html = `
          <div class="map-pin flex items-center justify-center w-8 h-8 rounded-full shadow-md border-2 transition-colors duration-300 bg-brand-500 border-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            </svg>
          </div>
        `;

        const icon = L.divIcon({
          html,
          className: 'custom-pin-container', // Wrapper class
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker(pos, { icon }).addTo(map);
        
        // Popup
        const popupHtml = `
          <div class="p-2 min-w-[150px]">
            <div class="text-xs font-bold text-brand-500 mb-1 flex items-center gap-1 uppercase tracking-wider">
               <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h20"/><path d="M5 20V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/></svg>
               ${hotel.type}
            </div>
            <h4 class="font-bold text-ink">${hotel.name}</h4>
            <div class="mt-1 font-semibold text-brand-600">${hotel.price ? hotel.price.toLocaleString('fr-DZ') + ' DZD' : ''}</div>
          </div>
        `;
        marker.bindPopup(popupHtml, { offset: [0, -10], closeButton: false, className: 'custom-popup' });

        marker.on('mouseover', function() {
          this.openPopup();
          if (onHotelHover) onHotelHover(hotel.id || hotel._id);
        });
        
        marker.on('mouseout', function() {
          this.closePopup();
          if (onHotelHover) onHotelHover(null);
        });

        markersRef.current[hotel.id || hotel._id] = marker;
      }
    });

    if (hasCoords) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    } else {
      map.setView([ALGERIA_CENTER.lat, ALGERIA_CENTER.lng], 5);
    }
  }, [hotels, ready]); // Removed activeHotelId from here

  // Separate effect to handle highlight state without recreating markers
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      const el = marker.getElement();
      if (!el) return;
      const pin = el.querySelector('.map-pin');
      if (pin) {
        if (id === activeHotelId) {
          pin.classList.replace('bg-brand-500', 'bg-brand-600');
          pin.classList.add('scale-110', 'z-50');
        } else {
          pin.classList.replace('bg-brand-600', 'bg-brand-500');
          pin.classList.remove('scale-110', 'z-50');
        }
      }
    });
  }, [activeHotelId, ready]);

  return (
    <div
      ref={elRef}
      className="h-full w-full bg-gray-100 z-0"
    />
  );
}
