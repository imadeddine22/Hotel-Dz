'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Star, Tag, Users, Home as HomeIcon } from 'lucide-react';
import Link from 'next/link';

const TESTIMONIALS = [
  {
    text: "We Couldn't Be Happier With The Outcome Of Our Renovation Project. From The Initial Consultation To The Final Touches, The Team Demonstrated A High Level Of Professionalism, Creativity.",
    rating: '5.0/5.0',
    stars: 5,
    name: "Tommie Littel",
    title: "Sales Director, NovaScale",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"
  },
  {
    text: "Excellent service ! L'équipe de HotelsDZ a géré notre dossier d'enregistrement de A à Z avec brio. Aucun frais caché et beaucoup de sérieux.",
    rating: '4.9/5.0',
    stars: 5,
    name: "Faris Benkaci",
    title: "Hôtelier, Oran Grand Palace",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80"
  },
  {
    text: "La plateforme la plus fiable en Algérie pour louer ou vendre un bien. Le support client est toujours disponible pour nous accompagner.",
    rating: '5.0/5.0',
    stars: 5,
    name: "Amira Mansouri",
    title: "Propriétaire de Villa, Alger",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80"
  }
];

export default function HomeDetailsSection() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const current = TESTIMONIALS[activeTestimonial];

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 space-y-24 bg-white/40">
      
      {/* ─── SECTION 1: JOURNEY TO PERFECT STAY / HOME ─── */}
      <div className="text-center space-y-6">
        <h2 className="text-3xl md:text-5xl font-black font-serif text-slate-800 tracking-tight leading-none">
          Your Journey To The Perfect <br className="hidden md:inline" />
          Home <span className="text-teal-500 italic font-medium font-serif leading-none tracking-normal">Starts With Us</span>
        </h2>
        <p className="max-w-2xl mx-auto text-slate-500 text-xs md:text-sm font-medium leading-relaxed">
          With a proven track record and in-depth market knowledge, we're here to make your real estate journey smooth and stress-free. Whether buying, selling, or renting, you can count on our team to deliver results with integrity.
        </p>

        {/* Corporate Team Image & Stats Panel */}
        <div className="relative mt-12 rounded-3xl overflow-hidden shadow-lg aspect-[16/9] max-h-[460px] w-full">
          <img
            src="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200&q=80"
            alt="HotelsDZ Team"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/10"></div>
        </div>

        {/* Stat Cards Grid (Overlapping in desktop / stacked below on mobile) */}
        <div className="grid gap-6 md:grid-cols-3 -mt-16 md:-mt-24 relative z-10 px-4 md:px-12">
          
          {/* Card 1 */}
          <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100 flex flex-col items-start text-left">
            <span className="text-3xl md:text-4xl font-black text-slate-800 font-serif">1,500</span>
            <p className="text-[11px] text-slate-500 font-bold mt-2 leading-relaxed">
              Total Properties Managed, Helping Families Find Their Dream Stay For Over A Decade.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100 flex flex-col items-start text-left">
            <span className="text-3xl md:text-4xl font-black text-slate-800 font-serif">30+</span>
            <p className="text-[11px] text-slate-500 font-bold mt-2 leading-relaxed">
              Strong Partnerships With Local Hoteliers & Owners To Enhance Our Services.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100 flex flex-col items-start text-left">
            <span className="text-3xl md:text-4xl font-black text-slate-800 font-serif">98%</span>
            <p className="text-[11px] text-slate-500 font-bold mt-2 leading-relaxed">
              Client Satisfaction Rate, Reflecting Our Commitment To Exceptional Service.
            </p>
          </div>

        </div>
      </div>

      {/* ─── SECTION 2: TESTIMONIALS ─── */}
      <div className="text-center space-y-8 py-10">
        <h2 className="text-3xl md:text-5xl font-black font-serif text-slate-800 leading-none">
          Hear From Our Awesome <br className="hidden md:inline" />
          <span className="text-teal-500 italic font-medium font-serif leading-none mt-2 inline-block">Satisfied Clients</span>
        </h2>
        
        {/* Active Testimonial Card */}
        <div className="max-w-5xl mx-auto bg-slate-50/50 rounded-3xl border border-slate-100 p-8 md:p-16 relative flex flex-col items-center">
          <p className="text-base md:text-2xl font-medium text-slate-600 leading-relaxed italic max-w-3xl text-center">
            "{current.text}"
          </p>

          {/* Stars & Rating */}
          <div className="flex items-center gap-1.5 mt-8">
            <div className="flex text-amber-400 gap-0.5">
              {[...Array(current.stars)].map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-current" />
              ))}
            </div>
            <span className="text-sm font-bold text-slate-500 ml-2">{current.rating}</span>
          </div>

          {/* Reviewer Details */}
          <div className="flex items-center gap-4 mt-8">
            <img
              src={current.avatar}
              alt={current.name}
              className="w-12 h-12 rounded-full object-cover shadow-sm border border-white"
            />
            <div className="text-left leading-tight">
              <h4 className="text-base font-bold text-slate-800">{current.name}</h4>
              <p className="text-xs font-bold text-slate-400 mt-0.5">{current.title}</p>
            </div>
          </div>

          {/* Navigation controls */}
          <div className="flex items-center gap-4 mt-8 select-none">
            <button
              onClick={prevTestimonial}
              className="w-9 h-9 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition shadow-sm"
              aria-label="Previous Testimonial"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-bold text-slate-400 tracking-wider">
              {String(activeTestimonial + 1).padStart(2, '0')} / {String(TESTIMONIALS.length).padStart(2, '0')}
            </span>
            <button
              onClick={nextTestimonial}
              className="w-9 h-9 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition shadow-sm"
              aria-label="Next Testimonial"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
