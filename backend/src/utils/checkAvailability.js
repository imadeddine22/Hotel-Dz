import Booking from '../models/Booking.js';

/**
 * Count active bookings for a room that overlap the [checkIn, checkOut) range.
 * Two ranges overlap when existing.checkIn < requested.checkOut
 * AND existing.checkOut > requested.checkIn.
 * Only 'pending' and 'confirmed' bookings hold inventory.
 */
export const countOverlapping = async (roomId, checkIn, checkOut, excludeBookingId = null) => {
  const filter = {
    room: roomId,
    status: { $in: ['pending', 'confirmed'] },
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
  };
  if (excludeBookingId) filter._id = { $ne: excludeBookingId };

  return Booking.countDocuments(filter);
};

/**
 * Returns true if at least one unit of the room is free for the date range.
 */
export const isRoomAvailable = async (room, checkIn, checkOut, excludeBookingId = null) => {
  const booked = await countOverlapping(room._id, checkIn, checkOut, excludeBookingId);
  return booked < room.quantity;
};
