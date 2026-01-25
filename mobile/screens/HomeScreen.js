import React, { useContext, useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Image, Dimensions, StatusBar 
} from 'react-native';
import { MapPin, ChevronRight, Star, Clock } from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, AoboshiOne_400Regular } from '@expo-google-fonts/aoboshi-one';
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';

const { width } = Dimensions.get('window');

// --- CHARTE & COULEURS ---
const COLORS = {
  headerTeal: '#487C83', // Bleu-vert de la maquette
  orange: '#ED6F2D', 
  dark: '#1e293b',
  grey: '#64748b',
  background: '#F8FAFC',
  cardBg: '#FFFFFF',
};

// --- DONNÉES FICTIVES ---
const FEATURED_PATH = {
  id: 'featured_1',
  title: 'Les Mystères du Vieux Bordeaux',
  description: 'Plongez dans les légendes oubliées de la ville.',
  steps: 6,
  rating: 4.8,
  image: require('../assets/images/bordeaux.jpg'), 
};

const NEARBY_PATHS = [
  { id: '1', title: 'Street Art Chartrons', distance: '300m', duration: '45 min', image: require('../assets/images/culturel.png') },
  { id: '2', title: 'Run & Garonne', distance: '850m', duration: '1h15', image: require('../assets/images/sportif.png') },
  { id: '3', title: 'Fantômes de la Victoire', distance: '1.2km', duration: '2h00', image: require('../assets/images/detente.png') },
];

