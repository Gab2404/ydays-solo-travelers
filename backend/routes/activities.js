const router = require('express').Router();
const Activity = require('../models/Activity');

router.get('/', async (req, res) => {
  const activities = [
    { _id: 1, title: "Visite guidée Tokyo", location: "Tokyo", price: 0, category: "Culture" },
    { _id: 2, title: "Cours de Surf", location: "Bali", price: 30, category: "Sport" }
  ];
  res.json(activities);
});

module.exports = router;