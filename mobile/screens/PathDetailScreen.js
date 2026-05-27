import React, { useEffect, useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, 
  ScrollView, Dimensions, ImageBackground, Image
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { 
  Clock, MapPin, ArrowLeft, Bookmark, Play, ChevronRight,
  Users, Map, Check, Maximize2
} from 'lucide-react-native';
import pathService from '../services/pathService';
import storage from '../utils/storage';
import userService from '../services/userService';
import errorHandler from '../utils/errorHandler';
import BottomNav from '../components/BottomNav';
import QuestReviewModal from '../components/QuestReviewModal';
import RatingBadge from '../components/RatingBadge';
import ReviewsListModal from '../components/ReviewsListModal';
import usePathRating from '../hooks/usePathRating';

const { width } = Dimensions.get('window');

const COLORS = {
  orange: '#ED6F2D',
  teal: '#43868D',
  tealDark: '#214347',
  tealLight: '#AECED1',
  ink: '#1A1A1A',
  ink2: '#4A4642',
  ink3: '#9C9590',
  background: '#FAF8F5',
  white: '#FFFFFF',
  rule: '#EAE6E1',
};

/**
 * Sous-composant : badge de note dynamique pour le hero du PathDetail.
 * Lit les avis de la dernière quête du parcours via usePathRating.
 */
function PathRatingBadge({ path, onPress }) {
  const lastQuestId = path?.quests?.[path.quests.length - 1]?._id;
  const { averageRating, totalReviews } = usePathRating(lastQuestId);
  return (
    <RatingBadge
      rating={averageRating}
      reviewsCount={totalReviews}
      onPress={onPress}
      variant="dark"
      size="md"
      style={{ position: 'absolute', bottom: 16, right: 16, zIndex: 10 }}
    />
  );
}

/**
 * Sous-composant : modal liste d'avis connecté aux données réelles.
 */
function PathReviewsList({ path, visible, onClose }) {
  const lastQuestId = path?.quests?.[path.quests.length - 1]?._id;
  const { averageRating, totalReviews, reviews, isLoading } = usePathRating(lastQuestId);
  return (
    <ReviewsListModal
      visible={visible}
      onClose={onClose}
      reviews={reviews}
      averageRating={averageRating}
      totalReviews={totalReviews}
      questTitle={path?.title}
      isLoading={isLoading}
    />
  );
}

export default function PathDetailScreen({ route, navigation }) {
  const { pathId } = route.params;
  const [path, setPath] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [routeCoords, setRouteCoords] = useState([]);
  const [completedQuests, setCompletedQuests] = useState([]);
  const [inProgressQuests, setInProgressQuests] = useState([]);
  const [selectedStepId, setSelectedStepId] = useState(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewQuestId, setReviewQuestId] = useState(null);
  const [reviewQuestTitle, setReviewQuestTitle] = useState('');
  const [reviewsListVisible, setReviewsListVisible] = useState(false);
  const mapRef = useRef(null);

  const categoryImages = {
    'Culturel': require('../assets/images/culturel.png'),
    'Sportif': require('../assets/images/sportif.png'),
    'Culinaire': require('../assets/images/culinaire.png'),
    'Détente': require('../assets/images/detente.png'),
    'Mixte': require('../assets/images/mixte.png'),
  };

  useEffect(() => {
    fetchPath();
    checkUserProgress();
  }, [pathId]);

  useEffect(() => {
    if (path && path.quests?.length > 1) {
      fetchWalkingRoute();
    }
  }, [path]);

  const checkUserProgress = async () => {
    try {
      const userData = await userService.getCurrentUser();
      const rawIds = userData.completedQuests?.map(cq => cq.questId) || [];
      setCompletedQuests([...new Set(rawIds)]);
    } catch (error) {
      console.error('Erreur récupération progression:', error);
    }
  };

  const fetchPath = async () => {
    try {
      setIsLoading(true);
      const data = await pathService.getPathById(pathId);
      setPath(data);
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

  const handleStartTrip = async () => {
    try {
      if (!path) return;
      const completedCount = completedQuests.filter(id => path.quests.some(q => q._id === id)).length;
      const totalSteps = path.quests?.length || 0;
      if (totalSteps > 0 && completedCount >= totalSteps) {
        navigation.navigate('Gallery', { pathId: path._id });
        return;
      }
      await storage.setItem('lastPathId', path._id);
      navigation.navigate('Roadmap', { pathId: path._id });
    } catch (error) {
      console.error('Erreur sauvegarde parcours:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.orange} />
      </View>
    );
  }

  if (!path) return null;

  const estimatedTime = `${path.quests.length * 20} min`;
  const estimatedDistance = `${(path.quests.length * 0.8).toFixed(1)} km`;
  const steps = path.quests?.length || 0;
  const categoryImage = path.difficulty ? categoryImages[path.difficulty] : null;

  const completedInThisPath = completedQuests.filter(id => path.quests.some(q => q._id === id)).length;
  const isCompleted = steps > 0 && completedInThisPath >= steps;
  const isOngoing = !isCompleted && (completedInThisPath > 0 || inProgressQuests.length > 0);
  const progressPercent = steps > 0 ? Math.min(100, Math.round((completedInThisPath / steps) * 100)) : 0;

  // Map initial region
  const mapRegion = path.quests[0]?.location ? {
    latitude: path.quests[0].location.lat,
    longitude: path.quests[0].location.lng,
    latitudeDelta: 0.018,
    longitudeDelta: 0.018,
  } : null;

  return (
    <View style={styles.container}>

      {/* ── HERO ── */}
      <View style={styles.hero}>
        {categoryImage ? (
          <ImageBackground source={categoryImage} style={styles.heroImage} resizeMode="cover">
            <View style={styles.heroOverlay} />
          </ImageBackground>
        ) : (
          <View style={[styles.heroImage, { backgroundColor: COLORS.tealDark }]}>
            <View style={styles.heroOverlay} />
          </View>
        )}

        {/* Floating buttons */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={14} color="#fff" strokeWidth={2.2} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bookmarkBtn}>
          <Bookmark size={14} color="#fff" strokeWidth={2} />
        </TouchableOpacity>

        {/* Bottom tags */}
        <View style={styles.heroCat}>
          <Text style={styles.heroCatText}>{(path.difficulty || 'Parcours').toUpperCase()} · {path.city || 'Bordeaux'}</Text>
        </View>
        <PathRatingBadge path={path} onPress={() => setReviewsListVisible(true)} />
      </View>

      {/* ── SCROLLABLE CONTENT ── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Title block */}
        <View style={styles.titleBlock}>
          <Text style={styles.questTitle}>{path.title}</Text>
          <View style={styles.authorRow}>
            <View style={styles.authorAvatar}>
              <Users size={10} color={COLORS.tealLight} strokeWidth={2} />
            </View>
            <Text style={styles.authorText}>Par <Text style={styles.authorName}>TravelQuest</Text></Text>
          </View>
        </View>

        {/* Meta pills */}
        <View style={styles.metaRow}>
          <View style={styles.metaPill}>
            <Clock size={13} color={COLORS.ink3} strokeWidth={1.8} />
            <Text style={styles.metaText}>{estimatedTime}</Text>
          </View>
          <View style={styles.metaPill}>
            <MapPin size={13} color={COLORS.ink3} strokeWidth={1.8} />
            <Text style={styles.metaText}>{estimatedDistance}</Text>
          </View>
          <View style={styles.metaPill}>
            <Map size={13} color={COLORS.ink3} strokeWidth={1.8} />
            <Text style={styles.metaText}>{steps} étapes</Text>
          </View>
          <View style={[styles.metaPill, styles.metaPillHighlight]}>
            <Users size={13} color={COLORS.orange} strokeWidth={1.8} />
            <Text style={[styles.metaText, { color: COLORS.orange, fontFamily: 'Poppins_600SemiBold' }]}>Solo · Groupe</Text>
          </View>
        </View>

        <View style={styles.rule} />

        {/* Resume / Completed banner */}
        {isCompleted ? (
          <View style={styles.completedBanner}>
            <View style={styles.resumeIcon}>
              <Check size={16} color={COLORS.tealLight} strokeWidth={2.5} />
            </View>
            <View style={styles.resumeBody}>
              <Text style={styles.resumeLabel}>TERMINÉ · {steps} ÉTAPES SUR {steps}</Text>
              <Text style={styles.resumeText}>Parcours complété 🎉</Text>
              <View style={styles.resumeBar}>
                <View style={[styles.resumeFill, { width: '100%' }]} />
              </View>
            </View>
          </View>
        ) : isOngoing ? (
          <TouchableOpacity style={styles.resumeBanner} onPress={handleStartTrip} activeOpacity={0.88}>
            <View style={styles.resumeIcon}>
              <Play size={16} color={COLORS.tealLight} strokeWidth={1.8} />
            </View>
            <View style={styles.resumeBody}>
              <Text style={styles.resumeLabel}>EN COURS · ÉTAPE {completedInThisPath} SUR {steps}</Text>
              <Text style={styles.resumeText}>Reprendre la quête</Text>
              <View style={styles.resumeBar}>
                <View style={[styles.resumeFill, { width: `${progressPercent}%` }]} />
              </View>
            </View>
            <ChevronRight size={10} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>
        ) : null}

        {/* ── MAP PREVIEW ── */}
        {mapRegion && (
          <View style={styles.mapSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Carte du parcours</Text>
            </View>
            <View style={styles.mapContainer}>
              <MapView
                ref={mapRef}
                style={styles.mapView}
                initialRegion={mapRegion}
                scrollEnabled={false}
                zoomEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
              >
                {routeCoords.length > 0 && (
                  <Polyline
                    coordinates={routeCoords}
                    strokeColor={COLORS.orange}
                    strokeWidth={3}
                    lineDashPattern={[6, 3]}
                  />
                )}
                {path.quests.map((quest, index) => {
                  const isDone = completedQuests.includes(quest._id);
                  const isCurrent = !isDone && inProgressQuests.includes(quest._id);
                  return (
                    <Marker
                      key={quest._id}
                      coordinate={{ latitude: quest.location.lat, longitude: quest.location.lng }}
                    >
                      <View style={[
                        styles.mapPin,
                        isDone && styles.mapPinDone,
                        isCurrent && styles.mapPinCurrent,
                        !isDone && !isCurrent && styles.mapPinUpcoming,
                      ]}>
                        {isDone ? (
                          <Check size={10} color={COLORS.tealLight} strokeWidth={2.5} />
                        ) : (
                          <Text style={styles.mapPinText}>{index + 1}</Text>
                        )}
                      </View>
                    </Marker>
                  );
                })}
              </MapView>
              <TouchableOpacity 
                style={styles.mapExpand}
                onPress={() => navigation.navigate('Map', { pathId: path._id })}
              >
                <Maximize2 size={13} color={COLORS.ink2} strokeWidth={1.8} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── DESCRIPTION ── */}
        <View style={styles.descSection}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {path.description || "Explorez la ville à travers ce parcours unique. Découvrez des lieux cachés et résolvez des énigmes passionnantes !"}
            {'  '}
            <Text style={styles.descLink}>En savoir plus →</Text>
          </Text>
        </View>

        {/* ── STEPS TIMELINE ── */}
        <View style={styles.stepsSection}>
          <Text style={styles.sectionTitle}>Étapes du parcours</Text>
          {path.quests.map((quest, index) => {
            const isDone = completedQuests.includes(quest._id);
            const isCurrent = !isDone && inProgressQuests.includes(quest._id);
            const isLast = index === path.quests.length - 1;
            const isSelected = selectedStepId === quest._id;

            return (
              <TouchableOpacity
                key={quest._id}
                onPress={() => setSelectedStepId(isSelected ? null : quest._id)}
                activeOpacity={0.85}
                style={styles.stepItem}
              >
                {/* Left: number + connector */}
                <View style={styles.stepLeft}>
                  <View style={[
                    styles.stepNum,
                    isDone && styles.stepNumDone,
                    isCurrent && styles.stepNumCurrent,
                    !isDone && !isCurrent && styles.stepNumUpcoming,
                  ]}>
                    {isDone ? (
                      <Check size={10} color={COLORS.tealLight} strokeWidth={2.5} />
                    ) : (
                      <Text style={[
                        styles.stepNumText,
                        isCurrent && { color: '#fff' },
                        !isDone && !isCurrent && { color: COLORS.ink3 },
                      ]}>{index + 1}</Text>
                    )}
                  </View>
                  {!isLast && <View style={styles.stepLine} />}
                </View>

                {/* Right: body */}
                <View style={styles.stepBody}>
                  <Text style={[styles.stepName, (!isDone && !isCurrent) && styles.stepNameMuted]}>
                    {quest.title}
                  </Text>
                  <View style={styles.stepDetail}>
                    <MapPin size={10} color={COLORS.ink3} strokeWidth={1.8} />
                    <Text style={styles.stepDetailText}>
                      {(index + 1) * 250} m · {(index + 1) * 8} min
                    </Text>
                  </View>
                  {isDone && (
                    <View style={[styles.stepTag, styles.stepTagDone]}>
                      <Check size={8} color={COLORS.teal} strokeWidth={2.5} />
                      <Text style={[styles.stepTagText, { color: COLORS.teal }]}>Complété</Text>
                    </View>
                  )}
                  {isCurrent && (
                    <View style={[styles.stepTag, styles.stepTagCurrent]}>
                      <Text style={[styles.stepTagText, { color: COLORS.orange }]}>⏱ En cours</Text>
                    </View>
                  )}

                  {/* Expanded panel on tap */}
                  {isSelected && (
                    <View style={styles.stepExpanded}>
                      <Text style={styles.stepExpandedDesc} numberOfLines={3}>
                        {quest.description || 'Rendez-vous à ce point pour découvrir l\'étape.'}
                      </Text>
                      <TouchableOpacity
                        style={styles.stepExpandedBtn}
                        onPress={() => navigation.navigate('Roadmap', { pathId: path._id })}
                      >
                        <Play size={12} color="#fff" fill="#fff" strokeWidth={2} />
                        <Text style={styles.stepExpandedBtnText}>
                          {isDone ? 'Revoir l\'étape' : isCurrent ? 'Continuer' : 'Commencer'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── PRACTICAL INFO ── */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Informations pratiques</Text>
          <View style={styles.infoBlock}>
            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, styles.infoIconOrange]}>
                <Clock size={14} color={COLORS.orange} strokeWidth={1.8} />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Durée estimée</Text>
                <Text style={styles.infoVal}>{estimatedTime} selon votre rythme</Text>
              </View>
            </View>
            <View style={styles.infoRowDivider} />
            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, styles.infoIconTeal]}>
                <MapPin size={14} color={COLORS.teal} strokeWidth={1.8} />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Point de départ</Text>
                <Text style={styles.infoVal}>{path.quests[0]?.title || 'Point de départ'}, {path.city}</Text>
              </View>
            </View>
            <View style={styles.infoRowDivider} />
            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, styles.infoIconNeutral]}>
                <Users size={14} color={COLORS.ink2} strokeWidth={1.8} />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Niveau</Text>
                <Text style={styles.infoVal}>{path.difficulty || 'Intermédiaire'} · Accessible à tous</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── CTA BUTTON ── */}
        <View style={styles.ctaWrap}>
          <TouchableOpacity style={[styles.ctaBtn, isCompleted && styles.ctaBtnCompleted]} onPress={handleStartTrip} activeOpacity={0.9}>
            <Play size={18} color="#fff" fill="#fff" strokeWidth={2} />
            <Text style={styles.ctaBtnText}>
              {isCompleted ? 'Voir ma galerie' : isOngoing ? 'Reprendre l\'aventure' : 'Commencer l\'aventure'}
            </Text>
          </TouchableOpacity>

          {/* Bouton d'évaluation — visible uniquement si le parcours est terminé */}
          {isCompleted && (
            <TouchableOpacity
              style={styles.reviewBtn}
              onPress={() => {
                // Ouvre le modal pour évaluer la dernière quête du parcours
                const lastQuest = path.quests[path.quests.length - 1];
                setReviewQuestId(lastQuest._id);
                setReviewQuestTitle(path.title);
                setReviewModalVisible(true);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.reviewBtnStar}>★</Text>
              <Text style={styles.reviewBtnText}>Évaluer ce parcours</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      <BottomNav navigation={navigation} activeRoute="PathDetail" currentPathId={pathId} />

      {/* ── REVIEW MODAL ── */}
      <QuestReviewModal
        visible={reviewModalVisible}
        onClose={() => setReviewModalVisible(false)}
        onSuccess={() => setReviewModalVisible(false)}
        questId={reviewQuestId}
        questTitle={reviewQuestTitle}
      />

      {/* ── REVIEWS LIST MODAL ── */}
      {path && (
        <PathReviewsList
          path={path}
          visible={reviewsListVisible}
          onClose={() => setReviewsListVisible(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },

  // ── HERO ──
  hero: {
    height: 230,
    position: 'relative',
    backgroundColor: COLORS.tealDark,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    background: 'transparent',
    backgroundColor: 'rgba(14,30,34,0.55)',
  },
  backBtn: {
    position: 'absolute', top: 50, left: 18, zIndex: 10,
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  bookmarkBtn: {
    position: 'absolute', top: 50, right: 18, zIndex: 10,
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroCat: {
    position: 'absolute', bottom: 16, left: 16, zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 4, paddingHorizontal: 10, paddingVertical: 4,
  },
  heroCatText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9, letterSpacing: 1,
    color: 'rgba(255,255,255,0.7)',
  },
  heroRating: {
    position: 'absolute', bottom: 16, right: 16, zIndex: 10,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
  },
  heroRatingStar: { fontSize: 12, color: '#FFD060' },
  heroRatingVal: {
    fontFamily: 'AoboshiOne_400Regular',
    fontSize: 13, color: '#fff',
  },

  // ── CONTENT ──
  scrollView: { flex: 1 },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 22,
    paddingBottom: 90,
  },

  titleBlock: { marginBottom: 16 },
  questTitle: {
    fontFamily: 'AoboshiOne_400Regular',
    fontSize: 22, color: COLORS.ink,
    lineHeight: 28, letterSpacing: -0.3, marginBottom: 8,
  },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  authorAvatar: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: COLORS.tealDark,
    alignItems: 'center', justifyContent: 'center',
  },
  authorText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11, color: COLORS.ink3,
  },
  authorName: {
    fontFamily: 'Poppins_600SemiBold',
    color: COLORS.orange,
  },

  // Meta pills
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  metaPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.white,
    borderWidth: 1, borderColor: COLORS.rule,
    borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12,
  },
  metaPillHighlight: {
    backgroundColor: 'rgba(237,111,45,0.08)',
    borderColor: 'rgba(237,111,45,0.2)',
  },
  metaText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11, color: COLORS.ink2,
  },

  rule: { height: 1, backgroundColor: COLORS.rule, marginBottom: 20 },

  // Resume banner
  resumeBanner: {
    backgroundColor: COLORS.tealDark,
    borderRadius: 10, padding: 12,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginBottom: 22,
  },
  completedBanner: {
    backgroundColor: COLORS.tealDark,
    borderRadius: 10, padding: 12,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginBottom: 22,
    opacity: 0.85,
  },
  resumeIcon: {
    width: 34, height: 34, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  resumeBody: { flex: 1 },
  resumeLabel: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9, letterSpacing: 1, textTransform: 'uppercase',
    color: 'rgba(174,206,209,0.7)', marginBottom: 2,
  },
  resumeText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12, color: '#fff', marginBottom: 6,
  },
  resumeBar: {
    height: 3, backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10, overflow: 'hidden',
  },
  resumeFill: {
    height: '100%', backgroundColor: COLORS.orange, borderRadius: 10,
  },

  // Section headers
  sectionHeader: { marginBottom: 10 },
  sectionTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9.5, letterSpacing: 1.1,
    textTransform: 'uppercase', color: COLORS.ink3,
    marginBottom: 12,
  },

  // Map
  mapSection: { marginBottom: 22 },
  mapContainer: {
    borderRadius: 12, overflow: 'hidden',
    borderWidth: 1, borderColor: COLORS.rule,
    height: 170, position: 'relative',
  },
  mapView: { width: '100%', height: '100%' },
  mapExpand: {
    position: 'absolute', top: 10, right: 10,
    width: 28, height: 28, borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  mapPin: {
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  mapPinDone: { backgroundColor: COLORS.tealDark },
  mapPinCurrent: { backgroundColor: COLORS.orange },
  mapPinUpcoming: { backgroundColor: '#fff', borderColor: COLORS.rule },
  mapPinText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    color: COLORS.ink3,
  },

  // Description
  descSection: { marginBottom: 22 },
  description: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12, lineHeight: 20, color: COLORS.ink2,
  },
  descLink: {
    fontFamily: 'Poppins_500Medium',
    color: COLORS.orange,
  },

  // Steps timeline
  stepsSection: { marginBottom: 22 },
  stepItem: { flexDirection: 'row', gap: 12 },
  stepLeft: { alignItems: 'center', width: 28 },
  stepNum: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 1,
  },
  stepNumDone: { backgroundColor: COLORS.tealDark },
  stepNumCurrent: {
    backgroundColor: COLORS.orange,
    shadowColor: COLORS.orange,
    shadowOpacity: 0.3, shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 }, elevation: 4,
  },
  stepNumUpcoming: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5, borderColor: COLORS.rule,
  },
  stepNumText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11, color: '#fff',
  },
  stepLine: {
    flex: 1, width: 1,
    backgroundColor: COLORS.rule,
    marginTop: 4, marginBottom: 0,
    minHeight: 20,
  },
  stepBody: { flex: 1, paddingBottom: 20, paddingTop: 4 },
  stepName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12, color: COLORS.ink, marginBottom: 3,
  },
  stepNameMuted: { color: COLORS.ink3, fontFamily: 'Poppins_500Medium' },
  stepDetail: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stepDetailText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10, color: COLORS.ink3,
  },
  stepTag: {
    alignSelf: 'flex-start',
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 4, marginTop: 5,
  },
  stepTagDone: { backgroundColor: 'rgba(67,134,141,0.1)' },
  stepTagCurrent: { backgroundColor: 'rgba(237,111,45,0.1)' },
  stepTagText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 9, letterSpacing: 0.3,
  },

  // Step expanded panel
  stepExpanded: {
    marginTop: 10,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.rule,
    borderRadius: 10,
    padding: 12,
  },
  stepExpandedDesc: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11, color: COLORS.ink2,
    lineHeight: 17, marginBottom: 10,
  },
  stepExpandedBtn: {
    backgroundColor: COLORS.orange,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6,
    borderRadius: 8, paddingVertical: 8,
  },
  stepExpandedBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11, color: '#fff',
  },

  // Practical info
  infoSection: { marginBottom: 22 },
  infoBlock: {
    backgroundColor: COLORS.white,
    borderWidth: 1, borderColor: COLORS.rule,
    borderRadius: 12, padding: 16,
  },
  infoRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  infoRowDivider: {
    height: 1, backgroundColor: COLORS.rule,
    marginVertical: 10,
  },
  infoIcon: {
    width: 30, height: 30, borderRadius: 7,
    alignItems: 'center', justifyContent: 'center',
  },
  infoIconOrange: { backgroundColor: 'rgba(237,111,45,0.1)' },
  infoIconTeal: { backgroundColor: 'rgba(67,134,141,0.1)' },
  infoIconNeutral: { backgroundColor: 'rgba(26,26,26,0.06)' },
  infoText: { flex: 1 },
  infoLabel: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9.5, letterSpacing: 0.8,
    textTransform: 'uppercase', color: COLORS.ink3, marginBottom: 2,
  },
  infoVal: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12, color: COLORS.ink, lineHeight: 18,
  },

  // CTA
  ctaWrap: {
    paddingHorizontal: 0,
    paddingTop: 16,
    paddingBottom: 8,
  },
  ctaBtn: {
    width: '100%', height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.orange,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10,
    shadowColor: COLORS.orange,
    shadowOpacity: 0.35, shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 }, elevation: 6,
  },
  ctaBtnCompleted: {
    backgroundColor: COLORS.teal,
    shadowColor: COLORS.teal,
  },
  ctaBtnText: {
    fontFamily: 'AoboshiOne_400Regular',
    fontSize: 14, color: '#fff', letterSpacing: 0.4,
  },

  // Review button (secondary — appears below CTA when completed)
  reviewBtn: {
    marginTop: 10,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.rule,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  reviewBtnStar: {
    fontSize: 16,
    color: '#FFD060',
    lineHeight: 20,
  },
  reviewBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: COLORS.ink2,
    letterSpacing: 0.1,
  },
});