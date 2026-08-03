import crypto from 'crypto';
import chargilyClient from '../config/chargily.js';
import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import { sendEmail } from '../utils/sendEmail.js';

const CLIENT_URL  = process.env.CLIENT_URL  || 'http://localhost:3000';
const SERVER_URL  = process.env.SERVER_URL  || 'http://localhost:5000';
const COMMISSION  = 0.10; // 10% plateforme

/* ─────────────────────────────────────────────────────────────
   POST /payments/checkout  { bookingId }
   Crée (ou réutilise) un Payment + redirige vers Chargily
───────────────────────────────────────────────────────────── */
export const createCheckout = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate('hotel', 'name')
      .populate('room', 'title')
      .populate('house', 'name');

    if (!booking)
      return res.status(404).json({ success: false, message: 'Réservation introuvable' });

    if (booking.customer.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Non autorisé' });

    if (booking.paymentStatus === 'paid')
      return res.status(400).json({ success: false, message: 'Réservation déjà payée' });

    // Calcul de la commission
    const baseAmount  = booking.totalPrice;          // montant propriétaire
    const platformFee = Math.round(baseAmount * COMMISSION);
    const totalAmount = baseAmount + platformFee;     // ce que paie le client

    // Créer ou réutiliser un Payment en attente
    let payment = await Payment.findOne({ booking: booking._id, status: 'pending' });
    if (!payment) {
      payment = await Payment.create({
        booking:     booking._id,
        customer:    req.user._id,
        amount:      totalAmount,
        platformFee,
        ownerAmount: baseAmount,
        currency:    'dzd',
      });
    }

    // Determine property name based on booking type
    const propertyName = booking.propertyType === 'house'
      ? (booking.house?.name || 'Hébergement HotelsDZ')
      : (booking.hotel?.name || 'Hébergement HotelsDZ');

    const checkout = await chargilyClient.createCheckout({
      amount:           totalAmount,
      currency:         'dzd',
      success_url:      `${CLIENT_URL}/payment/success?booking=${booking._id}`,
      failure_url:      `${CLIENT_URL}/payment/failed?booking=${booking._id}`,
      webhook_endpoint: `${SERVER_URL}/api/v1/payments/webhook`,
      description:      `Réservation — ${propertyName} (${booking.nights} nuit(s))`,
      locale:           'fr',
      metadata: [{ booking_id: booking._id.toString(), payment_id: payment._id.toString() }],
    });

    payment.chargilyCheckoutId  = checkout.id;
    payment.chargilyCheckoutUrl = checkout.checkout_url;
    await payment.save();

    res.json({
      success: true,
      url:        checkout.checkout_url,
      checkoutId: checkout.id,
      amount:     totalAmount,
      platformFee,
      ownerAmount: baseAmount,
    });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────────
   POST /payments/webhook  — corps brut, signature dans header
───────────────────────────────────────────────────────────── */
export const handleWebhook = async (req, res) => {
  try {
    const signature = req.get('signature');
    const rawBody   = req.body; // Buffer (express.raw)
    const secret    = process.env.CHARGILY_SECRET_KEY || '';

    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    if (!signature || signature !== expected) {
      return res.status(403).json({ success: false, message: 'Signature invalide' });
    }

    const event    = JSON.parse(rawBody.toString());
    const checkout = event.data;
    const meta     = Array.isArray(checkout.metadata)
      ? checkout.metadata[0]
      : checkout.metadata || {};

    if (event.type === 'checkout.paid') {
      // Mettre à jour le Payment
      const payment = await Payment.findOne({ chargilyCheckoutId: checkout.id });
      if (payment) {
        payment.status = 'paid';
        payment.method = checkout.payment_method || payment.method;
        await payment.save();
      }

      // Mettre à jour la Booking
      const booking = await Booking.findById(meta.booking_id)
        .populate('customer', 'email fullName')
        .populate('hotel',    'name')
        .populate('house',    'name');

      if (booking) {
        booking.status        = 'confirmed';
        booking.paymentStatus = 'paid';
        await booking.save();

        // Determine property name for the email
        const propName = booking.propertyType === 'house'
          ? (booking.house?.name || 'HotelsDZ')
          : (booking.hotel?.name || 'HotelsDZ');

        // Email de confirmation
        await sendEmail({
          to:      booking.customer.email,
          subject: `✅ Réservation confirmée — ${propName}`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
              <h2 style="color:#00bcd4">Réservation confirmée !</h2>
              <p>Bonjour <strong>${booking.customer.fullName}</strong>,</p>
              <p>Votre réservation à <strong>${propName}</strong> est confirmée ✅</p>
              <table style="width:100%;border-collapse:collapse;margin:16px 0">
                <tr><td style="padding:8px;color:#666">Check-in</td>
                    <td style="padding:8px;font-weight:bold">${new Date(booking.checkIn).toLocaleDateString('fr-DZ')}</td></tr>
                <tr><td style="padding:8px;color:#666">Check-out</td>
                    <td style="padding:8px;font-weight:bold">${new Date(booking.checkOut).toLocaleDateString('fr-DZ')}</td></tr>
                <tr><td style="padding:8px;color:#666">Durée</td>
                    <td style="padding:8px;font-weight:bold">${booking.nights} nuit(s)</td></tr>
                <tr style="background:#f0fdfa">
                    <td style="padding:8px;color:#666">Total payé</td>
                    <td style="padding:8px;font-weight:bold;color:#00bcd4">${(payment?.amount || booking.totalPrice).toLocaleString('fr')} DZD</td></tr>
              </table>
              <p style="color:#666;font-size:14px">Merci d'avoir choisi HotelsDZ 🏨</p>
            </div>`,
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

/* ─────────────────────────────────────────────────────────────
   GET /payments/:bookingId  — statut du paiement
───────────────────────────────────────────────────────────── */
export const getPaymentStatus = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ booking: req.params.bookingId }).sort({ createdAt: -1 });
    if (!payment)
      return res.status(404).json({ success: false, message: 'Aucun paiement trouvé' });

    if (payment.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Non autorisé' });

    res.json({ success: true, payment });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────────
   POST /payments/retry/:bookingId  — recréer un checkout
───────────────────────────────────────────────────────────── */
export const retryCheckout = async (req, res, next) => {
  try {
    req.body.bookingId = req.params.bookingId;
    // Supprimer l'ancien pending pour en créer un nouveau
    await Payment.deleteOne({ booking: req.params.bookingId, status: 'pending' });
    return createCheckout(req, res, next);
  } catch (err) {
    next(err);
  }
};





