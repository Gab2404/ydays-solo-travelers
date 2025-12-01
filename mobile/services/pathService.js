import api from '../utils/api';

/**
 * Service de gestion des parcours
 */
const pathService = {
  /**
   * Récupère tous les parcours avec filtres optionnels
   * @param {Object} filters - Filtres {city, difficulty}
   * @returns {Promise} Liste des parcours
   */
  getAllPaths: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const url = params ? `/paths?${params}` : '/paths';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Récupère un parcours par son ID
   * @param {String} pathId - ID du parcours
   * @returns {Promise} Détails du parcours
   */
  getPathById: async (pathId) => {
    try {
      const response = await api.get(`/paths/${pathId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Récupère les parcours d'une ville
   * @param {String} city - Nom de la ville
   * @returns {Promise} Liste des parcours
   */
  getPathsByCity: async (city) => {
    try {
      const response = await api.get(`/paths/city/${city}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Crée un nouveau parcours (Admin uniquement)
   * @param {Object} pathData - Données du parcours
   * @returns {Promise} Parcours créé
   */
  createPath: async (pathData) => {
    try {
      const response = await api.post('/paths', pathData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Met à jour un parcours (Admin uniquement)
   * @param {String} pathId - ID du parcours
   * @param {Object} pathData - Nouvelles données
   * @returns {Promise} Parcours mis à jour
   */
  updatePath: async (pathId, pathData) => {
    try {
      const response = await api.put(`/paths/${pathId}`, pathData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Supprime un parcours (Admin uniquement)
   * @param {String} pathId - ID du parcours
   * @returns {Promise} Message de confirmation
   */
  deletePath: async (pathId) => {
    try {
      const response = await api.delete(`/paths/${pathId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default pathService;