import React, { useEffect, useState } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, StyleSheet, 
  Image, ActivityIndicator, StatusBar 
} from 'react-native';
import { Clock, MapPin, Star } from 'lucide-react-native';
import pathService from '../services/pathService';
import errorHandler from '../utils/errorHandler';
import BottomNav from '../components/BottomNav';
import { useFonts, AoboshiOne_400Regular } from '@expo-google-fonts/aoboshi-one';
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';

// --- IMPORT DE L'URL CENTRALISÉE ---
import { SERVER_URL } from '../utils/api'; 

const COLORS = {
  headerTeal: '#487C83',
  orange: '#ED6F2D', 
  dark: '#1e293b',
  grey: '#64748b',
  background: '#F8FAFC',
};

const FILTERS = ['Tous', 'Culturel', 'Sportif', 'Insolite', 'Food'];

export default function DashboardScreen({ route, navigation }) {
  const city = route.params?.city || 'Bordeaux';
  
  const [paths, setPaths] = useState([]);
  const [filteredPaths, setFilteredPaths] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Tous');

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
    if (activeFilter === 'Tous') {
      setFilteredPaths(paths);
    } else {
      const filtered = paths.filter(p => 
        p.difficulty && p.difficulty.toLowerCase() === activeFilter.toLowerCase()
      );
      setFilteredPaths(filtered);
    }
  }, [activeFilter, paths]);

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

    return categoryImages[path.difficulty] || require('../assets/images/mixte.png');
  };

  const renderPathCard = ({ item }) => {
    const duration = "1h30"; 
    const distance = "3 km";
    const points = "+150 pts";

    return (
      <TouchableOpacity 
        activeOpacity={0.95}
        style={styles.card}
        onPress={() => navigation.navigate('PathDetail', { pathId: item._id })}
      >
        {/* --- ZONE IMAGE --- */}
        <View style={styles.imageWrapper}>
          <Image 
            source={getPathImage(item)} 
            style={styles.cardImage}
            resizeMode="cover"
          />
          <View style={styles.badgeOverlay}>
            <Text style={styles.badgeText}>{item.difficulty}</Text>
          </View>
        </View>

        {/* --- ZONE CONTENU --- */}
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Clock size={12} color="#64748b" />
              <Text style={styles.metaText}>{duration}</Text>
            </View>
            <View style={styles.metaItem}>
              <MapPin size={12} color="#64748b" />
              <Text style={styles.metaText}>{distance}</Text>
            </View>
          </View>

          <Text style={styles.stepsInfo}>{item.quests?.length || 0} étapes à découvrir</Text>
          
          <View style={styles.pointsBadge}>
             <Star size={12} color={COLORS.orange} fill={COLORS.orange} />
             <Text style={styles.pointsText}>{points}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerTeal} />

      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Quêtes Disponibles</Text>
        <Text style={styles.headerSubtitle}>
          {filteredPaths.length} parcours exclusifs à {city}
        </Text>
      </View>

      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={item => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[
                styles.filterPill, 
                activeFilter === item && styles.activeFilterPill
              ]}
              onPress={() => setActiveFilter(item)}
            >
              <Text style={[
                styles.filterText, 
                activeFilter === item && styles.activeFilterText
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

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
  
  headerContainer: {
    backgroundColor: COLORS.headerTeal,
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    zIndex: 10,
  },
  headerTitle: {
    fontFamily: 'AoboshiOne_400Regular',
    fontSize: 24,
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },

  // --- FILTRES RÉDUITS ---
  filtersContainer: {
    marginTop: 15,
    height: 40, // Hauteur réduite
  },
  filterPill: {
    paddingHorizontal: 16, // Réduit (était 20)
    paddingVertical: 6,    // Réduit (était 8)
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
  },
  activeFilterPill: {
    backgroundColor: COLORS.headerTeal,
    borderColor: COLORS.headerTeal,
  },
  filterText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12, // Réduit (était 13)
    color: COLORS.grey,
  },
  activeFilterText: {
    color: '#fff',
  },

  listContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 110, 
  },
  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center'
  },
  emptyContainer: {
    marginTop: 50, alignItems: 'center'
  },
  emptyText: {
    fontFamily: 'Poppins_400Regular', color: COLORS.grey
  },

  // CARD STYLES
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  imageWrapper: {
    height: 160,
    width: '100%',
    position: 'relative',
    backgroundColor: '#f1f5f9',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  badgeOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(33, 67, 71, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#fff',
  },
  cardContent: {
    padding: 16,
    position: 'relative',
  },
  cardTitle: {
    fontFamily: 'AoboshiOne_400Regular',
    fontSize: 18,
    color: COLORS.dark,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4
  },
  metaText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#64748b',
  },
  stepsInfo: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#64748b',
  },
  pointsBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pointsText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: COLORS.orange,
  }
});