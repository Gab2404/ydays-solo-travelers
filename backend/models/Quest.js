const mongoose = require('mongoose');

const QuestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  clue: { type: String },
  location: {
    lat: Number,
    lng: Number,
    address: String
  },
  order: { type: Number }, 
  pathId: { type: mongoose.Schema.Types.ObjectId, ref: 'Path' }
});

module.exports = mongoose.model('Quest', QuestSchema);