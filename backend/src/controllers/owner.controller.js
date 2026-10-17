import Hotel from '../models/Hotel.js';
import House from '../models/House.js';
import Booking from '../models/Booking.js';

export const getOwnerStats = async (req, res, next) => {
  try {
    const ownerId = req.user._id;

    const totalHotels = await Hotel.countDocuments({ owner: ownerId });
    const totalHouses = await House.countDocuments({ owner: ownerId });

    const hotelIds = await Hotel.find({ owner: ownerId }).distinct('_id');
    const houseIds = await House.find({ owner: ownerId }).distinct('_id');

    // Consider completed or pending/confirmed bookings for revenue, exclude cancelled
    const bookings = await Booking.find({
      $or: [
        { hotel: { $in: hotelIds } },
        { house: { $in: houseIds } },
      ],
      status: { $ne: 'cancelled' },
    });

    const totalBookings = bookings.length;
    // Unpaid (pending) bookings are not revenue yet
    // One total per currency (a hotel in Tunis is paid in TND): never add them together
    const revenueByCurrency = {};
    for (const b of bookings.filter((x) => x.paymentStatus === 'paid')) {
      const cur = b.currency || 'DZD';
      revenueByCurrency[cur] = (revenueByCurrency[cur] || 0) + (b.totalPrice || 0);
    }
    const totalRevenue = revenueByCurrency.DZD || 0;

    res.status(200).json({
      success: true,
      totalHotels,
      totalHouses,
      totalBookings,
      totalRevenue,
      revenueByCurrency,
    });
  } catch (error) {
    next(error);
  }
};
