const router = require('express').Router();
const Trip = require('../models/Trip');

// GET all trips
router.get('/', async (req, res) => {
  try {
    const trips = await Trip.find()
      .populate('organizer', 'username') // On récupère le nom de l'organisateur
      .populate('participants', 'username'); // On récupère les noms des participants
    res.json(trips);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET un voyage spécifique
router.get('/:id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('organizer', 'username bio')
      .populate('participants', 'username');
    res.json(trip);
  } catch (err) {
    res.status(500).json(err);
  }
});

// POST Rejoindre ou Quitter un voyage
router.post('/:id/join', async (req, res) => {
  const { userId } = req.body; // On reçoit l'ID de celui qui clique
  
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json("Voyage introuvable");

    // Vérifier si l'user est déjà participant
    if (trip.participants.includes(userId)) {
      // SI OUI : On le retire (Pull)
      await trip.updateOne({ $pull: { participants: userId } });
      res.status(200).json("Vous avez quitté le voyage");
    } else {
      // SI NON : On l'ajoute (Push)
      await trip.updateOne({ $push: { participants: userId } });
      res.status(200).json("Vous avez rejoint le voyage !");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// POST Créer un voyage
router.post('/', async (req, res) => {
  const newTrip = new Trip(req.body);
  try {
    const savedTrip = await newTrip.save();
    res.status(200).json(savedTrip);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;