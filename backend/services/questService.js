const Quest = require('../models/Quest');
const Path = require('../models/Path');

/**
 * Calcule la distance entre deux points GPS (en km)
 * Utilise la formule de Haversine
 * @param {Number} lat1 - Latitude point 1
 * @param {Number} lon1 - Longitude point 1
 * @param {Number} lat2 - Latitude point 2
 * @param {Number} lon2 - Longitude point 2
 * @returns {Number} Distance en kilomètres
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Arrondi à 2 décimales
};

/**
 * Vérifie si l'utilisateur est proche d'une quête
 * @param {Object} questLocation - Coordonnées de la quête {lat, lng}
 * @param {Object} userLocation - Coordonnées de l'utilisateur {lat, lng}
 * @param {Number} threshold - Distance maximale en km (défaut: 0.1 = 100m)
 * @returns {Boolean} True si l'utilisateur est proche
 */
const isUserNearQuest = (questLocation, userLocation, threshold = 0.1) => {
  const distance = calculateDistance(
    questLocation.lat,
    questLocation.lng,
    userLocation.lat,
    userLocation.lng
  );
  
  return distance <= threshold;
};

/**
 * Récupère la prochaine quête non complétée d'un parcours
 * @param {String} pathId - ID du parcours
 * @param {Array} completedQuests - Liste des IDs de quêtes complétées
 * @returns {Object|null} Prochaine quête ou null
 */
const getNextQuest = async (pathId, completedQuests = []) => {
  try {
    const quests = await Quest.find({ pathId }).sort({ order: 1 });
    
    const nextQuest = quests.find(quest => 
      !completedQuests.some(cq => cq.toString() === quest._id.toString())
    );
    
    return nextQuest || null;
  } catch (error) {
    throw new Error('Erreur lors de la récupération de la prochaine quête');
  }
};

/**
 * Réorganise l'ordre des quêtes d'un parcours
 * @param {String} pathId - ID du parcours
 * @param {Array} questIds - Liste ordonnée des IDs de quêtes
 * @returns {Boolean} True si réussi
 */
const reorderQuests = async (pathId, questIds) => {
  try {
    // Vérifier que le parcours existe
    const path = await Path.findById(pathId);
    if (!path) {
      throw new Error('Parcours introuvable');
    }

    // Mettre à jour l'ordre de chaque quête
    const updatePromises = questIds.map((questId, index) => 
      Quest.findByIdAndUpdate(questId, { order: index + 1 })
    );

    await Promise.all(updatePromises);
    return true;
  } catch (error) {
    throw error;
  }
};

/**
 * Vérifie si une quête appartient à un parcours
 * @param {String} questId - ID de la quête
 * @param {String} pathId - ID du parcours
 * @returns {Boolean} True si la quête appartient au parcours
 */
const questBelongsToPath = async (questId, pathId) => {
  try {
    const quest = await Quest.findById(questId);
    return quest && quest.pathId.toString() === pathId.toString();
  } catch (error) {
    return false;
  }
};

module.exports = {
  calculateDistance,
  isUserNearQuest,
  getNextQuest,
  reorderQuests,
  questBelongsToPath
};