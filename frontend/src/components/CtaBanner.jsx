'use client';

import Link from 'next/link';
import { useLangStore } from '@/store/authStore';

export default function CtaBanner() {
  const { lang } = useLangStore();
  const isRtl = lang === 'ar';

  const text = {
    fr: {
      titlePrefix: 'Prêt à Réaliser',
      titleLine2: 'Votre Propriété ',
      titleHighlight: 'de Rêve',
      subtitle:
        'Explorez une sélection de propriétés qui correspondent à votre vision et vos objectifs. Ensemble, construisons l’extraordinaire.',
      btn: 'Commencer',
    },

    ar: {
      titlePrefix: 'اجعل مساحة أحلامك',
      titleLine2: '',
      titleHighlight: 'حقيقة ملموسة',
      subtitle:
        'اكتشف مجموعة مختارة من العقارات والتصاميم المبتكرة التي تتوافق مع رؤيتك وأهدافك.',
      btn: 'ابدأ الآن',
    },

    en: {
      titlePrefix: 'Make Your Dream',
      titleLine2: 'Space a ',
      titleHighlight: 'Reality',
      subtitle:
        "Partner with us to create stunning, innovative designs that match your vision. Let's build something extraordinary together.",
      btn: 'Get Started',
    },
  };

  const t = text[lang] || text.fr;

  return (
    <section
      className="
        relative
        overflow-hidden
        mx-4 sm:mx-6 lg:mx-auto
        max-w-7xl

        min-h-[360px]
        sm:min-h-[420px]
        md:min-h-[480px]
        lg:min-h-[515px]

        rounded-[24px]
        sm:rounded-[32px]

        my-8 sm:my-12
        shadow-xl
      "
    >

      {/* =========================
          BACKGROUND IMAGE
      ========================== */}
      <img
        src="/hand_holding_house.png"
        alt="Dream House Model"
        className="
          absolute
          inset-0
          w-full
          h-full
          object-cover
          object-center

          /* قلب اليد والصورة أفقيًا */
          scale-x-[-1]

          z-0
        "
      />

      {/* =========================
          GRADIENT
      ========================== */}
      <div
        className="
          absolute
          inset-0
          z-10

          bg-gradient-to-r
          from-[#8fb5d2]/80
          via-[#8fb5d2]/35
          to-transparent
        "
      />

      {/* =========================
          CONTENT
      ========================== */}
      <div
        className={`
          relative
          z-20

          min-h-[360px]
          sm:min-h-[420px]
          md:min-h-[480px]
          lg:min-h-[515px]

          flex
          items-center

          ${isRtl
            ? 'justify-end text-right'
            : 'justify-start text-left'
          }

          px-8
          sm:px-12
          md:px-14
          lg:px-16
        `}
      >

        <div
          className={`
            w-full
            max-w-[520px]

            ${isRtl ? 'items-end' : 'items-start'}

            flex
            flex-col
          `}
        >

          {/* TITLE */}
          <h2
            className="
              text-[32px]
              sm:text-4xl
              md:text-5xl
              lg:text-[42px]
              xl:text-[46px]

              font-bold
              text-white

              leading-[1.08]
              tracking-tight

              font-sans
            "
          >
            {t.titlePrefix}

            <br />

            {t.titleLine2}

            <span
              className="
                font-serif
                italic
                font-normal
                text-white
              "
            >
              {t.titleHighlight}
            </span>
          </h2>

          {/* SUBTITLE */}
          <p
            className="
              mt-5
              sm:mt-6

              text-xs
              sm:text-sm
              md:text-base

              text-white/95

              font-sans
              font-medium

              leading-[1.6]

              max-w-[500px]
            "
          >
            {t.subtitle}
          </p>

          {/* BUTTON */}
          <Link
            href="/sales"
            className="
              mt-7
              sm:mt-8

              inline-flex
              items-center
              justify-center

              bg-white
              text-[#1a2332]

              font-bold

              text-sm
              sm:text-base

              px-7
              sm:px-8

              py-3
              sm:py-3.5

              rounded-full

              shadow-md

              hover:shadow-xl
              hover:scale-[1.03]

              active:scale-95

              transition-all
              duration-300
            "
          >
            {t.btn}
          </Link>

        </div>
      </div>
    </section>
  );
}