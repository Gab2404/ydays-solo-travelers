import api from '../utils/api';

/**
 * Service d'authentification - Toutes les requêtes auth
 */
const authService = {
  /**
   * Inscription d'un nouvel utilisateur
   * @param {Object} userData - Données de l'utilisateur
   * @returns {Promise} Données de l'utilisateur + token
   */
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Connexion d'un utilisateur
   * @param {String} login - Email ou téléphone
   * @param {String} password - Mot de passe
   * @returns {Promise} Données de l'utilisateur + token
   */
  login: async (login, password) => {
    try {
      const response = await api.post('/auth/login', { login, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Récupère les informations de l'utilisateur connecté
   * @returns {Promise} Données de l'utilisateur
   */
  getMe: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default authService;