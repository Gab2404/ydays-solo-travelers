import api from '../utils/api';

/**
 * Service de gestion des quêtes
 */
const questService = {
  /**
   * Récupère les quêtes d'un parcours
   * @param {String} pathId - ID du parcours
   * @returns {Promise} Liste des quêtes
   */
  getQuestsByPath: async (pathId) => {
    try {
      const response = await api.get(`/quests/path/${pathId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Crée une nouvelle quête (Admin uniquement)
   * @param {Object} questData - Données de la quête
   * @returns {Promise} Quête créée
   */
  createQuest: async (questData) => {
    try {
      const response = await api.post('/quests', questData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Met à jour une quête (Admin uniquement)
   * @param {String} questId - ID de la quête
   * @param {Object} questData - Nouvelles données
   * @returns {Promise} Quête mise à jour
   */
  updateQuest: async (questId, questData) => {
    try {
      const response = await api.put(`/quests/${questId}`, questData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Supprime une quête (Admin uniquement)
   * @param {String} questId - ID de la quête
   * @returns {Promise} Message de confirmation
   */
  deleteQuest: async (questId) => {
    try {
      const response = await api.delete(`/quests/${questId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default questService;