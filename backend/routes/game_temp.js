const router = require('express').Router();
const Path = require('../models/Path');
const Quest = require('../models/Quest');

// --- PARTIE ADMIN (CRÉATION) ---

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

// --- PARTIE ADMIN (SUPPRESSION) ---

// Supprimer une quête
router.delete('/quests/:id', async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id);
    if (!quest) return res.status(404).json("Quête introuvable");

    // 1. Retirer la référence de la quête dans le parcours parent
    await Path.findByIdAndUpdate(quest.pathId, {
      $pull: { quests: quest._id }
    });

    // 2. Supprimer la quête elle-même
    await Quest.findByIdAndDelete(req.params.id);

    res.status(200).json("Quête supprimée avec succès");
  } catch (err) { 
    console.error(err);
    res.status(500).json(err); 
  }
});

// Supprimer un parcours entier
router.delete('/paths/:id', async (req, res) => {
  try {
    const path = await Path.findById(req.params.id);
    if (!path) return res.status(404).json("Parcours introuvable");

    // 1. Supprimer toutes les quêtes associées à ce parcours
    await Quest.deleteMany({ _id: { $in: path.quests } });

    // 2. Supprimer le parcours
    await Path.findByIdAndDelete(req.params.id);

    res.status(200).json("Parcours et ses quêtes supprimés");
  } catch (err) { 
    console.error(err);
    res.status(500).json(err); 
  }
});

// --- PARTIE JOUEUR (LECTURE) ---

// Récupérer tous les parcours
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