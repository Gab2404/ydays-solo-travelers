import api from '../utils/api';

/**
 * Service de gestion des utilisateurs
 */
const userService = {
  /**
   * Récupère le profil de l'utilisateur connecté
   * @returns {Promise} Profil utilisateur
   */
  getUserProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Met à jour le profil de l'utilisateur
   * @param {Object} userData - Nouvelles données utilisateur
   * @returns {Promise} Profil mis à jour
   */
  updateUserProfile: async (userData) => {
    try {
      const response = await api.put('/users/profile', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Marque une quête comme complétée
   * @param {String} questId - ID de la quête
   * @returns {Promise} Résultat de la validation
   */
  completeQuest: async (questId) => {
    try {
      const response = await api.post(`/users/complete-quest/${questId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Récupère l'historique des parcours de l'utilisateur
   * @returns {Promise} Historique et statistiques
   */
  getUserHistory: async () => {
    try {
      const response = await api.get('/users/history');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default userService;