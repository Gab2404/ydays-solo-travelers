import React, { useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ImageBackground, Image } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Search, User, Map as MapIcon, ShoppingBag, X } from 'lucide-react-native';

export default function CitySelectionScreen({ navigation, user, setUser }) {
  
  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  const goToDashboard = (cityName) => {
    navigation.navigate('Dashboard', { city: cityName });
  };

  // Images HD (Unsplash - Vraies photos urbaines)
  const images = {
    bordeaux: "https://images.unsplash.com/photo-1589828016481-416e06740729?q=80&w=800", // Place de la Bourse
    paris: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800", // Tour Eiffel
    marseille: "https://images.unsplash.com/photo-1548695079-c7258498305f?q=80&w=800", // Vieux Port
    lyon: "https://images.unsplash.com/photo-1622303493822-777227dd2b7b?q=80&w=800", // Architecture Lyon
    toulouse: "https://images.unsplash.com/photo-1559579313-021b6ec9f6d6?q=80&w=800", // Ville Rose (Capitole)
  };

  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeLabel}>Bienvenue,</Text>
          <Text style={styles.username}>{user.firstname}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* BOUTON ADMIN */}
      {user.role === 'admin' && (
        <TouchableOpacity style={styles.adminBtn} onPress={() => navigation.navigate('AdminPanel')}>
          <Text style={styles.adminText}>🛠️ Studio Création</Text>
        </TouchableOpacity>
      )}

      {/* TITRE */}
      <View style={styles.titleContainer}>
        <Text style={styles.mainTitle}>Où êtes-vous ? 📍</Text>
        <Text style={styles.subTitle}>Choisissez votre ville pour commencer</Text>
      </View>

      {/* RECHERCHE */}
      <View style={styles.searchBar}>
        <Text style={styles.searchPlaceholder}>Ou est tu ?...</Text>
        <View style={styles.searchIconBox}>
          <Search size={24} color="#1e293b" />
        </View>
      </View>

      {/* GRILLE BENTO */}
      <ScrollView contentContainerStyle={styles.gridContainer} showsVerticalScrollIndicator={false}>
        
        <View style={styles.topRow}>
          
          {/* COLONNE GAUCHE */}
          <View style={styles.leftCol}>
            {/* BORDEAUX (Medium Rectangle) */}
            <TouchableOpacity style={styles.cardMedium} onPress={() => goToDashboard('Bordeaux')}>
              <ImageBackground source={{uri: images.bordeaux}} style={styles.cardBg} imageStyle={{borderRadius: 15}}>
                <View style={styles.overlay}><Text style={styles.cardTitle}>BORDEAUX</Text></View>
              </ImageBackground>
            </TouchableOpacity>

            {/* Ligne MARSEILLE & LYON */}
            <View style={styles.smallRow}>
              <TouchableOpacity style={styles.cardSmall} onPress={() => goToDashboard('Marseille')}>
                <ImageBackground source={{uri: images.marseille}} style={styles.cardBg} imageStyle={{borderRadius: 15}}>
                  <View style={styles.overlay}><Text style={styles.cardTitleSmall}>MARSEILLE</Text></View>
                </ImageBackground>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.cardSmall} onPress={() => goToDashboard('Lyon')}>
                <ImageBackground source={{uri: images.lyon}} style={styles.cardBg} imageStyle={{borderRadius: 15}}>
                  <View style={styles.overlay}><Text style={styles.cardTitleSmall}>LYON</Text></View>
                </ImageBackground>
              </TouchableOpacity>
            </View>
          </View>

          {/* COLONNE DROITE (PARIS) */}
          <View style={styles.rightCol}>
            <TouchableOpacity style={styles.cardTall} onPress={() => goToDashboard('Paris')}>
              <ImageBackground source={{uri: images.paris}} style={styles.cardBg} imageStyle={{borderRadius: 15}}>
                <View style={styles.overlay}><Text style={styles.cardTitle}>PARIS</Text></View>
              </ImageBackground>
            </TouchableOpacity>
          </View>

        </View>

        {/* BAS : TOULOUSE */}
        <TouchableOpacity style={styles.cardWide} onPress={() => goToDashboard('Toulouse')}>
          <ImageBackground source={{uri: images.toulouse}} style={styles.cardBg} imageStyle={{borderRadius: 15}}>
            <View style={styles.overlay}><Text style={styles.cardTitle}>TOULOUSE</Text></View>
          </ImageBackground>
        </TouchableOpacity>

        <View style={{height: 100}} />
      </ScrollView>

      {/* MENU DU BAS */}
      <View style={styles.bottomNav}>
        {/* Navigation vers le Profil activée */}
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
          <User size={28} color="#1e293b" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MapIcon size={28} color="#1e293b" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <ShoppingBag size={28} color="#1e293b" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
  
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 15 },
  welcomeLabel: { fontSize: 14, color: '#64748b' },
  username: { fontSize: 24, fontWeight: '900', color: '#1e293b' },
  closeBtn: { backgroundColor: '#fee2e2', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  closeText: { color: '#ef4444', fontSize: 16, fontWeight: 'bold' },

  adminBtn: { marginHorizontal: 20, backgroundColor: '#1e293b', padding: 12, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  adminText: { color: '#fff', fontWeight: 'bold' },

  titleContainer: { paddingHorizontal: 20, marginBottom: 20 },
  mainTitle: { fontSize: 28, fontWeight: 'bold', color: '#1e293b' },
  subTitle: { fontSize: 14, color: '#64748b' },

  // Barre de recherche
  searchBar: { 
    marginHorizontal: 20, flexDirection: 'row', alignItems: 'center', 
    borderWidth: 2, borderColor: '#1e293b', borderRadius: 15, 
    paddingLeft: 15, marginBottom: 20, height: 55, backgroundColor: '#fff'
  },
  searchPlaceholder: { fontSize: 18, fontWeight: '600', color: '#1e293b', flex: 1 },
  searchIconBox: { width: 50, height: '100%', borderLeftWidth: 2, borderColor: '#1e293b', justifyContent: 'center', alignItems: 'center' },

  // Grille
  gridContainer: { paddingHorizontal: 20 },
  topRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  leftCol: { flex: 2, gap: 10 },
  rightCol: { flex: 1 },

  // --- CARTES SANS BORDURES NOIRES ---
  cardMedium: { height: 120, borderRadius: 20, overflow: 'hidden' }, // Pas de borderWidth
  cardTall: { height: 250, borderRadius: 20, overflow: 'hidden' },   // Pas de borderWidth
  smallRow: { flexDirection: 'row', gap: 10, height: 120 },
  cardSmall: { flex: 1, borderRadius: 20, overflow: 'hidden' },      // Pas de borderWidth
  cardWide: { height: 80, borderRadius: 20, overflow: 'hidden', marginBottom: 20 }, // Pas de borderWidth

  // Style visuel
  cardBg: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  overlay: { backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  cardTitle: { fontSize: 14, fontWeight: '900', color: '#fff', textTransform: 'uppercase', letterSpacing: 1 },
  cardTitleSmall: { fontSize: 10, fontWeight: '900', color: '#fff', textTransform: 'uppercase' },
  cardTitleVertical: { fontSize: 18, fontWeight: '900', color: '#fff', textTransform: 'uppercase' },

  // Bottom Nav
  bottomNav: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, backgroundColor: '#fff', 
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    borderTopWidth: 2, borderTopColor: '#1e293b', paddingBottom: 20
  },
  navItem: { padding: 10 }
});