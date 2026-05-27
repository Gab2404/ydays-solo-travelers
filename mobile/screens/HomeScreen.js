import React, { useContext, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Dimensions, StatusBar, ActivityIndicator
} from 'react-native';
import Svg, { Path, Circle, Polygon } from 'react-native-svg';
import { MapPin, ChevronRight, ArrowRight } from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';
import pathService from '../services/pathService';
import userService from '../services/userService';
import api from '../utils/api';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, AoboshiOne_400Regular } from '@expo-google-fonts/aoboshi-one';
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';

const { width } = Dimensions.get('window');

const COLORS = {
  orange:      '#ED6F2D',
  orangeLight: '#EE8643',
  orangePale:  '#F5C39F',
  teal:        '#43868D',
  tealDark:    '#214347',
  tealLight:   '#AECED1',
  ink:         '#1A1A1A',
  ink2:        '#4A4642',
  ink3:        '#9C9590',
  background:  '#FAF8F5',
  white:       '#FFFFFF',
  rule:        '#EAE6E1',
};

const CATEGORY_IMAGES = {
  'Culturel':  require('../assets/images/culturel.png'),
  'Sportif':   require('../assets/images/sportif.png'),
  'Culinaire': require('../assets/images/culinaire.png'),
  'Détente':   require('../assets/images/detente.png'),
  'Mixte':     require('../assets/images/mixte.png'),
};

const CATEGORIES = ['Tout', 'Culturel', 'Sportif', 'Culinaire', 'Détente', 'Mixte'];

/* ─── Boussole image en arrière-plan du header ─── */
function CompassDeco() {
  return (
    <Image
      source={require('../assets/images/BOUSSOLE.png')}
      style={styles.compassDeco}
      resizeMode="contain"
    />
  );
}

/* ─── Vague de séparation header → body ─── */
function HeroWave() {
  const hw = width;
  const d = `M0 28 L0 14 Q${hw * 0.25} 0 ${hw * 0.5} 10 Q${hw * 0.75} 20 ${hw} 4 L${hw} 28 Z`;
  return (
    <Svg width={hw} height={28} viewBox={`0 0 ${hw} 28`} preserveAspectRatio="none">
      <Path d={d} fill={COLORS.background} />
    </Svg>
  );
}

