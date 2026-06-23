import Room from '../models/Room.js';
import Hotel from '../models/Hotel.js';
import { uploadMany, destroyImage } from '../utils/cloudinaryUpload.js';
import { countOverlapping } from '../utils/checkAvailability.js';

const parseArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const p = JSON.parse(value);
    return Array.isArray(p) ? p : [value];
  } catch {
    return value.split(',').map((s) => s.trim()).filter(Boolean);
  }
};

const ownsHotel = (req, hotel) =>
  req.user.role === 'admin' || hotel.owner.toString() === req.user._id.toString();

// GET /hotels/:hotelId/rooms
export const getRoomsByHotel = async (req, res, next) => {
  try {
    const rooms = await Room.find({ hotel: req.params.hotelId, isActive: true });
    res.json({ success: true, count: rooms.length, rooms });
  } catch (err) {
    next(err);
  }
};

// GET /rooms/:id
export const getRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate('hotel', 'name wilaya city');
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, room });
  } catch (err) {
    next(err);
  }
};

// POST /hotels/:hotelId/rooms  (owner)
export const createRoom = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.hotelId);
    if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });
    if (!ownsHotel(req, hotel)) {
      return res.status(403).json({ success: false, message: 'Not your hotel' });
    }

    const images = req.files?.length ? await uploadMany(req.files, 'dzhotels/rooms') : [];

    const room = await Room.create({
      ...req.body,
      amenities: parseArray(req.body.amenities),
      hotel: hotel._id,
      images,
    });

    res.status(201).json({ success: true, room });
  } catch (err) {
    next(err);
  }
};

// PUT /rooms/:id  (owner)
export const updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate('hotel', 'owner');
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    if (!ownsHotel(req, room.hotel)) {
      return res.status(403).json({ success: false, message: 'Not your hotel' });
    }

    const fields = ['type', 'title', 'description', 'pricePerNight', 'capacity', 'bedsCount', 'quantity', 'isActive'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) room[f] = req.body[f];
    });
    if (req.body.amenities !== undefined) room.amenities = parseArray(req.body.amenities);
    if (req.files?.length) {
      const uploaded = await uploadMany(req.files, 'dzhotels/rooms');
      room.images.push(...uploaded);
    }

    await room.save();
    res.json({ success: true, room });
  } catch (err) {
    next(err);
  }
};

// DELETE /rooms/:id  (owner)
export const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate('hotel', 'owner');
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    if (!ownsHotel(req, room.hotel)) {
      return res.status(403).json({ success: false, message: 'Not your hotel' });
    }

    await Promise.all(room.images.map((img) => destroyImage(img.publicId)));
    await room.deleteOne();
    res.json({ success: true, message: 'Room deleted' });
  } catch (err) {
    next(err);
  }
};

// POST /rooms/:id/availability  { checkIn, checkOut }
export const checkRoomAvailability = async (req, res, next) => {
  try {
    const { checkIn, checkOut } = req.body;
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    if (!checkIn || !checkOut) {
      return res.status(400).json({ success: false, message: 'checkIn and checkOut are required' });
    }

    const booked = await countOverlapping(room._id, new Date(checkIn), new Date(checkOut));
    const available = booked < room.quantity;

    res.json({
      success: true,
      available,
      remaining: Math.max(0, room.quantity - booked),
      quantity: room.quantity,
    });
  } catch (err) {
    next(err);
  }
};
