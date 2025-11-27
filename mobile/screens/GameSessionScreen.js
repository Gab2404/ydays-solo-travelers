import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import api from '../utils/api';

export default function GameSessionScreen({ route, navigation }) {
  const { id } = route.params;
  const [path, setPath] = useState(null);
  const [viewMode, setViewMode] = useState('map'); // 'map' ou 'list'

  useEffect(() => {
    const fetchPath = async () => {
      try {
        const res = await api.get(`/game/paths/${id}`);
        setPath(res.data);
      } catch (err) { console.error(err); }
    };
    fetchPath();
  }, [id]);

  if (!path) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#f59e0b" />;

  const initialRegion = path.quests.length > 0 
    ? { latitude: path.quests[0].location.lat, longitude: path.quests[0].location.lng, latitudeDelta: 0.05, longitudeDelta: 0.05 }
    : { latitude: 48.8566, longitude: 2.3522, latitudeDelta: 0.1, longitudeDelta: 0.1 };

  return (
    <View style={styles.container}>
      {/* Header Flottant */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.iconText}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.city}>{path.city}</Text>
          <Text style={styles.pathTitle} numberOfLines={1}>{path.title}</Text>
        </View>
        {/* Bouton Switch Vue */}
        <View style={styles.switchContainer}>
          <TouchableOpacity onPress={() => setViewMode('list')} style={[styles.switchBtn, viewMode === 'list' && styles.activeBtn]}>
            <Text style={[styles.switchText, viewMode === 'list' && styles.activeText]}>📄</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setViewMode('map')} style={[styles.switchBtn, viewMode === 'map' && styles.activeBtn]}>
            <Text style={[styles.switchText, viewMode === 'map' && styles.activeText]}>🗺️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === 'map' ? (
        // --- VUE CARTE ---
        <MapView style={styles.map} initialRegion={initialRegion}>
          {path.quests.map((quest, index) => (
            <Marker
              key={quest._id}
              coordinate={{ latitude: quest.location.lat, longitude: quest.location.lng }}
              pinColor="#ef4444"
            >
              <Callout>
                <View style={styles.callout}>
                  <Text style={styles.stepTitle}>Étape {index + 1}</Text>
                  <Text style={styles.questTitle}>{quest.title}</Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      ) : (
        // --- VUE LISTE ---
        <ScrollView style={styles.listContainer} contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={styles.timelineLine} />
          {path.quests.length === 0 && <Text style={{textAlign:'center', marginTop: 20, color: '#94a3b8'}}>Aucune quête.</Text>}
          
          {path.quests.map((quest, index) => (
            <View key={quest._id} style={styles.stepContainer}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepNumber}>{index + 1}</Text>
              </View>
              <View style={styles.stepCard}>
                <Text style={styles.cardQuestTitle}>{quest.title}</Text>
                <Text style={styles.cardQuestDesc}>{quest.description}</Text>
                <TouchableOpacity style={styles.validateBtn}>
                  <Text style={styles.validateText}>Valider l'étape</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  map: { width: '100%', height: '100%' },
  header: { position: 'absolute', top: 50, left: 15, right: 15, backgroundColor: 'rgba(255,255,255,0.95)', padding: 10, borderRadius: 15, flexDirection: 'row', alignItems: 'center', zIndex: 10, elevation: 5 },
  backBtn: { marginRight: 10, padding: 5 },
  iconText: { fontSize: 24, color: '#64748b' },
  city: { fontSize: 10, fontWeight: 'bold', color: '#d97706', textTransform: 'uppercase' },
  pathTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  
  switchContainer: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 8, padding: 2 },
  switchBtn: { padding: 8, borderRadius: 6 },
  activeBtn: { backgroundColor: '#fff', elevation: 2 },
  switchText: { fontSize: 18 },

  // Styles Liste
  listContainer: { marginTop: 120, paddingHorizontal: 20 },
  timelineLine: { position: 'absolute', left: 35, top: 0, bottom: 0, width: 2, backgroundColor: '#e2e8f0' },
  stepContainer: { flexDirection: 'row', marginBottom: 20 },
  stepBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#d97706', justifyContent: 'center', alignItems: 'center', marginRight: 15, zIndex: 1, borderWidth: 3, borderColor: '#fff' },
  stepNumber: { color: '#fff', fontWeight: 'bold' },
  stepCard: { flex: 1, backgroundColor: '#fff', padding: 15, borderRadius: 12, elevation: 2 },
  cardQuestTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 5 },
  cardQuestDesc: { fontSize: 14, color: '#64748b', marginBottom: 10 },
  validateBtn: { backgroundColor: '#1e293b', padding: 10, borderRadius: 8, alignItems: 'center' },
  validateText: { color: '#fff', fontWeight: 'bold', fontSize: 12 }
});