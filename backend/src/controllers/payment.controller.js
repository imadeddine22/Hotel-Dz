import crypto from 'crypto';
import chargilyClient from '../config/chargily.js';
import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import { sendEmail } from '../utils/sendEmail.js';

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';

// POST /payments/checkout  (customer)  { bookingId }
export const createCheckout = async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId).populate('hotel', 'name');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not your booking' });
    }
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Booking already paid' });
    }

    // Create (or reuse) a pending Payment record
    let payment = await Payment.findOne({ booking: booking._id, status: 'pending' });
    if (!payment) {
      payment = await Payment.create({
        booking: booking._id,
        customer: req.user._id,
        amount: booking.totalPrice,
        currency: 'dzd',
      });
    }

    const checkout = await chargilyClient.createCheckout({
      amount: booking.totalPrice,
      currency: 'dzd',
      success_url: `${CLIENT_URL}/payment/success?booking=${booking._id}`,
      failure_url: `${CLIENT_URL}/payment/failed?booking=${booking._id}`,
      webhook_endpoint: `${SERVER_URL}/api/v1/payments/webhook`,
      metadata: [{ booking_id: booking._id.toString(), payment_id: payment._id.toString() }],
    });

    payment.chargilyCheckoutId = checkout.id;
    payment.chargilyCheckoutUrl = checkout.checkout_url;
    await payment.save();

    res.json({ success: true, url: checkout.checkout_url, checkoutId: checkout.id });
  } catch (err) {
    next(err);
  }
};

// POST /payments/webhook  — raw body, signature in 'signature' header
export const handleWebhook = async (req, res) => {
  try {
    const signature = req.get('signature');
    const rawBody = req.body; // Buffer (express.raw)
    const secret = process.env.CHARGILY_SECRET_KEY || '';

    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    if (!signature || signature !== expected) {
      return res.status(403).json({ success: false, message: 'Invalid signature' });
    }

    const event = JSON.parse(rawBody.toString());
    const checkout = event.data;
    const meta = Array.isArray(checkout.metadata) ? checkout.metadata[0] : checkout.metadata || {};

    if (event.type === 'checkout.paid') {
      const payment = await Payment.findOne({ chargilyCheckoutId: checkout.id });
      if (payment) {
        payment.status = 'paid';
        payment.method = checkout.payment_method || payment.method;
        await payment.save();
      }

      const booking = await Booking.findById(meta.booking_id).populate('customer', 'email fullName').populate('hotel', 'name');
      if (booking) {
        booking.status = 'confirmed';
        booking.paymentStatus = 'paid';
        await booking.save();

        await sendEmail({
          to: booking.customer.email,
          subject: `Réservation confirmée — ${booking.hotel.name}`,
          html: `<h2>Bonjour ${booking.customer.fullName},</h2>
            <p>Votre réservation à <b>${booking.hotel.name}</b> est confirmée ✅</p>
            <p>Du ${booking.checkIn.toDateString()} au ${booking.checkOut.toDateString()} —
            ${booking.nights} nuit(s), total <b>${booking.totalPrice} DZD</b>.</p>
            <p>Merci d'avoir choisi DzHotels.</p>`,
        });
      }
    } else if (event.type === 'checkout.failed' || event.type === 'checkout.canceled') {
      const payment = await Payment.findOne({ chargilyCheckoutId: checkout.id });
      if (payment) {
        payment.status = event.type === 'checkout.failed' ? 'failed' : 'canceled';
        await payment.save();
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(400).json({ success: false, message: 'Webhook processing failed' });
  }
};

// GET /payments/:bookingId  — payment status for a booking
export const getPaymentStatus = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ booking: req.params.bookingId }).sort({ createdAt: -1 });
    if (!payment) return res.status(404).json({ success: false, message: 'No payment found' });

    if (payment.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, payment });
  } catch (err) {
    next(err);
  }
};
