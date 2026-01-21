const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    minlength: 3
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide']
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  
  // Profil utilisateur
  firstName: { 
    type: String,
    trim: true
  },
  lastName: { 
    type: String,
    trim: true
  },
  bio: { 
    type: String,
    maxlength: 500
  },
  avatar: { 
    type: String 
  },
  
  // Ville sélectionnée
  selectedCity: {
    type: String,
    default: null
  },
  
  // Progression
  xp: { 
    type: Number, 
    default: 0 
  },
  level: { 
    type: Number, 
    default: 1 
  },
  
  // Parcours complétés ⭐ MISE À JOUR - Avec date de complétion
  completedPaths: [{
    pathId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Path',
      required: true
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Quêtes complétées avec photos
  completedQuests: [{
    questId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quest',
      required: true
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    photoUrl: {
      type: String,
      required: true
    }
  }],
  
  // Badges
  badges: [{
    type: String
  }],
  
  // Rôle
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  certified: { 
    type: Boolean, 
    default: false 
  },
  
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ selectedCity: 1 });

// Méthode pour calculer le niveau basé sur l'XP
UserSchema.methods.calculateLevel = function() {
  this.level = Math.floor(this.xp / 1000) + 1;
  return this.level;
};

// Méthode pour vérifier si une quête est complétée
UserSchema.methods.hasCompletedQuest = function(questId) {
  return this.completedQuests.some(
    cq => cq.questId.toString() === questId.toString()
  );
};

// Méthode pour vérifier si un parcours est complété
UserSchema.methods.hasCompletedPath = function(pathId) {
  return this.completedPaths.some(
    cp => cp.pathId.toString() === pathId.toString()
  );
};

module.exports = mongoose.model('User', UserSchema);