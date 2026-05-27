import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const VALIDATION_DISTANCE = 50; // 50 mètres

const ProximityChecker = ({ userLocation, questLocation, onNearby }) => {
  const [distance, setDistance] = useState(null);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (userLocation && questLocation) {
      const dist = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        questLocation.latitude,
        questLocation.longitude
      );
      setDistance(dist);

      // Si l'utilisateur est proche, déclencher l'animation et le callback
      if (dist <= VALIDATION_DISTANCE && onNearby) {
        startPulseAnimation();
        onNearby();
      }
    }
  }, [userLocation, questLocation]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c;
    return Math.round(distanceKm * 1000); // Distance en mètres
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  if (!distance) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>📍 Calcul de la distance...</Text>
      </View>
    );
  }

  const isNearby = distance <= VALIDATION_DISTANCE;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.distanceContainer,
          isNearby && styles.nearbyContainer,
          { transform: [{ scale: isNearby ? pulseAnim : 1 }] },
        ]}
      >
        <Text style={[styles.distanceText, isNearby && styles.nearbyText]}>
          {isNearby ? '✓ Vous êtes arrivé !' : `📍 ${distance}m`}
        </Text>
        {!isNearby && (
          <Text style={styles.requiredText}>
            Rapprochez-vous à moins de {VALIDATION_DISTANCE}m
          </Text>
        )}
      </Animated.View>

      {/* Barre de progression */}
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${Math.max(
                0,
                Math.min(100, ((VALIDATION_DISTANCE * 2 - distance) / (VALIDATION_DISTANCE * 2)) * 100)
              )}%`,
              backgroundColor: isNearby ? '#4CAF50' : '#FF9800',
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginVertical: 10,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  distanceContainer: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 12,
  },
  nearbyContainer: {
    backgroundColor: '#E8F5E9',
  },
  distanceText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  nearbyText: {
    color: '#4CAF50',
  },
  requiredText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
});

export default ProximityChecker;