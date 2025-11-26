const router = require('express').Router();
const Path = require('../models/Path');
const Quest = require('../models/Quest');

// --- PARTIE ADMIN ---

// Créer un parcours
router.post('/paths', async (req, res) => {
  try {
    const newPath = new Path(req.body);
    const savedPath = await newPath.save();
    res.status(200).json(savedPath);
  } catch (err) { res.status(500).json(err); }
});

// Ajouter une quête à un parcours
router.post('/quests', async (req, res) => {
  try {
    const newQuest = new Quest(req.body);
    const savedQuest = await newQuest.save();

    // On lie la quête au parcours
    await Path.findByIdAndUpdate(req.body.pathId, { 
      $push: { quests: savedQuest._id } 
    });

    res.status(200).json(savedQuest);
  } catch (err) { res.status(500).json(err); }
});

// --- PARTIE JOUEUR ---
router.get('/paths', async (req, res) => {
  try {
    const paths = await Path.find().populate('quests');
    res.json(paths);
  } catch (err) { res.status(500).json(err); }
});

// Récupérer un parcours complet avec ses quêtes
router.get('/paths/:id', async (req, res) => {
  try {
    const path = await Path.findById(req.params.id).populate('quests');
    res.json(path);
  } catch (err) { res.status(500).json(err); }
});

module.exports = router;