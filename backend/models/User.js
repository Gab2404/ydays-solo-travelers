const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['admin', 'joueur'], 
    default: 'joueur' 
  },
  lastname: { 
    type: String, 
    required: true,
    trim: true
  },
  firstname: { 
    type: String, 
    required: true,
    trim: true
  },
  age: { 
    type: Number,
    min: 0,
    max: 120
  },
  nationality: { 
    type: String,
    trim: true
  },
  sex: { 
    type: String, 
    enum: ['H', 'F', 'Autre'] 
  },
  phone: { 
    type: String,
    trim: true
  },
  
  // Quêtes complétées par l'utilisateur
  completedQuests: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Quest' 
  }],
  
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances de recherche
UserSchema.index({ email: 1 });
UserSchema.index({ phone: 1 });

module.exports = mongoose.model('User', UserSchema);