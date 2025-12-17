import React, { useEffect, useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, 
  Dimensions, Animated, Platform, Linking, ScrollView 
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { X, CheckCircle, Navigation, MapPin, ChevronRight, Clock } from 'lucide-react-native';
import pathService from '../services/pathService';
import errorHandler from '../utils/errorHandler';
import BottomNav from '../components/BottomNav';

const { width } = Dimensions.get('window');
const PANEL_WIDTH = width * 0.75;
const ZOOM_DELTA = 0.01;

export default function MapScreen({ route, navigation }) {
  const { id } = route.params;
  const [path, setPath] = useState(null);
  const [selectedQuestId, setSelectedQuestId] = useState(null);
  const [completedQuests, setCompletedQuests] = useState([]);
  const [inProgressQuests, setInProgressQuests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const mapRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(PANEL_WIDTH)).current;

  useEffect(() => {
    fetchPath();
  }, [id]);

  const fetchPath = async () => {
    try {
      setIsLoading(true);
      const data = await pathService.getPathById(id);
      setPath(data);
    } catch (err) {
      errorHandler.handle(err, 'Impossible de charger le parcours');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkerPress = (questId) => {
    setSelectedQuestId(questId);
    
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    const quest = path.quests.find(q => q._id === questId);
    if (quest && mapRef.current) {
      const offsetFactor = 0.35;
      const correctedLongitude = quest.location.lng + (ZOOM_DELTA * offsetFactor);

      mapRef.current.animateToRegion({
        latitude: quest.location.lat,
        longitude: correctedLongitude,
        latitudeDelta: ZOOM_DELTA,
        longitudeDelta: ZOOM_DELTA,
      }, 600);
    }
  };

  const handleClosePanel = () => {
    Animated.timing(slideAnim, {
      toValue: PANEL_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setSelectedQuestId(null);
    });
  };

  const handleStartQuest = (questId) => {
    if (!inProgressQuests.includes(questId)) {
      setInProgressQuests([...inProgressQuests, questId]);
      errorHandler.showSuccess('Étape commencée !');
    }
  };

  const handleNavigateToPoint = (lat, lng, label) => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${lat},${lng}`;
    Linking.openURL(Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    }));
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (!path) return null;

  const totalQuests = path.quests.length;
  const completedCount = completedQuests.length;
  const selectedQuest = path.quests.find(q => q._id === selectedQuestId);
  const questNumber = selectedQuest ? path.quests.findIndex(q => q._id === selectedQuestId) + 1 : 0;
  
  const isQuestCompleted = selectedQuest && completedQuests.includes(selectedQuest._id);
  const isQuestInProgress = selectedQuest && inProgressQuests.includes(selectedQuest._id);
  const progressPercentage = Math.round((completedCount / totalQuests) * 100);

  return (
    <View style={styles.container}>
      
      <View style={styles.headerFloating}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerCity}>{path.city}</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>{path.title}</Text>
        </View>
        <View style={styles.progressPill}>
          <Text style={styles.progressText}>{completedCount}/{totalQuests}</Text>
        </View>
      </View>

      <MapView 
        ref={mapRef}
        style={styles.map} 
        initialRegion={{
          latitude: path.quests[0]?.location?.lat || 48.85,
          longitude: path.quests[0]?.location?.lng || 2.35,
          latitudeDelta: 0.05, 
          longitudeDelta: 0.05
        }}
        toolbarEnabled={false}
        onPress={() => { if(selectedQuestId) handleClosePanel() }}
      >
        {path.quests.map((quest, index) => {
          const isCompleted = completedQuests.includes(quest._id);
          const isSelected = selectedQuestId === quest._id;
          
          return (
            <Marker
              key={quest._id}
              coordinate={{ latitude: quest.location.lat, longitude: quest.location.lng }}
              onPress={() => handleMarkerPress(quest._id)}
              anchor={{ x: 0.5, y: isSelected ? 1 : 0.5 }}
            >
              {isSelected ? (
                <View style={styles.pinContainer}>
                  <View style={styles.pinHead}>
                    <MapPin size={20} color="#fff" fill="#fff" />
                  </View>
                  <View style={styles.pinArrow} />
                </View>
              ) : isCompleted ? (
                <View style={styles.completedMarker}>
                  <CheckCircle size={16} color="#fff" />
                </View>
              ) : (
                <View style={styles.defaultMarker}>
                  <Text style={styles.defaultMarkerText}>{index + 1}</Text>
                </View>
              )}
            </Marker>
          );
        })}
      </MapView>

      {selectedQuest && (
        <Animated.View style={[styles.sidePanel, { transform: [{ translateX: slideAnim }], width: PANEL_WIDTH }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            
            <View style={styles.sidePanelHeader}>
              <TouchableOpacity onPress={handleClosePanel} style={styles.closeButton}>
                <X size={24} color="#fff" />
              </TouchableOpacity>
              
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>ÉTAPE {questNumber} SUR {totalQuests}</Text>
              </View>
              
              {isQuestInProgress && !isQuestCompleted && (
                <View style={styles.statusBadgeOrange}>
                  <Text style={styles.statusBadgeOrangeText}>Étape en cours</Text>
                </View>
              )}
              {isQuestCompleted && (
                <View style={styles.statusBadgeGreen}>
                  <Text style={styles.statusBadgeGreenText}>Étape validée</Text>
                </View>
              )}
              
              <Text style={styles.sidePanelTitle}>{selectedQuest.title}</Text>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Progression parcours</Text>
                  <Text style={styles.progressValue}>{progressPercentage}%</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
                </View>
              </View>
            </View>

            <View style={styles.sidePanelContent}>
              <View style={styles.infoSection}>
                <Text style={styles.infoTitle}>INFORMATIONS</Text>
                <View style={styles.descriptionBox}>
                  <Text style={styles.descriptionText}>{selectedQuest.description}</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.gpsButton}
                onPress={() => handleNavigateToPoint(selectedQuest.location.lat, selectedQuest.location.lng, selectedQuest.title)}
              >
                <Navigation size={20} color="#f97316" />
                <Text style={styles.gpsButtonText}>S'y rendre</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.sidePanelFooter}>
            {isQuestCompleted ? (
              <TouchableOpacity style={[styles.actionButton, styles.btnSuccess]} disabled>
                <CheckCircle size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Étape terminée</Text>
              </TouchableOpacity>
            ) : isQuestInProgress ? (
              <TouchableOpacity style={[styles.actionButton, styles.btnInProgress]} disabled>
                <Clock size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Étape en cours...</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.actionButton, styles.btnPrimary]} 
                onPress={() => handleStartQuest(selectedQuest._id)}
              >
                <Text style={styles.actionButtonText}>Commencer l'étape</Text>
                <ChevronRight size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      )}

      <BottomNav navigation={navigation} activeRoute="Map" currentPathId={id} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc'
  },

  headerFloating: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20, right: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 15, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    zIndex: 10,
    elevation: 5,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
  },
  headerTextContainer: { flex: 1 },
  headerCity: { color: '#f97316', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', marginBottom: 2 },
  headerTitle: { color: '#1e293b', fontSize: 18, fontWeight: 'bold' },
  progressPill: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  progressText: { color: '#64748b', fontWeight: 'bold', fontSize: 12 },

  map: { width: '100%', height: '100%' },
  
  pinContainer: { alignItems: 'center', width: 50, height: 60 },
  pinHead: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#f97316',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#fff',
    elevation: 5, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4
  },
  pinArrow: {
    width: 0, height: 0, backgroundColor: 'transparent', borderStyle: 'solid',
    borderLeftWidth: 8, borderRightWidth: 8, borderTopWidth: 12,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#f97316',
    marginTop: -2
  },
  completedMarker: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: '#22c55e',
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff',
    elevation: 3
  },
  defaultMarker: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#cbd5e1',
    elevation: 3
  },
  defaultMarkerText: { fontSize: 12, fontWeight: 'bold', color: '#64748b' },

  sidePanel: {
    position: 'absolute',
    right: 0, top: 0, bottom: 80, 
    backgroundColor: '#fff',
    elevation: 10, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: -2, height: 0 },
    zIndex: 100
  },
  sidePanelHeader: {
    backgroundColor: '#f97316',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20, paddingBottom: 25,
  },
  closeButton: {
    position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, right: 20,
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: 8,
    zIndex: 10
  },
  stepBadge: {
    backgroundColor: 'rgba(255,255,255,0.9)', alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 10,
  },
  stepBadgeText: { color: '#f97316', fontSize: 11, fontWeight: 'bold', letterSpacing: 0.5 },
  statusBadgeOrange: { backgroundColor: '#fb923c', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 10 },
  statusBadgeOrangeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  statusBadgeGreen: { backgroundColor: '#22c55e', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 10 },
  statusBadgeGreenText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  sidePanelTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 15 },
  
  progressContainer: { marginTop: 5 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 13 },
  progressValue: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  progressBarBg: { width: '100%', height: 10, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 10, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#fff', borderRadius: 10 },
  
  sidePanelContent: { padding: 20, paddingBottom: 40 },
  infoSection: { marginBottom: 20 },
  infoTitle: { fontSize: 11, fontWeight: 'bold', color: '#9ca3af', letterSpacing: 1, marginBottom: 10 },
  descriptionBox: { backgroundColor: '#f8fafc', borderLeftWidth: 4, borderLeftColor: '#cbd5e1', padding: 15, borderRadius: 8 },
  descriptionText: { color: '#64748b', fontSize: 15, lineHeight: 22 },

  gpsButton: {
    backgroundColor: '#fff', borderWidth: 2, borderColor: '#f97316',
    borderRadius: 12, paddingVertical: 15,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  gpsButtonText: { color: '#f97316', fontSize: 15, fontWeight: '600' },
  
  sidePanelFooter: {
    padding: 20, backgroundColor: '#f9fafb', borderTopWidth: 1, borderTopColor: '#e5e7eb',
  },
  actionButton: {
    borderRadius: 12, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
  },
  actionButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  btnPrimary: { backgroundColor: '#f97316' },
  btnInProgress: { backgroundColor: '#94a3b8' },
  btnSuccess: { backgroundColor: '#22c55e' },
});