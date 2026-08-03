'use client';

import { useRef } from 'react';
import { ArrowLeft, ArrowRight, Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Leslie Alexander',
    company: 'Biffco Ltd.',
    text: 'This team exceeded my expectations! They were punctual and meticulous. My office has looked better. Will use them again!',
    rating: 5,
    img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    topText: true,
  },
  {
    name: 'Wade Warren',
    company: 'Binford Ltd.',
    text: 'This team exceeded my expectations! They were punctual and meticulous. My office has looked better. Will use them again!',
    rating: 5,
    img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
    topText: false,
  },
  {
    name: 'Brooklyn Simmons',
    company: 'Acme Co.',
    text: 'This team exceeded my expectations! They were punctual and meticulous. My office has looked better. Will use them again!',
    rating: 5,
    img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    topText: true,
  },
  {
    name: 'Guy Hawkins',
    company: 'Abstergo Ltd.',
    text: 'This team exceeded my expectations! They were punctual and meticulous. My office has looked better. Will use them again!',
    rating: 5,
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    topText: false,
  },
  {
    name: 'Eleanor Pena',
    company: 'Barone LLC.',
    text: 'This team exceeded my expectations! They were punctual and meticulous. My office has looked better. Will use them again!',
    rating: 5,
    img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    topText: true,
  }
];

export default function Testimonials() {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === 'left' ? -380 : 380;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-[#f8f9fa] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 flex items-center gap-4">
              <span className="text-sm font-bold text-[#f97316] uppercase tracking-wider">Our Testimonial</span>
              <div className="h-[2px] w-12 bg-[#f97316]/30">
                <div className="h-full w-6 bg-[#f97316]"></div>
              </div>
            </div>
            <h2 className="text-4xl font-extrabold text-[#0f172a] tracking-tight sm:text-5xl">
              Clients Feedback
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => scroll('left')}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md transition-transform hover:scale-105 hover:shadow-lg text-brand-500"
              aria-label="Previous testimonials"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md transition-transform hover:scale-105 hover:shadow-lg text-brand-500"
              aria-label="Next testimonials"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div 
          ref={scrollRef}
          className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-12 sm:-mx-6 sm:px-6"
        >
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="flex w-[320px] shrink-0 snap-start flex-col gap-6 sm:w-[380px]">
              
              {t.topText ? (
                <>
                  <div className="flex flex-col gap-6 rounded-2xl bg-white p-8 shadow-sm">
                    <p className="text-lg text-gray-600 leading-relaxed">
                      "{t.text}"
                    </p>
                    <div className="flex items-center gap-1">
                      {[...Array(t.rating)].map((_, idx) => (
                        <Star key={idx} className="h-5 w-5 fill-[#f97316] text-[#f97316]" />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 px-4">
                    <img src={t.img} alt={t.name} className="h-16 w-16 rounded-full object-cover shadow-sm border-2 border-white" />
                    <div>
                      <h4 className="text-lg font-bold text-ink">{t.name}</h4>
                      <p className="text-sm text-gray-500">{t.company}</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-4 px-4 pt-6">
                    <img src={t.img} alt={t.name} className="h-16 w-16 rounded-full object-cover shadow-sm border-2 border-white" />
                    <div>
                      <h4 className="text-lg font-bold text-ink">{t.name}</h4>
                      <p className="text-sm text-gray-500">{t.company}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-6 rounded-2xl bg-white p-8 shadow-sm">
                    <p className="text-lg text-gray-600 leading-relaxed">
                      "{t.text}"
                    </p>
                    <div className="flex items-center gap-1">
                      {[...Array(t.rating)].map((_, idx) => (
                        <Star key={idx} className="h-5 w-5 fill-[#f97316] text-[#f97316]" />
                      ))}
                    </div>
                  </div>
                </>
              )}

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
