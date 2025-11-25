const router = require('express').Router();
const Chat = require('../models/Chat');

// GET les chats d'un utilisateur
router.get('/:userId', async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: { $in: [req.params.userId] }
    }).sort({ updatedAt: -1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json(err);
  }
});

// POST Créer ou Récupérer un chat de groupe pour un voyage
router.post('/group', async (req, res) => {
  const { tripId, tripName, participants } = req.body;

  try {
    // 1. On regarde si le chat existe déjà pour ce voyage
    const existingChat = await Chat.findOne({ tripId: tripId });
    
    if (existingChat) {
      return res.status(200).json(existingChat);
    }

    // 2. Sinon on le crée
    const newChat = new Chat({
      name: `Groupe: ${tripName}`,
      isGroup: true,
      tripId: tripId,
      participants: participants,
      lastMessage: "Bienvenue dans le groupe ! 👋"
    });

    const savedChat = await newChat.save();
    res.status(200).json(savedChat);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;