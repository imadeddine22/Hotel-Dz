import Conversation from '../models/Conversation.js';
import Booking from '../models/Booking.js';
import Hotel from '../models/Hotel.js';
import House from '../models/House.js';

const isParty = (conv, user) =>
  user.role === 'admin' || String(conv.customer?._id || conv.customer) === String(user._id) || String(conv.owner?._id || conv.owner) === String(user._id);

const summary = (conv, userId) => {
  const last = conv.messages[conv.messages.length - 1];
  return {
    _id: conv._id,
    booking: conv.booking,
    propertyType: conv.propertyType,
    propertyName: conv.propertyName,
    customer: conv.customer,
    owner: conv.owner,
    lastMessage: last ? { text: last.text.slice(0, 140), sender: last.sender, createdAt: last.createdAt } : null,
    lastMessageAt: conv.lastMessageAt,
    unread: conv.unreadFor(userId),
  };
};

// GET /conversations/booking/:bookingId — the booking's conversation (created on first open)
export const getOrCreateForBooking = async (req, res, next) => {
  try {
    let conv = await Conversation.findOne({ booking: req.params.bookingId });
    if (!conv) {
      const booking = await Booking.findById(req.params.bookingId);
      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
      const property = booking.propertyType === 'house'
        ? await House.findById(booking.house).select('owner name')
        : await Hotel.findById(booking.hotel).select('owner name');
      if (!property) return res.status(404).json({ success: false, message: 'Listing not found' });
      const draft = { customer: booking.customer, owner: property.owner };
      if (!isParty(draft, req.user)) return res.status(403).json({ success: false, message: 'Not authorized' });
      try {
        conv = await Conversation.create({
          booking: booking._id,
          ...draft,
          propertyType: booking.propertyType,
          propertyName: property.name,
        });
      } catch (e) {
        if (e.code !== 11000) throw e; // created meanwhile by the other side
        conv = await Conversation.findOne({ booking: booking._id });
      }
    }
    if (!isParty(conv, req.user)) return res.status(403).json({ success: false, message: 'Not authorized' });
    res.json({ success: true, conversationId: conv._id });
  } catch (err) {
    next(err);
  }
};

// GET /conversations — my conversations (as guest or as owner), newest first
export const getMyConversations = async (req, res, next) => {
  try {
    const convs = await Conversation.find({ $or: [{ customer: req.user._id }, { owner: req.user._id }] })
      .populate('customer', 'fullName avatar')
      .populate('owner', 'fullName avatar')
      .sort({ lastMessageAt: -1 })
      .limit(100);
    const conversations = convs.map((c) => summary(c, req.user._id));
    res.json({ success: true, unread: conversations.reduce((n, c) => n + c.unread, 0), conversations });
  } catch (err) {
    next(err);
  }
};

// GET /conversations/unread — number of unread messages (navbar badge)
export const getUnreadCount = async (req, res, next) => {
  try {
    const convs = await Conversation.find({ $or: [{ customer: req.user._id }, { owner: req.user._id }], 'messages.readAt': null })
      .select('messages.sender messages.readAt');
    res.json({ success: true, unread: convs.reduce((n, c) => n + c.unreadFor(req.user._id), 0) });
  } catch (err) {
    next(err);
  }
};

// GET /conversations/:id — the thread; marks the other side's messages as read
export const getConversation = async (req, res, next) => {
  try {
    const conv = await Conversation.findById(req.params.id)
      .populate('customer', 'fullName avatar')
      .populate('owner', 'fullName avatar')
      .populate('booking', 'checkIn checkOut status nights guests');
    if (!conv) return res.status(404).json({ success: false, message: 'Conversation not found' });
    if (!isParty(conv, req.user)) return res.status(403).json({ success: false, message: 'Not authorized' });

    let changed = false;
    for (const m of conv.messages) {
      if (!m.readAt && String(m.sender) !== String(req.user._id) && req.user.role !== 'admin') {
        m.readAt = new Date();
        changed = true;
      }
    }
    if (changed) await conv.save();
    res.json({ success: true, conversation: conv });
  } catch (err) {
    next(err);
  }
};

// POST /conversations/:id/messages { text }
export const sendMessage = async (req, res, next) => {
  try {
    const text = String(req.body?.text || '').trim();
    if (!text) return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    if (text.length > 2000) return res.status(400).json({ success: false, message: 'Message is too long (2000 characters max)' });

    const conv = await Conversation.findById(req.params.id);
    if (!conv) return res.status(404).json({ success: false, message: 'Conversation not found' });
    const party = String(conv.customer) === String(req.user._id) || String(conv.owner) === String(req.user._id);
    if (!party) return res.status(403).json({ success: false, message: 'Not authorized' });

    conv.messages.push({ sender: req.user._id, text });
    conv.lastMessageAt = new Date();
    await conv.save();
    res.status(201).json({ success: true, message: conv.messages[conv.messages.length - 1] });
  } catch (err) {
    next(err);
  }
};