export default function HomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  let [fontsLoaded] = useFonts({
    AoboshiOne_400Regular,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold
  });

  useEffect(() => {
    const hideSplash = async () => {
      try { await SplashScreen.hideAsync(); } catch (e) { console.warn(e); }
    };
    if (fontsLoaded) hideSplash();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  const goToDetail = (pathId) => {
    navigation.navigate('PathDetail', { pathId });
  };

  return (
    <View style={styles.container}>
      {/* StatusBar blanche sur fond Teal */}
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerTeal} />

      {/* --- HEADER --- */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeLabel}>Bonjour,</Text>
            <Text style={styles.username}>{user?.firstname || 'Voyageur'}</Text>
          </View>
          <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile')}>
            <Image 
                source={require('../assets/images/mascotte2.png')} 
                style={styles.avatarImage} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* --- SECTION HERO (À la une) --- */}
        <View style={styles.sectionContainer}>
          {/* Titre simple sans badge ni étoile */}
          <Text style={styles.sectionTitle}>À la une</Text>

          <TouchableOpacity 
            style={styles.heroCard} 
            onPress={() => goToDetail(FEATURED_PATH.id)} 
            activeOpacity={0.9}
          >
            {/* Image */}
            <Image source={FEATURED_PATH.image} style={styles.heroImage} resizeMode="cover" />
            
            {/* Contenu */}
            <View style={styles.heroContent}>
                <View style={styles.heroHeaderRow}>
                    <Text style={styles.heroTitle} numberOfLines={1}>{FEATURED_PATH.title}</Text>
                    <View style={styles.ratingContainer}>
                        <Star size={12} color="#FBBF24" fill="#FBBF24" />
                        <Text style={styles.ratingText}>{FEATURED_PATH.rating}</Text>
                    </View>
                </View>

                <Text style={styles.heroDescription} numberOfLines={2}>
                    {FEATURED_PATH.description}
                </Text>

                <View style={styles.heroFooter}>
                    <View style={styles.metaRow}>
                        <MapPin size={12} color={COLORS.grey} />
                        <Text style={styles.metaText}>{FEATURED_PATH.steps} étapes</Text>
                    </View>
                    
                    <TouchableOpacity style={styles.ctaLink}>
                        <Text style={styles.ctaText}>Découvrir</Text>
                        <ChevronRight size={14} color={COLORS.orange} />
                    </TouchableOpacity>
                </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* --- SUGGESTIONS (Autour de toi) --- */}
        <View style={styles.sectionContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.sectionTitle}>Autour de toi</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Map')}>
                <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingRight: 20}}>
            {NEARBY_PATHS.map((path) => (
               <TouchableOpacity key={path.id} style={styles.nearbyCard} activeOpacity={0.9} onPress={() => goToDetail(path.id)}>
                  <Image source={path.image} style={styles.nearbyImage} />
                  
                  <View style={styles.nearbyContent}>
                      <Text style={styles.nearbyTitle} numberOfLines={1}>{path.title}</Text>
                      <View style={styles.nearbyMetaRow}>
                          <Clock size={10} color={COLORS.grey} />
                          <Text style={styles.nearbyMetaText}>{path.duration}</Text>
                          <Text style={styles.dotSeparator}>•</Text>
                          <MapPin size={10} color={COLORS.grey} />
                          <Text style={styles.nearbyMetaText}>{path.distance}</Text>
                      </View>
                  </View>
               </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

      </ScrollView>

      <BottomNav navigation={navigation} activeRoute="Home" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  
  // --- HEADER ---
  headerContainer: {
    backgroundColor: COLORS.headerTeal,
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5,
  },
  headerContent: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  welcomeLabel: { 
    fontFamily: 'Poppins_400Regular', 
    fontSize: 14, 
    color: 'rgba(255,255,255,0.8)' 
  },
  username: { 
    fontFamily: 'AoboshiOne_400Regular', 
    fontSize: 24, 
    color: '#FFFFFF', 
    marginTop: 2
  },
  profileBtn: { 
    padding: 2, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 30,
  },
  avatarImage: { width: 44, height: 44, borderRadius: 22 },

  // --- SECTIONS ---
  sectionContainer: { marginBottom: 25, paddingLeft: 24 },
  
  // Titre Section
  sectionTitle: { 
    fontFamily: 'AoboshiOne_400Regular', 
    fontSize: 18, 
    color: COLORS.dark, 
    marginBottom: 12 
  },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 24, marginBottom: 12 },
  seeAllText: { fontFamily: 'Poppins_500Medium', color: COLORS.orange, fontSize: 12 },

  // --- HERO CARD ---
  heroCard: {
    width: width - 48,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
    overflow: 'hidden'
  },
  heroImage: { width: '100%', height: 140 }, 
  heroContent: { padding: 16 }, 
  
  heroHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  heroTitle: { fontFamily: 'AoboshiOne_400Regular', fontSize: 16, color: COLORS.dark, flex: 1, marginRight: 10 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 8 },
  ratingText: { fontFamily: 'Poppins_700Bold', fontSize: 11, color: '#D97706', marginLeft: 3 },

  heroDescription: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: COLORS.grey, lineHeight: 18, marginBottom: 14 },

  heroFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontFamily: 'Poppins_500Medium', color: COLORS.grey, fontSize: 12 },
  
  ctaLink: { flexDirection: 'row', alignItems: 'center' },
  ctaText: { fontFamily: 'Poppins_600SemiBold', color: COLORS.orange, fontSize: 12, marginRight: 2 },

  // --- NEARBY CARDS ---
  nearbyCard: { width: 150, marginRight: 14, backgroundColor: '#fff', borderRadius: 16, padding: 8, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  nearbyImage: { width: '100%', height: 100, borderRadius: 12, marginBottom: 8 },
  
  nearbyContent: { paddingHorizontal: 4 },
  nearbyTitle: { fontFamily: 'Poppins_700Bold', color: COLORS.dark, fontSize: 12, marginBottom: 2 },
  nearbyMetaRow: { flexDirection: 'row', alignItems: 'center' },
  nearbyMetaText: { fontFamily: 'Poppins_500Medium', color: COLORS.grey, fontSize: 10, marginLeft: 2 },
  dotSeparator: { marginHorizontal: 4, color: COLORS.grey, fontSize: 10 },
});