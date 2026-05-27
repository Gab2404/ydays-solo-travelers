import api from '../utils/api';

const questValidationService = {
  /**
   * Vérifie si l'utilisateur est proche d'une quête
   * @param {String} questId - ID de la quête
   * @param {Number} latitude - Latitude utilisateur
   * @param {Number} longitude - Longitude utilisateur
   * @returns {Promise} Résultat de la vérification
   */
  checkProximity: async (questId, latitude, longitude) => {
    try {
      const response = await api.post(`/quest-validation/check-proximity/${questId}`, {
        latitude,
        longitude
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Valide une quête avec vérification GPS
   * @param {String} questId - ID de la quête
   * @param {Object} location - Objet contenant latitude et longitude
   * @returns {Promise} Résultat de la validation
   */
  validateQuest: async (questId, location) => {
    try {
      const response = await api.post(`/quest-validation/validate/${questId}`, {
        latitude: location.latitude,
        longitude: location.longitude
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Récupère les quêtes proches de la position actuelle
   * @param {Number} latitude - Latitude utilisateur
   * @param {Number} longitude - Longitude utilisateur
   * @param {Number} radius - Rayon de recherche en km (défaut: 5)
   * @returns {Promise} Liste des quêtes proches
   */
  getNearbyQuests: async (latitude, longitude, radius = 5) => {
    try {
      const response = await api.post('/quest-validation/nearby', {
        latitude,
        longitude,
        radius
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default questValidationService;