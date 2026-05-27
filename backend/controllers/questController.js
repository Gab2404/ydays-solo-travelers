const Quest = require('../models/Quest');
const Path = require('../models/Path');
const User = require('../models/User');
const questService = require('../services/questService'); // Import du service de calcul
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

// @desc    Valider une quête avec une photo ET vérification GPS
// @route   POST /api/quests/:id/validate
// @access  Private
const validateQuest = async (req, res) => {
  try {
    const questId = req.params.id;
    const userId = req.user.id;
    // Récupération des coordonnées envoyées par le mobile
    const { latitude, longitude } = req.body; 

    // 1. VÉRIFICATION GPS (Nouvelle brique de sécurité)
    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Coordonnées GPS manquantes' });
    }

    const proximity = await questService.checkProximity(questId, latitude, longitude);
    if (!proximity.isNearby) {
      return res.status(400).json({ 
        message: `Vous êtes trop loin (${proximity.distanceMeters}m). Rapprochez-vous !`,
        distance: proximity.distanceMeters
      });
    }

    // 2. VÉRIFICATION PHOTO (Ton code original)
    if (!req.file) {
      return res.status(400).json({ message: 'Aucune photo fournie' });
    }

    const quest = await Quest.findById(questId);
    if (!quest) return res.status(404).json({ message: 'Quête introuvable' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

    // Vérifier si déjà complétée
    const isAlreadyDone = user.completedQuests?.some(cq => cq.questId.toString() === questId.toString());
    if (isAlreadyDone) return res.status(400).json({ message: 'Quête déjà complétée' });

    const photoUrl = `/uploads/quests/${req.file.filename}`;
    const XP_PER_QUEST = quest.xpReward || 100;
    let totalXpGained = XP_PER_QUEST;

    // 3. LOGIQUE DE PROGRESSION ET PARCOURS (Ton code original conservé à 100%)
    const path = await Path.findById(quest.pathId).populate('quests');
    const completedQuestsIds = user.completedQuests ? user.completedQuests.map(cq => cq.questId.toString()) : [];
    completedQuestsIds.push(questId.toString());

    const allQuestsCompleted = path.quests.every(q => completedQuestsIds.includes(q._id.toString()));
    
    // Support de tes deux formats de complétion de parcours
    const hasCompletedPath = user.completedPaths?.some(cp => {
      const pathIdToCheck = cp.pathId ? cp.pathId.toString() : cp.toString();
      return pathIdToCheck === path._id.toString();
    });

    let pathCompletionBonus = 0;
    const updateData = {
      $push: { 
        completedQuests: {
          questId: questId,
          photoUrl: photoUrl,
          completedAt: new Date()
        }
      },
      $inc: { xp: XP_PER_QUEST }
    };

    if (allQuestsCompleted && !hasCompletedPath) {
      const PATH_COMPLETION_BONUS = 500;
      pathCompletionBonus = PATH_COMPLETION_BONUS;
      totalXpGained += PATH_COMPLETION_BONUS;
      
      updateData.$inc.xp += PATH_COMPLETION_BONUS;
      updateData.$push.completedPaths = {
        pathId: path._id,
        completedAt: new Date()
      };
    }

    const newXp = (user.xp || 0) + totalXpGained;
    const newLevel = Math.floor(newXp / 1000) + 1;
    updateData.$set = { level: newLevel };

    await User.findByIdAndUpdate(userId, updateData, { new: true });

    res.status(200).json({
      message: 'Quête validée avec succès ! 🎉',
      xpGained: totalXpGained,
      totalXp: newXp,
      level: newLevel,
      photoUrl: photoUrl,
      pathCompleted: allQuestsCompleted && pathCompletionBonus > 0
    });

  } catch (err) {
    console.error('Erreur validation quête:', err);
    res.status(500).json({ message: 'Erreur lors de la validation de la quête' });
  }
};

// EXPORT UNIQUE - NE PAS DUPLIQUER
module.exports = {
  getQuestsByPath,
  createQuest,
  updateQuest,
  deleteQuest,
  validateQuest
};