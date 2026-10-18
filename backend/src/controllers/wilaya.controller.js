import Wilaya from '../models/Wilaya.js';
import Hotel from '../models/Hotel.js';
import House from '../models/House.js';
import { getCommunes } from '../utils/communes.js';
import { exactRegex } from '../utils/searchRegex.js';

export const getWilayas = async (req, res, next) => {
  try {
    const wilayas = await Wilaya.find({}).sort({ code: 1, name: 1 });
    res.json({ success: true, wilayas });
  } catch (error) {
    next(error);
  }
};

// GET /wilayas/popular?limit=12 — wilayas with the most approved hotels + houses: [{ wilaya, count }]
// (the footer used to download 100 full listings on every page just to compute this)
export const getPopularWilayas = async (req, res, next) => {
  try {
    const limit = Math.min(69, Math.max(1, parseInt(req.query.limit, 10) || 12));
    const group = [{ $match: { status: 'approved', wilaya: { $type: 'string', $ne: '' } } }, { $group: { _id: '$wilaya', count: { $sum: 1 } } }];
    const [hotels, houses] = await Promise.all([Hotel.aggregate(group), House.aggregate(group)]);
    const count = new Map();
    for (const { _id, count: n } of [...hotels, ...houses]) count.set(_id, (count.get(_id) || 0) + n);
    const wilayas = [...count]
      .map(([wilaya, n]) => ({ wilaya, count: n }))
      .sort((a, b) => b.count - a.count || a.wilaya.localeCompare(b.wilaya))
      .slice(0, limit);
    res.set('Cache-Control', 'public, max-age=600');
    res.json({ success: true, wilayas });
  } catch (error) {
    next(error);
  }
};

// GET /wilayas/:wilaya/communes — :wilaya is the official code (1-69) or a name (French, ASCII or Arabic)
export const getWilayaCommunes = (req, res) => {
  const result = getCommunes(req.params.wilaya);
  if (!result) return res.status(404).json({ success: false, message: 'Wilaya not found' });
  res.set('Cache-Control', 'public, max-age=86400');
  res.json({ success: true, wilaya: result.wilaya, count: result.communes.length, communes: result.communes });
};

export const addWilaya = async (req, res, next) => {
  try {
    const { name, code } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const exists = await Wilaya.findOne({ name: exactRegex(name) });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Wilaya already exists' });
    }

    let finalCode = code;
    if (!finalCode) {
      const maxCode = await Wilaya.findOne({}).sort({ code: -1 });
      finalCode = maxCode && maxCode.code ? maxCode.code + 1 : 1;
    }

    const wilaya = await Wilaya.create({ name, code: finalCode });
    res.status(201).json({ success: true, wilaya });
  } catch (error) {
    next(error);
  }
};
