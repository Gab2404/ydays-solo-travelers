import React, { useEffect, useState } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, StyleSheet, 
  Image, ActivityIndicator, StatusBar, TextInput
} from 'react-native';
import { Clock, MapPin, Search, SlidersHorizontal, Map } from 'lucide-react-native';
import pathService from '../services/pathService';
import errorHandler from '../utils/errorHandler';
import BottomNav from '../components/BottomNav';
import { useFonts, AoboshiOne_400Regular } from '@expo-google-fonts/aoboshi-one';
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { SERVER_URL } from '../utils/api';

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

const FILTERS = ['Tout', 'Culture', 'Gastronomie', 'Street Art', 'Nature', 'Nocturne'];

// Couleurs de fond par catégorie pour les cartes sans image
const CATEGORY_GRADIENTS = {
  'Culturel':   ['#2E5055', '#1A3035'],
  'Culture':    ['#2E5055', '#1A3035'],
  'Street Art': ['#2C3828', '#1E2B1A'],
  'Sportif':    ['#1A2E40', '#214347'],
  'Culinaire':  ['#2E2418', '#1E1610'],
  'Nocturne':   ['#1E1825', '#2A2035'],
  'Détente':    ['#1E2E28', '#142018'],
  'Mixte':      ['#22262E', '#181C24'],
};

