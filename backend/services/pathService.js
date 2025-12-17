const Path = require('../models/Path');
const Quest = require('../models/Quest');

/**
 * Calcule les statistiques d'un parcours
 * @param {String} pathId - ID du parcours
 * @param {Array} completedQuests - Liste des quêtes complétées par l'utilisateur
 * @returns {Object} Statistiques du parcours
 */
const calculatePathProgress = async (pathId, completedQuests = []) => {
  try {
    const path = await Path.findById(pathId).populate('quests');
    
    if (!path) {
      return null;
    }

    const totalQuests = path.quests.length;
    const completedCount = path.quests.filter(quest => 
      completedQuests.some(cq => cq.toString() === quest._id.toString())
    ).length;

    return {
      pathId: path._id,
      title: path.title,
      city: path.city,
      totalQuests,
      completedQuests: completedCount,
      progress: totalQuests > 0 ? Math.round((completedCount / totalQuests) * 100) : 0,
      isCompleted: completedCount === totalQuests && totalQuests > 0
    };
  } catch (error) {
    throw new Error('Erreur lors du calcul de progression');
  }
};

/**
 * Récupère tous les parcours avec filtres
 * @param {Object} filters - Filtres de recherche
 * @returns {Array} Liste des parcours
 */
const getPathsWithFilters = async (filters = {}) => {
  try {
    const query = {};
    
    if (filters.city) {
      query.city = new RegExp(filters.city, 'i');
    }
    
    if (filters.difficulty) {
      query.difficulty = filters.difficulty;
    }

    const paths = await Path.find(query)
      .populate('quests')
      .sort({ createdAt: -1 });

    return paths;
  } catch (error) {
    throw new Error('Erreur lors de la récupération des parcours');
  }
};

/**
 * Vérifie si un utilisateur peut accéder à un parcours
 * @param {String} pathId - ID du parcours
 * @returns {Boolean} True si accessible
 */
const isPathAccessible = async (pathId) => {
  try {
    const path = await Path.findById(pathId);
    return path !== null;
  } catch (error) {
    return false;
  }
};

/**
 * Supprime un parcours et toutes ses quêtes associées
 * @param {String} pathId - ID du parcours
 * @returns {Object} Résultat de la suppression
 */
const deletePathWithQuests = async (pathId) => {
  try {
    const path = await Path.findById(pathId);
    
    if (!path) {
      throw new Error('Parcours introuvable');
    }

    // Supprimer toutes les quêtes associées
    await Quest.deleteMany({ _id: { $in: path.quests } });

    // Supprimer le parcours
    await Path.findByIdAndDelete(pathId);

    return {
      success: true,
      deletedQuestsCount: path.quests.length
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  calculatePathProgress,
  getPathsWithFilters,
  isPathAccessible,
  deletePathWithQuests
};