import api from '../utils/api';

/**
 * Service de gestion des utilisateurs
 */
const userService = {
  /**
   * Récupère le profil de l'utilisateur connecté
   * (ancienne méthode – conservée)
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
   * Récupère le profil de l'utilisateur connecté
   * (nouvelle méthode – alias plus clair)
   */
  getCurrentUser: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Met à jour le profil de l'utilisateur
   * (ancienne méthode – conservée)
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
   * Met à jour le profil utilisateur
   * (nouvelle méthode – alias)
   */
  updateProfile: async (formData) => {
    try {
      const response = await api.put('/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Indispensable pour l'image
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Marque une quête comme complétée
   * (conservée)
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
   * (conservée)
   */
  getUserHistory: async () => {
    try {
      const response = await api.get('/users/history');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Récupère les statistiques de l'utilisateur
   * (nouvelle méthode)
   */
  getUserStats: async () => {
    try {
      const response = await api.get('/users/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default userService;
