import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, Dimensions, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api';
import { Clock, MapPin, Star, Heart, ArrowLeft, Users } from 'lucide-react-native';
import BottomNav from '../components/BottomNav';

const { width } = Dimensions.get('window');

export default function PathDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [path, setPath] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  // Images des villes
  const cityImages = {
    bordeaux: require('../assets/images/bordeaux.jpg'),
    paris: require('../assets/images/paris.jpg'),
    marseille: require('../assets/images/marseille.jpg'),
    lyon: require('../assets/images/lyon.jpg'),
    toulouse: require('../assets/images/toulouse.jpg'),
  };

  // Images des catégories
  const categoryImages = {
    'Culturel': require('../assets/images/culturel.png'),
    'Sportif': require('../assets/images/sportif.png'),
    'Culinaire': require('../assets/images/culinaire.png'),
    'Détente': require('../assets/images/detente.png'),
    'Mixte': require('../assets/images/mixte.png'),
  };

  useEffect(() => {
    const fetchPath = async () => {
      try {
        const res = await api.get(`/game/paths/${id}`);
        setPath(res.data);
      } catch (err) { console.error(err); }
    };
    fetchPath();
  }, [id]);

  // Fonction pour obtenir les couleurs selon la catégorie
  const getCategoryStyle = (category) => {
    switch(category) {
      case 'Culturel': return { bg: '#fef9c3', text: '#b45309', icon: '#b45309' };
      case 'Sportif': return { bg: '#fee2e2', text: '#ef4444', icon: '#ef4444' };
      case 'Culinaire': return { bg: '#ede9fe', text: '#7c3aed', icon: '#7c3aed' };
      case 'Détente': return { bg: '#d1fae5', text: '#059669', icon: '#059669' };
      case 'Mixte': return { bg: '#e0f2fe', text: '#0284c7', icon: '#0284c7' };
      default: return { bg: '#f1f5f9', text: '#64748b', icon: '#8b5cf6' };
    }
  };

  const handleStartTrip = async () => {
    try {
      await AsyncStorage.setItem('lastPathId', path._id);
      navigation.navigate('Roadmap', { id: path._id });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du parcours:', error);
    }
  };

  if (!path) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#10b981" />;

  const estimatedTime = `${(path.quests.length * 20)} min`; 
  const estimatedDistance = `${(path.quests.length * 0.8).toFixed(1)} km`;
  const categoryStyle = getCategoryStyle(path.difficulty);
  
  // Déterminer l'image de la catégorie
  const categoryImage = path.difficulty ? categoryImages[path.difficulty] : null;

  return (
    <View style={styles.container}>
      
      {/* HEADER avec bouton retour uniquement */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        
        {/* CARTE IMAGE avec photo de catégorie */}
        <View style={[styles.imageCard, { transform: [{ rotate: '-1deg' }] }]}>
          {categoryImage ? (
            <ImageBackground 
              source={categoryImage} 
              style={styles.imagePlaceholder}
              imageStyle={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
              resizeMode="cover"
            >
              <View style={styles.imageOverlay} />
            </ImageBackground>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>📷</Text>
              <Text style={styles.imagePlaceholderSubtext}>Photo de destination</Text>
            </View>
          )}
          
          {/* Badge note */}
          <View style={styles.ratingBadge}>
            <Star size={16} color="#fbbf24" fill="#fbbf24" />
            <Text style={styles.ratingBadgeText}>4.9</Text>
          </View>
        </View>

        {/* CARD BLANCHE PRINCIPALE - Titre + infos avec rotation */}
        <View style={[styles.mainCard, { transform: [{ rotate: '-1deg' }] }]}>
          
          {/* Titre */}
          <Text style={styles.title}>{path.title}</Text>
          
          {/* By TravelQuest */}
          <View style={styles.authorContainer}>
            <Text style={styles.authorIcon}>✈️</Text>
            <Text style={styles.authorText}>By TravelQuest</Text>
          </View>

          {/* Info badges compacts */}
          <View style={styles.infoBadgesContainer}>
            <View style={styles.infoBadge}>
              <Clock size={18} color="#f59e0b" />
              <Text style={styles.infoBadgeText}>{estimatedTime}</Text>
            </View>
            
            <View style={styles.infoBadge}>
              <MapPin size={18} color="#ec4899" />
              <Text style={styles.infoBadgeText}>{estimatedDistance}</Text>
            </View>
            
            <View style={[styles.infoBadge, { backgroundColor: categoryStyle.bg }]}>
              <Users size={18} color={categoryStyle.icon} />
              <Text style={[styles.infoBadgeText, { color: categoryStyle.text }]}>{path.difficulty}</Text>
            </View>
          </View>
        </View>

        {/* CARD INFORMATIONS PRATIQUES avec description et rotation */}
        <View style={[styles.practicalInfoCard, { transform: [{ rotate: '1deg' }], marginTop: 10}]}>
          <View style={styles.practicalInfoHeader}>
            <Text style={styles.practicalInfoIcon}>📋</Text>
            <Text style={styles.practicalInfoTitle}>Informations pratiques</Text>
          </View>
          
          <Text style={styles.description}>
            {path.description || "Explorez la ville à travers ce parcours unique. Découvrez des lieux cachés et résolvez des énigmes passionnantes !"}
          </Text>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* BOUTON START TRIP FIXE */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.startBtn}
          onPress={handleStartTrip}
          activeOpacity={0.9}
        >
          <Text style={styles.startBtnIcon}>🚀</Text>
          <Text style={styles.startBtnText}>Commencer l'aventure</Text>
        </TouchableOpacity>
      </View>

      {/* BOTTOM NAV */}
      <BottomNav navigation={navigation} activeRoute="PathDetail" currentPathId={id} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa',
  },
  
  // Header
  header: { 
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  
  headerBtn: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  
  timeBadge: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },

  // Content
  content: { 
    paddingTop: 120,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  // Image Card - collée avec la carte principale
  imageCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#f97316',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  
  imagePlaceholderText: {
    fontSize: 50,
    marginBottom: 8,
  },
  
  imagePlaceholderSubtext: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  
  ratingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  
  ratingBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },

  // Main Card - Collée avec l'image
  mainCard: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  
  title: { 
    fontSize: 26,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 6,
  },
  
  authorIcon: {
    fontSize: 14,
  },
  
  authorText: {
    fontSize: 14,
    color: '#f97316',
    fontWeight: '600',
  },
  
  infoBadgesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },
  
  infoBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },

  // Practical Info Card - Avec description
  practicalInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  
  practicalInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  
  practicalInfoIcon: {
    fontSize: 20,
  },
  
  practicalInfoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f97316',
  },
  
  description: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 21,
  },

  // Footer - encore plus remonté
  footer: { 
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 120,
    backgroundColor: 'transparent',
  },
  
  startBtn: { 
    backgroundColor: '#f97316',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#10b981',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  
  startBtnIcon: {
    fontSize: 20,
  },
  
  startBtnText: { 
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});