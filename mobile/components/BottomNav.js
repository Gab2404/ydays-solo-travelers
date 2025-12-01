import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Search, List, Map, User } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function BottomNav({ navigation, activeRoute, currentPathId }) {
  const [lastPathId, setLastPathId] = useState(null);

  useEffect(() => {
    // Charger le dernier pathId au montage
    loadLastPathId();
    
    // Si on reçoit un currentPathId, on le sauvegarde
    if (currentPathId) {
      savePathId(currentPathId);
    }
  }, [currentPathId]);

  const loadLastPathId = async () => {
    try {
      const saved = await AsyncStorage.getItem('lastPathId');
      if (saved) setLastPathId(saved);
    } catch (error) {
      console.error('Erreur chargement pathId:', error);
    }
  };

  const savePathId = async (id) => {
    try {
      await AsyncStorage.setItem('lastPathId', id);
      setLastPathId(id);
    } catch (error) {
      console.error('Erreur sauvegarde pathId:', error);
    }
  };

  const handleRoadmapPress = () => {
    const pathId = currentPathId || lastPathId;
    
    if (!pathId) {
      Alert.alert(
        "Aucun parcours sélectionné",
        "Veuillez d'abord choisir un parcours depuis la recherche.",
        [{ text: "OK" }]
      );
      return;
    }
    
    navigation.navigate('Roadmap', { id: pathId });
  };

  const handleMapPress = () => {
    const pathId = currentPathId || lastPathId;
    
    if (!pathId) {
      Alert.alert(
        "Aucun parcours sélectionné", 
        "Veuillez d'abord choisir un parcours depuis la recherche.",
        [{ text: "OK" }]
      );
      return;
    }
    
    navigation.navigate('Map', { id: pathId });
  };

  return (
    <View style={styles.bottomNav}>
      
      {/* RECHERCHE / CITY SELECTION */}
      <TouchableOpacity 
        style={[styles.navItem, activeRoute === 'CitySelection' && styles.activeNavItem]}
        onPress={() => navigation.navigate('CitySelection')}
      >
        <Search 
          size={28} 
          color={activeRoute === 'CitySelection' ? '#d97706' : '#64748b'} 
          strokeWidth={activeRoute === 'CitySelection' ? 2.5 : 2}
        />
      </TouchableOpacity>

      {/* ROADMAP */}
      <TouchableOpacity 
        style={[styles.navItem, activeRoute === 'Roadmap' && styles.activeNavItem]}
        onPress={handleRoadmapPress}
      >
        <List 
          size={28} 
          color={activeRoute === 'Roadmap' ? '#d97706' : '#64748b'} 
          strokeWidth={activeRoute === 'Roadmap' ? 2.5 : 2}
        />
      </TouchableOpacity>

      {/* MAP */}
      <TouchableOpacity 
        style={[styles.navItem, activeRoute === 'Map' && styles.activeNavItem]}
        onPress={handleMapPress}
      >
        <Map 
          size={28} 
          color={activeRoute === 'Map' ? '#d97706' : '#64748b'} 
          strokeWidth={activeRoute === 'Map' ? 2.5 : 2}
        />
      </TouchableOpacity>

      {/* PROFILE */}
      <TouchableOpacity 
        style={[styles.navItem, activeRoute === 'Profile' && styles.activeNavItem]}
        onPress={() => navigation.navigate('Profile')}
      >
        <User 
          size={28} 
          color={activeRoute === 'Profile' ? '#d97706' : '#64748b'} 
          strokeWidth={activeRoute === 'Profile' ? 2.5 : 2}
        />
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    height: 80, 
    backgroundColor: '#fff', 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    alignItems: 'center',
    borderTopWidth: 2, 
    borderTopColor: '#1e293b', 
    paddingBottom: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10
  },
  navItem: { 
    padding: 10,
    borderRadius: 15,
  },
  activeNavItem: {
    backgroundColor: '#fff7ed',
  }
});