import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import Svg, { Path } from 'react-native-svg';
import { Map, List, CheckCircle, ArrowLeft, HelpCircle } from 'lucide-react-native';
import api from '../utils/api';

const { width } = Dimensions.get('window');

export default function GameSessionScreen({ route, navigation }) {
  const { id } = route.params;
  const [path, setPath] = useState(null);
  const [viewMode, setViewMode] = useState('tree'); 
  const [selectedQuestId, setSelectedQuestId] = useState(null);
  
  // Liste des quêtes validées (IDs)
  const [completedQuests, setCompletedQuests] = useState([]);
  
  const scrollViewRef = useRef(null);

  useEffect(() => {
    const fetchPath = async () => {
      try {
        const res = await api.get(`/game/paths/${id}`);
        setPath(res.data);
        
        // Sélectionne la 1ère étape (celle qui sera tout en bas visuellement)
        if (res.data.quests.length > 0) {
          setSelectedQuestId(res.data.quests[0]._id);
        }
      } catch (err) { console.error(err); }
    };
    fetchPath();
  }, [id]);

  if (!path) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#d97706" />;

  // --- LOGIQUE ROADMAP (L'Ascension) ---
  // On inverse le tableau pour l'affichage :
  // Le premier élément du tableau inversé sera affiché en HAUT de l'écran (Fin du parcours)
  // Le dernier élément sera en BAS (Début du parcours)
  const reversedQuests = [...path.quests].reverse();

  const getQuestCoordinates = (index) => {
    const centerX = width / 2;
    const yGap = 120; 
    const xOffset = 80; 
    
    // Zig-zag
    const x = index % 2 === 0 ? centerX + xOffset : centerX - xOffset;
    const y = 80 + index * yGap; 
    
    return { x, y };
  };

  const generateSvgPath = () => {
    if (!reversedQuests || reversedQuests.length === 0) return [];
    
    const paths = [];
    reversedQuests.forEach((quest, index) => {
      if (index === 0) return;
      
      const pos = getQuestCoordinates(index);
      const prevPos = getQuestCoordinates(index - 1);
      const controlY = (prevPos.y + pos.y) / 2;
      
      const d = `M ${prevPos.x} ${prevPos.y} C ${prevPos.x} ${controlY}, ${pos.x} ${controlY}, ${pos.x} ${pos.y}`;
      
      // Vérifie si les deux quêtes sont validées pour colorer le chemin en vert
      const prevQuest = reversedQuests[index - 1];
      const isPathCompleted = completedQuests.includes(prevQuest._id) && completedQuests.includes(quest._id);
      
      paths.push({
        d,
        color: isPathCompleted ? "#22c55e" : "#cbd5e1"
      });
    });
    
    return paths;
  };

  const handleValidateStep = () => {
    if (selectedQuestId && !completedQuests.includes(selectedQuestId)) {
      setCompletedQuests([...completedQuests, selectedQuestId]);
      Alert.alert("Bravo ! 🎉", "Étape validée ! Passez à la suivante.");
    }
  };

  const selectedQuest = path.quests.find(q => q._id === selectedQuestId);

  return (
    <View style={styles.container}>
      
      {/* HEADER FLOTTANT */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.iconText}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.city}>{path.city}</Text>
          <Text style={styles.pathTitle} numberOfLines={1}>{path.title}</Text>
        </View>
        <View style={styles.switchContainer}>
          <TouchableOpacity onPress={() => setViewMode('tree')} style={[styles.switchBtn, viewMode === 'tree' && styles.activeBtn]}>
            <List size={20} color={viewMode === 'tree' ? '#d97706' : '#94a3b8'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setViewMode('map')} style={[styles.switchBtn, viewMode === 'map' && styles.activeBtn]}>
            <Map size={20} color={viewMode === 'map' ? '#d97706' : '#94a3b8'} />
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === 'map' ? (
        // --- VUE CARTE ---
        <MapView 
          style={styles.map} 
          initialRegion={{
            latitude: path.quests[0]?.location?.lat || 48.85,
            longitude: path.quests[0]?.location?.lng || 2.35,
            latitudeDelta: 0.05, longitudeDelta: 0.05
          }}
        >
          {path.quests.map((quest, index) => (
            <Marker
              key={quest._id}
              coordinate={{ latitude: quest.location.lat, longitude: quest.location.lng }}
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
      ) : (
        // --- VUE ROADMAP (ARBRE) ---
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.roadmapContainer} 
          showsVerticalScrollIndicator={false}
          bounces={false}
          // Scroll automatique tout en bas au chargement pour voir le départ (étape 1)
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
        >
          
          {/* Conteneur avec hauteur calculée pour permettre le scroll */}
          <View style={{ height: reversedQuests.length * 120 + 150 }}>
            
            {/* Ligne Sinueuse (SVG) */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <Svg width={width} height={reversedQuests.length * 120 + 150}>
                {generateSvgPath().map((pathData, idx) => (
                  <Path
                    key={idx}
                    d={pathData.d}
                    stroke={pathData.color}
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray="8, 8"
                  />
                ))}
              </Svg>
            </View>

          {/* Nœuds (Affichés du Haut vers le Bas) */}
          {reversedQuests.map((quest, index) => {
            // Calcul du numéro réel (puisqu'on affiche à l'envers)
            const realNumber = path.quests.length - index; 
            const pos = getQuestCoordinates(index);
            const isSelected = selectedQuestId === quest._id;
            const isCompleted = completedQuests.includes(quest._id);

            return (
              <TouchableOpacity 
                key={quest._id} 
                style={[
                  styles.node, 
                  { left: pos.x - 35, top: pos.y - 35 },
                  isSelected && styles.nodeSelected
                ]}
                onPress={() => setSelectedQuestId(quest._id)}
                activeOpacity={0.9}
              >
                <View style={[
                  styles.nodeInner, 
                  isSelected && styles.nodeInnerSelected, // Jaune si sélectionné
                  isCompleted && styles.nodeInnerCompleted // Vert si validé (écrase le jaune)
                ]}>
                  {isCompleted ? (
                    <CheckCircle size={24} color="#fff" />
                  ) : (
                    <Text style={[
                      styles.nodeText, 
                      isSelected && styles.nodeTextSelected
                    ]}>
                      {realNumber}
                    </Text>
                  )}
                </View>
                
                <View style={styles.nodeLabel}>
                  <Text style={styles.nodeLabelText} numberOfLines={1}>{quest.title}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
          
            {/* Espace en bas pour le panneau + Badge Départ */}
            <View style={{ position: 'absolute', bottom: 60, left: 0, right: 0, justifyContent: 'center', alignItems: 'center' }}>
              <View style={styles.startBadgeContainer}>
                  <Text style={styles.startBadgeText}>DÉPART 🚩</Text>
              </View>
            </View>

          </View>
        </ScrollView>
      )}

      {/* PANNEAU D'ACTION (Fixe en bas) */}
      {selectedQuest && (
        <View style={styles.actionPanel}>
          <View style={styles.panelHeader}>
            <View style={[
              styles.panelBadge, 
              completedQuests.includes(selectedQuest._id) ? {backgroundColor: '#dcfce7'} : {}
            ]}>
              <Text style={[
                styles.panelBadgeText,
                completedQuests.includes(selectedQuest._id) ? {color: '#16a34a'} : {}
              ]}>
                {completedQuests.includes(selectedQuest._id) ? "VALIDÉ ✅" : "ÉTAPE EN COURS"}
              </Text>
            </View>
            <TouchableOpacity>
               <HelpCircle size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.panelTitle}>{selectedQuest.title}</Text>
          <Text style={styles.panelDesc} numberOfLines={3}>{selectedQuest.description}</Text>
          
          {/* BOUTON VALIDER */}
          <TouchableOpacity 
            style={[
              styles.validateBtn, 
              completedQuests.includes(selectedQuest._id) && styles.validateBtnCompleted
            ]} 
            onPress={handleValidateStep}
            disabled={completedQuests.includes(selectedQuest._id)}
          >
            <Text style={styles.validateBtnText}>
              {completedQuests.includes(selectedQuest._id) ? "Étape Terminée" : "Valider cette étape"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  map: { width: '100%', height: '100%' },
  
  // Header
  header: { position: 'absolute', top: 50, left: 15, right: 15, backgroundColor: 'rgba(255,255,255,0.95)', padding: 10, borderRadius: 15, flexDirection: 'row', alignItems: 'center', zIndex: 10, elevation: 5, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5 },
  backBtn: { marginRight: 10, padding: 5 },
  iconText: { fontSize: 24, color: '#64748b' },
  city: { fontSize: 10, fontWeight: 'bold', color: '#d97706', textTransform: 'uppercase' },
  pathTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  switchContainer: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 8, padding: 2 },
  switchBtn: { padding: 8, borderRadius: 6 },
  activeBtn: { backgroundColor: '#fff', elevation: 2 },

  // ROADMAP
  roadmapContainer: { flexGrow: 1, paddingTop: 140, paddingBottom: 180 },
  
  node: { position: 'absolute', width: 70, height: 70, justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  
  nodeInner: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#fff', borderWidth: 4, borderColor: '#cbd5e1', justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 3 },
  
  // États visuels
  nodeSelected: { transform: [{scale: 1.2}] },
  nodeInnerSelected: { borderColor: '#d97706', backgroundColor: '#fff7ed' },
  
  // État validé (Vert)
  nodeInnerCompleted: { borderColor: '#16a34a', backgroundColor: '#22c55e' },
  
  nodeText: { fontSize: 18, fontWeight: 'bold', color: '#94a3b8' },
  nodeTextSelected: { color: '#d97706' },

  nodeLabel: { position: 'absolute', top: 65, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  nodeLabelText: { fontSize: 10, fontWeight: 'bold', color: '#64748b' },
  
  startBadgeContainer: { backgroundColor:'#fff', paddingHorizontal:12, paddingVertical:6, borderRadius:20, borderWidth:2, borderColor:'#d97706', elevation: 2 },
  startBadgeText: { fontWeight: '900', color: '#d97706', fontSize: 12 },

  // ACTION PANEL
  actionPanel: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, elevation: 20, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: {width: 0, height: -5} },
  panelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  panelBadge: { backgroundColor: '#dbeafe', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  panelBadgeText: { color: '#2563eb', fontSize: 10, fontWeight: '900' },
  panelTitle: { fontSize: 22, fontWeight: 'bold', color: '#1e293b', marginBottom: 5 },
  panelDesc: { fontSize: 14, color: '#64748b', lineHeight: 20, marginBottom: 20 },
  
  validateBtn: { backgroundColor: '#1e293b', paddingVertical: 16, borderRadius: 15, alignItems: 'center' },
  validateBtnCompleted: { backgroundColor: '#16a34a' }, 
  validateBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  callout: { width: 150, padding: 5 },
  stepTitle: { fontSize: 10, color: '#d97706', fontWeight: 'bold' },
  questTitle: { fontSize: 14, fontWeight: 'bold' },
});