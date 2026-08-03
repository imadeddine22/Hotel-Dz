'use client';

import Link from 'next/link';
import { Hotel, Home, ArrowRight } from 'lucide-react';

const GRADIENTS = [
  'linear-gradient(135deg, #0891b2 0%, #06b6d4 50%, #22d3ee 100%)',
  'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%)',
  'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)',
  'linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #f87171 100%)',
  'linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #fbbf24 100%)',
  'linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%)',
  'linear-gradient(135deg, #db2777 0%, #ec4899 50%, #f472b6 100%)',
  'linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #818cf8 100%)',
  'linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #2dd4bf 100%)',
  'linear-gradient(135deg, #c026d3 0%, #d946ef 50%, #e879f9 100%)',
];

const PATTERNS = [
  'M10 10 L90 10 L90 90 L10 90 Z',
  'M50 10 L90 50 L50 90 L10 50 Z',
  'M50 10 L90 90 L10 90 Z',
  'M10 50 Q50 10 90 50 Q50 90 10 50 Z',
];

export default function WilayaCard({ name, index = 0 }) {
  const gradient = GRADIENTS[index % GRADIENTS.length];
  const pattern = PATTERNS[index % PATTERNS.length];

  return (
    <Link
      href={`/destinations/${encodeURIComponent(name)}`}
      className="group"
      style={{
        display: 'block',
        borderRadius: 18,
        overflow: 'hidden',
        textDecoration: 'none',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 40px -12px rgba(0,0,0,0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div
        style={{
          background: gradient,
          padding: '24px 20px',
          minHeight: 120,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative SVG */}
        <svg
          viewBox="0 0 100 100"
          style={{
            position: 'absolute', right: -10, top: -10,
            width: 100, height: 100, opacity: 0.1,
            transition: 'transform 0.5s',
          }}
          className="group-hover:scale-110"
        >
          <path d={pattern} fill="white" />
        </svg>
        <div
          style={{
            position: 'absolute', right: 15, bottom: -25,
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            transition: 'transform 0.5s',
          }}
          className="group-hover:scale-125"
        />

        {/* Name */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0 }}>
            {name}
          </h3>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4, fontWeight: 500 }}>
            Voir les hôtels & maisons
          </p>
        </div>

        {/* Arrow */}
        <div
          style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'grid', placeItems: 'center',
            transition: 'background 0.2s, transform 0.3s',
            position: 'relative', zIndex: 1,
          }}
          className="group-hover:translate-x-1"
        >
          <ArrowRight size={16} color="#fff" />
        </div>
      </div>
    </Link>
  );
}
