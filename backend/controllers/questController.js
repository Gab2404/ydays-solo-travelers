const Quest = require('../models/Quest');
const Path = require('../models/Path');
const { validateQuestData } = require('../utils/validation');

// @desc    Récupérer les quêtes d'un parcours
// @route   GET /api/quests/path/:pathId
// @access  Public
const getQuestsByPath = async (req, res) => {
  try {
    const quests = await Quest.find({ pathId: req.params.pathId }).sort({ order: 1 });
    res.status(200).json(quests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération des quêtes' });
  }
};

// @desc    Créer une quête
// @route   POST /api/quests
// @access  Private (Admin)
const createQuest = async (req, res) => {
  try {
    const { title, description, clue, location, pathId, order } = req.body;

    // Validation
    const validation = validateQuestData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.errors.join(', ') });
    }

    // Vérifier que le parcours existe
    const path = await Path.findById(pathId);
    if (!path) {
      return res.status(404).json({ message: 'Parcours introuvable' });
    }

    const newQuest = new Quest({
      title,
      description,
      clue,
      location,
      pathId,
      order: order || path.quests.length + 1
    });

    const savedQuest = await newQuest.save();

    // Ajouter la quête au parcours
    await Path.findByIdAndUpdate(pathId, {
      $push: { quests: savedQuest._id }
    });

    res.status(201).json(savedQuest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la création de la quête' });
  }
};

// @desc    Modifier une quête
// @route   PUT /api/quests/:id
// @access  Private (Admin)
const updateQuest = async (req, res) => {
  try {
    const { title, description, clue, location, order } = req.body;

    const quest = await Quest.findById(req.params.id);
    
    if (!quest) {
      return res.status(404).json({ message: 'Quête introuvable' });
    }

    quest.title = title || quest.title;
    quest.description = description || quest.description;
    quest.clue = clue !== undefined ? clue : quest.clue;
    quest.location = location || quest.location;
    quest.order = order !== undefined ? order : quest.order;

    const updatedQuest = await quest.save();
    res.status(200).json(updatedQuest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la modification de la quête' });
  }
};

// @desc    Supprimer une quête
// @route   DELETE /api/quests/:id
// @access  Private (Admin)
const deleteQuest = async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id);
    
    if (!quest) {
      return res.status(404).json({ message: 'Quête introuvable' });
    }

    // Retirer la référence du parcours
    await Path.findByIdAndUpdate(quest.pathId, {
      $pull: { quests: quest._id }
    });

    // Supprimer la quête
    await Quest.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Quête supprimée avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la suppression de la quête' });
  }
};

module.exports = {
  getQuestsByPath,
  createQuest,
  updateQuest,
  deleteQuest
};