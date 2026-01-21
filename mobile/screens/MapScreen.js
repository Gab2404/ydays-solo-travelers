import React, { useEffect, useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, 
  Dimensions, Animated, Platform, Linking, ScrollView 
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
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
  const [routeCoords, setRouteCoords] = useState([]); // Stocke le tracé des rues

  const mapRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(PANEL_WIDTH)).current;

  useEffect(() => {
    fetchPath();
  }, [id]);

  // Dès que le parcours est chargé, on calcule l'itinéraire réel
  useEffect(() => {
    if (path && path.quests.length > 1) {
      fetchWalkingRoute();
    }
  }, [path]);

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

  // Récupère l'itinéraire piéton via le service gratuit OSRM
  const fetchWalkingRoute = async () => {
    try {
      const coordsString = path.quests
        .map(q => `${q.location.lng},${q.location.lat}`)
        .join(';');

      // Profil "foot" pour avoir les chemins piétons et ponts
      const url = `https://router.project-osrm.org/route/v1/foot/${coordsString}?overview=full&geometries=geojson`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes[0]) {
        const coords = data.routes[0].geometry.coordinates.map(c => ({
          latitude: c[1],
          longitude: c[0],
        }));
        setRouteCoords(coords);
      }
    } catch (err) {
      console.error("Erreur itinéraire OSRM:", err);
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

  const handleNavigateToPoint = (lat, lng, label) => {
    const url = Platform.select({ 
        ios: `maps://?q=${label}&daddr=${lat},${lng}&dirflg=w`, 
        android: `google.navigation:q=${lat},${lng}&mode=w` 
    });
    Linking.openURL(url);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (!path) return null;

  const selectedQuest = path.quests.find(q => q._id === selectedQuestId);
  const totalQuests = path.quests.length;

  return (
    <View style={styles.container}>
      
      <View style={styles.headerFloating}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerCity}>{path.city}</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>{path.title}</Text>
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
        onPress={() => { if(selectedQuestId) handleClosePanel() }}
      >
        {/* LE TRACÉ PIÉTON DES RUES */}
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor="#f97316"
            strokeWidth={4}
          />
        )}

        {path.quests.map((quest, index) => {
          const isSelected = selectedQuestId === quest._id;
          return (
            <Marker
              key={quest._id}
              coordinate={{ latitude: quest.location.lat, longitude: quest.location.lng }}
              onPress={() => handleMarkerPress(quest._id)}
            >
              {isSelected ? (
                <View style={styles.pinContainer}>
                  <View style={styles.pinHead}><MapPin size={20} color="#fff" fill="#fff" /></View>
                  <View style={styles.pinArrow} />
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
              <TouchableOpacity onPress={handleClosePanel} style={styles.closeButton}><X size={24} color="#fff" /></TouchableOpacity>
              <Text style={styles.sidePanelTitle}>{selectedQuest.title}</Text>
            </View>

            <View style={styles.sidePanelContent}>
              <Text style={styles.descriptionText}>{selectedQuest.description}</Text>
              <TouchableOpacity 
                style={styles.gpsButton}
                onPress={() => handleNavigateToPoint(selectedQuest.location.lat, selectedQuest.location.lng, selectedQuest.title)}
              >
                <Navigation size={20} color="#f97316" />
                <Text style={styles.gpsButtonText}>Lancer l'itinéraire (Plans/Maps)</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      )}

      <BottomNav navigation={navigation} activeRoute="Map" currentPathId={id} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerFloating: {
    position: 'absolute', top: 50, left: 20, right: 20,
    backgroundColor: '#fff', borderRadius: 16, padding: 15, zIndex: 10, elevation: 5
  },
  headerCity: { color: '#f97316', fontSize: 10, fontWeight: '900' },
  headerTitle: { color: '#1e293b', fontSize: 18, fontWeight: 'bold' },
  map: { width: '100%', height: '100%' },
  pinContainer: { alignItems: 'center' },
  pinHead: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f97316', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  pinArrow: { width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 8, borderTopColor: '#f97316', borderLeftColor: 'transparent', borderRightColor: 'transparent' },
  defaultMarker: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#cbd5e1' },
  defaultMarkerText: { fontSize: 12, fontWeight: 'bold', color: '#64748b' },
  sidePanel: { position: 'absolute', right: 0, top: 0, bottom: 80, backgroundColor: '#fff', elevation: 10, zIndex: 100 },
  sidePanelHeader: { backgroundColor: '#f97316', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 },
  closeButton: { position: 'absolute', top: 50, right: 20 },
  sidePanelTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  sidePanelContent: { padding: 20 },
  descriptionText: { color: '#64748b', fontSize: 14, lineHeight: 20, marginBottom: 20 },
  gpsButton: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#f97316', borderRadius: 12, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  gpsButtonText: { color: '#f97316', fontSize: 14, fontWeight: '600' },
});