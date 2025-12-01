import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import api from '../utils/api';

export default function DashboardScreen({ route, navigation }) {
  const { city } = route.params;
  const [paths, setPaths] = useState([]);

  useEffect(() => {
    const fetchPaths = async () => {
      try {
        const res = await api.get('/game/paths');
        const targetCity = city.trim().toLowerCase();
        
        const cityPaths = res.data.filter(p => 
          p.city && p.city.trim().toLowerCase() === targetCity
        );
        
        setPaths(cityPaths);
      } catch (err) { console.error(err); }
    };
    fetchPaths();
  }, [city]);

  // --- GESTION DES IMAGES PAR CATÉGORIE ---
  // Assure-toi que ces fichiers existent bien dans ton dossier assets !
  const categoryImages = {
    'Culturel': require('../assets/images/culturel.png'),
    'Sportif': require('../assets/images/sportif.png'),
    'Culinaire': require('../assets/images/culinaire.png'),
    'Détente': require('../assets/images/detente.png'),
    'Mixte': require('../assets/images/mixte.png'),
    // Fallback pour éviter les crashs si une catégorie est inconnue
    'default': require('../assets/images/mixte.png'), 
  };

  // --- GESTION DES COULEURS DES BADGES ---
  const getCategoryColor = (category) => {
    const cat = category ? category.trim() : '';
    switch(cat) {
      case 'Culturel': return { bg: '#ede9fe', text: '#7c3aed' }; // Violet
      case 'Sportif': return { bg: '#fee2e2', text: '#ef4444' }; // Rouge
      case 'Culinaire': return { bg: '#ffedd5', text: '#c2410c' }; // Orange
      case 'Détente': return { bg: '#d1fae5', text: '#059669' }; // Vert
      case 'Mixte': return { bg: '#e0f2fe', text: '#0284c7' }; // Bleu
      default: return { bg: '#f1f5f9', text: '#64748b' }; // Gris
    }
  };

  const renderItem = ({ item }) => {
    const catStyle = getCategoryColor(item.difficulty);
    // Sélection de l'image : si la catégorie n'existe pas dans la liste, on prend 'default'
    const imageSource = categoryImages[item.difficulty] || categoryImages['default'];

    return (
      <TouchableOpacity 
        activeOpacity={0.9}
        style={styles.card}
        onPress={() => navigation.navigate('PathDetail', { id: item._id })}
      >
        {/* IMAGE DE LA CATÉGORIE (Gauche) */}
        <View style={styles.cardImageContainer}>
          <Image 
            source={imageSource} 
            style={styles.cardImage} 
            resizeMode="cover" 
          />
        </View>
        
        {/* CONTENU (Droite) */}
        <View style={styles.cardContent}>
          
          {/* En-tête : Badge + Nombre étapes */}
          <View style={styles.cardHeader}>
            <View style={[styles.catBadge, { backgroundColor: catStyle.bg }]}>
              <Text style={[styles.catText, { color: catStyle.text }]}>{item.difficulty}</Text>
            </View>
            <Text style={styles.stepsText}>{item.quests.length} étapes</Text>
          </View>

          {/* Titre & Description */}
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.cardDesc} numberOfLines={2}>
            {item.description || "Découvrez ce parcours unique à travers la ville..."}
          </Text>
          
          {/* Bouton discret "Voir" */}
          <View style={styles.seeMoreContainer}>
            <Text style={styles.seeMoreText}>VOIR LE PARCOURS →</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header simple */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Changer de ville</Text>
        </TouchableOpacity>
        <Text style={styles.cityTitle}>{city}</Text>
      </View>

      <Text style={styles.sectionTitle}>Aventures disponibles</Text>

      <FlatList
        data={paths}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyText}>Aucun parcours trouvé ici.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', paddingHorizontal: 20, paddingTop: 60 },
  
  // HEADER
  header: { marginBottom: 25 },
  backBtn: { alignSelf: 'flex-start', paddingVertical: 5, paddingHorizontal: 10, backgroundColor: '#fff', borderRadius: 20, marginBottom: 10 },
  backText: { color: '#64748b', fontSize: 12, fontWeight: 'bold' },
  cityTitle: { fontSize: 34, fontWeight: '900', color: '#d97706', textTransform: 'uppercase', letterSpacing: -1 },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#334155' },

  // CARTE (NOUVEAU DESIGN)
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    marginBottom: 20, 
    flexDirection: 'row', 
    height: 140, // Hauteur fixe pour uniformité
    shadowColor: '#000', 
    shadowOpacity: 0.08, 
    shadowRadius: 15, 
    shadowOffset: { width: 0, height: 4 }, 
    elevation: 4,
    overflow: 'hidden'
  },

  // Partie Image (Gauche)
  cardImageContainer: { width: 110, height: '100%', backgroundColor: '#f1f5f9' },
  cardImage: { width: '100%', height: '100%' },

  // Partie Contenu (Droite)
  cardContent: { flex: 1, padding: 12, justifyContent: 'space-between' },

  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  
  // Badge Catégorie
  catBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  catText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  
  stepsText: { fontSize: 11, color: '#94a3b8', fontWeight: '600' },

  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginTop: 5 },
  cardDesc: { fontSize: 12, color: '#64748b', lineHeight: 16 },

  seeMoreContainer: { alignSelf: 'flex-end' },
  seeMoreText: { fontSize: 10, fontWeight: '900', color: '#d97706', letterSpacing: 0.5 },

  // Empty State
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyEmoji: { fontSize: 40, marginBottom: 10 },
  emptyText: { fontSize: 16, color: '#64748b', fontWeight: '500' }
});