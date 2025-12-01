const User = require('../models/User');
const Path = require('../models/Path');

/**
 * Calcule les statistiques XP d'un utilisateur
 * @param {Object} user - Objet utilisateur
 * @returns {Object} Statistiques XP
 */
const calculateUserXP = (user) => {
  const XP_PER_QUEST = 50;
  const totalXP = user.completedQuests.length * XP_PER_QUEST;
  
  // Système de niveaux (tous les 500 XP)
  const level = Math.floor(totalXP / 500) + 1;
  const xpForNextLevel = level * 500;
  const xpProgress = totalXP % 500;
  
  return {
    totalXP,
    level,
    xpForNextLevel,
    xpProgress,
    progressPercentage: Math.round((xpProgress / 500) * 100)
  };
};

/**
 * Récupère l'historique détaillé des parcours d'un utilisateur
 * @param {String} userId - ID de l'utilisateur
 * @returns {Object} Historique détaillé
 */
const getUserDetailedHistory = async (userId) => {
  try {
    const user = await User.findById(userId).populate({
      path: 'completedQuests',
      populate: { path: 'pathId' }
    });

    if (!user) {
      throw new Error('Utilisateur introuvable');
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
            percentage: 0,
            completedQuestIds: []
          };
        }
        
        pathsMap[pathId].completedQuestsCount++;
        pathsMap[pathId].completedQuestIds.push(quest._id);
        pathsMap[pathId].percentage = Math.round(
          (pathsMap[pathId].completedQuestsCount / pathsMap[pathId].totalQuests) * 100
        );
      }
    });

    const history = Object.values(pathsMap);
    const xpStats = calculateUserXP(user);

    return {
      ...xpStats,
      totalQuestsCompleted: user.completedQuests.length,
      completedPaths: history.filter(h => h.percentage === 100).length,
      inProgressPaths: history.filter(h => h.percentage > 0 && h.percentage < 100).length,
      history
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Récupère les statistiques globales d'un utilisateur
 * @param {String} userId - ID de l'utilisateur
 * @returns {Object} Statistiques
 */
const getUserStats = async (userId) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('Utilisateur introuvable');
    }

    const xpStats = calculateUserXP(user);
    
    // Compter les parcours uniques
    const uniquePaths = new Set();
    const userWithQuests = await User.findById(userId).populate({
      path: 'completedQuests',
      select: 'pathId'
    });
    
    userWithQuests.completedQuests.forEach(quest => {
      if (quest.pathId) {
        uniquePaths.add(quest.pathId.toString());
      }
    });

    return {
      ...xpStats,
      totalQuestsCompleted: user.completedQuests.length,
      uniquePathsExplored: uniquePaths.size
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Vérifie si un utilisateur a complété un parcours
 * @param {String} userId - ID de l'utilisateur
 * @param {String} pathId - ID du parcours
 * @returns {Boolean} True si le parcours est complété
 */
const hasUserCompletedPath = async (userId, pathId) => {
  try {
    const user = await User.findById(userId);
    const path = await Path.findById(pathId);
    
    if (!user || !path) {
      return false;
    }

    // Vérifier que toutes les quêtes du parcours sont complétées
    const allQuestsCompleted = path.quests.every(questId =>
      user.completedQuests.some(cq => cq.toString() === questId.toString())
    );

    return allQuestsCompleted;
  } catch (error) {
    return false;
  }
};

/**
 * Récupère les badges/achievements d'un utilisateur
 * @param {Object} user - Objet utilisateur
 * @returns {Array} Liste des badges
 */
const getUserBadges = (user) => {
  const badges = [];
  const questsCount = user.completedQuests.length;

  // Badges basés sur le nombre de quêtes
  if (questsCount >= 1) badges.push({ id: 'first_quest', name: 'Première Quête', icon: '🎯' });
  if (questsCount >= 10) badges.push({ id: 'explorer', name: 'Explorateur', icon: '🗺️' });
  if (questsCount >= 50) badges.push({ id: 'adventurer', name: 'Aventurier', icon: '⛰️' });
  if (questsCount >= 100) badges.push({ id: 'legend', name: 'Légende', icon: '👑' });

  return badges;
};

module.exports = {
  calculateUserXP,
  getUserDetailedHistory,
  getUserStats,
  hasUserCompletedPath,
  getUserBadges
};