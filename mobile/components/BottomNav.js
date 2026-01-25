import React, { useEffect, useState, useContext } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Home, Compass, Map, User, Settings } from 'lucide-react-native'; // Ajout de Compass
import { AuthContext } from '../context/AuthContext';
import { useNavigationDirection } from '../context/NavigationContext';
import storage from '../utils/storage';
import errorHandler from '../utils/errorHandler';

export default function BottomNav({ navigation, activeRoute, currentPathId }) {
  const { user } = useContext(AuthContext);
  const { setDirection } = useNavigationDirection();
  const [lastPathId, setLastPathId] = useState(null);

  // Ordre des routes
  const getRouteOrder = () => {
    const routes = {
      'Home': 0,
      'Dashboard': 1, // Nouvelle page Quêtes
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

  const canAccessAdmin = user?.role === 'admin' || user?.certified;

  return (
    <View style={styles.bottomNav}>
      
      {/* 1. ACCUEIL */}
      <TouchableOpacity 
        style={[styles.navItem, activeRoute === 'Home' && styles.activeNavItem]}
        onPress={() => navigateWithDirection('Home')}
      >
        <Home 
          size={26} 
          color={activeRoute === 'Home' ? '#d97706' : '#64748b'} 
          strokeWidth={activeRoute === 'Home' ? 2.5 : 2}
        />
        <Text style={[styles.navText, activeRoute === 'Home' && styles.activeNavText]}>Accueil</Text>
      </TouchableOpacity>

      {/* 2. QUÊTES (DASHBOARD) - NOUVEAU */}
      <TouchableOpacity 
        style={[styles.navItem, activeRoute === 'Dashboard' && styles.activeNavItem]}
        onPress={() => navigateWithDirection('Dashboard', { city: 'Bordeaux' })} // Force Bordeaux par défaut
      >
        <Compass 
          size={26} 
          color={activeRoute === 'Dashboard' ? '#d97706' : '#64748b'} 
          strokeWidth={activeRoute === 'Dashboard' ? 2.5 : 2}
        />
        <Text style={[styles.navText, activeRoute === 'Dashboard' && styles.activeNavText]}>Quêtes</Text>
      </TouchableOpacity>

      {/* 3. CARTE */}
      <TouchableOpacity 
        style={[styles.navItem, activeRoute === 'Map' && styles.activeNavItem]}
        onPress={() => navigateWithDirection('Map')}
      >
        <Map 
          size={26} 
          color={activeRoute === 'Map' ? '#d97706' : '#64748b'} 
          strokeWidth={activeRoute === 'Map' ? 2.5 : 2}
        />
        <Text style={[styles.navText, activeRoute === 'Map' && styles.activeNavText]}>Carte</Text>
      </TouchableOpacity>

      {/* 4. PROFIL */}
      <TouchableOpacity 
        style={[styles.navItem, activeRoute === 'Profile' && styles.activeNavItem]}
        onPress={() => navigateWithDirection('Profile')}
      >
        <User 
          size={26} 
          color={activeRoute === 'Profile' ? '#d97706' : '#64748b'} 
          strokeWidth={activeRoute === 'Profile' ? 2.5 : 2}
        />
        <Text style={[styles.navText, activeRoute === 'Profile' && styles.activeNavText]}>Compte</Text>
      </TouchableOpacity>

      {/* 5. ADMIN (Si autorisé) */}
      {canAccessAdmin && (
        <TouchableOpacity 
          style={[styles.navItem, activeRoute === 'AdminPanel' && styles.activeNavItem]}
          onPress={() => navigateWithDirection('AdminPanel')}
        >
          <Settings 
            size={26} 
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
    height: 90, // Un peu plus haut pour les labels
    backgroundColor: '#fff', 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    alignItems: 'center',
    paddingBottom: 20, // Pour les écrans sans bouton home physique
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
  }
});