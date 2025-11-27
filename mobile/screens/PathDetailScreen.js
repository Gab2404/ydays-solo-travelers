import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import api from '../utils/api';
import { Clock, MapPin, Star } from 'lucide-react-native';

export default function PathDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [path, setPath] = useState(null);

  useEffect(() => {
    const fetchPath = async () => {
      try {
        const res = await api.get(`/game/paths/${id}`);
        setPath(res.data);
      } catch (err) { console.error(err); }
    };
    fetchPath();
  }, [id]);

  if (!path) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#d97706" />;

  // Estimation fictive
  const estimatedTime = `${(path.quests.length * 20)} min`; 
  const estimatedDistance = `${(path.quests.length * 0.8).toFixed(1)} km`;

  return (
    <View style={styles.container}>
      
      {/* HEADER: Bouton Retour */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* TITRE DU PARCOURS & NOTE */}
        <Text style={styles.title}>{path.title}</Text>
        <View style={styles.ratingContainer}>
          <Star size={18} color="#FFD700" fill="#FFD700" />
          <Text style={styles.ratingText}> 4.9 (128 reviews) • By TravelQuest</Text>
        </View>

        {/* DESCRIPTION */}
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>
          {path.description || "Explorez la ville à travers ce parcours unique. Découvrez des lieux cachés et résolvez des énigmes passionnantes !"}
        </Text>

        {/* INFOS CLÉS (Badges) */}
        <View style={styles.infoContainer}>
          <View style={styles.infoBadge}>
            <Clock size={20} color="#000" />
            <Text style={styles.infoText}>{estimatedTime}</Text>
          </View>
          <View style={styles.infoBadge}>
            <MapPin size={20} color="#000" />
            <Text style={styles.infoText}>{estimatedDistance}</Text>
          </View>
          <View style={styles.infoBadge}>
            <Text style={{fontSize: 18}}>🧗</Text>
            <Text style={styles.infoText}>{path.difficulty}</Text>
          </View>
        </View>

        {/* ESPACE VIDE POUR LE BOUTON */}
        <View style={{height: 100}} />

      </ScrollView>

      {/* BOUTON "START TRIP" */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.startBtn}
          onPress={() => navigation.navigate('GameSession', { id: path._id })}
        >
          <Text style={styles.startBtnText}>Start Trip</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  
  // Header & Retour
  backBtn: { position: 'absolute', top: 50, left: 20, zIndex: 10, backgroundColor: '#fff', borderRadius: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5 },
  backText: { fontSize: 24, color: '#000' },

  // Contenu
  content: { paddingTop: 120, paddingHorizontal: 25 },

  // Titre & Note
  title: { fontSize: 32, fontWeight: '800', color: '#000', marginBottom: 10 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  ratingText: { fontSize: 14, color: '#64748b', fontWeight: '600' },

  // Description
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#000', marginBottom: 10 },
  description: { fontSize: 16, color: '#475569', lineHeight: 24, marginBottom: 30 },

  // Badges d'info
  infoContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  infoBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 30, gap: 8 },
  infoText: { fontSize: 14, fontWeight: 'bold', color: '#000' },

  // Footer & Bouton Start
  footer: { position: 'absolute', bottom: 30, left: 0, right: 0, paddingHorizontal: 25, alignItems: 'center' },
  startBtn: { backgroundColor: '#000', width: '100%', paddingVertical: 20, borderRadius: 40, alignItems: 'center', elevation: 10 },
  startBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});