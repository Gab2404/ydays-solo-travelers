const User = require('../models/User');
const Quest = require('../models/Quest');
const Path = require('../models/Path');

// @desc    Récupérer le profil utilisateur
// @route   GET /api/users/profile
// @access  Private
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

// @desc    Mettre à jour le profil utilisateur
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const { firstname, lastname, age, nationality, sex, phone } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    user.firstname = firstname || user.firstname;
    user.lastname = lastname || user.lastname;
    user.age = age !== undefined ? age : user.age;
    user.nationality = nationality || user.nationality;
    user.sex = sex || user.sex;
    user.phone = phone || user.phone;

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      email: updatedUser.email,
      firstname: updatedUser.firstname,
      lastname: updatedUser.lastname,
      age: updatedUser.age,
      nationality: updatedUser.nationality,
      sex: updatedUser.sex,
      phone: updatedUser.phone,
      role: updatedUser.role
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du profil' });
  }
};

// @desc    Marquer une quête comme complétée
// @route   POST /api/users/complete-quest/:questId
// @access  Private
const completeQuest = async (req, res) => {
  try {
    const { questId } = req.params;

    // Vérifier que la quête existe
    const quest = await Quest.findById(questId);
    if (!quest) {
      return res.status(404).json({ message: 'Quête introuvable' });
    }

    const user = await User.findById(req.user._id);

    // Vérifier si la quête n'est pas déjà complétée
    if (user.completedQuests.includes(questId)) {
      return res.status(400).json({ message: 'Quête déjà complétée' });
    }

    // Ajouter la quête aux complétées
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

// @desc    Récupérer l'historique des parcours de l'utilisateur
// @route   GET /api/users/history
// @access  Private
const getUserHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'completedQuests',
      populate: { path: 'pathId' }
    });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    // Grouper les quêtes par parcours
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
      totalXP: user.completedQuests.length * 50, // 50 XP par quête
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