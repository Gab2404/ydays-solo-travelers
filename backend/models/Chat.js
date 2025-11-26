const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  name: { type: String },
  isGroup: { type: Boolean, default: false },
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastMessage: { type: String },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Chat', ChatSchema);