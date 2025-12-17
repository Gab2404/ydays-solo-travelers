import * as Location from 'expo-location';

/**
 * Helper pour gérer la géolocalisation
 */
const locationHelper = {
  /**
   * Demande les permissions de localisation
   * @returns {Boolean} True si autorisé
   */
  requestPermission: async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Erreur demande permission:', error);
      return false;
    }
  },

  /**
   * Récupère la position actuelle de l'utilisateur
   * @returns {Object|null} {latitude, longitude} ou null
   */
  getCurrentPosition: async () => {
    try {
      const hasPermission = await locationHelper.requestPermission();
      
      if (!hasPermission) {
        throw new Error('Permission de localisation refusée');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      };
    } catch (error) {
      console.error('Erreur récupération position:', error);
      return null;
    }
  },

  /**
   * Calcule la distance entre deux points (formule de Haversine)
   * @param {Number} lat1 - Latitude point 1
   * @param {Number} lon1 - Longitude point 1
   * @param {Number} lat2 - Latitude point 2
   * @param {Number} lon2 - Longitude point 2
   * @returns {Number} Distance en kilomètres
   */
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 100) / 100; // 2 décimales
  },

  /**
   * Vérifie si l'utilisateur est proche d'un point
   * @param {Object} userPos - {latitude, longitude}
   * @param {Object} targetPos - {lat, lng}
   * @param {Number} threshold - Distance maximale en km (défaut: 0.1 = 100m)
   * @returns {Boolean} True si proche
   */
  isNearby: (userPos, targetPos, threshold = 0.1) => {
    const distance = locationHelper.calculateDistance(
      userPos.latitude,
      userPos.longitude,
      targetPos.lat,
      targetPos.lng
    );
    
    return distance <= threshold;
  },

  /**
   * Formate une distance pour l'affichage
   * @param {Number} distanceKm - Distance en km
   * @returns {String} Distance formatée
   */
  formatDistance: (distanceKm) => {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m`;
    }
    return `${distanceKm.toFixed(1)}km`;
  }
};

export default locationHelper;