import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import api from '../utils/api';
import BottomNav from '../components/BottomNav';

export default function MapScreen({ route, navigation }) {
  const { id } = route.params;
  const [path, setPath] = useState(null);
  const [selectedQuestId, setSelectedQuestId] = useState(null);
  const [completedQuests, setCompletedQuests] = useState([]);

  useEffect(() => {
    const fetchPath = async () => {
      try {
        const res = await api.get(`/game/paths/${id}`);
        setPath(res.data);
        
        if (res.data.quests.length > 0) {
          setSelectedQuestId(res.data.quests[0]._id);
        }
      } catch (err) { console.error(err); }
    };
    fetchPath();
  }, [id]);

  if (!path) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#d97706" />;

  const selectedQuest = path.quests.find(q => q._id === selectedQuestId);

  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.city}>{path.city}</Text>
          <Text style={styles.pathTitle} numberOfLines={1}>{path.title}</Text>
        </View>
      </View>

      {/* MAP */}
      <MapView 
        style={styles.map} 
        initialRegion={{
          latitude: path.quests[0]?.location?.lat || 48.85,
          longitude: path.quests[0]?.location?.lng || 2.35,
          latitudeDelta: 0.05, 
          longitudeDelta: 0.05
        }}
      >
        {path.quests.map((quest, index) => (
          <Marker
            key={quest._id}
            coordinate={{ 
              latitude: quest.location.lat, 
              longitude: quest.location.lng 
            }}
            pinColor={completedQuests.includes(quest._id) ? "green" : "red"}
            onPress={() => setSelectedQuestId(quest._id)}
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

      {/* INFO PANEL */}
      {selectedQuest && (
        <View style={styles.infoPanel}>
          <View style={styles.infoPanelHeader}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>
                ÉTAPE {path.quests.findIndex(q => q._id === selectedQuest._id) + 1}/{path.quests.length}
              </Text>
            </View>
            {completedQuests.includes(selectedQuest._id) && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedBadgeText}>✓ VALIDÉE</Text>
              </View>
            )}
          </View>
          <Text style={styles.infoPanelTitle}>{selectedQuest.title}</Text>
          <Text style={styles.infoPanelDesc} numberOfLines={2}>{selectedQuest.description}</Text>
        </View>
      )}

      {/* BOTTOM NAV */}
      <BottomNav navigation={navigation} activeRoute="Map" currentPathId={id} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', paddingBottom: 80 },
  
  header: { 
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 50, 
    paddingHorizontal: 15, 
    paddingBottom: 15,
    backgroundColor: 'rgba(255,255,255,0.95)', 
    flexDirection: 'row', 
    alignItems: 'center',
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5
  },
  city: { fontSize: 10, fontWeight: 'bold', color: '#d97706', textTransform: 'uppercase' },
  pathTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },

  map: { width: '100%', height: '100%' },
  
  callout: { width: 150, padding: 5 },
  stepTitle: { fontSize: 10, color: '#d97706', fontWeight: 'bold' },
  questTitle: { fontSize: 14, fontWeight: 'bold', color: '#1e293b' },

  infoPanel: { 
    position: 'absolute', 
    bottom: 80, 
    left: 15, 
    right: 15, 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    padding: 20, 
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10
  },
  infoPanelHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  stepBadge: { backgroundColor: '#dbeafe', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  stepBadgeText: { color: '#2563eb', fontSize: 10, fontWeight: '900' },
  completedBadge: { backgroundColor: '#dcfce7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  completedBadgeText: { color: '#16a34a', fontSize: 10, fontWeight: '900' },
  infoPanelTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 5 },
  infoPanelDesc: { fontSize: 14, color: '#64748b', lineHeight: 20 },
});