const mongoose = require('mongoose');

const PathSchema = new mongoose.Schema({
  title: { type: String, required: true },
  city: { type: String, required: true },
  difficulty: { type: String, enum: ['Facile', 'Moyen', 'Difficile'], default: 'Moyen' },
  description: { type: String },
  quests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quest' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Path', PathSchema);