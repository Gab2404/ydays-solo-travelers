import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Helper pour gérer le stockage local de manière centralisée
 */
const storage = {
  /**
   * Sauvegarde les données utilisateur
   * @param {Object} userData - Données utilisateur
   */
  saveUser: async (userData) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde utilisateur:', error);
      throw error;
    }
  },

  /**
   * Récupère les données utilisateur
   * @returns {Object|null} Données utilisateur ou null
   */
  getUser: async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération utilisateur:', error);
      return null;
    }
  },

  /**
   * Supprime les données utilisateur
   */
  removeUser: async () => {
    try {
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Erreur lors de la suppression utilisateur:', error);
      throw error;
    }
  },

  /**
   * Sauvegarde la dernière ville sélectionnée
   * @param {String} city - Nom de la ville
   */
  saveLastCity: async (city) => {
    try {
      await AsyncStorage.setItem('lastCity', city);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la ville:', error);
    }
  },

  /**
   * Récupère la dernière ville sélectionnée
   * @returns {String|null} Nom de la ville ou null
   */
  getLastCity: async () => {
    try {
      return await AsyncStorage.getItem('lastCity');
    } catch (error) {
      console.error('Erreur lors de la récupération de la ville:', error);
      return null;
    }
  },

  /**
   * Sauvegarde des paramètres utilisateur
   * @param {Object} settings - Paramètres
   */
  saveSettings: async (settings) => {
    try {
      await AsyncStorage.setItem('settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres:', error);
    }
  },

  /**
   * Récupère les paramètres utilisateur
   * @returns {Object} Paramètres ou objet vide
   */
  getSettings: async () => {
    try {
      const settings = await AsyncStorage.getItem('settings');
      return settings ? JSON.parse(settings) : {};
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres:', error);
      return {};
    }
  },

  /**
   * ✅ MÉTHODE GÉNÉRIQUE - Sauvegarde une valeur
   * @param {String} key - Clé
   * @param {String} value - Valeur
   */
  setItem: async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`Erreur sauvegarde ${key}:`, error);
      throw error;
    }
  },

  /**
   * ✅ MÉTHODE GÉNÉRIQUE - Récupère une valeur
   * @param {String} key - Clé
   * @returns {String|null} Valeur ou null
   */
  getItem: async (key) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Erreur chargement ${key}:`, error);
      return null;
    }
  },

  /**
   * ✅ MÉTHODE GÉNÉRIQUE - Supprime une valeur
   * @param {String} key - Clé
   */
  removeItem: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Erreur suppression ${key}:`, error);
      throw error;
    }
  },

  /**
   * Efface toutes les données stockées
   */
  clearAll: async () => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Erreur lors de l\'effacement des données:', error);
      throw error;
    }
  }
};

export default storage;