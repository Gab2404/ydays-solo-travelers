import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [watchSubscription, setWatchSubscription] = useState(null);

  // Demander les permissions au montage
  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Permission de localisation refusée');
        console.error('❌ Permission de localisation refusée');
        return false;
      }
      
      console.log('✅ Permission de localisation accordée');
      return true;
    } catch (err) {
      console.error('Erreur demande permission:', err);
      setError(err.message);
      return false;
    }
  };

  const getCurrentPosition = async () => {
    try {
      console.log('📍 Récupération position actuelle...');
      
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        console.error('❌ Pas de permission pour la localisation');
        return null;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      console.log('✅ Position obtenue:', position.coords);
      setLocation(position);
      return position;
    } catch (err) {
      console.error('❌ Erreur getCurrentPosition:', err);
      setError(err.message);
      return null;
    }
  };

  const startTracking = async () => {
    try {
      console.log('🚀 Démarrage du tracking GPS...');
      
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        console.error('❌ Pas de permission pour démarrer le tracking');
        return;
      }

      // Obtenir la position initiale
      await getCurrentPosition();

      // Démarrer le suivi en temps réel
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: options.timeInterval || 5000, // Mise à jour toutes les 5 secondes
          distanceInterval: options.distanceInterval || 10, // Ou tous les 10 mètres
        },
        (newLocation) => {
          console.log('📍 Position mise à jour:', newLocation.coords);
          setLocation(newLocation);
        }
      );

      setWatchSubscription(subscription);
      setIsTracking(true);
      console.log('✅ Tracking GPS démarré');
    } catch (err) {
      console.error('❌ Erreur startTracking:', err);
      setError(err.message);
    }
  };

  const stopTracking = () => {
    if (watchSubscription) {
      console.log('⏹️ Arrêt du tracking GPS');
      watchSubscription.remove();
      setWatchSubscription(null);
      setIsTracking(false);
    }
  };

  // Nettoyer à la destruction du composant
  useEffect(() => {
    return () => {
      if (watchSubscription) {
        watchSubscription.remove();
      }
    };
  }, [watchSubscription]);

  return {
    location,
    error,
    isTracking,
    getCurrentPosition,
    startTracking,
    stopTracking,
  };
};
