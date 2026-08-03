import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    booking:  { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    amount:      { type: Number, required: true, min: 0 }, // total payé par le client (DZD)
    platformFee: { type: Number, default: 0 },              // 10% → HotelsDZ
    ownerAmount: { type: Number, default: 0 },              // 90% → propriétaire
    currency:    { type: String, default: 'dzd' },

    method: { type: String, enum: ['cib', 'edahabia', ''], default: '' },

    chargilyCheckoutId:  { type: String, index: true },
    chargilyCheckoutUrl: { type: String },

    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'canceled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;

