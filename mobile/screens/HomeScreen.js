import React, { useContext, useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Image, Dimensions, StatusBar, ActivityIndicator
} from 'react-native';
import { MapPin, ChevronRight, Clock, ArrowRight } from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';
import pathService from '../services/pathService';
import userService from '../services/userService';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, AoboshiOne_400Regular } from '@expo-google-fonts/aoboshi-one';
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';

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

const CATEGORY_IMAGES = {
  'Culturel': require('../assets/images/culturel.png'),
  'Sportif': require('../assets/images/sportif.png'),
  'Culinaire': require('../assets/images/culinaire.png'),
  'Détente': require('../assets/images/detente.png'),
  'Mixte': require('../assets/images/mixte.png'),
};

const CATEGORIES = ['Tout', 'Culturel', 'Sportif', 'Culinaire', 'Détente', 'Mixte'];

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
    Poppins_700Bold
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

  // Filtre par catégorie
  const filteredPaths = activeCategory === 'Tout' 
    ? paths 
    : paths.filter(p => p.difficulty === activeCategory || p.category === activeCategory);

  const featuredPath = filteredPaths[0] || null;
  const nearbyPaths = filteredPaths.slice(1, 4);

  const progressPercent = activeQuest 
    ? Math.round(activeQuest.percentage) 
    : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView 
        contentContainerStyle={{ paddingBottom: 100 }} 
        showsVerticalScrollIndicator={false}
      >
        {/* --- HEADER --- */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* Location eyebrow */}
            <View style={styles.eyebrow}>
              <View style={styles.locDot} />
              <Text style={styles.locText}>Bordeaux</Text>
            </View>
            <Text style={styles.greeting}>
              Bonjour,{'\n'}
              <Text style={styles.username}>{user?.firstname || 'Voyageur'}</Text>
            </Text>
          </View>

          <TouchableOpacity style={styles.avatarBtn} onPress={() => navigation.navigate('Profile')}>
            <Image 
              source={require('../assets/images/mascotte2.png')} 
              style={styles.avatarImage} 
            />
          </TouchableOpacity>
        </View>

        {/* --- DIVIDER --- */}
        <View style={styles.rule} />

        {/* --- ACTIVE QUEST STRIP --- */}
        {activeQuest && (
          <TouchableOpacity 
            style={styles.questStrip} 
            onPress={() => goToDetail(activeQuest.path?._id)} 
            activeOpacity={0.85}
          >
            <View style={styles.questIcon}>
              <MapPin size={16} color={COLORS.tealLight} />
            </View>
            <View style={styles.questBody}>
              <Text style={styles.questLabel}>En cours</Text>
              <Text style={styles.questName} numberOfLines={1}>{activeQuest.path?.title}</Text>
              <View style={styles.progBar}>
                <View style={[styles.progFill, { width: `${progressPercent}%` }]} />
              </View>
              <Text style={styles.questStep}>Étape {activeQuest.currentStep || '?'} sur {activeQuest.totalSteps || '?'}</Text>
            </View>
            <View style={styles.questArrow}>
              <ChevronRight size={16} color={COLORS.ink3} />
            </View>
          </TouchableOpacity>
        )}

        {/* --- SECTION: À la une --- */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>À la une</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
            <Text style={styles.seeAll}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        {/* Hero card */}
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
            <View style={styles.heroTop}>
              <View style={styles.heroTag}>
                <Text style={styles.heroTagText}>{featuredPath.difficulty} · {featuredPath.city}</Text>
              </View>
              <Text style={styles.heroScore}>4.8 <Text style={styles.heroScoreSub}>/ 5</Text></Text>
            </View>
            <View style={styles.heroBottom}>
              <Text style={styles.heroTitle}>{featuredPath.title}</Text>
              <Text style={styles.heroMeta}>
                {featuredPath.quests?.length} étapes · {featuredPath.quests?.length * 20} min · {featuredPath.difficulty}
              </Text>
            </View>
            <View style={styles.heroCta}>
              <ArrowRight size={16} color={COLORS.white} strokeWidth={2.5} />
            </View>
          </TouchableOpacity>
        ) : null}

        {/* --- CATEGORY FILTERS --- */}
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
              <Text style={[styles.catText, activeCategory === cat && styles.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* --- SECTION: Autour de toi --- */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Autour de toi</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
            <Text style={styles.seeAll}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        {/* Nearby list */}
        <View style={styles.nearbyList}>
          {nearbyPaths.map((path, index) => (
            <TouchableOpacity 
              key={path._id} 
              style={[styles.nearbyItem, index < nearbyPaths.length - 1 && styles.nearbyItemBorder]}
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
                  <Clock size={10} color={COLORS.ink3} />
                  <Text style={styles.nearbyDetail}>{path.quests?.length * 20} min</Text>
                  <Text style={styles.nearbySep}>·</Text>
                  <MapPin size={10} color={COLORS.ink3} />
                  <Text style={styles.nearbyDetail}>{path.city}</Text>
                </View>
              </View>
              <View style={styles.nearbyRight}>
                <Text style={styles.nearbyRating}>4.8</Text>
                <Text style={styles.nearbyDist}>{path.quests?.length} étapes</Text>
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

  // --- HEADER ---
  header: {
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: COLORS.background,
  },
  headerLeft: {},
  eyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  locDot: {
    width: 5, height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.orange,
  },
  locText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: COLORS.ink3,
  },
  greeting: {
    fontFamily: 'AoboshiOne_400Regular',
    fontSize: 26,
    color: COLORS.ink,
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  username: {
    color: COLORS.orange,
  },
  avatarBtn: {
    marginTop: 4,
  },
  avatarImage: {
    width: 38, height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.tealDark,
  },

  // --- DIVIDER ---
  rule: {
    height: 1,
    backgroundColor: COLORS.rule,
    marginHorizontal: 22,
    marginBottom: 16,
  },

  // --- ACTIVE QUEST ---
  questStrip: {
    marginHorizontal: 22,
    marginBottom: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.rule,
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  questIcon: {
    width: 34, height: 34,
    borderRadius: 8,
    backgroundColor: COLORS.tealDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questBody: {
    flex: 1,
    minWidth: 0,
  },
  questLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 9,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: COLORS.orange,
    marginBottom: 1,
  },
  questName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: COLORS.ink,
    marginBottom: 6,
  },
  progBar: {
    height: 2.5,
    backgroundColor: COLORS.rule,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progFill: {
    height: '100%',
    backgroundColor: COLORS.orange,
    borderRadius: 10,
  },
  questStep: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 9,
    color: COLORS.ink3,
  },
  questArrow: {
    opacity: 0.4,
  },

  // --- SECTION HEADERS ---
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: COLORS.ink3,
  },
  seeAll: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    color: COLORS.orange,
  },

  // --- HERO CARD ---
  heroCard: {
    marginHorizontal: 22,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    height: 190,
    backgroundColor: COLORS.tealDark,
  },
  heroImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(20, 30, 30, 0.62)',
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  heroTag: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  heroTagText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 9,
    letterSpacing: 0.5,
    color: '#fff',
  },
  heroScore: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#fff',
  },
  heroScoreSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },
  heroBottom: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 60,
  },
  heroTitle: {
    fontFamily: 'AoboshiOne_400Regular',
    fontSize: 18,
    color: '#fff',
    lineHeight: 24,
    marginBottom: 5,
  },
  heroMeta: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: 'rgba(255,255,255,0.65)',
  },
  heroCta: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // --- CATEGORY FILTERS ---
  catsContainer: {
    paddingHorizontal: 22,
    paddingBottom: 20,
    gap: 8,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.rule,
  },
  catChipActive: {
    backgroundColor: COLORS.ink,
    borderColor: COLORS.ink,
  },
  catText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    color: COLORS.ink2,
  },
  catTextActive: {
    color: COLORS.white,
  },

  // --- NEARBY LIST ---
  nearbyList: {
    marginHorizontal: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.rule,
    borderRadius: 12,
    overflow: 'hidden',
  },
  nearbyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  nearbyItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.rule,
  },
  nearbyThumb: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: COLORS.tealDark,
  },
  nearbyBody: {
    flex: 1,
    minWidth: 0,
  },
  nearbyCat: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 9,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: COLORS.ink3,
    marginBottom: 2,
  },
  nearbyTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: COLORS.ink,
    marginBottom: 4,
  },
  nearbyDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  nearbyDetail: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: COLORS.ink3,
    marginLeft: 2,
  },
  nearbySep: {
    color: COLORS.ink3,
    fontSize: 10,
    marginHorizontal: 2,
  },
  nearbyRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  nearbyRating: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: COLORS.ink,
  },
  nearbyDist: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: COLORS.ink3,
  },
});