import Booking from '../models/Booking.js';

/**
 * How long a booking request waits for the owner's answer while holding the dates.
 * Without a limit, requests the owner never answers would block rooms/houses forever.
 */
export const REQUEST_HOLD_MS = 48 * 60 * 60 * 1000;

/** Bookings that currently hold inventory: confirmed, or pending and still within the hold window. */
export const holdingInventory = () => ({
  $or: [
    { status: 'confirmed' },
    { status: 'pending', createdAt: { $gt: new Date(Date.now() - REQUEST_HOLD_MS) } },
  ],
});

/** True when a pending request was left unanswered past the hold window (its dates may have been taken). */
export const requestExpired = (booking) =>
  booking.status === 'pending' && Date.now() - new Date(booking.createdAt).getTime() > REQUEST_HOLD_MS;

/**
 * Count bookings for a room that overlap the [checkIn, checkOut) range.
 * Two ranges overlap when existing.checkIn < requested.checkOut
 * AND existing.checkOut > requested.checkIn.
 */
export const countOverlapping = async (roomId, checkIn, checkOut, excludeBookingId = null) => {
  const filter = {
    room: roomId,
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
    ...holdingInventory(),
  };
  if (excludeBookingId) filter._id = { $ne: excludeBookingId };

  return Booking.countDocuments(filter);
};

/** Count bookings for a HOUSE that overlap the [checkIn, checkOut) range. */
export const countOverlappingHouse = async (houseId, checkIn, checkOut, excludeBookingId = null) => {
  const filter = {
    house: houseId,
    propertyType: 'house',
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
    ...holdingInventory(),
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

/** Is the property of an existing booking still free for its own dates (ignoring the booking itself)? */
export const isBookingStillAvailable = async (booking, Room) => {
  if (booking.propertyType === 'house') {
    return (await countOverlappingHouse(booking.house._id || booking.house, booking.checkIn, booking.checkOut, booking._id)) === 0;
  }
  const room = await Room.findById(booking.room._id || booking.room);
  return Boolean(room) && isRoomAvailable(room, booking.checkIn, booking.checkOut, booking._id);
};
