import React, { useEffect, useState, useContext } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Search, List, Map, User, Settings } from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';
import { useNavigationDirection } from '../context/NavigationContext';
import storage from '../utils/storage';
import errorHandler from '../utils/errorHandler';

export default function BottomNav({ navigation, activeRoute, currentPathId }) {
  const { user } = useContext(AuthContext);
  const { setDirection } = useNavigationDirection();
  const [lastPathId, setLastPathId] = useState(null);

  // Ordre des routes dans la navbar
  const getRouteOrder = () => {
    const routes = {
      'CitySelection': 0,
      'Dashboard': 0,
      'PathDetail': 0,
      'Roadmap': 1,
      'Map': 2,
      'Profile': 3,
    };
    
    if (user?.role === 'admin' || user?.certified) {
      routes['AdminPanel'] = 4;
    }
    
    return routes;
  };

  useEffect(() => {
    loadLastPathId();
    
    if (currentPathId) {
      savePathId(currentPathId);
    }
  }, [currentPathId]);

  const loadLastPathId = async () => {
    try {
      const saved = await storage.getItem('lastPathId');
      if (saved) setLastPathId(saved);
    } catch (error) {
      console.error('Erreur chargement pathId:', error);
    }
  };

  const savePathId = async (id) => {
    try {
      await storage.setItem('lastPathId', id);
      setLastPathId(id);
    } catch (error) {
      console.error('Erreur sauvegarde pathId:', error);
    }
  };

  // Navigation avec détection de direction
  const navigateWithDirection = (targetScreen, params = {}) => {
    const routeOrder = getRouteOrder();
    const currentIndex = routeOrder[activeRoute] ?? 0;
    const targetIndex = routeOrder[targetScreen] ?? 0;
    
    // Définir la direction AVANT la navigation
    if (targetIndex > currentIndex) {
      // On va vers un bouton plus à droite
      setDirection('right');
    } else if (targetIndex < currentIndex) {
      // On va vers un bouton plus à gauche
      setDirection('left');
    }
    
    // Petite pause pour que le contexte se mette à jour
    setTimeout(() => {
      navigation.navigate(targetScreen, params);
    }, 50);
  };

  const handleRoadmapPress = () => {
    const pathId = currentPathId || lastPathId;
    
    if (!pathId) {
      errorHandler.showInfo(
        "Aucun parcours sélectionné",
        "Veuillez d'abord choisir un parcours depuis la recherche."
      );
      return;
    }
    
    navigateWithDirection('Roadmap', { id: pathId });
  };

  const handleMapPress = () => {
    const pathId = currentPathId || lastPathId;
    
    if (!pathId) {
      errorHandler.showInfo(
        "Aucun parcours sélectionné", 
        "Veuillez d'abord choisir un parcours depuis la recherche."
      );
      return;
    }
    
    navigateWithDirection('Map', { id: pathId });
  };

  // Vérifier si l'utilisateur peut voir le panel admin
  const canAccessAdmin = user?.role === 'admin' || user?.certified;

  return (
    <View style={styles.bottomNav}>
      
      <TouchableOpacity 
        style={[styles.navItem, activeRoute === 'CitySelection' && styles.activeNavItem]}
        onPress={() => navigateWithDirection('CitySelection')}
      >
        <Search 
          size={28} 
          color={activeRoute === 'CitySelection' ? '#d97706' : '#64748b'} 
          strokeWidth={activeRoute === 'CitySelection' ? 2.5 : 2}
        />
      </TouchableOpacity>

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

      <TouchableOpacity 
        style={[styles.navItem, activeRoute === 'Profile' && styles.activeNavItem]}
        onPress={() => navigateWithDirection('Profile')}
      >
        <User 
          size={28} 
          color={activeRoute === 'Profile' ? '#d97706' : '#64748b'} 
          strokeWidth={activeRoute === 'Profile' ? 2.5 : 2}
        />
      </TouchableOpacity>

      {/* Bouton Admin Panel - visible uniquement pour admin/certifiés */}
      {canAccessAdmin && (
        <TouchableOpacity 
          style={[styles.navItem, activeRoute === 'AdminPanel' && styles.activeNavItem]}
          onPress={() => navigateWithDirection('AdminPanel')}
        >
          <Settings 
            size={28} 
            color={activeRoute === 'AdminPanel' ? '#d97706' : '#64748b'} 
            strokeWidth={activeRoute === 'AdminPanel' ? 2.5 : 2}
          />
        </TouchableOpacity>
      )}

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
    paddingBottom: 20,
    // Ombre élégante au lieu du trait noir
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  navItem: { 
    padding: 10,
    borderRadius: 15,
  },
  activeNavItem: {
    backgroundColor: '#fff7ed',
  }
});