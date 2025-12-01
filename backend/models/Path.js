const mongoose = require('mongoose');

const PathSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  city: { 
    type: String, 
    required: true,
    trim: true
  },
  difficulty: { 
    type: String, 
    enum: ['Culturel', 'Sportif', 'Culinaire', 'Détente', 'Mixte'],
    default: 'Mixte' 
  },
  
  description: { 
    type: String,
    trim: true
  },
  
  // Liste des étapes/quêtes du parcours
  quests: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Quest' 
  }],
  
  // Créateur du parcours
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  
  // Métadonnées
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances
PathSchema.index({ city: 1 });
PathSchema.index({ difficulty: 1 });
PathSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Path', PathSchema);