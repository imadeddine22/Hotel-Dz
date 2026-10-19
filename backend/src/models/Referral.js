import mongoose from 'mongoose';

// "Comment nous avez-vous connus ?" — the answer a visitor gives in the welcome notification.
export const REFERRAL_SOURCES = ['Facebook', 'Instagram', 'TikTok', 'YouTube', 'Google', 'Ami ou famille', 'Publicité', 'Autre'];

const referralSchema = new mongoose.Schema(
  {
    source: { type: String, enum: REFERRAL_SOURCES, required: true, index: true },
    other: { type: String, trim: true, maxlength: 120, default: '' }, // details when source is 'Autre'
    lang: { type: String, enum: ['fr', 'ar', 'en'], default: 'fr' },
    page: { type: String, trim: true, maxlength: 200, default: '' }, // where the visitor answered
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // when logged in
  },
  { timestamps: true }
);

const Referral = mongoose.model('Referral', referralSchema);
export default Referral;
