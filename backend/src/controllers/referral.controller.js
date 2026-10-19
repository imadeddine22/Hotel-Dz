import Referral, { REFERRAL_SOURCES } from '../models/Referral.js';

// POST /referrals { source, other?, lang?, page? } — a visitor says how they heard about the site
export const createReferral = async (req, res, next) => {
  try {
    const { source, other, lang, page } = req.body;
    await Referral.create({
      source,
      other: source === 'Autre' ? other || '' : '',
      lang,
      page,
      user: req.user?._id,
    });
    res.status(201).json({ success: true, message: 'Thank you for your answer' });
  } catch (err) {
    next(err);
  }
};

// GET /admin/referrals?days=30 — answers per source (every source listed, even at 0) + the latest answers
export const getReferrals = async (req, res, next) => {
  try {
    const days = [7, 30, 90, 365].includes(Number(req.query.days)) ? Number(req.query.days) : 0; // 0 = all time
    const match = days ? { createdAt: { $gte: new Date(Date.now() - days * 86400000) } } : {};
    const [grouped, latest, total] = await Promise.all([
      Referral.aggregate([{ $match: match }, { $group: { _id: '$source', count: { $sum: 1 } } }]),
      Referral.find(match).sort({ createdAt: -1 }).limit(50).populate('user', 'fullName email').lean(),
      Referral.countDocuments(match),
    ]);
    const counts = new Map(grouped.map((g) => [g._id, g.count]));
    const sources = REFERRAL_SOURCES.map((source) => ({ source, count: counts.get(source) || 0 })).sort((a, b) => b.count - a.count);
    res.json({ success: true, total, days, sources, latest });
  } catch (err) {
    next(err);
  }
};
