import Message from '../models/Message.js';

// POST /messages — Public endpoint to send a message to admin
export const sendMessage = async (req, res, next) => {
  try {
    const { name, email, subject, content } = req.body;
    if (!name || !email || !subject || !content) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const message = await Message.create({ name, email, subject, content });
    res.status(201).json({ success: true, message: 'Message sent successfully', data: message });
  } catch (err) {
    next(err);
  }
};

// GET /messages — Admin endpoint to view all messages
export const getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json({ success: true, count: messages.length, messages });
  } catch (err) {
    next(err);
  }
};

// PUT /messages/:id/read — Admin endpoint to mark a message as read
export const markAsRead = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

    message.isRead = true;
    await message.save();

    res.json({ success: true, message });
  } catch (err) {
    next(err);
  }
};

// DELETE /messages/:id — Admin endpoint to delete a message
export const deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

    await message.deleteOne();
    res.json({ success: true, message: 'Message deleted' });
  } catch (err) {
    next(err);
  }
};
