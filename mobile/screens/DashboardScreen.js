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
        const cityPaths = res.data.filter(p => p.city === city);
        setPaths(cityPaths);
      } catch (err) { console.error(err); }
    };
    fetchPaths();
  }, [city]);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      activeOpacity={0.9}
      style={styles.card}
      onPress={() => navigation.navigate('PathDetail', { id: item._id })} // <-- Modification ICI
    >
      <View style={styles.cardLeft}>
        <View style={styles.iconContainer}>
          <Text style={styles.cardIcon}>🗺️</Text>
        </View>
      </View>
      
      <View style={styles.cardRight}>
        <View style={styles.badges}>
          <Text style={styles.difficulty}>{item.difficulty}</Text>
          <Text style={styles.questCount}>{item.quests.length} étapes</Text>
        </View>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
        
        <View style={styles.playBtn}>
          <Text style={styles.playBtnText}>VOIR LES DÉTAILS ▶</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
        ListEmptyComponent={<Text style={styles.empty}>Aucun parcours dans cette ville.</Text>}
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
  badges: { flexDirection: 'row', marginBottom: 5 },
  difficulty: { color: '#d97706', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', marginRight: 10, backgroundColor: '#fff7ed', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  questCount: { color: '#64748b', fontSize: 10, fontWeight: 'bold' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 },
  cardDesc: { fontSize: 12, color: '#94a3b8', marginBottom: 12, lineHeight: 16 },
  playBtn: { backgroundColor: '#1e293b', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  playBtnText: { color: '#fff', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  empty: { textAlign: 'center', marginTop: 50, color: '#94a3b8' }
});