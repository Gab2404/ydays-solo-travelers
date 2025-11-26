const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- CONNEXION MONGODB ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connecté !'))
  .catch(err => console.error('❌ Erreur connexion MongoDB:', err));

// Import des Routes
const authRoutes = require('./routes/auth');
const tripRoutes = require('./routes/trips');
const activityRoutes = require('./routes/activities');
const chatRoutes = require('./routes/chats');
const userRoutes = require('./routes/users');

// Utilisation des Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));