export default function HomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [activeCategory, setActiveCategory] = useState('Tout');
  const [paths, setPaths] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeQuest, setActiveQuest] = useState(null);

  let [fontsLoaded] = useFonts({
    AoboshiOne_400Regular,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    const hideSplash = async () => {
      try { await SplashScreen.hideAsync(); } catch (e) { console.warn(e); }
    };
    if (fontsLoaded) hideSplash();
  }, [fontsLoaded]);

  useEffect(() => {
    fetchPaths();
    fetchActiveQuest();
  }, []);

  const fetchPaths = async () => {
    try {
      setIsLoading(true);
      const data = await pathService.getAllPaths();
      setPaths(data);
    } catch (err) {
      console.error('Erreur chargement parcours:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActiveQuest = async () => {
    try {
      const history = await userService.getUserHistory();
      if (history?.history) {
        const ongoing = history.history.find(h => h.percentage > 0 && h.percentage < 100);
        if (ongoing) {
          const totalSteps = ongoing.path?.quests?.length || ongoing.totalQuests || 0;
          const currentStep = totalSteps > 0 ? Math.round((ongoing.percentage / 100) * totalSteps) : 0;
          setActiveQuest({ ...ongoing, currentStep, totalSteps });
        }
      }
    } catch (err) {
      console.error('Erreur quête active:', err);
    }
  };

  if (!fontsLoaded) return null;

  const goToDetail = (pathId) => navigation.navigate('PathDetail', { pathId });

  const filteredPaths = activeCategory === 'Tout'
    ? paths
    : paths.filter(p => p.difficulty === activeCategory || p.category === activeCategory);

  const featuredPath    = filteredPaths[0] || null;
  const nearbyPaths     = filteredPaths.slice(1, 4);
  const progressPercent = activeQuest ? Math.round(activeQuest.percentage) : 0;

  /* Prénom / Nom — même logique que ProfileScreen */
  const firstName = user?.firstName || user?.firstname || '';
  const lastName  = user?.lastName  || user?.lastname  || '';
  const initials  = (firstName.slice(0, 1) + lastName.slice(0, 1)).toUpperCase() || '?';

  /* Photo de profil — reconstitution URL complète comme ProfileScreen */
  const serverURL = api.defaults.baseURL?.replace(/\/api$/, '') || '';
  const rawAvatar = user?.avatar || null;
  const avatarUri = rawAvatar
    ? (rawAvatar.startsWith('http') ? rawAvatar : `${serverURL}${rawAvatar.startsWith('/') ? '' : '/'}${rawAvatar}`)
    : null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.orange} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >

        {/* ════════════════════════════════════
            HERO HEADER ORANGE
        ════════════════════════════════════ */}
        <View style={styles.hero}>
          {/* Boussole déco */}
          <CompassDeco />

          {/* Contenu principal */}
          <View style={styles.heroContent}>
            <View style={styles.heroLeft}>
              {/* Eyebrow localisation */}
              <View style={styles.eyebrow}>
                <View style={styles.locDot} />
                <Text style={styles.locText}>Bordeaux</Text>
              </View>
              {/* Bonjour + prénom */}
              <Text style={styles.heroName}>
                Bonjour,{'\n'}
                <Text style={styles.heroNameSub}>{firstName}</Text>
              </Text>
            </View>

            {/* Avatar : photo de profil ou initiales */}
            <TouchableOpacity style={styles.avatarCircle} onPress={() => navigation.navigate('Profile')}>
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Vague de bas */}
          <HeroWave />
        </View>

        {/* ════════════════════════════════════
            QUÊTE EN COURS
        ════════════════════════════════════ */}
        {activeQuest && (
          <TouchableOpacity
            style={styles.questStrip}
            onPress={() => goToDetail(activeQuest.path?._id)}
            activeOpacity={0.85}
          >
            {/* Cercle déco */}
            <View style={styles.questDecoCircle} />

            {/* Icône */}
            <View style={styles.questIcon}>
              <MapPin size={16} color={COLORS.tealLight} />
            </View>

            {/* Corps */}
            <View style={styles.questBody}>
              <Text style={styles.questLabel}>En cours</Text>
              <Text style={styles.questName} numberOfLines={1}>
                {activeQuest.path?.title}
              </Text>
              <View style={styles.progBar}>
                <View style={[styles.progFill, { width: `${progressPercent}%` }]} />
              </View>
              <Text style={styles.questStep}>
                Étape {activeQuest.currentStep || '?'} sur {activeQuest.totalSteps || '?'}
              </Text>
            </View>

            {/* Flèche */}
            <View style={styles.questArrowCircle}>
              <ChevronRight size={12} color="rgba(255,255,255,0.7)" />
            </View>
          </TouchableOpacity>
        )}

        {/* ════════════════════════════════════
            À LA UNE
        ════════════════════════════════════ */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>À la une</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
            <Text style={styles.seeAll}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={[styles.heroCard, { alignItems: 'center', justifyContent: 'center' }]}>
            <ActivityIndicator color={COLORS.orange} />
          </View>
        ) : featuredPath ? (
          <TouchableOpacity
            style={styles.heroCard}
            onPress={() => goToDetail(featuredPath._id)}
            activeOpacity={0.9}
          >
            <Image
              source={CATEGORY_IMAGES[featuredPath.difficulty] || CATEGORY_IMAGES['Culturel']}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <View style={styles.heroOverlay} />

            {/* Tag + note */}
            <View style={styles.heroTop}>
              <View style={styles.heroTag}>
                <Text style={styles.heroTagText}>
                  {featuredPath.difficulty} · {featuredPath.city}
                </Text>
              </View>
              <Text style={styles.heroScore}>
                4.8 <Text style={styles.heroScoreSub}>/ 5</Text>
              </Text>
            </View>

            {/* Titre + méta */}
            <View style={styles.heroBottom}>
              <Text style={styles.heroTitle}>{featuredPath.title}</Text>
              <View style={styles.heroMetaRow}>
                <Text style={styles.heroMetaItem}>{featuredPath.quests?.length} étapes</Text>
                <Text style={styles.heroMetaSep}>·</Text>
                <Text style={styles.heroMetaItem}>{featuredPath.quests?.length * 20} min</Text>
                <Text style={styles.heroMetaSep}>·</Text>
                <Text style={styles.heroMetaItem}>{featuredPath.difficulty}</Text>
              </View>
            </View>

            {/* CTA bouton */}
            <View style={styles.heroCta}>
              <ArrowRight size={14} color={COLORS.white} strokeWidth={2.5} />
            </View>
          </TouchableOpacity>
        ) : null}

        {/* ════════════════════════════════════
            FILTRES CATÉGORIES
        ════════════════════════════════════ */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catsContainer}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.catChip, activeCategory === cat && styles.catChipActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.catText, activeCategory === cat && styles.catTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ════════════════════════════════════
            AUTOUR DE TOI
        ════════════════════════════════════ */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Autour de toi</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
            <Text style={styles.seeAll}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.nearbyList}>
          {nearbyPaths.map((path, index) => (
            <TouchableOpacity
              key={path._id}
              style={[
                styles.nearbyItem,
                index < nearbyPaths.length - 1 && styles.nearbyItemBorder,
              ]}
              onPress={() => goToDetail(path._id)}
              activeOpacity={0.85}
            >
              <Image
                source={CATEGORY_IMAGES[path.difficulty] || CATEGORY_IMAGES['Culturel']}
                style={styles.nearbyThumb}
              />
              <View style={styles.nearbyBody}>
                <Text style={styles.nearbyCat}>{path.difficulty}</Text>
                <Text style={styles.nearbyTitle} numberOfLines={1}>{path.title}</Text>
                <View style={styles.nearbyDetails}>
                  <Text style={styles.nearbyDetail}>{path.quests?.length * 20} min</Text>
                  <Text style={styles.nearbySep}>·</Text>
                  <Text style={styles.nearbyDetail}>{path.quests?.length} étapes</Text>
                </View>
              </View>
              <View style={styles.nearbyRight}>
                <Text style={styles.nearbyRating}>4.8</Text>
                <View style={styles.nearbyDistBadge}>
                  <Text style={styles.nearbyDistText}>{path.quests?.length} ét.</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {nearbyPaths.length === 0 && !isLoading && (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: COLORS.ink3 }}>
                Aucun parcours disponible
              </Text>
            </View>
          )}
        </View>

      </ScrollView>

      <BottomNav navigation={navigation} activeRoute="Home" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // ─── HERO HEADER ───────────────────────────────────
  hero: {
    backgroundColor: COLORS.orange,
    overflow: 'hidden',
    position: 'relative',
  },
  compassDeco: {
    position: 'absolute',
    right: -70,
    top: '50%',
    marginTop: -150,
    width: 230,
    height: 230,
    opacity: 0.15,
  },
  heroContent: {
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    position: 'relative',
    zIndex: 2,
  },
  heroLeft: {},
  eyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  locDot: {
    width: 6, height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  locText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9.5,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.8)',
  },
  heroName: {
    fontFamily: 'AoboshiOne_400Regular',
    fontSize: 26,
    color: '#fff',
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  heroNameSub: {
    fontFamily: 'AoboshiOne_400Regular',
    fontSize: 22,
    color: 'rgba(255,255,255,0.75)',
  },
  avatarCircle: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  avatarText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: '#fff',
    letterSpacing: 0.5,
  },

  // ─── QUEST STRIP ───────────────────────────────────
  questStrip: {
    marginHorizontal: 22,
    marginTop: 14,
    marginBottom: 18,
    backgroundColor: COLORS.tealDark,
    borderRadius: 14,
    padding: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    overflow: 'hidden',
    shadowColor: COLORS.tealDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
  questDecoCircle: {
    position: 'absolute',
    right: -20, top: -20,
    width: 80, height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  questIcon: {
    width: 36, height: 36,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  questBody: {
    flex: 1,
    minWidth: 0,
  },
  questLabel: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 8.5,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: COLORS.orangePale,
    marginBottom: 2,
  },
  questName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#fff',
    marginBottom: 6,
  },
  progBar: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progFill: {
    height: '100%',
    backgroundColor: COLORS.orange,
    borderRadius: 10,
  },
  questStep: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  questArrowCircle: {
    width: 28, height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  // ─── SECTION HEADERS ───────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9.5,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: COLORS.ink3,
  },
  seeAll: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: COLORS.orange,
  },

  // ─── HERO CARD ─────────────────────────────────────
  heroCard: {
    marginHorizontal: 22,
    marginBottom: 18,
    borderRadius: 16,
    overflow: 'hidden',
    height: 190,
    backgroundColor: COLORS.tealDark,
    shadowColor: '#0E1E22',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 8,
  },
  heroImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(14,30,34,0.55)',
  },
  heroTop: {
    position: 'absolute',
    top: 14, left: 14, right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  heroTag: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    // Glassmorphism – backdrop blur non supporté nativement en RN,
    // on simule avec fond blanc semi-transparent + bordure lumineuse
  },
  heroTagText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 8.5,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.95)',
  },
  heroScore: {
    fontFamily: 'AoboshiOne_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.95)',
  },
  heroScoreSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
  },
  heroBottom: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: 14,
    paddingRight: 56,
    zIndex: 2,
  },
  heroTitle: {
    fontFamily: 'AoboshiOne_400Regular',
    fontSize: 17,
    color: '#fff',
    lineHeight: 22,
    marginBottom: 7,
    letterSpacing: -0.2,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  heroMetaItem: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
  },
  heroMetaSep: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 10,
  },
  heroCta: {
    position: 'absolute',
    bottom: 14, right: 14,
    width: 34, height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.orange,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },

  // ─── CATEGORY FILTERS ──────────────────────────────
  catsContainer: {
    paddingHorizontal: 22,
    paddingBottom: 18,
    gap: 7,
  },
  catChip: {
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.rule,
  },
  catChipActive: {
    backgroundColor: COLORS.orange,
    borderColor: COLORS.orange,
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  catText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: COLORS.ink2,
  },
  catTextActive: {
    color: COLORS.white,
  },

  // ─── NEARBY LIST ───────────────────────────────────
  nearbyList: {
    marginHorizontal: 22,
  },
  nearbyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 12,
  },
  nearbyItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.rule,
  },
  nearbyThumb: {
    width: 58, height: 58,
    borderRadius: 10,
    backgroundColor: COLORS.tealDark,
    flexShrink: 0,
  },
  nearbyBody: {
    flex: 1,
    minWidth: 0,
  },
  nearbyCat: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: COLORS.teal,
    marginBottom: 2,
  },
  nearbyTitle: {
    fontFamily: 'AoboshiOne_400Regular',
    fontSize: 13,
    color: COLORS.ink,
    marginBottom: 4,
  },
  nearbyDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nearbyDetail: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: COLORS.ink3,
  },
  nearbySep: {
    color: COLORS.ink3,
    fontSize: 10,
  },
  nearbyRight: {
    alignItems: 'flex-end',
    gap: 6,
    flexShrink: 0,
  },
  nearbyRating: {
    fontFamily: 'AoboshiOne_400Regular',
    fontSize: 13,
    color: COLORS.ink,
  },
  nearbyDistBadge: {
    backgroundColor: 'rgba(237,111,45,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  nearbyDistText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    color: COLORS.orange,
  },
});