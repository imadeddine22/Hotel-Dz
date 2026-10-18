// Comparison page content (fr / ar / en). Competitor facts: keep them verifiable and dated.
// Last checked: October 2026. Sources are listed at the bottom of the page.

export const CHECKED = { fr: 'octobre 2026', ar: 'أكتوبر 2026', en: 'October 2026' };

export const SOURCES = [
  { label: 'Booking.com — commission des hébergeurs (guide Homerez)', url: 'https://www.homerez.com/fr/guides-proprietaire/tout-savoir-sur-la-commission-booking' },
  { label: 'Booking.com — paiement sur place et facturation mensuelle (guide Homerez)', url: 'https://www.homerez.com/fr/guides-proprietaire/paiement-booking-comment-ca-marche' },
  { label: 'Ouedkniss — rubrique Location vacances', url: 'https://www.ouedkniss.com/location-vacance_immobilier-r?lang=fr' },
];

const COLUMNS = ['Meskan', 'Booking.com', 'Airbnb', 'Ouedkniss'];

export const CONTENT = {
  fr: {
    metaTitle: 'Booking, Airbnb ou Ouedkniss : comparatif Algérie',
    metaDescription:
      "Comparatif honnête pour réserver un hôtel, louer une maison ou acheter un bien en Algérie : paiement, frais, réservation et types d'annonces.",
    h1: 'Meskan, Booking.com, Airbnb ou Ouedkniss : que choisir en Algérie ?',
    intro:
      "Pour réserver un hôtel, louer un appartement à la nuit ou acheter un bien en Algérie, quatre plateformes reviennent souvent. Elles ne font pas la même chose : Booking.com et Airbnb sont des plateformes internationales de réservation, Ouedkniss est un site de petites annonces, et Meskan est une plateforme algérienne de réservation avec paiement sur place en dinars.",
    tldrTitle: 'En bref',
    tldr: [
      "Vous voulez réserver en ligne et payer en dinars à l'arrivée, sans carte internationale : Meskan.",
      'Vous voyagez souvent à l’étranger et avez une carte Visa ou Mastercard : Booking.com et Airbnb offrent le plus grand choix mondial.',
      "Vous cherchez le plus grand volume d'annonces algériennes et acceptez de tout négocier par téléphone : Ouedkniss.",
    ],
    tableTitle: 'Comparatif rapide',
    columns: COLUMNS,
    rows: [
      ['Type de plateforme', 'Réservation (Algérie)', 'Réservation (international)', 'Réservation (international)', 'Petites annonces'],
      ['Hôtels', 'Oui', 'Oui', 'Rarement', 'Peu'],
      ['Maisons et appartements à la nuit', 'Oui', 'Oui', 'Oui', 'Oui (annonces)'],
      ['Biens à vendre', 'Oui', 'Non', 'Non', 'Oui'],
      ['Réservation en ligne', 'Demande confirmée par l’établissement', 'Oui', 'Oui', 'Non (contact direct)'],
      ['Paiement', 'Sur place, en dinars', 'En ligne ou sur place selon l’hôtel', 'En ligne, à la réservation', 'À convenir avec l’annonceur'],
      ['Frais pour le voyageur', 'Aucun', 'Aucun frais Booking', 'Frais de service possibles', 'Aucun'],
      ['Coût pour l’hébergeur', 'Formule gratuite ou abonnement fixe en DA', 'Commission par réservation (≈ 15 % en moyenne)', 'Commission par réservation', 'Gratuit, options payantes'],
      ['Annonces vérifiées avant publication', 'Oui', 'Contrôles de la plateforme', 'Contrôles de la plateforme', 'Non systématique'],
      ['Langues', 'Français, arabe, anglais', 'Plus de 40', 'Plus de 60', 'Français, arabe, anglais'],
    ],
    sections: [
      {
        title: 'Meskan',
        body: [
          "Meskan réunit trois usages au même endroit : hôtels, locations à la nuit et biens à vendre, dans les 69 wilayas. Le voyageur envoie une demande de réservation gratuite ; l'hôtel ou le propriétaire l'accepte sous 48 heures, puis le séjour se règle sur place, en dinars. Aucune carte bancaire internationale n'est nécessaire.",
          "Côté hébergeurs, il n'y a pas de commission sur les réservations : une formule gratuite (1 établissement) et des abonnements fixes en dinars (Growth à 2 900 DA/mois, Pro à 6 900 DA/mois). Chaque annonce est vérifiée par l'équipe avant publication.",
          "Limites : la plateforme est récente et son catalogue est plus petit que celui des géants internationaux, et elle ne couvre que l'Algérie.",
        ],
      },
      {
        title: 'Booking.com',
        body: [
          "Booking.com est la référence mondiale pour les hôtels, avec beaucoup d'avis clients. Pour le voyageur, la réservation est sans frais ; l'établissement paie une commission sur chaque séjour, en moyenne autour de 15 % (de 10 à 25 % selon les cas). Quand l'hôtel choisit le paiement sur place, il encaisse le client puis reçoit une facture mensuelle de commissions.",
          "Idéal si vous comparez des hôtels dans plusieurs pays. En Algérie, certains établissements demandent toutefois un paiement par carte, ce qui suppose une carte internationale.",
        ],
      },
      {
        title: 'Airbnb',
        body: [
          "Airbnb est spécialisé dans les logements chez l'habitant et les locations de vacances. Le paiement se fait en ligne au moment de la réservation, avec des frais de service selon les cas, et l'hôte paie une commission.",
          "Idéal pour les voyageurs qui disposent d'une carte internationale et cherchent un logement entier ou original. Le choix d'annonces en Algérie reste limité par rapport à d'autres pays.",
        ],
      },
      {
        title: 'Ouedkniss',
        body: [
          "Ouedkniss, fondé en 2006, est le site de petites annonces le plus connu d'Algérie. Sa rubrique immobilier compte des milliers d'annonces de vente, de location et de location vacances. Il n'y a pas de réservation en ligne : on appelle l'annonceur et on négocie directement.",
          "Idéal pour le volume d'annonces et la vente immobilière. Revers de la médaille : les annonces ne sont pas systématiquement vérifiées, et rien ne garantit la disponibilité ni le prix affiché, il faut donc rester vigilant face aux arnaques.",
        ],
      },
    ],
    whoTitle: 'Quelle plateforme pour vous ?',
    who: [
      ['Voyageur en Algérie, paiement en espèces ou carte CIB/Edahabia', 'Meskan'],
      ['Voyage à l’étranger, carte Visa ou Mastercard', 'Booking.com ou Airbnb'],
      ['Hôtelier qui veut éviter les commissions', 'Meskan'],
      ['Acheter ou vendre un bien, très large audience', 'Ouedkniss ou Meskan'],
    ],
    faqTitle: 'Questions fréquentes',
    faq: [
      [
        'Peut-on réserver un hôtel en Algérie sans carte bancaire internationale ?',
        "Oui. Sur Meskan, la demande de réservation est gratuite et le séjour se paie sur place, en dinars, à l'arrivée. Sur Booking.com, cela dépend de l'hôtel : certains acceptent le paiement sur place, d'autres demandent une carte.",
      ],
      [
        'Meskan prend-il une commission sur les réservations ?',
        "Non. Les hébergeurs choisissent une formule gratuite ou un abonnement fixe en dinars ; aucune commission n'est prélevée sur les séjours. Les voyageurs ne paient aucun frais de réservation.",
      ],
      [
        'Quelle est la différence entre Meskan et Ouedkniss ?',
        "Ouedkniss est un site de petites annonces : on contacte l'annonceur et tout se négocie en direct. Meskan est une plateforme de réservation : les annonces sont vérifiées, la disponibilité est vérifiée et la demande est confirmée par l'établissement.",
      ],
    ],
    cta: 'Voir les hôtels en Algérie',
    sourcesTitle: 'Sources',
    checked: 'Informations vérifiées en',
    crumbs: ['Accueil', 'Comparatif'],
  },

  ar: {
    metaTitle: 'Booking أم Airbnb أم واد كنيس: مقارنة في الجزائر',
    metaDescription: 'مقارنة صريحة لحجز فندق أو كراء منزل أو شراء عقار في الجزائر: طريقة الدفع، الرسوم، الحجز وأنواع الإعلانات.',
    h1: 'مسكن، Booking.com، Airbnb أم واد كنيس: ماذا تختار في الجزائر؟',
    intro:
      'لحجز فندق أو كراء شقة بالليلة أو شراء عقار في الجزائر، تتكرر أربع منصات كثيراً، لكنها لا تقدّم نفس الخدمة: Booking.com وAirbnb منصتا حجز دوليتان، واد كنيس موقع إعلانات مبوّبة، ومسكن منصة حجز جزائرية مع الدفع في عين المكان بالدينار.',
    tldrTitle: 'باختصار',
    tldr: [
      'تريد الحجز عبر الإنترنت والدفع بالدينار عند الوصول، دون بطاقة دولية: مسكن.',
      'تسافر كثيراً إلى الخارج ولديك بطاقة Visa أو Mastercard: Booking.com وAirbnb يقدّمان أكبر خيار عالمي.',
      'تبحث عن أكبر عدد من الإعلانات الجزائرية وتقبل التفاوض هاتفياً: واد كنيس.',
    ],
    tableTitle: 'مقارنة سريعة',
    columns: ['مسكن', 'Booking.com', 'Airbnb', 'واد كنيس'],
    rows: [
      ['نوع المنصة', 'حجز (الجزائر)', 'حجز (دولي)', 'حجز (دولي)', 'إعلانات مبوّبة'],
      ['الفنادق', 'نعم', 'نعم', 'نادراً', 'قليل'],
      ['منازل وشقق بالليلة', 'نعم', 'نعم', 'نعم', 'نعم (إعلانات)'],
      ['عقارات للبيع', 'نعم', 'لا', 'لا', 'نعم'],
      ['الحجز عبر الإنترنت', 'طلب يؤكده صاحب المؤسسة', 'نعم', 'نعم', 'لا (اتصال مباشر)'],
      ['الدفع', 'في عين المكان بالدينار', 'عبر الإنترنت أو في الفندق حسب الفندق', 'عبر الإنترنت عند الحجز', 'يُتّفق عليه مع المعلن'],
      ['رسوم على المسافر', 'لا شيء', 'لا رسوم من Booking', 'رسوم خدمة ممكنة', 'لا شيء'],
      ['التكلفة على صاحب الإيواء', 'عرض مجاني أو اشتراك ثابت بالدينار', 'عمولة على كل حجز (حوالي 15% في المتوسط)', 'عمولة على كل حجز', 'مجاني، مع خيارات مدفوعة'],
      ['التحقق من الإعلانات قبل النشر', 'نعم', 'رقابة المنصة', 'رقابة المنصة', 'ليس دائماً'],
      ['اللغات', 'الفرنسية، العربية، الإنجليزية', 'أكثر من 40', 'أكثر من 60', 'الفرنسية، العربية، الإنجليزية'],
    ],
    sections: [
      {
        title: 'مسكن',
        body: [
          'يجمع مسكن ثلاث خدمات في مكان واحد: الفنادق، الكراء بالليلة والعقارات للبيع في 69 ولاية. يرسل المسافر طلب حجز مجاني، ويقبله الفندق أو المالك خلال 48 ساعة، ثم يُدفع ثمن الإقامة في عين المكان بالدينار. لا حاجة إلى بطاقة بنكية دولية.',
          'بالنسبة لأصحاب الإيواء، لا توجد عمولة على الحجوزات: عرض مجاني (مؤسسة واحدة) واشتراكات ثابتة بالدينار (Growth بـ 2 900 دج شهرياً وPro بـ 6 900 دج شهرياً). يراجع الفريق كل إعلان قبل نشره.',
          'الحدود: المنصة حديثة وعدد إعلاناتها أقل من المنصات الدولية الكبرى، وتغطي الجزائر فقط.',
        ],
      },
      {
        title: 'Booking.com',
        body: [
          'Booking.com هو المرجع العالمي للفنادق مع عدد كبير من آراء الزبائن. الحجز مجاني للمسافر، بينما تدفع المؤسسة عمولة على كل إقامة، بحوالي 15% في المتوسط (من 10 إلى 25% حسب الحالة). عندما يختار الفندق الدفع في عين المكان، يستلم المبلغ من الزبون ثم يتلقى فاتورة شهرية بالعمولات.',
          'مثالي إذا كنت تقارن فنادق في عدة دول. في الجزائر، تطلب بعض المؤسسات الدفع ببطاقة، ما يستلزم بطاقة دولية.',
        ],
      },
      {
        title: 'Airbnb',
        body: [
          'Airbnb متخصص في السكن عند الأهالي وكراء العطل. يتم الدفع عبر الإنترنت عند الحجز، مع رسوم خدمة حسب الحالة، ويدفع المضيف عمولة.',
          'مثالي للمسافرين الذين يملكون بطاقة دولية ويبحثون عن سكن كامل أو مميّز. يبقى عدد الإعلانات في الجزائر محدوداً مقارنة بدول أخرى.',
        ],
      },
      {
        title: 'واد كنيس',
        body: [
          'واد كنيس، الذي تأسس سنة 2006، هو أشهر موقع إعلانات مبوّبة في الجزائر. يضم قسم العقارات آلاف إعلانات البيع والكراء وكراء العطل. لا يوجد حجز عبر الإنترنت: تتصل بالمعلن وتتفاوض معه مباشرة.',
          'مثالي لعدد الإعلانات ولبيع العقارات. في المقابل، لا يتم التحقق من الإعلانات دائماً، ولا شيء يضمن التوفر أو السعر المعروض، لذا يجب الحذر من الاحتيال.',
        ],
      },
    ],
    whoTitle: 'أي منصة تناسبك؟',
    who: [
      ['مسافر داخل الجزائر، يدفع نقداً أو ببطاقة CIB/الذهبية', 'مسكن'],
      ['سفر إلى الخارج، بطاقة Visa أو Mastercard', 'Booking.com أو Airbnb'],
      ['صاحب فندق يريد تجنّب العمولات', 'مسكن'],
      ['شراء أو بيع عقار، جمهور واسع جداً', 'واد كنيس أو مسكن'],
    ],
    faqTitle: 'أسئلة شائعة',
    faq: [
      [
        'هل يمكن حجز فندق في الجزائر دون بطاقة بنكية دولية؟',
        'نعم. على مسكن، طلب الحجز مجاني وتُدفع الإقامة في عين المكان بالدينار عند الوصول. على Booking.com يتوقف الأمر على الفندق: بعضها يقبل الدفع في المكان وبعضها يطلب بطاقة.',
      ],
      [
        'هل يأخذ مسكن عمولة على الحجوزات؟',
        'لا. يختار أصحاب الإيواء عرضاً مجانياً أو اشتراكاً ثابتاً بالدينار، ولا تُقتطع أي عمولة على الإقامات. ولا يدفع المسافرون أي رسوم حجز.',
      ],
      [
        'ما الفرق بين مسكن وواد كنيس؟',
        'واد كنيس موقع إعلانات مبوّبة: تتصل بالمعلن ويتم كل شيء بالتفاوض المباشر. مسكن منصة حجز: الإعلانات موثّقة، والتوفر مُتحقَّق منه، والطلب يؤكده صاحب المؤسسة.',
      ],
    ],
    cta: 'تصفّح الفنادق في الجزائر',
    sourcesTitle: 'المصادر',
    checked: 'معلومات تم التحقق منها في',
    crumbs: ['الرئيسية', 'مقارنة'],
  },

  en: {
    metaTitle: 'Booking vs Airbnb vs Ouedkniss in Algeria',
    metaDescription: 'An honest comparison for booking a hotel, renting a house or buying property in Algeria: payment, fees, booking and listing types.',
    h1: 'Meskan, Booking.com, Airbnb or Ouedkniss: which to use in Algeria?',
    intro:
      'To book a hotel, rent an apartment by the night or buy property in Algeria, four platforms come up again and again. They do different things: Booking.com and Airbnb are international booking platforms, Ouedkniss is a classifieds site, and Meskan is an Algerian booking platform where you pay on site in dinars.',
    tldrTitle: 'In short',
    tldr: [
      'You want to book online and pay in dinars on arrival, without an international card: Meskan.',
      'You travel abroad often and have a Visa or Mastercard: Booking.com and Airbnb offer the widest worldwide choice.',
      'You want the largest volume of Algerian listings and are happy to negotiate by phone: Ouedkniss.',
    ],
    tableTitle: 'Quick comparison',
    columns: COLUMNS,
    rows: [
      ['Platform type', 'Booking (Algeria)', 'Booking (international)', 'Booking (international)', 'Classifieds'],
      ['Hotels', 'Yes', 'Yes', 'Rarely', 'Few'],
      ['Houses and apartments by the night', 'Yes', 'Yes', 'Yes', 'Yes (ads)'],
      ['Properties for sale', 'Yes', 'No', 'No', 'Yes'],
      ['Online booking', 'Request confirmed by the host', 'Yes', 'Yes', 'No (direct contact)'],
      ['Payment', 'On site, in dinars', 'Online or at the hotel, depending on the hotel', 'Online, when booking', 'Agreed with the advertiser'],
      ['Fees for travellers', 'None', 'No Booking fee', 'Service fees may apply', 'None'],
      ['Cost for hosts', 'Free plan or flat subscription in DZD', 'Commission per booking (≈15% on average)', 'Commission per booking', 'Free, paid options'],
      ['Listings checked before publication', 'Yes', 'Platform checks', 'Platform checks', 'Not systematically'],
      ['Languages', 'French, Arabic, English', '40+', '60+', 'French, Arabic, English'],
    ],
    sections: [
      {
        title: 'Meskan',
        body: [
          'Meskan brings three things together: hotels, nightly rentals and properties for sale, across all 69 wilayas. The traveller sends a free booking request; the hotel or owner accepts it within 48 hours, and the stay is paid on site, in dinars. No international bank card is needed.',
          'For hosts there is no commission on bookings: a free plan (1 property) and flat subscriptions in dinars (Growth at 2,900 DZD/month, Pro at 6,900 DZD/month). Every listing is checked by the team before it goes live.',
          'Limits: the platform is new, its catalogue is smaller than the international giants’, and it only covers Algeria.',
        ],
      },
      {
        title: 'Booking.com',
        body: [
          'Booking.com is the world reference for hotels, with lots of guest reviews. Booking is free for travellers; the property pays a commission on each stay, around 15% on average (10 to 25% depending on the case). When a hotel chooses pay-at-the-property, it collects from the guest and then receives a monthly commission invoice.',
          'Best if you compare hotels in several countries. In Algeria, some properties ask for card payment, which requires an international card.',
        ],
      },
      {
        title: 'Airbnb',
        body: [
          'Airbnb specialises in private homes and holiday rentals. Payment is made online when booking, with service fees depending on the case, and the host pays a commission.',
          'Best for travellers with an international card looking for a whole or unusual place. The choice of listings in Algeria is still limited compared with other countries.',
        ],
      },
      {
        title: 'Ouedkniss',
        body: [
          'Ouedkniss, founded in 2006, is Algeria’s best-known classifieds site. Its real-estate section has thousands of sale, rental and holiday-rental ads. There is no online booking: you call the advertiser and negotiate directly.',
          'Best for listing volume and property sales. The flip side: ads are not systematically checked, and nothing guarantees the availability or the advertised price, so stay alert to scams.',
        ],
      },
    ],
    whoTitle: 'Which platform is right for you?',
    who: [
      ['Travelling in Algeria, paying cash or with a CIB/Edahabia card', 'Meskan'],
      ['Travelling abroad with a Visa or Mastercard', 'Booking.com or Airbnb'],
      ['Hotelier who wants to avoid commissions', 'Meskan'],
      ['Buying or selling property, very wide audience', 'Ouedkniss or Meskan'],
    ],
    faqTitle: 'Frequently asked questions',
    faq: [
      [
        'Can I book a hotel in Algeria without an international bank card?',
        'Yes. On Meskan the booking request is free and the stay is paid on site, in dinars, on arrival. On Booking.com it depends on the hotel: some accept payment at the property, others require a card.',
      ],
      [
        'Does Meskan take a commission on bookings?',
        'No. Hosts choose a free plan or a flat subscription in dinars; no commission is taken on stays. Travellers pay no booking fees.',
      ],
      [
        'What is the difference between Meskan and Ouedkniss?',
        'Ouedkniss is a classifieds site: you contact the advertiser and everything is negotiated directly. Meskan is a booking platform: listings are verified, availability is checked and the request is confirmed by the property.',
      ],
    ],
    cta: 'See hotels in Algeria',
    sourcesTitle: 'Sources',
    checked: 'Information checked in',
    crumbs: ['Home', 'Comparison'],
  },
};
