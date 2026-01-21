const Quest = require('../models/Quest');
const Path = require('../models/Path');
const User = require('../models/User');
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

// @desc    Valider une quête avec une photo
// @route   POST /api/quests/:id/validate
// @access  Private
const validateQuest = async (req, res) => {
  try {
    const questId = req.params.id;
    const userId = req.user.id;

    // Vérifier que la photo a été uploadée
    if (!req.file) {
      return res.status(400).json({ message: 'Aucune photo fournie' });
    }

    // Récupérer la quête
    const quest = await Quest.findById(questId);
    if (!quest) {
      return res.status(404).json({ message: 'Quête introuvable' });
    }

    // Récupérer l'utilisateur pour vérification
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    // Vérifier si la quête n'est pas déjà complétée
    if (user.hasCompletedQuest && user.hasCompletedQuest(questId)) {
      return res.status(400).json({ message: 'Quête déjà complétée' });
    }

    // Construire l'URL de la photo
    const photoUrl = `/uploads/quests/${req.file.filename}`;

    // XP de base pour la quête
    const XP_PER_QUEST = 100;
    let totalXpGained = XP_PER_QUEST;

    // Vérifier si toutes les quêtes du parcours seront complétées après celle-ci
    const path = await Path.findById(quest.pathId).populate('quests');
    
    // Calculer les quêtes complétées (incluant celle-ci)
    const completedQuestsIds = user.completedQuests 
      ? user.completedQuests.map(cq => cq.questId.toString()) 
      : [];
    completedQuestsIds.push(questId.toString());

    const allQuestsCompleted = path.quests.every(q => 
      completedQuestsIds.includes(q._id.toString())
    );

    const hasCompletedPath = user.hasCompletedPath ? 
      user.hasCompletedPath(path._id) : 
      user.completedPaths?.some(cp => {
        // Support ancien format (ObjectId direct) et nouveau format (objet avec pathId)
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

    // Si toutes les quêtes sont complétées et que le parcours n'était pas déjà complété
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

    // Calculer le nouveau niveau basé sur le nouvel XP
    const newXp = (user.xp || 0) + totalXpGained;
    const newLevel = Math.floor(newXp / 1000) + 1; // Formule simple : 1 niveau tous les 1000 XP

    updateData.$set = { level: newLevel };

    // SOLUTION ALTERNATIVE : Mise à jour directe sans charger tout le document
    await User.findByIdAndUpdate(
      userId,
      updateData,
      { runValidators: false, new: true }
    );

    res.status(200).json({
      message: 'Quête validée avec succès !',
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