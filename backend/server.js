const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connecté !'))
  .catch(err => console.error('❌ Erreur MongoDB:', err));

// Routes
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game_temp');

app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);

const PORT = process.env.PORT || 5000;

// MODIFICATION ICI : '0.0.0.0' permet d'accepter les connexions du téléphone
app.listen(PORT, '0.0.0.0', () => console.log(`Serveur démarré sur le port ${PORT} (Accessible réseau)`));