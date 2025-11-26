const router = require('express').Router();
const User = require('../models/User');

router.get('/:id', async (req, res) => {
  try {
    // Mock response pour éviter erreur DB
    const mockUser = {
      _id: req.params.id,
      username: "ThomasDev",
      bio: "Développeur voyageur",
      trips: []
    };
    res.status(200).json(mockUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;