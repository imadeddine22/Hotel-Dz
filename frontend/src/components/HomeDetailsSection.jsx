'use client';

import Testimonials from '@/components/Testimonials';
import HomeBanner from '@/components/HomeBanner';

import { useT } from '@/lib/i18n/useT';
export default function HomeDetailsSection() {
  const { t } = useT();
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 space-y-24 bg-white/40">
      
      {/* ─── SECTION 1: JOURNEY TO PERFECT STAY / HOME ─── */}
      <div className="text-center space-y-6">
        <h2 className="text-3xl md:text-5xl font-black font-serif text-slate-800 tracking-tight leading-none">
          {t('Your Journey To The Perfect')} <br className="hidden md:inline" />
          {t('Home')} <span className="text-teal-500 italic font-medium font-serif leading-none tracking-normal">{t('Starts With Us')}</span>
        </h2>
        <p className="max-w-2xl mx-auto text-slate-500 text-xs md:text-sm font-medium leading-relaxed">
          {t('With a proven track record and in-depth market knowledge, we\'re here to make your real estate journey smooth and stress-free. Whether buying, selling, or renting, you can count on our team to deliver results with integrity.')}
        </p>

        {/* Brand banner (where the team photo was) */}
        <HomeBanner />

        {/* Stat Cards Grid */}
        <div className="grid gap-6 md:grid-cols-3 pt-6 relative z-10 px-4 md:px-12">
          
          {/* Card 1 */}
          <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100 flex flex-col items-start text-left">
            <span className="text-3xl md:text-4xl font-black text-slate-800 font-serif">1,500</span>
            <p className="text-[11px] text-slate-500 font-bold mt-2 leading-relaxed">
              {t('Total Properties Managed, Helping Families Find Their Dream Stay For Over A Decade.')}
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100 flex flex-col items-start text-left">
            <span className="text-3xl md:text-4xl font-black text-slate-800 font-serif">30+</span>
            <p className="text-[11px] text-slate-500 font-bold mt-2 leading-relaxed">
              {t('Strong Partnerships With Local Hoteliers & Owners To Enhance Our Services.')}
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100 flex flex-col items-start text-left">
            <span className="text-3xl md:text-4xl font-black text-slate-800 font-serif">98%</span>
            <p className="text-[11px] text-slate-500 font-bold mt-2 leading-relaxed">
              {t('Client Satisfaction Rate, Reflecting Our Commitment To Exceptional Service.')}
            </p>
          </div>

        </div>
      </div>

      {/* ─── SECTION 2: TESTIMONIALS (moderated by the admin) ─── */}
      <Testimonials />

    </div>
  );
}
