const User = require('../models/User');
const Quest = require('../models/Quest');
const { calculateDistance } = require('../services/questService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

const VALIDATION_DISTANCE_KM = 0.03;

/**
 * @desc    Vérifie la proximité d'une quête
 * @route   POST /api/quest-validation/check-proximity/:questId
 * @access  Public
 */
const checkProximity = async (req, res) => {
  try {
    const { questId } = req.params;
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return errorResponse(res, 400, 'Coordonnées GPS manquantes');
    }

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return errorResponse(res, 400, 'Coordonnées GPS invalides');
    }

    const quest = await Quest.findById(questId);
    if (!quest) {
      return errorResponse(res, 404, 'Quête introuvable');
    }

    const distance = calculateDistance(
      latitude,
      longitude,
      quest.location.coordinates[1], // latitude
      quest.location.coordinates[0]  // longitude
    );

    const isNearby = distance <= VALIDATION_DISTANCE_KM;

    return successResponse(res, 200, 'Proximité vérifiée', {
      questId: quest._id,
      questTitle: quest.title,
      distance: distance,
      distanceMeters: Math.round(distance * 1000),
      isNearby: isNearby,
      requiredDistance: VALIDATION_DISTANCE_KM * 1000,
      canValidate: isNearby
    });
  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, 'Erreur lors de la vérification de proximité');
  }
};

/**
 * @desc    Valide une quête avec vérification GPS
 * @route   POST /api/quest-validation/validate/:questId
 * @access  Public (pas d'auth en dev)
 */
const validateQuestWithGPS = async (req, res) => {
  try {
    const { questId } = req.params;
    const { latitude, longitude } = req.body;

    console.log('🎯 Validation de quête:', questId);
    console.log('📍 Position utilisateur:', { latitude, longitude });

    if (!latitude || !longitude) {
      return errorResponse(res, 400, 'Coordonnées GPS manquantes');
    }

    const quest = await Quest.findById(questId);
    if (!quest) {
      return errorResponse(res, 404, 'Quête introuvable');
    }

    console.log('🗺️ Position quête:', quest.location.coordinates);

    // ✅ Vérifier si la quête est déjà complétée
    if (quest.completed) {
      return errorResponse(res, 400, 'Quête déjà complétée');
    }

    const distance = calculateDistance(
      latitude,
      longitude,
      quest.location.coordinates[1], // latitude
      quest.location.coordinates[0]  // longitude
    );

    console.log('📏 Distance calculée:', distance, 'km');

    if (distance > VALIDATION_DISTANCE_KM) {
      return res.status(400).json({
        success: false,
        message: 'Vous êtes trop éloigné de la quête',
        distance: Math.round(distance * 1000),
        requiredDistance: Math.round(VALIDATION_DISTANCE_KM * 1000)
      });
    }

    // ✅ Marquer la quête comme complétée
    quest.completed = true;
    await quest.save();

    const XP_EARNED = quest.xpReward || 50;

    return res.status(200).json({
      success: true,
      message: 'Bravo ! Quête validée ! 🎉',
      xpEarned: XP_EARNED,
      quest: {
        id: quest._id,
        title: quest.title,
        description: quest.description
      },
      distance: Math.round(distance * 1000),
      requiredDistance: Math.round(VALIDATION_DISTANCE_KM * 1000)
    });
  } catch (err) {
    console.error('❌ Erreur validation:', err);
    return errorResponse(res, 500, 'Erreur lors de la validation de la quête');
  }
};

/**
 * @desc    Récupère les quêtes proches de l'utilisateur
 * @route   POST /api/quest-validation/nearby
 * @access  Public
 */
const getNearbyQuests = async (req, res) => {
  try {
    const { latitude, longitude, radius = 5 } = req.body;

    if (!latitude || !longitude) {
      return errorResponse(res, 400, 'Coordonnées GPS manquantes');
    }

    const allQuests = await Quest.find();

    const nearbyQuests = allQuests
      .map(quest => {
        const distance = calculateDistance(
          latitude,
          longitude,
          quest.location.coordinates[1],
          quest.location.coordinates[0]
        );

        return {
          ...quest.toObject(),
          distance: distance,
          distanceMeters: Math.round(distance * 1000)
        };
      })
      .filter(quest => quest.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    return successResponse(res, 200, 'Quêtes proches récupérées', {
      count: nearbyQuests.length,
      searchRadius: radius,
      quests: nearbyQuests
    });
  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, 'Erreur lors de la recherche de quêtes proches');
  }
};

module.exports = {
  checkProximity,
  validateQuestWithGPS,
  getNearbyQuests
};