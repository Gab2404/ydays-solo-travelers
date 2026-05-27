const Quest = require('../models/Quest');
const Path = require('../models/Path');

/**
 * Calcule la distance entre deux points GPS (en km)
 * Utilise la formule de Haversine
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
 */
const isUserNearQuest = (questLocation, userLocation, threshold = 0.05) => { // Seuil à 50m
  const distance = calculateDistance(
    questLocation.lat,
    questLocation.lng,
    userLocation.lat,
    userLocation.lng
  );
  
  return distance <= threshold;
};

/**
 * NOUVELLE FONCTION : Vérifier la proximité via l'ID
 */
const checkProximity = async (questId, userLat, userLon) => {
  try {
    const quest = await Quest.findById(questId);
    if (!quest) throw new Error('Quête non trouvée');

    const distance = calculateDistance(userLat, userLon, quest.location.lat, quest.location.lng);
    const threshold = 0.05; // 50 mètres

    return {
      isNearby: distance <= threshold,
      distanceMeters: Math.round(distance * 1000),
      requiredDistance: threshold * 1000,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * TES FONCTIONS ORIGINALES CONSERVÉES
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

const reorderQuests = async (pathId, questIds) => {
  try {
    const path = await Path.findById(pathId);
    if (!path) throw new Error('Parcours introuvable');
    const updatePromises = questIds.map((questId, index) => 
      Quest.findByIdAndUpdate(questId, { order: index + 1 })
    );
    await Promise.all(updatePromises);
    return true;
  } catch (error) {
    throw error;
  }
};

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
  checkProximity,
  getNextQuest,
  reorderQuests,
  questBelongsToPath
};