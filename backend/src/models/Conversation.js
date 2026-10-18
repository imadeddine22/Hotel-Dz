import mongoose from 'mongoose';

/** Messages between a guest and the owner of the property, one conversation per booking. */
const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    readAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const conversationSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    propertyType: { type: String, enum: ['hotel', 'house'], required: true },
    propertyName: { type: String, default: '' },
    messages: [messageSchema],
    lastMessageAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

/** Messages in this conversation that `userId` hasn't read yet (sent by the other side). */
conversationSchema.methods.unreadFor = function (userId) {
  return this.messages.filter((m) => !m.readAt && String(m.sender) !== String(userId)).length;
};

export default mongoose.model('Conversation', conversationSchema);
