import Hotel from '../models/Hotel.js';
import House from '../models/House.js';
import HouseForSale from '../models/HouseForSale.js';
import { attachPrices } from './hotel.controller.js';
import { effectivePrice } from '../utils/pricing.js';
import { getCommunes } from '../utils/communes.js';

const fold = (v) => String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]/g, '');
/** City and wilaya names in the catalog language (Arabic from the official lists; French otherwise). */
const places = (doc, lang) => {
  if (lang !== 'ar') return { city: doc.city || '', wilaya: doc.wilaya || '' };
  const found = getCommunes(doc.wilaya);
  const commune = found?.communes.find((c) => fold(c.name) === fold(doc.city));
  return { city: commune?.arabic || found?.wilaya.arabic || doc.city || '', wilaya: found?.wilaya.arabic || doc.wilaya || '' };
};

/**
 * Product catalog for Meta (Facebook / Instagram) catalog ads — Commerce Manager → Catalog →
 * Data sources → Scheduled feed → this URL. Every published listing with a photo and a price becomes
 * a catalog item; Meta then builds ads from it (Advantage+ catalog ads, carousels, retargeting).
 * Format: https://www.facebook.com/business/help/120325381656392 (CSV, one row per item).
 *
 *   GET /api/v1/feeds/meta-catalog.csv?lang=fr|ar|en&type=hotels|houses|sales
 */
const COLUMNS = ['id', 'title', 'description', 'availability', 'condition', 'price', 'link', 'image_link', 'brand', 'product_type', 'custom_label_0', 'custom_label_1', 'custom_label_2'];
const LABEL = {
  fr: { hotel: 'Hôtel', house: 'Location', sale: 'À vendre', night: '/ nuit' },
  ar: { hotel: 'فندق', house: 'للكراء', sale: 'للبيع', night: '/ الليلة' },
  en: { hotel: 'Hotel', house: 'Rental', sale: 'For sale', night: '/ night' },
};

const csvCell = (v) => {
  const s = String(v ?? '').replace(/\s+/g, ' ').trim();
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** The listing's text in `lang` (machine translation when it was written in another language). */
const text = (doc, field, lang) => {
  const tr = doc.translations?.[lang]?.[field];
  return doc.sourceLang !== lang && tr ? tr : doc[field] || '';
};

export const getMetaCatalog = async (req, res, next) => {
  try {
    const lang = ['fr', 'ar', 'en'].includes(req.query.lang) ? req.query.lang : 'fr';
    const only = ['hotels', 'houses', 'sales'].includes(req.query.type) ? req.query.type : null;
    const L = LABEL[lang];
    const site = (process.env.CLIENT_URL || 'https://hotel-dz-three.vercel.app').replace(/\/$/, '');
    const api = (process.env.SERVER_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
    const prefix = lang === 'fr' ? '' : `/${lang}`;
    const imageUrl = (img) => {
      const u = typeof img === 'string' ? img : img?.url;
      if (!u) return '';
      return /^https?:\/\//.test(u) ? u : `${api}${u.startsWith('/') ? '' : '/'}${u}`;
    };
    const link = (path, id) => `${site}${prefix}${path}?utm_source=facebook&utm_medium=paid&utm_campaign=catalog&utm_content=${id}`;

    const approved = { status: 'approved' };
    const [hotels, houses, sales] = await Promise.all([
      !only || only === 'hotels' ? Hotel.find(approved).lean().then(attachPrices) : [],
      !only || only === 'houses' ? House.find(approved).lean() : [],
      !only || only === 'sales' ? HouseForSale.find(approved).lean() : [],
    ]);

    const rows = [];
    for (const h of hotels) {
      if (!h.price) continue; // no active room → no price to advertise
      const p = places(h, lang);
      rows.push({
        id: `hotel-${h._id}`,
        title: `${text(h, 'name', lang)}${h.starRating ? ` ${h.starRating}★` : ''} — ${p.city}`,
        description: text(h, 'description', lang) || `${L.hotel} ${p.city}, ${p.wilaya}`,
        price: `${h.price} ${h.currency || 'DZD'}`,
        link: link(`/hotels/${h._id}`, h._id),
        image_link: imageUrl(h.images?.[0]),
        product_type: `${L.hotel} > ${p.wilaya}`,
        custom_label_0: 'hotel',
        custom_label_1: h.wilaya,
        custom_label_2: h.city,
      });
    }
    for (const h of houses) {
      const { price } = effectivePrice(h);
      const p = places(h, lang);
      rows.push({
        id: `house-${h._id}`,
        title: `${text(h, 'name', lang)} — ${p.city}`,
        description: text(h, 'description', lang) || `${L.house} ${p.city}, ${p.wilaya}`,
        price: `${price} ${h.currency || 'DZD'}`,
        link: link(`/houses/${h._id}`, h._id),
        image_link: imageUrl(h.images?.[0]),
        product_type: `${L.house} > ${p.wilaya}`,
        custom_label_0: 'house',
        custom_label_1: h.wilaya,
        custom_label_2: h.city,
      });
    }
    for (const s of sales) {
      const p = places(s, lang);
      rows.push({
        id: `sale-${s._id}`,
        title: `${text(s, 'title', lang)} — ${p.city}`,
        description: text(s, 'description', lang) || `${L.sale} ${p.city}, ${p.wilaya}`,
        price: `${s.price} ${s.currency || 'DZD'}`,
        link: link(`/sales/${s._id}`, s._id),
        image_link: imageUrl(s.images?.[0]),
        product_type: `${L.sale} > ${p.wilaya}`,
        custom_label_0: 'sale',
        custom_label_1: s.wilaya,
        custom_label_2: s.city,
      });
    }

    const lines = [COLUMNS.join(',')];
    for (const r of rows) {
      if (!r.image_link || !r.price || r.price.startsWith('0 ')) continue; // Meta rejects items without photo or price
      const row = { ...r, description: r.description.slice(0, 4900), availability: 'in stock', condition: 'new', brand: 'Meskan' };
      lines.push(COLUMNS.map((c) => csvCell(row[c])).join(','));
    }

    res.set('Content-Type', 'text/csv; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(`﻿${lines.join('\n')}\n`); // BOM: Arabic shows correctly when opened in Excel
  } catch (err) {
    next(err);
  }
};
