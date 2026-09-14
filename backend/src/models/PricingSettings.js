import mongoose from 'mongoose';

const pricingSettingsSchema = new mongoose.Schema(
  {
    growthMonthlyPrice: { type: Number, default: 2900 },
    growthYearlyPrice: { type: Number, default: 29000 },
    proMonthlyPrice: { type: Number, default: 6900 },
    proYearlyPrice: { type: Number, default: 69000 }
  },
  { timestamps: true }
);

const PricingSettings = mongoose.model('PricingSettings', pricingSettingsSchema);
export default PricingSettings;