export default function DashboardScreen({ route, navigation }) {
  const city = route.params?.city || 'Bordeaux';
  
  const [paths, setPaths] = useState([]);
  const [filteredPaths, setFilteredPaths] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Tout');
  const [searchQuery, setSearchQuery] = useState('');

  let [fontsLoaded] = useFonts({
    AoboshiOne_400Regular,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold
  });

  useEffect(() => {
    fetchPaths();
  }, [city]);

  useEffect(() => {
    let result = paths;
    if (activeFilter !== 'Tout') {
      result = result.filter(p =>
        p.difficulty && p.difficulty.toLowerCase() === activeFilter.toLowerCase()
      );
    }
    if (searchQuery.trim()) {
      result = result.filter(p =>
        p.title && p.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredPaths(result);
  }, [activeFilter, paths, searchQuery]);

  const fetchPaths = async () => {
    try {
      setIsLoading(true);
      const data = await pathService.getPathsByCity(city);
      setPaths(data);
      setFilteredPaths(data);
    } catch (err) {
      errorHandler.handle(err, 'Impossible de charger les parcours');
    } finally {
      setIsLoading(false);
    }
  };

  const getPathImage = (path) => {
    if (path.imageUrl) {
      const cleanPath = path.imageUrl.replace(/\\/g, '/');
      const baseUrl = SERVER_URL || '';
      return { uri: `${baseUrl}/${cleanPath}` };
    }
    const categoryImages = {
      'Culturel': require('../assets/images/culturel.png'),
      'Sportif': require('../assets/images/sportif.png'),
      'Culinaire': require('../assets/images/culinaire.png'),
      'Détente': require('../assets/images/detente.png'),
      'Mixte': require('../assets/images/mixte.png'),
    };
    return categoryImages[path.difficulty] || null;
  };

  const getCategoryBg = (difficulty) => {
    return CATEGORY_GRADIENTS[difficulty] || ['#22262E', '#181C24'];
  };

  // Determine status of a path (mock logic — adapt to your data model)
  const getPathStatus = (path) => {
    if (path.status === 'ongoing' || path.currentStep) return 'ongoing';
    if (path.status === 'completed') return 'completed';
    return 'new';
  };

  const renderPathCard = ({ item }) => {
    const duration = item.duration || '1h30';
    const distance = item.distance || '3 km';
    const xp = item.xp || '+150 XP';
    const rating = item.rating || 4.8;
    const steps = item.quests?.length || 0;
    const status = getPathStatus(item);
    const currentStep = item.currentStep || 0;
    const progressPercent = steps > 0 ? (currentStep / steps) * 100 : 0;
    const pathImage = getPathImage(item);
    const [bg1, bg2] = getCategoryBg(item.difficulty);

    return (
      <TouchableOpacity
        activeOpacity={0.92}
        style={styles.card}
        onPress={() => navigation.navigate('PathDetail', { pathId: item._id })}
      >
        {/* --- HERO ZONE --- */}
        <View style={styles.cardHero}>
          {/* Background: image or gradient fallback */}
          {pathImage ? (
            <Image source={pathImage} style={styles.cardBgImage} resizeMode="cover" />
          ) : (
            <View style={[styles.cardBgGradient, { backgroundColor: bg1 }]} />
          )}

          {/* Dark overlay */}
          <View style={styles.heroOverlay} />

          {/* Category tag — top right */}
          <View style={styles.catTag}>
            <Text style={styles.catTagText}>{(item.difficulty || 'Parcours').toUpperCase()}</Text>
          </View>

          {/* XP badge — bottom right */}
          <View style={styles.xpBadge}>
            <Text style={styles.xpStar}>★</Text>
            <Text style={styles.xpText}>{xp}</Text>
          </View>

          {/* Progress bar for ongoing quests */}
          {status === 'ongoing' && (
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            </View>
          )}
        </View>

        {/* --- CARD BODY --- */}
        <View style={styles.cardBody}>
          {/* Title row + status badge */}
          <View style={styles.titleRow}>
            <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
            {status === 'ongoing' && (
              <View style={[styles.statusBadge, styles.statusOngoing]}>
                <Text style={[styles.statusText, { color: COLORS.orange }]}>EN COURS</Text>
              </View>
            )}
            {status === 'completed' && (
              <View style={[styles.statusBadge, styles.statusDone]}>
                <Text style={[styles.statusText, { color: COLORS.teal }]}>TERMINÉ</Text>
              </View>
            )}
            {status === 'new' && (
              <View style={[styles.statusBadge, styles.statusNew]}>
                <Text style={[styles.statusText, { color: COLORS.tealDark }]}>NOUVEAU</Text>
              </View>
            )}
          </View>

          {/* Meta row */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Clock size={12} color={COLORS.ink3} strokeWidth={1.8} />
              <Text style={styles.metaText}>{duration}</Text>
            </View>
            <View style={styles.metaItem}>
              <MapPin size={12} color={COLORS.ink3} strokeWidth={1.8} />
              <Text style={styles.metaText}>{distance}</Text>
            </View>
            <View style={styles.metaItem}>
              <Map size={12} color={COLORS.ink3} strokeWidth={1.8} />
              <Text style={styles.metaText}>{steps} étapes</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.cardFooter}>
            {status === 'ongoing' ? (
              <Text style={styles.footerSub}>Étape {currentStep} sur {steps} · {Math.round(progressPercent)}% complété</Text>
            ) : (
              <Text style={styles.footerSub}>{distance} de toi</Text>
            )}
            <View style={styles.ratingRow}>
              <Text style={styles.ratingStar}>★</Text>
              <Text style={styles.ratingVal}>{rating}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* --- HEADER --- */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Quêtes</Text>
          <TouchableOpacity style={styles.iconBtn}>
            <Search size={15} color={COLORS.ink2} strokeWidth={1.8} />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSub}>
          <Text style={styles.headerSubBold}>{filteredPaths.length} parcours</Text>
          {' '}disponibles à {city}
        </Text>
      </View>

      {/* --- DIVIDER --- */}
      <View style={styles.rule} />

      {/* --- SEARCH --- */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Search size={13} color={COLORS.ink3} strokeWidth={1.8} />
          <TextInput
            style={styles.searchInput}
            placeholder="Chercher un parcours…"
            placeholderTextColor={COLORS.ink3}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterBox}>
          <View style={[styles.fl, { width: 14 }]} />
          <View style={[styles.fl, { width: 10 }]} />
          <View style={[styles.fl, { width: 6 }]} />
        </TouchableOpacity>
      </View>

      {/* --- CATEGORY FILTERS --- */}
      <View style={styles.catsWrapper}>
        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={item => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catsContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.catChip, activeFilter === item && styles.catChipActive]}
              onPress={() => setActiveFilter(item)}
            >
              <Text style={[styles.catText, activeFilter === item && styles.catTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* --- SECTION HEADER --- */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Tous les parcours</Text>
        <Text style={styles.sectionCount}>{filteredPaths.length} résultats</Text>
      </View>

      {/* --- LIST --- */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.orange} />
        </View>
      ) : (
        <FlatList
          data={filteredPaths}
          keyExtractor={item => item._id}
          renderItem={renderPathCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucune quête trouvée.</Text>
            </View>
          }
        />
      )}

      <BottomNav navigation={navigation} activeRoute="Dashboard" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // --- HEADER ---
  header: {
    paddingTop: 56,
    paddingBottom: 14,
    paddingHorizontal: 22,
    backgroundColor: COLORS.background,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    fontFamily: 'AoboshiOne_400Regular',
    fontSize: 22,
    color: COLORS.ink,
    letterSpacing: -0.3,
  },
  iconBtn: {
    width: 34, height: 34,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.rule,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: COLORS.ink3,
  },
  headerSubBold: {
    fontFamily: 'Poppins_600SemiBold',
    color: COLORS.ink2,
  },

  rule: { height: 1, backgroundColor: COLORS.rule, marginHorizontal: 22 },

  // --- SEARCH ---
  searchRow: {
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBox: {
    flex: 1,
    height: 38,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.rule,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: COLORS.ink,
    padding: 0,
  },
  filterBox: {
    width: 38, height: 38,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.rule,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  fl: {
    height: 1.5,
    backgroundColor: COLORS.ink2,
    borderRadius: 2,
    opacity: 0.5,
  },

  // --- CATEGORIES ---
  catsWrapper: {
    height: 52,
    justifyContent: 'center',
  },
  catsContainer: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    gap: 7,
    alignItems: 'center',
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 5,
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

  // --- SECTION HEADER ---
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9.5,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: COLORS.ink3,
  },
  sectionCount: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: COLORS.ink3,
  },

  // --- CARDS ---
  listContent: {
    paddingHorizontal: 22,
    paddingBottom: 110,
    gap: 14,
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { marginTop: 50, alignItems: 'center' },
  emptyText: { fontFamily: 'Poppins_400Regular', color: COLORS.ink3 },

  card: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.rule,
    borderRadius: 14,
    overflow: 'hidden',
  },

  // Hero
  cardHero: {
    height: 140,
    position: 'relative',
    overflow: 'hidden',
  },
  cardBgImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  cardBgGradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  catTag: {
    position: 'absolute',
    top: 10, right: 10,
    backgroundColor: 'rgba(33,67,71,0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
  },
  catTagText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    letterSpacing: 0.8,
    color: '#fff',
  },
  xpBadge: {
    position: 'absolute',
    bottom: 10, right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  xpStar: { fontSize: 10, color: '#FFD060' },
  xpText: { fontFamily: 'Poppins_700Bold', fontSize: 10, color: '#fff' },

  progressBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.orange,
  },

  // Body
  cardBody: { padding: 14 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  cardTitle: {
    fontFamily: 'AoboshiOne_400Regular',
    fontSize: 15,
    color: COLORS.ink,
    flex: 1,
    lineHeight: 20,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    flexShrink: 0,
  },
  statusOngoing: { backgroundColor: 'rgba(237,111,45,0.1)' },
  statusDone:    { backgroundColor: 'rgba(67,134,141,0.1)' },
  statusNew:     { backgroundColor: 'rgba(33,67,71,0.07)' },
  statusText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    letterSpacing: 0.7,
  },

  metaRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: COLORS.ink3,
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: COLORS.ink3,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingStar: { fontSize: 11, color: '#FFD060' },
  ratingVal: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: COLORS.ink2,
  },
});