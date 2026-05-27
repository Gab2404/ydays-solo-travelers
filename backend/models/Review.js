const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  questId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quest',
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: null,
  },
}, {
  timestamps: true,
});

// Un seul avis par utilisateur par quête
ReviewSchema.index({ questId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
