const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  name: { type: String }, // Nom du groupe (ex: "Voyage Tokyo")
  isGroup: { type: Boolean, default: false },
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' }, // Lien vers le voyage
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastMessage: { type: String },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Chat', ChatSchema);