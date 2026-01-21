const User = require('../models/User');
const Quest = require('../models/Quest');
const Path = require('../models/Path');
const path = require('path');

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('completedQuests');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération du profil' });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

    // Si Multer a bien reçu un fichier, on met à jour le champ avatar
    if (req.file) {
      user.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    // Mise à jour des autres champs texte
    const { firstname, lastname, age, nationality, phone } = req.body;
    user.firstName = firstname || user.firstName; // Utilise firstName (majuscule) du modèle
    user.lastName = lastname || user.lastName;
    user.age = age !== undefined ? age : user.age;
    user.nationality = nationality || user.nationality;
    user.phone = phone || user.phone;

    const updatedUser = await user.save();
    
    // On renvoie l'utilisateur complet sans le mot de passe
    const response = updatedUser.toObject();
    delete response.password;
    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la mise à jour' });
  }
};

const completeQuest = async (req, res) => {
  try {
    const { questId } = req.params;

    const quest = await Quest.findById(questId);
    if (!quest) {
      return res.status(404).json({ message: 'Quête introuvable' });
    }

    const user = await User.findById(req.user._id);

    if (user.completedQuests.includes(questId)) {
      return res.status(400).json({ message: 'Quête déjà complétée' });
    }

    user.completedQuests.push(questId);
    await user.save();

    res.status(200).json({ 
      message: 'Quête complétée !',
      completedQuests: user.completedQuests
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la validation de la quête' });
  }
};

const getUserHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'completedQuests',
      populate: { path: 'pathId' }
    });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    const pathsMap = {};
    
    user.completedQuests.forEach(quest => {
      if (quest.pathId) {
        const pathId = quest.pathId._id.toString();
        
        if (!pathsMap[pathId]) {
          pathsMap[pathId] = {
            path: quest.pathId,
            completedQuestsCount: 0,
            totalQuests: quest.pathId.quests.length,
            percentage: 0
          };
        }
        
        pathsMap[pathId].completedQuestsCount++;
        pathsMap[pathId].percentage = Math.round(
          (pathsMap[pathId].completedQuestsCount / pathsMap[pathId].totalQuests) * 100
        );
      }
    });

    const history = Object.values(pathsMap);

    res.status(200).json({
      totalXP: user.completedQuests.length * 50,
      completedPaths: history.filter(h => h.percentage === 100).length,
      inProgressPaths: history.filter(h => h.percentage > 0 && h.percentage < 100).length,
      history
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'historique' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  completeQuest,
  getUserHistory
};