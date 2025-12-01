const mongoose = require('mongoose');

const QuestSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true,
    trim: true
  },
  clue: { 
    type: String,
    trim: true
  },
  
  // Coordonnées GPS du point d'intérêt
  location: {
    lat: { 
      type: Number, 
      required: true,
      min: -90,
      max: 90
    },
    lng: { 
      type: Number, 
      required: true,
      min: -180,
      max: 180
    },
    address: { 
      type: String,
      trim: true
    }
  },
  
  // Ordre de l'étape dans le parcours
  order: { 
    type: Number,
    default: 0
  },
  
  // Référence au parcours parent
  pathId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Path',
    required: true
  },
  
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances
QuestSchema.index({ pathId: 1, order: 1 });

module.exports = mongoose.model('Quest', QuestSchema);