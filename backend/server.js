const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Connexion DB
connectDB();

// Routes
<<<<<<< HEAD
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game_temp');
=======
app.use('/api/auth', require('./routes/auth'));
app.use('/api/paths', require('./routes/paths'));
app.use('/api/quests', require('./routes/quests'));
app.use('/api/users', require('./routes/users'));
>>>>>>> main

// Error Handler (en dernier)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => 
  console.log(`✅ Serveur démarré sur le port ${PORT}`)
);