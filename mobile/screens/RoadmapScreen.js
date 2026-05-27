import React, { useEffect, useState, useRef, useContext } from 'react';
import { 
  View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, 
  ScrollView, Dimensions, Animated, Alert, Platform, Linking, Image
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { CheckCircle, MapPin, ChevronRight, X, Clock, Camera, Award, Image as ImageIcon } from 'lucide-react-native';
import pathService from '../services/pathService';
import questService from '../services/questService';
import userService from '../services/userService';
import errorHandler from '../utils/errorHandler';
import BottomNav from '../components/BottomNav';
import storage from '../utils/storage';
import CameraCapture from '../components/CameraCapture';
import { AuthContext } from '../context/AuthContext';
import api, { SERVER_URL } from '../utils/api';

// --- AJOUTS POUR LE GPS ---
import ProximityChecker from '../components/ProximityChecker'; 
import { useGeolocation } from '../hooks/useGeolocation';


const { width } = Dimensions.get('window');

// ── Images par catégorie (identique à PathDetailScreen) ──
const CATEGORY_IMAGES = {
  'Culturel':  require('../assets/images/culturel.png'),
  'Sportif':   require('../assets/images/sportif.png'),
  'Culinaire': require('../assets/images/culinaire.png'),
  'Détente':   require('../assets/images/detente.png'),
  'Mixte':     require('../assets/images/mixte.png'),
};

const getPathImage = (path) => {
  if (path.imageUrl) {
    const cleanPath = path.imageUrl.replace(/\\/g, '/');
    const baseUrl = SERVER_URL || '';
    return { uri: `${baseUrl}/${cleanPath}` };
  }
  return CATEGORY_IMAGES[path.difficulty] || null;
};

export default function RoadmapScreen({ route, navigation }) {
  const pathId = route.params?.pathId || route.params?.id;
  const { user: authUser } = useContext(AuthContext);
  
  const [path, setPath] = useState(null);
  const [selectedQuestId, setSelectedQuestId] = useState(null);
  const [completedQuests, setCompletedQuests] = useState([]);
  const [inProgressQuests, setInProgressQuests] = useState([]);
  const [isPathCompleted, setIsPathCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [routeCoords, setRouteCoords] = useState([]);
  
  const [isNearby, setIsNearby] = useState(false);
  const [questAddresses, setQuestAddresses] = useState({});
  const { location, startTracking, stopTracking } = useGeolocation();
  
  const mapRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(500)).current;

  useEffect(() => {
    if (!pathId) { setIsLoading(false); return; }
    fetchPath();
    checkUserProgress();
    startTracking();
    return () => stopTracking();
  }, [pathId]);

  useEffect(() => {
    if (path && path.quests.length > 1) fetchWalkingRoute();
  }, [path]);

  // Reverse geocoding pour afficher l'adresse de chaque étape
  useEffect(() => {
    if (!selectedQuestId || !path) return;
    const quest = path.quests.find(q => q._id === selectedQuestId);
    if (!quest || questAddresses[selectedQuestId]) return;
    if (quest.address) {
      setQuestAddresses(prev => ({ ...prev, [selectedQuestId]: quest.address }));
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${quest.location.lat}&lon=${quest.location.lng}&format=json&accept-language=fr`,
          { headers: { 'User-Agent': 'VascoApp/1.0' } }
        );
        const data = await res.json();
        const addr = data?.address;
        if (addr) {
          const formatted = [addr.road, addr.house_number, addr.city || addr.town || addr.village]
            .filter(Boolean).join(' ');
          setQuestAddresses(prev => ({ ...prev, [selectedQuestId]: formatted || data.display_name?.split(',')[0] }));
        }
      } catch (e) {
        // silencieux
      }
    })();
  }, [selectedQuestId]);

  const fetchPath = async () => {
    try {
      setIsLoading(true);
      const data = await pathService.getPathById(pathId);
      setPath(data);
      // Mémoriser le parcours en cours pour la mascotte de la nav bar
      await storage.setItem('activePathId', pathId);
    } catch (err) {
      errorHandler.handle(err, 'Impossible de charger le parcours');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWalkingRoute = async () => {
    try {
      const coordsString = path.quests
        .map(q => `${q.location.lng},${q.location.lat}`)
        .join(';');
      const url = `https://router.project-osrm.org/route/v1/foot/${coordsString}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      
      // Vérifier que la réponse est bien du JSON avant de parser
      const contentType = response.headers.get('content-type') || '';
      if (!response.ok || !contentType.includes('application/json')) {
        console.warn('OSRM indisponible, pas de tracé piéton.');
        return;
      }
      
      const data = await response.json();
      if (data.routes && data.routes[0]) {
        const coords = data.routes[0].geometry.coordinates.map(c => ({
          latitude: c[1], longitude: c[0],
        }));
        setRouteCoords(coords);
      }
    } catch (err) {
      // Silencieux — la carte fonctionne sans le tracé
      console.warn('Tracé piéton non disponible:', err.message);
    }
  };

  const checkUserProgress = async () => {
    try {
      const userData = await userService.getCurrentUser();
      const rawIds = userData.completedQuests?.map(cq => cq.questId) || [];
      setCompletedQuests([...new Set(rawIds)]);
      const pathCompleted = userData.completedPaths?.some(cp => {
        const idToCheck = cp.pathId ? cp.pathId.toString() : cp.toString();
        return idToCheck === pathId;
      });
      setIsPathCompleted(pathCompleted || false);
    } catch (error) {
      console.error('Erreur récupération progression:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ED6F2D" />
      </View>
    );
  }

  if (!path) return null;

  const reversedQuests = [...path.quests].reverse();
  const selectedQuest = path.quests.find(q => q._id === selectedQuestId);
  const questNumber = selectedQuest ? path.quests.findIndex(q => q._id === selectedQuestId) + 1 : 0;
  const totalQuests = path.quests.length;
  const completedInThisPath = completedQuests.filter(id => path.quests.some(q => q._id === id)).length;
  const progressPercentage = Math.min(100, Math.round((completedInThisPath / totalQuests) * 100));
  const isQuestCompleted = selectedQuest && completedQuests.includes(selectedQuest._id);
  const isQuestInProgress = selectedQuest && inProgressQuests.includes(selectedQuest._id);
  const isQuestNotStarted = selectedQuest && !isQuestInProgress && !isQuestCompleted;

  const handleStartQuest = () => {
    if (selectedQuestId && !inProgressQuests.includes(selectedQuestId)) {
      setInProgressQuests([...inProgressQuests, selectedQuestId]);
      errorHandler.showSuccess('Étape commencée ! Rapprochez-vous du lieu.');
    }
  };

  const handleOpenCamera = () => {
    if (!isNearby) {
      Alert.alert('Trop loin', 'Vous devez être à moins de 50m du point pour valider.');
      return;
    }
    if (selectedQuestId && !completedQuests.includes(selectedQuestId)) {
      setIsCameraVisible(true);
    }
  };

  const handlePhotoTaken = async (photoData) => {
    try {
      setIsCameraVisible(false);
      setIsValidating(true);
      const result = await questService.validateQuest(selectedQuestId, photoData, location?.coords);
      setCompletedQuests(prev => prev.includes(selectedQuestId) ? prev : [...prev, selectedQuestId]);
      if (result.pathCompleted) {
        setIsPathCompleted(true);
        // Parcours terminé : on libère l'activePathId
        await storage.removeItem('activePathId');
        Alert.alert('🎉 Parcours Terminé !',
          `Félicitations ! Tu as complété "${path.title}" et gagné ${result.xpGained} XP bonus !`,
          [{ text: 'Voir ma galerie', onPress: () => navigation.navigate('GalleryAll') },
           { text: 'Super !', style: 'default' }]);
      } else {
        Alert.alert('✅ Étape validée !', `+${result.xpGained} XP ! Continue ton aventure.`,
          [{ text: 'Super !', style: 'default' }]);
      }
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Impossible de valider la quête. Réessaye.', [{ text: 'OK' }]);
    } finally {
      setIsValidating(false);
    }
  };

  const handleClosePanel = () => {
    Animated.timing(slideAnim, {
      toValue: 500, duration: 300, useNativeDriver: true,
    }).start(() => setSelectedQuestId(null));
  };

  const handleViewGallery = () => navigation.navigate('GalleryAll');

  // ── Calcul distance vers la quête sélectionnée ──
  const getDistance = () => {
    if (!location?.coords || !selectedQuest?.location) return null;
    const R = 6371000;
    const lat1 = location.coords.latitude * Math.PI / 180;
    const lat2 = selectedQuest.location.lat * Math.PI / 180;
    const dLat = lat2 - lat1;
    const dLon = (selectedQuest.location.lng - location.coords.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
    const d = Math.round(2 * R * Math.asin(Math.sqrt(a)));
    return d;
  };

  const distanceM = getDistance();
  const distanceLabel = distanceM !== null
    ? (distanceM >= 1000 ? `${(distanceM/1000).toFixed(1)} km` : `${distanceM} m`)
    : null;

  const distanceBarProgress = distanceM !== null
    ? Math.max(0, Math.min(100, Math.round(((distanceM - 50) / Math.max(distanceM, 50)) * 100)))
    : 0;

  // Centrer la carte sur le point sélectionné ou sur le parcours entier
  const handleMarkerPress = (questId) => {
    setSelectedQuestId(questId);
    setIsNearby(false);

    const quest = path.quests.find(q => q._id === questId);
    if (quest && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: quest.location.lat - 0.003,
        longitude: quest.location.lng,
        latitudeDelta: ZOOM_DELTA,
        longitudeDelta: ZOOM_DELTA,
      }, 500);
    }

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>

      {/* ── CARTE PLEIN ÉCRAN (depuis le haut absolu) ── */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: path.quests[0]?.location?.lat || 48.85,
          longitude: path.quests[0]?.location?.lng || 2.35,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        }}
        onPress={() => { if (selectedQuestId) handleClosePanel(); }}
      >
        {/* Tracé piéton OSRM */}
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor={COLORS.orange}
            strokeWidth={4}
            strokeDashPattern={[0]}
            lineDashPattern={[0]}
          />
        )}

        {/* Marqueurs des étapes */}
        {path.quests.map((quest, index) => {
          const isSelected = selectedQuestId === quest._id;
          const isCompleted = completedQuests.includes(quest._id);
          return (
            <Marker
              key={quest._id}
              coordinate={{ latitude: quest.location.lat, longitude: quest.location.lng }}
              onPress={() => handleMarkerPress(quest._id)}
            >
              {isSelected ? (
                <View style={styles.pinSelected}>
                  <Text style={styles.pinSelectedText}>{index + 1}</Text>
                </View>
              ) : isCompleted ? (
                <View style={[styles.pinDefault, styles.pinCompleted]}>
                  <CheckCircle size={14} color={COLORS.tealLight} strokeWidth={2.5} />
                </View>
              ) : (
                <View style={styles.pinDefault}>
                  <Text style={styles.pinDefaultText}>{index + 1}</Text>
                </View>
              )}
            </Marker>
          );
        })}
      </MapView>

      {/* ── VIGNETTE MINIATURE (coin haut-droit, sous la status bar) ── */}
      <View style={styles.vignetteWrapper} pointerEvents="none">
        <View style={styles.vignette}>
          {(() => {
            const pathImg = getPathImage(path);
            return (
              <>
                {pathImg ? (
                  <Image
                    source={pathImg}
                    style={styles.vignetteImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#1A3035' }]} />
                )}
                <View style={styles.vignetteOverlay} />
                <View style={styles.vignetteLabel}>
                  <Text style={styles.vignetteLabelText}>
                    {path.difficulty?.toUpperCase() || 'PARCOURS'}
                  </Text>
                </View>
              </>
            );
          })()}
        </View>
      </View>

      {/* ── BANNER PARCOURS TERMINÉ ── */}
      {isPathCompleted && (
        <TouchableOpacity
          style={styles.completedBanner}
          onPress={handleViewGallery}
          activeOpacity={0.9}
        >
          <Award size={16} color="#fff" />
          <Text style={styles.completedBannerText}>Parcours terminé · Voir ma galerie</Text>
          <ImageIcon size={15} color="#fff" />
        </TouchableOpacity>
      )}

      {/* ── BOTTOM SHEET ── */}
      {selectedQuest && (
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>

          <View style={styles.sheetHandle}>
            <View style={styles.handleBar} />
          </View>

          {/* Step tabs scrollables */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.stepTabsScroll}
            contentContainerStyle={styles.stepTabsContent}
          >
            {path.quests.map((q, i) => {
              const isTabCompleted = completedQuests.includes(q._id);
              const isTabCurrent = q._id === selectedQuestId;
              return (
                <TouchableOpacity
                  key={q._id}
                  style={[
                    styles.stepTab,
                    isTabCompleted && styles.stepTabDone,
                    isTabCurrent && styles.stepTabCurrent,
                  ]}
                  onPress={() => handleMarkerPress(q._id)}
                >
                  {isTabCompleted && !isTabCurrent ? (
                    <CheckCircle size={12} color={COLORS.tealLight} strokeWidth={2.5} />
                  ) : (
                    <Text style={[
                      styles.stepTabText,
                      isTabCompleted && styles.stepTabTextDone,
                      isTabCurrent && styles.stepTabTextCurrent,
                    ]}>{i + 1}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 260 }}>

            {/* Sheet header */}
            <View style={[styles.sheetHeader, (!isQuestInProgress || isQuestCompleted) && { borderBottomWidth: 0, paddingBottom: 10 }]}>
              <View style={{ flex: 1, minWidth: 0 }}>
                {isQuestInProgress && !isQuestCompleted && (
                  <View style={styles.sheetStatusBadge}>
                    <Clock size={9} color={COLORS.orange} strokeWidth={2.5} />
                    <Text style={styles.sheetStatusBadgeText}>Étape en cours</Text>
                  </View>
                )}
                {isQuestCompleted && (
                  <View style={[styles.sheetStatusBadge, styles.sheetStatusBadgeGreen]}>
                    <CheckCircle size={9} color="#22c55e" strokeWidth={2.5} />
                    <Text style={[styles.sheetStatusBadgeText, styles.sheetStatusBadgeTextGreen]}>Étape validée</Text>
                  </View>
                )}
                <Text style={styles.sheetStepName} numberOfLines={2}>{selectedQuest.title}</Text>
                <View style={styles.sheetStepSub}>
                  <MapPin size={10} color={COLORS.ink3} strokeWidth={2} />
                  <Text style={styles.sheetStepSubText} numberOfLines={1}>
                    {questAddresses[selectedQuestId]
                      ? questAddresses[selectedQuestId]
                      : distanceM !== null
                        ? `${distanceLabel} · ~${Math.ceil(distanceM / 80)} min à pied`
                        : 'Chargement…'}
                  </Text>
                </View>
              </View>

              {distanceLabel && (
                <View style={styles.distBadge}>
                  <Text style={styles.distBadgeVal}>{distanceLabel}</Text>
                  <Text style={styles.distBadgeLbl}>restants</Text>
                </View>
              )}

              <TouchableOpacity onPress={handleClosePanel} style={styles.closeBtn}>
                <X size={16} color={COLORS.ink3} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* Barre de distance */}
            {isQuestInProgress && !isQuestCompleted && distanceLabel && (
              <View style={styles.distBarWrap}>
                <View style={styles.distBarLabels}>
                  <Text style={styles.distBarLabel}>En chemin…</Text>
                  <Text style={styles.distBarLabel}>&lt; 50m pour valider</Text>
                </View>
                <View style={styles.distBar}>
                  <View style={[styles.distFill, { width: `${100 - distanceBarProgress}%` }]} />
                </View>
              </View>
            )}

            <View style={styles.sheetBody}>
              {/* ProximityChecker caché — logique GPS conservée */}
              {isQuestInProgress && !isQuestCompleted && (
                <View style={{ height: 0, overflow: 'hidden' }}>
                  <ProximityChecker
                    userLocation={location?.coords}
                    questLocation={{
                      latitude: selectedQuest.location.lat,
                      longitude: selectedQuest.location.lng,
                    }}
                    onNearby={() => setIsNearby(true)}
                  />
                </View>
              )}

              {selectedQuest.description && (
                <View style={[styles.infoBlock, (!isQuestInProgress || isQuestCompleted) && { marginTop: 0 }]}>
                  <Text style={styles.infoBlockLabel}>Indice du lieu</Text>
                  <Text style={styles.infoBlockText}>{selectedQuest.description}</Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.mapsBtn}
                onPress={() => {
                  const url = Platform.select({
                    ios: `maps://?q=${selectedQuest.title}&daddr=${selectedQuest.location.lat},${selectedQuest.location.lng}&dirflg=w`,
                    android: `google.navigation:q=${selectedQuest.location.lat},${selectedQuest.location.lng}&mode=w`,
                  });
                  Linking.openURL(url);
                }}
              >
                <MapPin size={14} color={COLORS.teal} strokeWidth={2} />
                <Text style={styles.mapsBtnText}>Ouvrir dans Maps</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* CTA footer */}
          <View style={styles.sheetFooter}>
            {isQuestNotStarted && (
              <TouchableOpacity style={styles.ctaBtn} onPress={handleStartQuest}>
                <ChevronRight size={18} color="#fff" />
                <Text style={styles.ctaBtnText}>Commencer l'étape</Text>
              </TouchableOpacity>
            )}

            {isQuestInProgress && !isQuestCompleted && (
              <TouchableOpacity
                style={[styles.ctaBtn, (!isNearby || isValidating) && styles.ctaBtnDisabled]}
                onPress={handleOpenCamera}
                disabled={isValidating || !isNearby}
              >
                {isValidating ? (
                  <>
                    <ActivityIndicator size="small" color={isNearby ? '#fff' : COLORS.ink3} />
                    <Text style={[styles.ctaBtnText, !isNearby && styles.ctaBtnTextDisabled]}>Validation…</Text>
                  </>
                ) : (
                  <>
                    <Camera size={18} color={isNearby ? '#fff' : COLORS.ink3} strokeWidth={2} />
                    <Text style={[styles.ctaBtnText, !isNearby && styles.ctaBtnTextDisabled]}>
                      {isNearby ? 'Prendre une photo' : 'Lieu non atteint'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {isQuestCompleted && (
              <View style={[styles.ctaBtn, styles.ctaBtnCompleted]}>
                <CheckCircle size={18} color="#fff" strokeWidth={2.5} />
                <Text style={styles.ctaBtnText}>Étape terminée</Text>
              </View>
            )}
          </View>
        </Animated.View>
      )}

      <CameraCapture
        visible={isCameraVisible}
        onClose={() => setIsCameraVisible(false)}
        onPhotoTaken={handlePhotoTaken}
        questTitle={selectedQuest?.title || ''}
      />

      {/* BottomNav AU-DESSUS du sheet avec zIndex explicite */}
      <View style={styles.navWrapper}>
        <BottomNav navigation={navigation} activeRoute="Map" currentPathId={pathId} />
      </View>
    </View>
  );
}

const COLORS = {
  orange: '#ED6F2D',
  teal: '#43868D',
  tealDark: '#214347',
  tealLight: '#AECED1',
  bg: '#FAF8F5',
  ink: '#1A1A1A',
  ink2: '#4A4642',
  ink3: '#9C9590',
  rule: '#EAE6E1',
  white: '#FFFFFF',
};

const ZOOM_DELTA = 0.015;

const styles = StyleSheet.create({

  container: { flex: 1 },

  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg,
  },

  // ── VIGNETTE MINIATURE (remplace le hero header) ──
  vignetteWrapper: {
    position: 'absolute',
    top: 48,
    right: 14,
    zIndex: 30,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.8,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 14,
  },
  vignette: {
    width: 72,
    height: 72,
    borderRadius: 12,
    overflow: 'hidden',
  },
  vignetteImage: {
    position: 'absolute',
    top: -18,
    left: -18,
    width: 108,
    height: 108,
  },
  vignetteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  vignetteLabel: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.52)',
    paddingVertical: 4,
    alignItems: 'center',
  },
  vignetteLabelText: {
    fontSize: 6.5,
    fontWeight: '700',
    letterSpacing: 0.9,
    color: '#fff',
    textTransform: 'uppercase',
  },

  // ── BANNER TERMINÉ ──
  completedBanner: {
    position: 'absolute',
    top: 0,           // plus de hero, le banner part du haut
    left: 0, right: 0,
    backgroundColor: '#22c55e',
    paddingVertical: 10, paddingHorizontal: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, zIndex: 14,
  },
  completedBannerText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  // ── MARQUEURS ──
  pinSelected: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: COLORS.orange,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: COLORS.orange, shadowOpacity: 0.5, shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 }, elevation: 8,
    borderWidth: 3, borderColor: '#fff',
  },
  pinSelectedText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  pinArrow: {
    width: 0, height: 0,
    borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 6,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    borderTopColor: COLORS.orange,
    alignSelf: 'center',
  },
  pinDefault: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: COLORS.white,
    borderWidth: 2, borderColor: '#D8D4CF',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 4, elevation: 3,
  },
  pinCompleted: { backgroundColor: COLORS.tealDark, borderColor: COLORS.tealDark },
  pinDefaultText: { fontSize: 12, fontWeight: '600', color: COLORS.ink3 },

  // ── BOTTOM SHEET ──
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22, borderTopRightRadius: 22,
    overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 }, elevation: 24,
    zIndex: 49,
    paddingBottom: 95,
  },

  navWrapper: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    zIndex: 100,
  },
  sheetHandle: { alignItems: 'center', paddingTop: 10, paddingBottom: 6, backgroundColor: '#FFFFFF' },
  handleBar: { width: 36, height: 4, backgroundColor: COLORS.rule, borderRadius: 10 },

  stepTabsScroll: { maxHeight: 46, backgroundColor: '#FFFFFF' },
  stepTabsContent: { paddingHorizontal: 18, paddingBottom: 12, gap: 6, flexDirection: 'row' },
  stepTab: {
    width: 28, height: 28, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.rule,
  },
  stepTabDone: { backgroundColor: COLORS.tealDark, borderColor: COLORS.tealDark },
  stepTabCurrent: {
    backgroundColor: COLORS.orange, borderColor: COLORS.orange,
    shadowColor: COLORS.orange, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
  },
  stepTabText: { fontSize: 10, fontWeight: '700', color: COLORS.ink3 },
  stepTabTextDone: { color: COLORS.tealLight },
  stepTabTextCurrent: { color: '#fff' },

  sheetHeader: {
    paddingHorizontal: 18, paddingBottom: 14,
    flexDirection: 'row', alignItems: 'flex-start',
    gap: 10, borderBottomWidth: 1, borderBottomColor: COLORS.rule,
    backgroundColor: '#FFFFFF',
  },
  sheetStatusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(237,111,45,0.1)',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 4, marginBottom: 5,
  },
  sheetStatusBadgeGreen: { backgroundColor: 'rgba(34,197,94,0.1)' },
  sheetStatusBadgeText: {
    fontSize: 9, fontWeight: '700', letterSpacing: 0.8,
    textTransform: 'uppercase', color: COLORS.orange,
  },
  sheetStatusBadgeTextGreen: { color: '#22c55e' },
  sheetStepName: { fontSize: 16, fontWeight: '700', color: COLORS.ink, marginBottom: 3 },
  sheetStepSub: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sheetStepSubText: { fontSize: 10, color: COLORS.ink3 },

  distBadge: {
    flexShrink: 0,
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.rule,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, alignItems: 'center',
  },
  distBadgeVal: { fontSize: 15, fontWeight: '700', color: COLORS.ink, lineHeight: 18 },
  distBadgeLbl: { fontSize: 8, fontWeight: '600', color: COLORS.ink3, letterSpacing: 0.5, marginTop: 1 },

  closeBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.rule,
    justifyContent: 'center', alignItems: 'center',
  },

  distBarWrap: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: '#FFFFFF' },
  distBarLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  distBarLabel: { fontSize: 9, color: COLORS.ink3 },
  distBar: { height: 4, backgroundColor: COLORS.rule, borderRadius: 10, overflow: 'hidden' },
  distFill: { height: '100%', backgroundColor: COLORS.orange, borderRadius: 10 },

  sheetBody: { paddingHorizontal: 18, paddingBottom: 10, backgroundColor: '#FFFFFF' },
  infoBlock: {
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.rule,
    borderRadius: 10, padding: 12, marginBottom: 10,
  },
  infoBlockLabel: {
    fontSize: 8, fontWeight: '700', letterSpacing: 1,
    textTransform: 'uppercase', color: COLORS.ink3, marginBottom: 5,
  },
  infoBlockText: { fontSize: 13, color: COLORS.ink2, lineHeight: 20 },

  mapsBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 7, height: 40, borderRadius: 10,
    borderWidth: 1.5, borderColor: COLORS.teal,
    backgroundColor: 'transparent', marginBottom: 4,
  },
  mapsBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.teal },

  sheetFooter: {
    paddingHorizontal: 18, paddingBottom: 16, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: COLORS.rule,
    backgroundColor: '#FFFFFF',
  },
  ctaBtn: {
    backgroundColor: COLORS.orange,
    borderRadius: 14, height: 50,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8,
    shadowColor: COLORS.orange, shadowOpacity: 0.35, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 5,
  },
  ctaBtnDisabled: { backgroundColor: COLORS.rule, shadowOpacity: 0, elevation: 0 },
  ctaBtnCompleted: { backgroundColor: '#22c55e', shadowColor: '#22c55e' },
  ctaBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  ctaBtnTextDisabled: { color: COLORS.ink3 },
});