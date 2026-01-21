const User = require('../models/User');
const Path = require('../models/Path');

/**
 * Service de gestion de la galerie photos
 * Contient toute la logique métier liée aux galeries
 */
const galleryService = {
  /**
   * Récupère la galerie d'un parcours complété
   * @param {String} userId - ID de l'utilisateur
   * @param {String} pathId - ID du parcours
   * @returns {Promise} Galerie de photos avec métadonnées
   */
  getPathGallery: async (userId, pathId) => {
    // Récupérer l'utilisateur avec ses quêtes complétées
    const user = await User.findById(userId).populate('completedQuests.questId');
    if (!user) {
      throw new Error('Utilisateur introuvable');
    }

    // Vérifier que le parcours existe
    const pathData = await Path.findById(pathId).populate('quests');
    if (!pathData) {
      throw new Error('Parcours introuvable');
    }

    // Vérifier si le parcours est complété
    const isPathCompleted = user.hasCompletedPath(pathId);
    if (!isPathCompleted) {
      throw new Error('Parcours non complété. Termine toutes les quêtes pour accéder à ta galerie.');
    }

    // Filtrer les quêtes complétées pour ce parcours
    const pathQuestIds = pathData.quests.map(q => q._id.toString());
    const completedQuestsForPath = user.completedQuests.filter(cq => 
      pathQuestIds.includes(cq.questId._id.toString())
    );

    // Construire la liste des photos
    const photos = completedQuestsForPath.map(cq => ({
      questId: cq.questId._id,
      questTitle: cq.questId.title,
      photoUrl: cq.photoUrl,
      completedAt: cq.completedAt
    }));

    // Trier par date de complétion (du plus ancien au plus récent)
    photos.sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));

    // Trouver la date de complétion du parcours
    const pathCompletionEntry = user.completedPaths.find(
      cp => cp.pathId && cp.pathId.toString() === pathId
    );
    const completedAt = pathCompletionEntry?.completedAt || 
                        (photos.length > 0 ? photos[photos.length - 1].completedAt : null);

    return {
      pathId: pathData._id,
      pathTitle: pathData.title,
      pathCity: pathData.city,
      completedAt: completedAt,
      totalQuests: pathData.quests.length,
      photos: photos
    };
  },

  /**
   * Vérifie si un utilisateur peut accéder à une galerie
   * @param {String} userId - ID de l'utilisateur
   * @param {String} pathId - ID du parcours
   * @returns {Promise<Boolean>} True si l'utilisateur peut accéder
   */
  canAccessGallery: async (userId, pathId) => {
    const user = await User.findById(userId);
    if (!user) return false;

    return user.hasCompletedPath(pathId);
  },

  /**
   * Récupère les informations nécessaires pour créer le ZIP
   * @param {String} userId - ID de l'utilisateur
   * @param {String} pathId - ID du parcours
   * @returns {Promise} Données pour le ZIP
   */
  getZipData: async (userId, pathId) => {
    const user = await User.findById(userId).populate('completedQuests.questId');
    if (!user) {
      throw new Error('Utilisateur introuvable');
    }

    const pathData = await Path.findById(pathId).populate('quests');
    if (!pathData) {
      throw new Error('Parcours introuvable');
    }

    if (!user.hasCompletedPath(pathId)) {
      throw new Error('Parcours non complété');
    }

    // Filtrer les quêtes complétées pour ce parcours
    const pathQuestIds = pathData.quests.map(q => q._id.toString());
    const completedQuestsForPath = user.completedQuests
      .filter(cq => pathQuestIds.includes(cq.questId._id.toString()))
      .sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));

    if (completedQuestsForPath.length === 0) {
      throw new Error('Aucune photo trouvée pour ce parcours');
    }

    return {
      pathTitle: pathData.title,
      pathCity: pathData.city,
      completedQuests: completedQuestsForPath
    };
  }
};

module.exports = galleryService;