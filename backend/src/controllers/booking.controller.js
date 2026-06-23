import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import Hotel from '../models/Hotel.js';
import { countOverlapping } from '../utils/checkAvailability.js';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// POST /bookings  (customer)
export const createBooking = async (req, res, next) => {
  try {
    const { roomId, checkIn, checkOut, guests = 1 } = req.body;

    const room = await Room.findById(roomId).populate('hotel', 'name status');
    if (!room || !room.isActive) {
      return res.status(404).json({ success: false, message: 'Room not available' });
    }
    if (room.hotel.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Hotel is not available for booking' });
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ success: false, message: 'Invalid dates' });
    }
    if (end <= start) {
      return res.status(400).json({ success: false, message: 'checkOut must be after checkIn' });
    }
    if (start < new Date().setHours(0, 0, 0, 0)) {
      return res.status(400).json({ success: false, message: 'checkIn cannot be in the past' });
    }
    if (guests > room.capacity) {
      return res.status(400).json({ success: false, message: `Room capacity is ${room.capacity} guests` });
    }

    // Availability check
    const booked = await countOverlapping(room._id, start, end);
    if (booked >= room.quantity) {
      return res.status(409).json({ success: false, message: 'No rooms available for these dates' });
    }

    const nights = Math.round((end - start) / MS_PER_DAY);
    const totalPrice = nights * room.pricePerNight;

    const booking = await Booking.create({
      customer: req.user._id,
      hotel: room.hotel._id,
      room: room._id,
      checkIn: start,
      checkOut: end,
      nights,
      guests,
      totalPrice,
      status: 'pending',
      paymentStatus: 'unpaid',
    });

    res.status(201).json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};

// GET /bookings/my  (customer)
export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ customer: req.user._id })
      .populate('hotel', 'name wilaya city images')
      .populate('room', 'title type pricePerNight')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    next(err);
  }
};

// GET /bookings/owner  (owner) — bookings on the owner's hotels
export const getOwnerBookings = async (req, res, next) => {
  try {
    const hotelIds = await Hotel.find({ owner: req.user._id }).distinct('_id');
    const bookings = await Booking.find({ hotel: { $in: hotelIds } })
      .populate('hotel', 'name wilaya city')
      .populate('room', 'title type')
      .populate('customer', 'fullName email phone')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    next(err);
  }
};

// PUT /bookings/:id/cancel
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('hotel', 'owner');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const isCustomer = booking.customer.toString() === req.user._id.toString();
    const isOwner = booking.hotel.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isCustomer && !isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (['cancelled', 'completed'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: `Booking already ${booking.status}` });
    }

    booking.status = 'cancelled';
    if (booking.paymentStatus === 'paid') booking.paymentStatus = 'refunded';
    await booking.save();

    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};
