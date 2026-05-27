import React, { useEffect, useState, useContext } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Image, Alert } from 'react-native';
import { Home, Compass, Map, Images, User, Settings } from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';
import { useNavigationDirection } from '../context/NavigationContext';
import storage from '../utils/storage';
import errorHandler from '../utils/errorHandler';

const mascotte = require('../assets/images/mascotte4.png');

export default function BottomNav({ navigation, activeRoute, currentPathId }) {
  const { user } = useContext(AuthContext);
  const { setDirection } = useNavigationDirection();
  const [lastPathId, setLastPathId] = useState(null);

  // Ordre des routes
  const getRouteOrder = () => {
    const routes = {
      'Home': 0,
      'Dashboard': 1,
      'Map': 2,
      'GalleryAll': 3,
      'Profile': 4,
    };
    
    if (user?.role === 'admin' || user?.certified) {
      routes['AdminPanel'] = 5;
    }
    
    return routes;
  };

  useEffect(() => {
    loadLastPathId();
    if (currentPathId) savePathId(currentPathId);
  }, [currentPathId]);

  const loadLastPathId = async () => {
    try {
      const saved = await storage.getItem('lastPathId');
      if (saved) setLastPathId(saved);
    } catch (error) { console.error(error); }
  };

  const savePathId = async (id) => {
    try { await storage.setItem('lastPathId', id); setLastPathId(id); } 
    catch (error) { console.error(error); }
  };

  const navigateWithDirection = (targetScreen, params = {}) => {
    const routeOrder = getRouteOrder();
    const currentIndex = routeOrder[activeRoute] ?? 0;
    const targetIndex = routeOrder[targetScreen] ?? 0;
    
    if (targetIndex > currentIndex) setDirection('right');
    else if (targetIndex < currentIndex) setDirection('left');
    
    setTimeout(() => { navigation.navigate(targetScreen, params); }, 50);
  };

  const handleMascotPress = async () => {
    try {
      const saved = await storage.getItem('activePathId');
      if (saved) {
        navigateWithDirection('Roadmap', { pathId: saved });
      } else {
        Alert.alert(
          '🗺️ Aucun parcours en cours',
          'Tu n\'as pas encore commencé de parcours. Explore les quêtes disponibles pour en démarrer un !',
          [
            { text: 'Voir les quêtes', onPress: () => navigateWithDirection('Dashboard', { city: 'Bordeaux' }) },
            { text: 'Annuler', style: 'cancel' },
          ]
        );
      }
    } catch (error) {
      console.error('Erreur lecture activePathId:', error);
      navigateWithDirection('Dashboard', { city: 'Bordeaux' });
    }
  };

  const canAccessAdmin = user?.role === 'admin' || user?.certified;

  return (
    <View style={styles.bottomNav}>
      
      {/* 1. ACCUEIL */}
      <TouchableOpacity 
        style={[styles.navItem, activeRoute === 'Home' && styles.activeNavItem]}
        onPress={() => navigateWithDirection('Home')}
      >
        <Home 
          size={22} 
          color={activeRoute === 'Home' ? '#d97706' : '#64748b'} 
          strokeWidth={activeRoute === 'Home' ? 2.5 : 2}
        />
        <Text style={[styles.navText, activeRoute === 'Home' && styles.activeNavText]}>Accueil</Text>
      </TouchableOpacity>

      {/* 2. QUÊTES (DASHBOARD) */}
      <TouchableOpacity 
        style={[styles.navItem, activeRoute === 'Dashboard' && styles.activeNavItem]}
        onPress={() => navigateWithDirection('Dashboard', { city: 'Bordeaux' })}
      >
        <Compass 
          size={22} 
          color={activeRoute === 'Dashboard' ? '#d97706' : '#64748b'} 
          strokeWidth={activeRoute === 'Dashboard' ? 2.5 : 2}
        />
        <Text style={[styles.navText, activeRoute === 'Dashboard' && styles.activeNavText]}>Quêtes</Text>
      </TouchableOpacity>

      {/* 3. ROADMAP — mascotte flottante */}
      <TouchableOpacity
        style={styles.mapBtn}
        onPress={handleMascotPress}
        activeOpacity={0.85}
      >
        <Image source={mascotte} style={[styles.mascotteImg, activeRoute === 'Map' && styles.mascotteImgActive]} resizeMode="contain" />
      </TouchableOpacity>

      {/* 4. GALERIE */}
      <TouchableOpacity 
        style={[styles.navItem, activeRoute === 'GalleryAll' && styles.activeNavItem]}
        onPress={() => navigateWithDirection('GalleryAll')}
      >
        <Images 
          size={22} 
          color={activeRoute === 'GalleryAll' ? '#d97706' : '#64748b'} 
          strokeWidth={activeRoute === 'GalleryAll' ? 2.5 : 2}
        />
        <Text style={[styles.navText, activeRoute === 'GalleryAll' && styles.activeNavText]}>Galerie</Text>
      </TouchableOpacity>

      {/* 5. PROFIL */}
      <TouchableOpacity 
        style={[styles.navItem, activeRoute === 'Profile' && styles.activeNavItem]}
        onPress={() => navigateWithDirection('Profile')}
      >
        <User 
          size={22} 
          color={activeRoute === 'Profile' ? '#d97706' : '#64748b'} 
          strokeWidth={activeRoute === 'Profile' ? 2.5 : 2}
        />
        <Text style={[styles.navText, activeRoute === 'Profile' && styles.activeNavText]}>Compte</Text>
      </TouchableOpacity>

      {/* 6. ADMIN (Si autorisé) */}
      {canAccessAdmin && (
        <TouchableOpacity 
          style={[styles.navItem, activeRoute === 'AdminPanel' && styles.activeNavItem]}
          onPress={() => navigateWithDirection('AdminPanel')}
        >
          <Settings 
            size={22} 
            color={activeRoute === 'AdminPanel' ? '#d97706' : '#64748b'} 
            strokeWidth={activeRoute === 'AdminPanel' ? 2.5 : 2}
          />
          <Text style={[styles.navText, activeRoute === 'AdminPanel' && styles.activeNavText]}>Admin</Text>
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
    height: 90,
    backgroundColor: '#fff', 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    alignItems: 'center',
    paddingBottom: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  navItem: { 
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    width: 60,
  },
  navText: {
    fontSize: 10,
    fontFamily: 'Poppins_500Medium',
    color: '#64748b',
    marginTop: 4
  },
  activeNavText: {
    color: '#d97706',
    fontWeight: 'bold'
  },

  // Bouton central Carte — mascotte flottante
  mapBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    width: 60,
  },
  mascotteImg: {
    width: 64,
    height: 64,
    opacity: 0.8,
    marginTop: 6,
  },
  mascotteImgActive: {
    opacity: 1,
  },
});