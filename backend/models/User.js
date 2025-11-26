const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'joueur'], default: 'joueur' },
  lastname: { type: String, required: true },
  firstname: { type: String, required: true },
  age: { type: Number },
  nationality: { type: String },
  sex: { type: String, enum: ['H', 'F', 'Autre'] },
  phone: { type: String },
  
  completedQuests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quest' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);