import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    // Property type discriminator: determines which refs are relevant
    propertyType: {
      type: String,
      enum: ['hotel', 'house'],
      default: 'hotel',
      index: true,
    },

    // Hotel bookings (hotel + room are required when propertyType === 'hotel')
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', index: true },
    room:  { type: mongoose.Schema.Types.ObjectId, ref: 'Room',  index: true },

    // House bookings (house is required when propertyType === 'house')
    house: { type: mongoose.Schema.Types.ObjectId, ref: 'House', index: true },

    checkIn:  { type: Date, required: true },
    checkOut: { type: Date, required: true },
    nights:   { type: Number, required: true, min: 1 },
    guests:   { type: Number, default: 1, min: 1 },
    totalPrice: { type: Number, required: true, min: 0 }, // in `currency`
    // The property's currency when the booking was made (DZD, TND, MAD); never changes afterwards
    currency: { type: String, default: 'DZD' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
      index: true,
    },
    // Payment happens on site at arrival; the owner marks the booking as paid.
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid',
    },
    paidAt: { type: Date },
    // 'on_site' today; 'online' is reserved for a payment gateway (e.g. SofizPay in Algeria)
    paymentMethod: { type: String, enum: ['on_site', 'online'], default: 'on_site' },
    paymentProvider: { type: String, default: '' },
    // Policies snapshot taken when booking (later edits by the owner don't change past bookings)
    discountPercent: { type: Number, default: 0 }, // deal applied when booking (price snapshot)
    instant: { type: Boolean, default: false }, // confirmed at once (instant booking), no owner approval
    freeCancellationUntil: { type: Date, default: null }, // null = no free cancellation
    // Cancelled by the customer after the free-cancellation deadline (pay on site: nothing to refund)
    lateCancellation: { type: Boolean, default: false },
    cancelledBy: { type: String, enum: ['', 'customer', 'owner', 'admin'], default: '' },
    // Set when the owner refuses a booking request
    rejectionReason: { type: String, default: '' },
  },
  { timestamps: true }
);

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
