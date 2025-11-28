import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import api from '../utils/api';

export default function DashboardScreen({ route, navigation }) {
  const { city } = route.params;
  const [paths, setPaths] = useState([]);

  useEffect(() => {
    const fetchPaths = async () => {
      try {
        const res = await api.get('/game/paths');
        
        // FILTRAGE ROBUSTE : On nettoie les deux chaînes (minuscules + sans espaces inutiles)
        const targetCity = city.trim().toLowerCase();
        
        const cityPaths = res.data.filter(p => 
          p.city && p.city.trim().toLowerCase() === targetCity
        );
        
        setPaths(cityPaths);
      } catch (err) { console.error(err); }
    };
    fetchPaths();
  }, [city]);

  // Fonction pour avoir la couleur selon la catégorie
  const getCategoryStyle = (category) => {
    // On gère les cas même si c'est écrit en minuscule ou majuscule
    const cat = category ? category.trim() : '';
    
    switch(cat) {
      case 'Culturel': return { bg: '#fef9c3', text: '#b45309' }; // Jaune
      case 'Sportif': return { bg: '#fee2e2', text: '#ef4444' }; // Rouge
      case 'Culinaire': return { bg: '#ede9fe', text: '#7c3aed' }; // Violet
      case 'Détente': return { bg: '#d1fae5', text: '#059669' }; // Vert
      case 'Mixte': return { bg: '#e0f2fe', text: '#0284c7' }; // Bleu
      default: return { bg: '#f1f5f9', text: '#64748b' }; // Gris (par défaut)
    }
  };

  const renderItem = ({ item }) => {
    // On récupère le style correspondant à la catégorie (qui est stockée dans le champ 'difficulty')
    const catStyle = getCategoryStyle(item.difficulty);

    return (
      <TouchableOpacity 
        activeOpacity={0.9}
        style={styles.card}
        onPress={() => navigation.navigate('PathDetail', { id: item._id })}
      >
        <View style={styles.cardLeft}>
          <View style={styles.iconContainer}>
            <Text style={styles.cardIcon}>🗺️</Text>
          </View>
        </View>
        
        <View style={styles.cardRight}>
          <View style={styles.badges}>
            {/* Badge Catégorie Coloré */}
            <View style={[styles.catBadge, { backgroundColor: catStyle.bg }]}>
              <Text style={[styles.catText, { color: catStyle.text }]}>{item.difficulty}</Text>
            </View>
            <Text style={styles.questCount}>• {item.quests.length} étapes</Text>
          </View>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
          
          <View style={styles.playBtn}>
            <Text style={styles.playBtnText}>VOIR LES DÉTAILS ▶</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Changer de ville</Text>
        </TouchableOpacity>
        <Text style={styles.cityTitle}>{city}</Text>
      </View>

      <Text style={styles.sectionTitle}>Parcours disponibles</Text>

      <FlatList
        data={paths}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyText}>Aucun parcours trouvé à {city}.</Text>
            <Text style={styles.emptySubText}>Soyez le premier à en créer un !</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', paddingHorizontal: 20, paddingTop: 60 },
  header: { marginBottom: 20 },
  backBtn: { alignSelf: 'flex-start', paddingVertical: 5 },
  backText: { color: '#64748b', fontSize: 14, fontWeight: 'bold' },
  cityTitle: { fontSize: 32, fontWeight: '900', color: '#d97706', textTransform: 'uppercase', marginTop: 5 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#334155' },
  
  card: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 15, flexDirection: 'row', overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, padding: 5 },
  cardLeft: { width: 80, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: '#f1f5f9', borderStyle: 'dashed' },
  iconContainer: { width: 50, height: 50, backgroundColor: '#fff7ed', borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  cardIcon: { fontSize: 24 },
  cardRight: { flex: 1, padding: 12 },
  
  badges: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  
  // STYLE DU BADGE CATÉGORIE
  catBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 8 },
  catText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },

  questCount: { color: '#94a3b8', fontSize: 11, fontWeight: '600' },
  
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 },
  cardDesc: { fontSize: 12, color: '#94a3b8', marginBottom: 12, lineHeight: 16 },
  playBtn: { backgroundColor: '#1e293b', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  playBtnText: { color: '#fff', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyEmoji: { fontSize: 50, marginBottom: 10 },
  emptyText: { fontSize: 16, fontWeight: 'bold', color: '#334155' },
  emptySubText: { fontSize: 14, color: '#94a3b8', marginTop: 5 }
});