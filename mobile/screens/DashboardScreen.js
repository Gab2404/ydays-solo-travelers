import React, { useEffect, useState } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, StyleSheet, 
  Image, ActivityIndicator 
} from 'react-native';
import pathService from '../services/pathService';
import errorHandler from '../utils/errorHandler';
import formatters from '../utils/formatters';

export default function DashboardScreen({ route, navigation }) {
  const { city } = route.params;
  const [paths, setPaths] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPaths();
  }, [city]);

  const fetchPaths = async () => {
    try {
      setIsLoading(true);
      const data = await pathService.getPathsByCity(city);
      setPaths(data);
    } catch (err) {
      errorHandler.handle(err, 'Impossible de charger les parcours');
    } finally {
      setIsLoading(false);
    }
  };

  const categoryImages = {
    'Culturel': require('../assets/images/culturel.png'),
    'Sportif': require('../assets/images/sportif.png'),
    'Culinaire': require('../assets/images/culinaire.png'),
    'Détente': require('../assets/images/detente.png'),
    'Mixte': require('../assets/images/mixte.png'),
    'default': require('../assets/images/mixte.png'), 
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Culturel': { bg: '#ede9fe', text: '#7c3aed' },
      'Sportif': { bg: '#fee2e2', text: '#ef4444' },
      'Culinaire': { bg: '#ffedd5', text: '#c2410c' },
      'Détente': { bg: '#d1fae5', text: '#059669' },
      'Mixte': { bg: '#e0f2fe', text: '#0284c7' }
    };
    return colors[category?.trim()] || { bg: '#f1f5f9', text: '#64748b' };
  };

  const renderItem = ({ item }) => {
    const catStyle = getCategoryColor(item.difficulty);
    const imageSource = categoryImages[item.difficulty] || categoryImages['default'];

    return (
      <TouchableOpacity 
        activeOpacity={0.9}
        style={styles.card}
        onPress={() => navigation.navigate('PathDetail', { id: item._id })}
      >
        <View style={styles.cardImageContainer}>
          <Image 
            source={imageSource} 
            style={styles.cardImage} 
            resizeMode="cover" 
          />
        </View>
        
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={[styles.catBadge, { backgroundColor: catStyle.bg }]}>
              <Text style={[styles.catText, { color: catStyle.text }]}>
                {item.difficulty}
              </Text>
            </View>
            <Text style={styles.stepsText}>{item.quests.length} étapes</Text>
          </View>

          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.cardDesc} numberOfLines={2}>
            {item.description || "Découvrez ce parcours unique à travers la ville..."}
          </Text>
          
          <View style={styles.seeMoreContainer}>
            <Text style={styles.seeMoreText}>VOIR LE PARCOURS →</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d97706" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backBtn}
        >
          <Text style={styles.backText}>← Changer de ville</Text>
        </TouchableOpacity>
        <Text style={styles.cityTitle}>{city}</Text>
      </View>

      <Text style={styles.sectionTitle}>Aventures disponibles</Text>

      <FlatList
        data={paths}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🔭</Text>
            <Text style={styles.emptyText}>Aucun parcours trouvé ici.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8fafc', 
    paddingHorizontal: 20, 
    paddingTop: 60 
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc'
  },
  
  header: { marginBottom: 25 },
  backBtn: { 
    alignSelf: 'flex-start', 
    paddingVertical: 5, 
    paddingHorizontal: 10, 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    marginBottom: 10 
  },
  backText: { 
    color: '#64748b', 
    fontSize: 12, 
    fontWeight: 'bold' 
  },
  cityTitle: { 
    fontSize: 34, 
    fontWeight: '900', 
    color: '#d97706', 
    textTransform: 'uppercase', 
    letterSpacing: -1 
  },

  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 15, 
    color: '#334155' 
  },

  card: { 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    marginBottom: 20, 
    flexDirection: 'row', 
    height: 140,
    shadowColor: '#000', 
    shadowOpacity: 0.08, 
    shadowRadius: 15, 
    shadowOffset: { width: 0, height: 4 }, 
    elevation: 4,
    overflow: 'hidden'
  },

  cardImageContainer: { 
    width: 110, 
    height: '100%', 
    backgroundColor: '#f1f5f9' 
  },
  cardImage: { width: '100%', height: '100%' },

  cardContent: { 
    flex: 1, 
    padding: 12, 
    justifyContent: 'space-between' 
  },

  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  
  catBadge: { 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 8 
  },
  catText: { 
    fontSize: 10, 
    fontWeight: '800', 
    textTransform: 'uppercase' 
  },
  
  stepsText: { 
    fontSize: 11, 
    color: '#94a3b8', 
    fontWeight: '600' 
  },

  cardTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#1e293b', 
    marginTop: 5 
  },
  cardDesc: { 
    fontSize: 12, 
    color: '#64748b', 
    lineHeight: 16 
  },

  seeMoreContainer: { alignSelf: 'flex-end' },
  seeMoreText: { 
    fontSize: 10, 
    fontWeight: '900', 
    color: '#d97706', 
    letterSpacing: 0.5 
  },

  emptyContainer: { 
    alignItems: 'center', 
    marginTop: 50 
  },
  emptyEmoji: { 
    fontSize: 40, 
    marginBottom: 10 
  },
  emptyText: { 
    fontSize: 16, 
    color: '#64748b', 
    fontWeight: '500' 
  }
});